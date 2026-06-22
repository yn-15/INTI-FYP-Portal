// ── 7-day proposal selection lock cron job (#9) ───────────────────────────────
// Install: npm install node-cron
// This file is imported once in app.js to register the cron job.
//
// Logic:
//   Every day at 02:00 AM, find all ProposalSelections where:
//     - isLocked is false
//     - lockExpiresAt is in the past (i.e. 7 days have elapsed since selection)
//   For each expired selection:
//     1. Set isLocked = true on ProposalSelection
//     2. Create an in-app Notification for the employer (targeted by user ID)
//     3. Send an email to the employer with team details
//     4. Log the action

import cron            from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { logAction }    from './audit.js'
import { sendTeamLockedEmail } from './email.js'

const prisma = new PrismaClient()

async function processExpiredSelections() {
  console.log('[lockCron] Running selection lock check…')

  try {
    // Find selections whose lock window has expired but are not yet locked
    const expired = await prisma.proposalSelection.findMany({
      where: {
        isLocked:     false,
        lockExpiresAt: { lte: new Date() },
        proposalId:   { not: null },
      },
      include: {
        proposal: {
          include: {
            submittedBy: true,
            team: {
              include: {
                members: {
                  include: { student: { select: { id:true, firstName:true, lastName:true, email:true } } },
                },
              },
            },
          },
        },
        student: { select: { id:true, firstName:true, lastName:true } },
      },
    })

    if (expired.length === 0) {
      console.log('[lockCron] No expired selections found.')
      return
    }

    console.log(`[lockCron] Found ${expired.length} selection(s) to lock.`)

    for (const selection of expired) {
      try {
        // 1. Lock the selection
        await prisma.proposalSelection.update({
          where: { id: selection.id },
          data:  { isLocked: true },
        })

        const proposal = selection.proposal
        const employer = proposal?.submittedBy
        const team     = proposal?.team
        if (!proposal || !employer) continue

        // 2. In-app notification for employer
        await prisma.notification.create({
          data: {
            title:       'Project Selection Locked 🔒',
            message:     `A student team "${team?.name || 'Unknown Team'}" has selected your project "${proposal.title}" and the selection is now locked. You will be notified once the supervisor formally confirms the team.`,
            createdById: 1,  // system — use admin user id 1; adjust if needed
            targetUserId: employer.id,
          },
        })

        // 3. Email notification for employer
        const members = (team?.members || []).map(m => m.student).filter(Boolean)
        await sendTeamLockedEmail({
          email:         employer.email,
          firstName:     employer.firstName,
          proposalTitle: proposal.title,
          teamName:      team?.name || 'Unknown Team',
          members,
        })

        // 4. Audit log
        await logAction({
          userId:     1,  // system action
          action:     'Proposal Selection Locked (7-day expiry)',
          entityType: 'proposal',
          entityId:   proposal.id,
          details:    { teamId: team?.id, selectionId: selection.id },
        })

        console.log(`[lockCron] Locked selection ${selection.id} for proposal "${proposal.title}"`)
      } catch (err) {
        console.error(`[lockCron] Error locking selection ${selection.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[lockCron] Fatal error:', err)
  }
}

export function startLockCron() {
  // Run at 02:00 AM every day
  cron.schedule('0 2 * * *', processExpiredSelections, {
    timezone: 'Asia/Kuala_Lumpur',
  })
  console.log('[lockCron] Scheduled — runs daily at 02:00 AM MYT.')
}
