import bcrypt       from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { signToken }    from '../utils/jwt.js'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role, companyName } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    // Validate role
    const validRoles = ['student', 'lecturer', 'employer']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' })
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    // Validate email format per role
    const studentPattern  = /^J\d+@student\.newinti\.edu\.my$/i
    const lecturerPattern = /^[a-z0-9.]+@newinti\.edu\.my$/i
    const employerPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (role === 'student'  && !studentPattern.test(email)) {
      return res.status(400).json({ error: 'Student email must be J[ID]@student.newinti.edu.my' })
    }
    if (role === 'lecturer' && !lecturerPattern.test(email)) {
      return res.status(400).json({ error: 'Lecturer email must be name@newinti.edu.my' })
    }
    if (role === 'employer' && email.toLowerCase().includes('newinti.edu.my')) {
      return res.status(400).json({ error: 'Employers must use a company email, not an INTI email.' })
    }
    if (role === 'employer' && !companyName) {
      return res.status(400).json({ error: 'Company name is required for industry partners.' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user (status = pending, no department yet)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        status: 'pending',
        companyName: companyName || null,
      },
    })

    await logAction({
      userId: user.id,
      action: 'User Registered',
      entityType: 'user',
      entityId: user.id,
      details: { role, status: 'pending' },
    })

    return res.status(201).json({
      message: 'Registration submitted. Awaiting admin approval.',
      userId: user.id,
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Server error during registration.' })
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      await logAction({
        userId: user.id,
        action: 'Failed Login Attempt',
        entityType: 'user',
        entityId: user.id,
        details: { reason: 'Wrong password' },
      })
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'pending', message: 'Account is pending admin approval.' })
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'deactivated', message: 'Your account has been deactivated. Please contact the FYP administrator.' })
    }

    // Sign JWT
    const token = signToken({
      id:           user.id,
      email:        user.email,
      role:         user.role,
      departmentId: user.departmentId,
    })

    await logAction({
      userId: user.id,
      action: 'User Logged In',
      entityType: 'user',
      entityId: user.id,
      details: { role: user.role },
    })

    return res.json({
      token,
      user: {
        id:           user.id,
        firstName:    user.firstName,
        lastName:     user.lastName,
        email:        user.email,
        role:         user.role,
        status:       user.status,
        departmentId: user.departmentId,
        department:   user.department?.name || null,
        companyName:  user.companyName,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error during login.' })
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true },
    })

    if (!user) return res.status(404).json({ error: 'User not found.' })

    return res.json({
      id:           user.id,
      firstName:    user.firstName,
      lastName:     user.lastName,
      email:        user.email,
      role:         user.role,
      status:       user.status,
      departmentId: user.departmentId,
      department:   user.department?.name || null,
      companyName:  user.companyName,
    })
  } catch (err) {
    console.error('Me error:', err)
    return res.status(500).json({ error: 'Server error.' })
  }
}
