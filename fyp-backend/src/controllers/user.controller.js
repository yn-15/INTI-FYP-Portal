import bcrypt          from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ── GET /api/users ── (admin: all users) ──────────────────────────────────────
export async function getAllUsers(req, res) {
  try {
    const { role, status, department } = req.query

    const where = {}
    if (role)       where.role       = role
    if (status)     where.status     = status
    if (department) where.departmentId = parseInt(department)

    const users = await prisma.user.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(users.map(u => sanitizeUser(u)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── GET /api/users/pending ── (admin) ─────────────────────────────────────────
export async function getPendingUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'pending' },
      include: { department: true },
      orderBy: { createdAt: 'asc' },
    })
    return res.json(users.map(u => sanitizeUser(u)))
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── POST /api/users ── (admin: manually create user) ─────────────────────────
export async function createUser(req, res) {
  try {
    const { firstName, lastName, email, password, role, departmentId, companyName } = req.body

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be provided.' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        status: 'active', // admin-created accounts are immediately active
        departmentId: departmentId ? parseInt(departmentId) : null,
        companyName: companyName || null,
        approvedById: req.user.id,
        approvedAt: new Date(),
      },
      include: { department: true },
    })

    await logAction({
      userId: req.user.id,
      action: 'User Created by Admin',
      entityType: 'user',
      entityId: user.id,
      details: { role, email, department: user.department?.name },
    })

    return res.status(201).json(sanitizeUser(user))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/users/:id/approve ── (admin) ─────────────────────────────────────
export async function approveUser(req, res) {
  try {
    const { id } = req.params
    const { departmentId } = req.body

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ error: 'User not found.' })
    if (user.status !== 'pending') return res.status(400).json({ error: 'User is not pending.' })

    // Department required for students and lecturers
    if (['student', 'lecturer'].includes(user.role) && !departmentId) {
      return res.status(400).json({ error: 'Department must be assigned for students and lecturers.' })
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        status: 'active',
        departmentId: departmentId ? parseInt(departmentId) : null,
        approvedById: req.user.id,
        approvedAt: new Date(),
      },
      include: { department: true },
    })

    await logAction({
      userId: req.user.id,
      action: 'User Approved',
      entityType: 'user',
      entityId: updated.id,
      details: { role: updated.role, department: updated.department?.name },
    })

    // Create welcome notification targeted at the approved user
    const roleLabel = { admin:'Administrator', lecturer:'Lecturer / Supervisor', student:'Student', employer:'Industry Partner' }[updated.role] || updated.role
    const deptName  = updated.department?.name
    await prisma.notification.create({
      data: {
        title:              'Your Account Has Been Approved! 🎉',
        message:            `Welcome to the INTI FYP Portal, ${updated.firstName}! Your account has been reviewed and activated by the FYP Administrator. You now have full access as a ${roleLabel}${deptName ? ` in the ${deptName} department` : ''}. Log in to get started.`,
        createdById:        req.user.id,
        targetRole:         updated.role,
        targetDepartmentId: updated.departmentId || null,
        targetUserId:       updated.id,
      },
    })

    return res.json(sanitizeUser(updated))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/users/:id/reject ── (admin) ──────────────────────────────────────
export async function rejectUser(req, res) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ error: 'User not found.' })

    await prisma.user.delete({ where: { id: parseInt(id) } })

    // Log but don't crash if it fails
    try {
      await logAction({
        userId: req.user.id,
        action: 'User Registration Rejected',
        entityType: 'user',
        entityId: parseInt(id),
        details: { email: user.email, role: user.role },
      })
    } catch(logErr) { console.error('Audit log failed:', logErr) }

    return res.json({ message: 'Registration rejected and removed.' })
  } catch (err) {
    console.error('rejectUser error:', err)
    return res.status(500).json({ error: err.message || 'Server error.' })
  }
}

// ── PUT /api/users/:id/deactivate ── (admin) ──────────────────────────────────
export async function deactivateUser(req, res) {
  try {
    const { id } = req.params
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'deactivated' },
      include: { department: true },
    })

    await logAction({
      userId: req.user.id,
      action: 'User Deactivated',
      entityType: 'user',
      entityId: updated.id,
      details: { email: updated.email },
    })

    return res.json(sanitizeUser(updated))
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/users/:id ── (admin: edit user) ──────────────────────────────────
export async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { firstName, lastName, role, departmentId, companyName } = req.body

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName:    firstName    || undefined,
        lastName:     lastName     || undefined,
        role:         role         || undefined,
        departmentId: departmentId ? parseInt(departmentId) : undefined,
        companyName:  companyName  || undefined,
      },
      include: { department: true },
    })

    await logAction({
      userId: req.user.id,
      action: 'User Updated',
      entityType: 'user',
      entityId: updated.id,
      details: { email: updated.email },
    })

    return res.json(sanitizeUser(updated))
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── GET /api/departments ──────────────────────────────────────────────────────
export async function getDepartments(req, res) {
  try {
    const depts = await prisma.department.findMany({ orderBy: { name: 'asc' } })
    return res.json(depts)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── POST /api/departments ── (admin) ──────────────────────────────────────────
export async function createDepartment(req, res) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Department name is required.' })

    const dept = await prisma.department.create({ data: { name } })

    await logAction({
      userId: req.user.id,
      action: 'Department Created',
      entityType: 'department',
      entityId: dept.id,
      details: { name },
    })

    return res.status(201).json(dept)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Department already exists.' })
    return res.status(500).json({ error: 'Server error.' })
  }
}


// ── PUT /api/users/:id/reactivate ── (admin) ──────────────────────────────────
export async function reactivateUser(req, res) {
  try {
    const { id } = req.params
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'active' },
      include: { department: true },
    })
    await logAction({
      userId: req.user.id,
      action: 'User Reactivated',
      entityType: 'user',
      entityId: updated.id,
      details: { email: updated.email },
    })
    return res.json(sanitizeUser(updated))
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/users/:id/password ── (self) ────────────────────────────────────
export async function updatePassword(req, res) {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (parseInt(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' })
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!user) return res.status(404).json({ error: 'User not found.' })

    // Verify current password if self (not admin reset)
    if (req.user.role !== 'admin' || parseInt(id) === req.user.id) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password is required.' })
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: parseInt(id) }, data: { passwordHash } })

    return res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── DELETE /api/departments/:id ── (admin) ────────────────────────────────────
export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params
    await prisma.department.delete({ where: { id: parseInt(id) } })
    await logAction({
      userId: req.user.id,
      action: 'Department Deleted',
      entityType: 'department',
      entityId: parseInt(id),
      details: {},
    })
    return res.json({ message: 'Department deleted.' })
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ error: 'Cannot delete department that has users or proposals.' })
    return res.status(500).json({ error: 'Server error.' })
  }
}

// -- FETCH -- (lecturer) ----------------------------------
export async function getDeptStudents(req, res) {
  try {
    const departmentId = req.user.departmentId
    const students = await prisma.user.findMany({
      where: {
        role:         'student',
        status:       'active',
        departmentId: departmentId,
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        departmentId: true,
      },
    })
    return res.json(students)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}
