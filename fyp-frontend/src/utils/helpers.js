// ── Date formatting ───────────────────────────────────────────────────────────
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

// ── Proposal drop deadline ────────────────────────────────────────────────────
export function getDropDeadline(selectedAt) {
  const d = new Date(selectedAt)
  d.setDate(d.getDate() + 7)
  return d
}

export function getDaysUntilLock(selectedAt) {
  const deadline = getDropDeadline(selectedAt)
  const diff = deadline.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function isSelectionLocked(selectedAt) {
  return getDropDeadline(selectedAt).getTime() < Date.now()
}

// ── Initials ──────────────────────────────────────────────────────────────────
export function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

// ── Role display ──────────────────────────────────────────────────────────────
export const roleLabels = {
  admin: 'Administrator',
  lecturer: 'Lecturer / Supervisor',
  student: 'Student',
  employer: 'Industry Partner',
}

export const statusLabels = {
  pending: 'Pending Approval',
  active: 'Active',
  deactivated: 'Deactivated',
}
