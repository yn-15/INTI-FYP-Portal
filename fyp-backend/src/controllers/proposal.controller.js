import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ── GET /api/proposals ────────────────────────────────────────────────────────
export async function getProposals(req, res) {
  try {
    const { role, departmentId, id: userId } = req.user
    const { status } = req.query

    const where = {}

    // Role-based scoping
    if (role === 'lecturer') {
      where.departmentId = departmentId
    } else if (role === 'student') {
      where.departmentId = departmentId
      where.status = 'approved'
    } else if (role === 'employer') {
      where.submittedById = userId
    }
    // admin sees all

    if (status && role !== 'student') where.status = status

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        department:  true,
        submittedBy: { select: { id:true, firstName:true, lastName:true, companyName:true } },
        reviewedBy:  { select: { id:true, firstName:true, lastName:true } },
        selection:   { include: { student: { select: { id:true, firstName:true, lastName:true } } } },
        team:        { include: { members: { include: { student: { select: { id:true, firstName:true, lastName:true } } } } } },
        chatThread:  { select: { id:true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return res.json(proposals)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── GET /api/proposals/:id ────────────────────────────────────────────────────
export async function getProposalById(req, res) {
  try {
    const { id } = req.params
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
      include: {
        department:  true,
        submittedBy: { select: { id:true, firstName:true, lastName:true, companyName:true } },
        reviewedBy:  { select: { id:true, firstName:true, lastName:true } },
        selection:   { include: { student: { select: { id:true, firstName:true, lastName:true } } } },
        team:        {
          include: {
            supervisor: { select: { id:true, firstName:true, lastName:true } },
            members: { include: { student: { select: { id:true, firstName:true, lastName:true } } } },
          },
        },
        chatThread: { include: { messages: { include: { sender: { select: { id:true, firstName:true, lastName:true, role:true } } }, orderBy: { sentAt: 'asc' } } } },
      },
    })

    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

    // Students can only see approved proposals in their department
    if (req.user.role === 'student') {
      if (proposal.departmentId !== req.user.departmentId || proposal.status !== 'approved') {
        return res.status(403).json({ error: 'Access denied.' })
      }
    }

    return res.json(proposal)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── POST /api/proposals ── (employer) ─────────────────────────────────────────
export async function createProposal(req, res) {
  try {
    const {
      title, companyName, companyWebsite, companyCategory,
      projectChampion, processOwner, intiContact, departmentId,
      briefProfile, problemStatement, discipline, deliverables,
      technologies, skillsNeeded, targetAudience, practicalResources,
    } = req.body

    if (!title || !problemStatement || !departmentId) {
      return res.status(400).json({ error: 'Title, problem statement and department are required.' })
    }

    const proposal = await prisma.proposal.create({
      data: {
        title, companyName, companyWebsite, companyCategory,
        projectChampion, processOwner, intiContact,
        departmentId: parseInt(departmentId),
        briefProfile, problemStatement, discipline, deliverables,
        technologies, skillsNeeded, targetAudience, practicalResources,
        submittedById: req.user.id,
        status: 'pending',
      },
      include: { department: true, submittedBy: { select: { id:true, firstName:true, lastName:true } } },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Submitted',
      entityType: 'proposal',
      entityId: proposal.id,
      details: { title, department: proposal.department?.name },
    })

    return res.status(201).json(proposal)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/proposals/:id/approve ── (lecturer) ──────────────────────────────
export async function approveProposal(req, res) {
  try {
    const { id } = req.params
    const { feedback } = req.body

    const proposal = await prisma.proposal.findUnique({ where: { id: parseInt(id) } })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

    // Lecturers can only review proposals in their department
    if (req.user.role === 'lecturer' && proposal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'You can only review proposals in your department.' })
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Proposal has already been reviewed.' })
    }

    const updated = await prisma.proposal.update({
      where: { id: parseInt(id) },
      data: {
        status: 'approved',
        reviewedById: req.user.id,
        reviewFeedback: feedback || 'Approved.',
        reviewedAt: new Date(),
      },
    })

    // Auto-create chat thread seeded with the feedback as first message
    const thread = await prisma.chatThread.create({
      data: {
        proposalId: updated.id,
        messages: {
          create: {
            senderId: req.user.id,
            message: feedback || 'Approved. Looking forward to working with the team on this project.',
          },
        },
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Approved',
      entityType: 'proposal',
      entityId: updated.id,
      details: { feedback },
    })

    return res.json({ proposal: updated, chatThreadId: thread.id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/proposals/:id/reject ── (lecturer) ───────────────────────────────
export async function rejectProposal(req, res) {
  try {
    const { id } = req.params
    const { feedback } = req.body

    if (!feedback?.trim()) {
      return res.status(400).json({ error: 'Feedback is required when rejecting a proposal.' })
    }

    const proposal = await prisma.proposal.findUnique({ where: { id: parseInt(id) } })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

    if (req.user.role === 'lecturer' && proposal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'You can only review proposals in your department.' })
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Proposal has already been reviewed.' })
    }

    const updated = await prisma.proposal.update({
      where: { id: parseInt(id) },
      data: {
        status: 'rejected',
        reviewedById: req.user.id,
        reviewFeedback: feedback,
        reviewedAt: new Date(),
      },
    })

    // Auto-create chat thread with rejection feedback as first message
    await prisma.chatThread.create({
      data: {
        proposalId: updated.id,
        messages: {
          create: {
            senderId: req.user.id,
            message: feedback,
          },
        },
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Rejected',
      entityType: 'proposal',
      entityId: updated.id,
      details: { feedback },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/proposals/:id/dept ── (admin: reassign department) ───────────────
export async function reassignDepartment(req, res) {
  try {
    const { id } = req.params
    const { departmentId } = req.body

    const updated = await prisma.proposal.update({
      where: { id: parseInt(id) },
      data: { departmentId: parseInt(departmentId) },
      include: { department: true },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Department Reassigned',
      entityType: 'proposal',
      entityId: updated.id,
      details: { department: updated.department?.name },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}
