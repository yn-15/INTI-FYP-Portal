import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ── GET /api/teams ────────────────────────────────────────────────────────────
export async function getTeams(req, res) {
  try {
    const { role, departmentId } = req.user

    const where = {}
    if (role === 'lecturer') where.departmentId = departmentId

    const teams = await prisma.team.findMany({
      where,
      include: {
        proposal:   { select: { id:true, title:true } },
        department: true,
        supervisor: { select: { id:true, firstName:true, lastName:true } },
        members: {
          include: {
            student: { select: { id:true, firstName:true, lastName:true, email:true } },
          },
        },
      },
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
          include: {
            proposal:   { select: { id:true, title:true, companyName:true } },
            supervisor: { select: { id:true, firstName:true, lastName:true } },
            members: {
              include: {
                student: { select: { id:true, firstName:true, lastName:true } },
              },
            },
          },
        },
      },
    })

    if (!member) return res.json(null)
    return res.json(member.team)
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' })
  }
}

// ── POST /api/teams ── (lecturer) ─────────────────────────────────────────────
export async function createTeam(req, res) {
  try {
    const { name, proposalId } = req.body

    if (!name || !proposalId) {
      return res.status(400).json({ error: 'Team name and proposal are required.' })
    }

    // Check proposal exists and is approved
    const proposal = await prisma.proposal.findUnique({ where: { id: parseInt(proposalId) } })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' })
    if (proposal.status !== 'approved') return res.status(400).json({ error: 'Proposal must be approved first.' })

    // Check no team already exists for this proposal
    const existing = await prisma.team.findUnique({ where: { proposalId: parseInt(proposalId) } })
    if (existing) return res.status(409).json({ error: 'A team already exists for this proposal.' })

    const team = await prisma.team.create({
      data: {
        name,
        proposalId:   parseInt(proposalId),
        departmentId: req.user.departmentId,
        supervisorId: req.user.id,
        confirmed:    false,
      },
      include: {
        proposal:   { select: { id:true, title:true } },
        supervisor: { select: { id:true, firstName:true, lastName:true } },
        members:    true,
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Team Created',
      entityType: 'team',
      entityId: team.id,
      details: { name, proposalId },
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
    const { id } = req.params
    const { studentIds } = req.body // array of student user IDs

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds array is required.' })
    }

    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } })
    if (!team) return res.status(404).json({ error: 'Team not found.' })

    // Remove existing members and replace
    await prisma.teamMember.deleteMany({ where: { teamId: parseInt(id) } })

    await prisma.teamMember.createMany({
      data: studentIds.map(sid => ({
        teamId:    parseInt(id),
        studentId: parseInt(sid),
      })),
    })

    const updated = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: { student: { select: { id:true, firstName:true, lastName:true } } },
        },
      },
    })

    await logAction({
      userId: req.user.id,
      action: 'Students Assigned to Team',
      entityType: 'team',
      entityId: parseInt(id),
      details: { studentIds },
    })

    return res.json(updated)
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
      data: { confirmed: true },
      include: {
        members: {
          include: { student: { select: { id:true, firstName:true, lastName:true } } },
        },
      },
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
