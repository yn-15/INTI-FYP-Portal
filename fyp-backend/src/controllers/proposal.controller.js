import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'
import { sendProposalReturnedEmail } from '../utils/email.js'
import { getDepartmentForDiscipline } from '../utils/disciplines.js'

const prisma = new PrismaClient()

// ── Department lookup from discipline dropdown (#3) ───────────────────────────
async function inferDepartmentId(discipline) {
  const deptName = getDepartmentForDiscipline(discipline)
  const depts    = await prisma.department.findMany()
  const match    = depts.find(d => d.name.toLowerCase() === deptName.toLowerCase())
  return match?.id || depts[0]?.id || 1
}
// ── GET /api/proposals ────────────────────────────────────────────────────────
export async function getProposals(req, res) {
  try {
    const { role, departmentId, id: userId } = req.user
    const { status } = req.query

    const where = {}

    if (role === 'lecturer') {
      where.departmentId = departmentId
    } else if (role === 'student') {
      where.departmentId = departmentId
      where.status = 'approved'
    } else if (role === 'employer') {
      where.submittedById = userId
    }

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
        team: {
          include: {
            supervisor: { select: { id:true, firstName:true, lastName:true } },
            members: { include: { student: { select: { id:true, firstName:true, lastName:true } } } },
          },
        },
        chatThread: { include: { messages: { include: { sender: { select: { id:true, firstName:true, lastName:true, role:true } } }, orderBy: { sentAt: 'asc' } } } },
        revisions:  { orderBy: { revisionNum: 'desc' }, take: 10 },
      },
    })

    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })

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
      projectChampion, processOwner, intiContact,
      briefProfile, problemStatement, discipline, deliverables,
      technologies, skillsNeeded, targetAudience, practicalResources,
    } = req.body

    if (!title || !problemStatement) {
      return res.status(400).json({ error: 'Title and problem statement are required.' })
    }

    // Auto-infer department from discipline + skills (#3)
    const departmentId = await inferDepartmentId(discipline)

    const proposal = await prisma.proposal.create({
      data: {
        title, companyName, companyWebsite, companyCategory,
        projectChampion, processOwner, intiContact,
        departmentId,
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

// ── PUT /api/proposals/:id ── (employer: edit when returned_for_review) ── #5 ─
export async function editProposal(req, res) {
  try {
    const { id } = req.params
    const {
      title, companyName, companyWebsite, companyCategory,
      projectChampion, processOwner, intiContact,
      briefProfile, problemStatement, discipline, deliverables,
      technologies, skillsNeeded, targetAudience, practicalResources,
    } = req.body

    const existing = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
      include: { revisions: true },
    })
    if (!existing) return res.status(404).json({ error: 'Proposal not found.' })

    // Only the submitter can edit
    if (existing.submittedById !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own proposals.' })
    }

    // Only editable when returned_for_review
    if (existing.status !== 'returned_for_review') {
      return res.status(400).json({ error: 'Proposal can only be edited when it has been returned for review.' })
    }

    // Snapshot current state as revision before overwriting
    const revisionNum = (existing.revisions?.length || 0) + 1
    await prisma.proposalRevision.create({
      data: {
        proposalId:  existing.id,
        revisionNum,
        changedById: req.user.id,
        snapshot: {
          title:              existing.title,
          companyName:        existing.companyName,
          companyWebsite:     existing.companyWebsite,
          companyCategory:    existing.companyCategory,
          problemStatement:   existing.problemStatement,
          discipline:         existing.discipline,
          deliverables:       existing.deliverables,
          technologies:       existing.technologies,
          skillsNeeded:       existing.skillsNeeded,
          reviewFeedback:     existing.reviewFeedback,
          status:             existing.status,
        },
      },
    })

    // Re-infer department from updated fields
    const departmentId = await inferDepartmentId(discipline || existing.discipline)

    // Update proposal — same ID, status resets to pending (resubmission)
    const updated = await prisma.proposal.update({
      where: { id: parseInt(id) },
      data: {
        title:              title              || existing.title,
        companyName:        companyName        || existing.companyName,
        companyWebsite:     companyWebsite     ?? existing.companyWebsite,
        companyCategory:    companyCategory    ?? existing.companyCategory,
        projectChampion:    projectChampion    ?? existing.projectChampion,
        processOwner:       processOwner       ?? existing.processOwner,
        intiContact:        intiContact        ?? existing.intiContact,
        briefProfile:       briefProfile       ?? existing.briefProfile,
        problemStatement:   problemStatement   || existing.problemStatement,
        discipline:         discipline         ?? existing.discipline,
        deliverables:       deliverables       || existing.deliverables,
        technologies:       technologies       ?? existing.technologies,
        skillsNeeded:       skillsNeeded       ?? existing.skillsNeeded,
        targetAudience:     targetAudience     ?? existing.targetAudience,
        practicalResources: practicalResources ?? existing.practicalResources,
        departmentId,
        status:       'pending',   // resubmitted → back to review queue
        reviewFeedback: null,
        reviewedById:   null,
        reviewedAt:     null,
        submittedAt:    new Date(), // refreshed timestamp
      },
      include: { department: true, submittedBy: { select: { id:true, firstName:true, lastName:true } } },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Resubmitted',
      entityType: 'proposal',
      entityId: updated.id,
      details: { title: updated.title, revisionNum },
    })

    return res.json(updated)
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

// ── PUT /api/proposals/:id/return ── (lecturer) — was "reject" ── #4 ──────────
export async function returnProposal(req, res) {
  try {
    const { id } = req.params
    const { feedback } = req.body

    if (!feedback?.trim()) {
      return res.status(400).json({ error: 'Feedback is required when returning a proposal for review.' })
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
        status: 'returned_for_review',
        reviewedById: req.user.id,
        reviewFeedback: feedback,
        reviewedAt: new Date(),
      },
    })

    // Open a chat thread with the feedback so employer can see it
    await prisma.chatThread.upsert({
      where:  { proposalId: updated.id },
      update: {},
      create: {
        proposalId: updated.id,
        messages: {
          create: { senderId: req.user.id, message: feedback },
        },
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Returned for Review',
      entityType: 'proposal',
      entityId: updated.id,
      details: { feedback },
    })

    // Send email notification to employer (#1)
    const employer = await prisma.user.findUnique({ where: { id: updated.submittedById } })
    if (employer) {
      sendProposalReturnedEmail({
        email:         employer.email,
        firstName:     employer.firstName,
        proposalTitle: updated.title,
        feedback,
      }).catch(err => console.error('[email] proposal returned email failed:', err))
    }

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
