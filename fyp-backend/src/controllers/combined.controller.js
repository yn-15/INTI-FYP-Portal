import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNotifications(req, res) {
  try {
    const { role, id: userId, departmentId } = req.user

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: null,  targetDepartmentId: null  }, // all users
          { targetRole: role,  targetDepartmentId: null  }, // all in this role
          { targetRole: null,  targetDepartmentId: departmentId }, // all in this dept
          { targetRole: role,  targetDepartmentId: departmentId }, // this role in this dept
        ],
      },
      include: {
        createdBy: { select: { id:true, firstName:true, lastName:true, role:true } },
        reads: { where: { userId } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(notifications.map(n => ({
      ...n,
      isRead: n.reads.length > 0,
    })))
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function getUnreadCount(req, res) {
  try {
    const { role, id: userId, departmentId } = req.user

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: null, targetDepartmentId: null },
          { targetRole: role, targetDepartmentId: null },
          { targetRole: null, targetDepartmentId: departmentId },
          { targetRole: role, targetDepartmentId: departmentId },
        ],
      },
      select: { id: true },
    })

    const readIds = await prisma.notificationRead.findMany({
      where: { userId },
      select: { notificationId: true },
    })

    const readSet = new Set(readIds.map(r => r.notificationId))
    const count   = notifications.filter(n => !readSet.has(n.id)).length

    return res.json({ count })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function createNotification(req, res) {
  try {
    const { title, message, targetRole, targetDepartmentId } = req.body

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' })
    }

    // Lecturers can only notify students in their own department
    if (req.user.role === 'lecturer') {
      if (targetRole && targetRole !== 'student') {
        return res.status(403).json({ error: 'Lecturers can only notify students.' })
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        createdById: req.user.id,
        targetRole:         targetRole         || null,
        targetDepartmentId: targetDepartmentId ? parseInt(targetDepartmentId) : null,
      },
      include: {
        createdBy: { select: { id:true, firstName:true, lastName:true } },
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Notification Created',
      entityType: 'notification',
      entityId: notification.id,
      details: { title, targetRole },
    })

    return res.status(201).json(notification)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function markRead(req, res) {
  try {
    const { id } = req.params
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId: parseInt(id),
          userId: req.user.id,
        },
      },
      update: {},
      create: {
        notificationId: parseInt(id),
        userId: req.user.id,
      },
    })
    return res.json({ message: 'Marked as read.' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════════════════════════

export async function getThread(req, res) {
  try {
    const { proposalId } = req.params
    const { role, id: userId } = req.user

    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(proposalId) },
      select: { submittedById:true, reviewedById:true, departmentId:true },
    })

    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

    // Access control: lecturer who reviewed, employer who submitted, or admin
    const isLecturer = role === 'lecturer' && proposal.reviewedById === userId
    const isEmployer = role === 'employer' && proposal.submittedById === userId
    const isAdmin    = role === 'admin'

    // Also allow lecturers in the same dept (they might be the supervisor)
    const isDeptLecturer = role === 'lecturer' && proposal.departmentId === req.user.departmentId

    if (!isLecturer && !isEmployer && !isAdmin && !isDeptLecturer) {
      return res.status(403).json({ error: 'Access denied.' })
    }

    const thread = await prisma.chatThread.findUnique({
      where: { proposalId: parseInt(proposalId) },
      include: {
        messages: {
          include: {
            sender: { select: { id:true, firstName:true, lastName:true, role:true } },
          },
          orderBy: { sentAt: 'asc' },
        },
      },
    })

    return res.json(thread || null)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function sendMessage(req, res) {
  try {
    const { proposalId } = req.params
    const { message }    = req.body
    const { role, id: userId } = req.user

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' })
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(proposalId) },
      select: { submittedById:true, reviewedById:true, departmentId:true },
    })

    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

    // Employer can only respond (thread must exist = lecturer messaged first)
    const thread = await prisma.chatThread.findUnique({
      where: { proposalId: parseInt(proposalId) },
    })

    if (role === 'employer') {
      if (proposal.submittedById !== userId) {
        return res.status(403).json({ error: 'Access denied.' })
      }
      if (!thread) {
        return res.status(403).json({ error: 'You can only respond after a lecturer initiates the conversation.' })
      }
    }

    if (role === 'student') {
      return res.status(403).json({ error: 'Students cannot participate in proposal chats.' })
    }

    let targetThread = thread
    if (!targetThread) {
      targetThread = await prisma.chatThread.create({
        data: { proposalId: parseInt(proposalId) },
      })
    }

    const msg = await prisma.chatMessage.create({
      data: {
        threadId: targetThread.id,
        senderId: userId,
        message: message.trim(),
      },
      include: {
        sender: { select: { id:true, firstName:true, lastName:true, role:true } },
      },
    })

    return res.status(201).json(msg)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAdminReports(req, res) {
  try {
    const [
      totalUsers, usersByRole, pendingUsers,
      totalProposals, proposalsByStatus, proposalsByDept,
      totalTeams, confirmedTeams,
      totalNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by:['role'],   _count:{ id:true } }),
      prisma.user.count({ where: { status:'pending' } }),
      prisma.proposal.count(),
      prisma.proposal.groupBy({ by:['status'], _count:{ id:true } }),
      prisma.proposal.groupBy({ by:['departmentId'], _count:{ id:true } }),
      prisma.team.count(),
      prisma.team.count({ where: { confirmed:true } }),
      prisma.notification.count(),
    ])

    return res.json({
      users: { total: totalUsers, byRole: usersByRole, pending: pendingUsers },
      proposals: { total: totalProposals, byStatus: proposalsByStatus, byDept: proposalsByDept },
      teams: { total: totalTeams, confirmed: confirmedTeams },
      notifications: { total: totalNotifications },
    })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function getLecturerReports(req, res) {
  try {
    const { departmentId, id: userId } = req.user

    const [
      totalProposals, byStatus,
      totalTeams, confirmedTeams,
      totalStudents, assignedStudents,
    ] = await Promise.all([
      prisma.proposal.count({ where: { departmentId } }),
      prisma.proposal.groupBy({ by:['status'], where:{ departmentId }, _count:{ id:true } }),
      prisma.team.count({ where: { departmentId } }),
      prisma.team.count({ where: { departmentId, confirmed:true } }),
      prisma.user.count({ where: { role:'student', departmentId, status:'active' } }),
      prisma.teamMember.count({
        where: { team: { departmentId } },
      }),
    ])

    return res.json({
      proposals: { total: totalProposals, byStatus },
      teams: { total: totalTeams, confirmed: confirmedTeams },
      students: { total: totalStudents, assigned: assignedStudents, unassigned: totalStudents - assignedStudents },
    })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAuditLogs(req, res) {
  try {
    const { page = 1, limit = 50, entityType, userId } = req.query

    const where = {}
    if (entityType) where.entityType = entityType
    if (userId)     where.userId     = parseInt(userId)

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id:true, firstName:true, lastName:true, role:true } },
      },
      orderBy: { createdAt: 'desc' },
      skip:  (parseInt(page) - 1) * parseInt(limit),
      take:  parseInt(limit),
    })

    const total = await prisma.auditLog.count({ where })

    return res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL SELECTION (Student)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getMySelection(req, res) {
  try {
    const selection = await prisma.proposalSelection.findUnique({
      where: { studentId: req.user.id },
      include: {
        proposal: {
          include: {
            department: true,
            submittedBy: { select: { id:true, firstName:true, lastName:true, companyName:true } },
            team: {
              include: {
                supervisor: { select: { id:true, firstName:true, lastName:true } },
                members: { include: { student: { select: { id:true, firstName:true, lastName:true } } } },
              },
            },
          },
        },
      },
    })

    return res.json(selection || null)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function selectProposal(req, res) {
  try {
    const proposalId = parseInt(req.params.id || req.body.proposalId)
    const studentId = req.user.id

    // Check student doesn't already have a selection
    const existing = await prisma.proposalSelection.findUnique({
      where: { studentId },
    })
    if (existing && !existing.droppedAt) {
      return res.status(400).json({ error: 'You have already selected a proposal.' })
    }

    // Check proposal is approved
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(proposalId) },
    })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })
    if (proposal.status !== 'approved') return res.status(400).json({ error: 'Proposal is not available for selection.' })
    if (proposal.departmentId !== req.user.departmentId) return res.status(403).json({ error: 'This proposal is not in your department.' })

    // Check proposal isn't already taken
    const taken = await prisma.proposalSelection.findUnique({
      where: { proposalId: parseInt(proposalId) },
    })
    if (taken && !taken.droppedAt) {
      return res.status(409).json({ error: 'This proposal has already been selected by another student.' })
    }

    const selection = await prisma.proposalSelection.upsert({
      where: { studentId },
      update: {
        proposalId:  parseInt(proposalId),
        selectedAt:  new Date(),
        droppedAt:   null,
        isLocked:    false,
      },
      create: {
        studentId,
        proposalId: parseInt(proposalId),
        isLocked:   false,
      },
    })

    await logAction({
      userId: studentId,
      action: 'Proposal Selected',
      entityType: 'proposal',
      entityId: parseInt(proposalId),
      details: { proposalId },
    })

    return res.status(201).json(selection)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

export async function dropSelection(req, res) {
  try {
    const studentId = req.user.id

    const selection = await prisma.proposalSelection.findFirst({
      where: { studentId, droppedAt: null },
    })

    if (!selection || selection.droppedAt) {
      return res.status(400).json({ error: 'No active selection found.' })
    }

    // Check 7-day window
    const daysSinceSelection = (Date.now() - new Date(selection.selectedAt).getTime()) / (1000*60*60*24)
    if (daysSinceSelection > 7 || selection.isLocked) {
      return res.status(400).json({ error: 'Selection is locked. The 7-day drop window has passed. Please contact the FYP Administrator.' })
    }

    await prisma.proposalSelection.update({
      where: { studentId },
      data: { droppedAt: new Date() },
    })

    await logAction({
      userId: studentId,
      action: 'Proposal Selection Dropped',
      entityType: 'proposal',
      entityId: selection.proposalId,
      details: {},
    })

    return res.json({ message: 'Selection dropped successfully. You may now select a different proposal.' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}
