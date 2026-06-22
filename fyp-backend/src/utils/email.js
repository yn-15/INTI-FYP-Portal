// ── Email utility using Resend ─────────────────────────────────────────────────
// Install: npm install resend
// Add to .env: RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
//              EMAIL_FROM=noreply@yourdomain.com  (must be a verified Resend domain)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_ADDRESS   = process.env.EMAIL_FROM || 'FYP Portal <noreply@newinti.edu.my>'
const PORTAL_URL     = process.env.FRONTEND_URL || 'https://inti-fyp-portal.vercel.app'

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send.')
    return null
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('[email] Resend error:', data)
      return null
    }
    return data
  } catch (err) {
    console.error('[email] Send failed:', err)
    return null
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function sendApprovalEmail({ email, firstName, role, departmentName }) {
  const roleLabel = {
    admin:    'Administrator',
    lecturer: 'Lecturer / Supervisor',
    student:  'Student',
    employer: 'Industry Partner',
  }[role] || role

  const deptLine = departmentName ? `<p style="margin:0 0 8px"><strong>Department:</strong> ${departmentName}</p>` : ''

  return sendEmail({
    to: email,
    subject: 'Your INTI FYP Portal Account Has Been Approved',
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1A1A1A">
        <img src="${PORTAL_URL}/IICS-logo-new.svg" alt="INTI" style="height:36px;margin-bottom:28px"/>
        <h2 style="font-family:Space Grotesk,sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">
          Account Approved 🎉
        </h2>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          Hi ${firstName},<br/>Your registration on the INTI FYP Portal has been reviewed and approved.
          You now have full access as a <strong>${roleLabel}</strong>.
        </p>
        ${deptLine}
        <a href="${PORTAL_URL}/login"
          style="display:inline-block;margin-top:8px;padding:12px 24px;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px">
          Log In to the Portal →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#9CA3AF">
          INTI International College Subang · FYP Management System<br/>
          If you did not register for this account, please contact <a href="mailto:fyp@newinti.edu.my">fyp@newinti.edu.my</a>.
        </p>
      </div>
    `,
  })
}

export async function sendRejectionEmail({ email, firstName }) {
  return sendEmail({
    to: email,
    subject: 'Update on Your INTI FYP Portal Registration',
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1A1A1A">
        <img src="${PORTAL_URL}/IICS-logo-new.svg" alt="INTI" style="height:36px;margin-bottom:28px"/>
        <h2 style="font-family:Space Grotesk,sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">
          Registration Update
        </h2>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          Hi ${firstName},<br/>Unfortunately, your registration on the INTI FYP Portal could not be approved at this time.
        </p>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          Please contact the FYP Coordinator for further information:
        </p>
        <a href="mailto:fyp@newinti.edu.my" style="color:#CC0000;font-weight:600">fyp@newinti.edu.my</a>
        <p style="margin-top:32px;font-size:12px;color:#9CA3AF">
          INTI International College Subang · FYP Management System
        </p>
      </div>
    `,
  })
}

export async function sendProposalReturnedEmail({ email, firstName, proposalTitle, feedback, portalPath }) {
  return sendEmail({
    to: email,
    subject: `Action Required: Your Proposal Has Been Returned for Review`,
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1A1A1A">
        <img src="${PORTAL_URL}/IICS-logo-new.svg" alt="INTI" style="height:36px;margin-bottom:28px"/>
        <h2 style="font-family:Space Grotesk,sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">
          Proposal Returned for Review
        </h2>
        <p style="margin:0 0 12px;line-height:1.6;color:#374151">Hi ${firstName},</p>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          Your proposal <strong>"${proposalTitle}"</strong> has been returned for review by an INTI supervisor.
          Please read the feedback below, make the necessary revisions, and resubmit.
        </p>
        <div style="padding:14px 16px;background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:4px;margin-bottom:20px">
          <div style="font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Supervisor Feedback</div>
          <div style="font-size:14px;color:#92400E;line-height:1.6">${feedback}</div>
        </div>
        <a href="${PORTAL_URL}${portalPath || '/employer/proposals'}"
          style="display:inline-block;padding:12px 24px;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px">
          Edit & Resubmit Proposal →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#9CA3AF">
          INTI International College Subang · FYP Management System
        </p>
      </div>
    `,
  })
}

export async function sendTeamLockedEmail({ email, firstName, proposalTitle, teamName, members }) {
  const memberList = members.map(m =>
    `<li style="margin-bottom:4px">${m.firstName} ${m.lastName} — ${m.email}</li>`
  ).join('')

  return sendEmail({
    to: email,
    subject: `Project Selected: A Team Has Chosen Your Proposal`,
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1A1A1A">
        <img src="${PORTAL_URL}/IICS-logo-new.svg" alt="INTI" style="height:36px;margin-bottom:28px"/>
        <h2 style="font-family:Space Grotesk,sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">
          Your Project Has Been Selected 🎓
        </h2>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          Hi ${firstName},<br/>A student team has selected your proposal
          <strong>"${proposalTitle}"</strong> and the project is now locked to their team.
        </p>
        <div style="padding:14px 16px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:6px;margin-bottom:20px">
          <div style="font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Assigned Team — ${teamName}</div>
          <ul style="margin:0;padding-left:18px;font-size:14px;color:#166534;line-height:1.8">
            ${memberList}
          </ul>
        </div>
        <p style="margin:0 0 16px;line-height:1.6;color:#374151">
          You will be notified once the team is formally confirmed by the INTI supervisor.
          You can monitor the project progress through the portal.
        </p>
        <a href="${PORTAL_URL}/employer/proposals"
          style="display:inline-block;padding:12px 24px;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px">
          View in Portal →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#9CA3AF">
          INTI International College Subang · FYP Management System
        </p>
      </div>
    `,
  })
}
