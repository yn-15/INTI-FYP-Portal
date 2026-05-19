import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

const TEAM_INCLUDE = {
  proposal:   { select: { id:true, title:true, companyName:true } },
  department: true,
  supervisor: { select: { id:true, firstName:true, lastName:true, email:true } },
  members: {
    include: {
      student: { select: { id:true, firstName:true, lastName:true, email:true } },
    },
  },
}

// ── GET /api/teams ─────────────────────────────────────────────────────────────
export async function getTeams(req, res) {
  try {
    const { role, departmentId } = req.user
    const where = {}
    if (role === 'lecturer') where.departmentId = departmentId

    const teams = await prisma.team.findMany({
      where,
      include: TEAM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    return res.json(teams)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── GET /api/teams/mine ── (student) ──────────────────────────────────────────
export async function getMyTeam(req, res) {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { studentId: req.user.id },
      include: {
        team: {
          include: TEAM_INCLUDE,
        },
      },
    })
    if (!member) return res.json(null)

    // Attach isLeader flag to the team for convenience
    const team = { ...member.team, isLeader: member.isLeader }
    return res.json(team)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── POST /api/teams ── (lecturer) ─────────────────────────────────────────────
export async function createTeam(req, res) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Team name is required.' })

    const team = await prisma.team.create({
      data: {
        name,
        departmentId: req.user.departmentId,
        supervisorId: req.user.id,
        confirmed:    false,
      },
      include: TEAM_INCLUDE,
    })

    await logAction({
      userId: req.user.id,
      action: 'Team Created',
      entityType: 'team',
      entityId: team.id,
      details: { name },
    })

    return res.status(201).json(team)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/teams/:id/assign ── (lecturer) ───────────────────────────────────
export async function assignStudents(req, res) {
  try {
    const { id }                   = req.params
    const { studentIds, leaderId } = req.body

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds array is required.' })
    }

    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } })
    if (!team) return res.status(404).json({ error: 'Team not found.' })

    // Enforce max 5 members
    if (studentIds.length > 5) {
      return res.status(400).json({ error: 'A team can have a maximum of 5 members.' })
    }

    // Replace existing members
    await prisma.teamMember.deleteMany({ where: { teamId: parseInt(id) } })

    await prisma.teamMember.createMany({
      data: studentIds.map(sid => ({
        teamId:    parseInt(id),
        studentId: parseInt(sid),
        isLeader:  leaderId ? parseInt(sid) === parseInt(leaderId) : false,
      })),
    })

    const updated = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: TEAM_INCLUDE,
    })

    await logAction({
      userId: req.user.id,
      action: 'Students Assigned to Team',
      entityType: 'team',
      entityId: parseInt(id),
      details: { studentIds, leaderId },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/teams/:id ── (lecturer) — edit team name ────────────────────────
export async function updateTeam(req, res) {
  try {
    const { id }   = req.params
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Team name is required.' })

    const updated = await prisma.team.update({
      where: { id: parseInt(id) },
      data:  { name: name.trim() },
      include: TEAM_INCLUDE,
    })

    await logAction({
      userId: req.user.id,
      action: 'Team Updated',
      entityType: 'team',
      entityId: parseInt(id),
      details: { name: name.trim() },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── DELETE /api/teams/:id ── (lecturer) ───────────────────────────────────────
export async function deleteTeam(req, res) {
  try {
    const { id } = req.params

    // Only allow delete if team is not confirmed
    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } })
    if (!team) return res.status(404).json({ error: 'Team not found.' })
    if (team.confirmed) return res.status(400).json({ error: 'Cannot delete a confirmed team.' })

    await prisma.teamMember.deleteMany({ where: { teamId: parseInt(id) } })
    await prisma.team.delete({ where: { id: parseInt(id) } })

    await logAction({
      userId: req.user.id,
      action: 'Team Deleted',
      entityType: 'team',
      entityId: parseInt(id),
      details: {},
    })

    return res.json({ message: 'Team deleted.' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/teams/:id/confirm ── (lecturer) ──────────────────────────────────
export async function confirmTeam(req, res) {
  try {
    const { id } = req.params

    const updated = await prisma.team.update({
      where: { id: parseInt(id) },
      data:  { confirmed: true },
      include: TEAM_INCLUDE,
    })

    await logAction({
      userId: req.user.id,
      action: 'Team Confirmed',
      entityType: 'team',
      entityId: parseInt(id),
      details: { teamName: updated.name },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── PUT /api/teams/:id/link-proposal ── (team leader student) ─────────────────
export async function linkProposal(req, res) {
  try {
    const { id }         = req.params
    const { proposalId } = req.body

    // Verify requester is the team leader
    const member = await prisma.teamMember.findFirst({
      where: { teamId: parseInt(id), studentId: req.user.id, isLeader: true },
    })
    if (!member) return res.status(403).json({ error: 'Only the team leader can select a proposal.' })

    // Verify proposal is approved
    const proposal = await prisma.proposal.findUnique({ where: { id: parseInt(proposalId) } })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })
    if (proposal.status !== 'approved') return res.status(400).json({ error: 'Proposal must be approved.' })

    // Check no other team has this proposal
    const taken = await prisma.team.findFirst({
      where: { proposalId: parseInt(proposalId), id: { not: parseInt(id) } },
    })
    if (taken) return res.status(409).json({ error: 'This proposal has already been selected by another team.' })

    const updated = await prisma.team.update({
      where: { id: parseInt(id) },
      data:  { proposalId: parseInt(proposalId) },
      include: TEAM_INCLUDE,
    })

    // Also create a proposal selection record
    await prisma.proposalSelection.upsert({
      where:  { studentId: req.user.id },
      update: { proposalId: parseInt(proposalId), droppedAt: null, isLocked: false, selectedAt: new Date() },
      create: { proposalId: parseInt(proposalId), studentId: req.user.id },
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Selected by Team Leader',
      entityType: 'proposal',
      entityId: parseInt(proposalId),
      details: { teamId: parseInt(id), teamName: updated.name },
    })

    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── DELETE /api/teams/:id/link-proposal ── (team leader, within 7 days) ───────
export async function unlinkProposal(req, res) {
  try {
    const { id } = req.params

    // Verify requester is the team leader
    const member = await prisma.teamMember.findFirst({
      where: { teamId: parseInt(id), studentId: req.user.id, isLeader: true },
    })
    if (!member) return res.status(403).json({ error: 'Only the team leader can drop a proposal.' })

    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } })
    if (!team?.proposalId) return res.status(400).json({ error: 'No proposal linked to this team.' })

    // Check 7-day lock
    const selection = await prisma.proposalSelection.findFirst({
      where: { studentId: req.user.id },
    })
    if (selection) {
      const daysSince = (Date.now() - new Date(selection.selectedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince > 7) return res.status(403).json({ error: 'The 7-day drop window has passed. Contact admin to change.' })

      await prisma.proposalSelection.delete({ where: { studentId: req.user.id } })
    }

    const updated = await prisma.team.update({
      where: { id: parseInt(id) },
      data:  { proposalId: null },
      include: TEAM_INCLUDE,
    })

    await logAction({
      userId: req.user.id,
      action: 'Proposal Dropped by Team Leader',
      entityType: 'team',
      entityId: parseInt(id),
      details: { proposalId: team.proposalId },
    })

    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error.' })
  }
}
