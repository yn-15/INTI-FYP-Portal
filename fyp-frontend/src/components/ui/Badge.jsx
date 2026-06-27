import styles from './Badge.module.css'

const CONFIG = {
  // Proposal status
  pending:          { label: 'Pending',          cls: 'warning' },
  approved:         { label: 'Approved',          cls: 'success' },
  rejected:             { label: 'Returned for Review', cls: 'corrective' },
  returned_for_review:  { label: 'Returned for Review', cls: 'corrective' },
  // User status
  active:           { label: 'Active',            cls: 'success' },
  deactivated:      { label: 'Deactivated',       cls: 'neutral' },
  pending_approval: { label: 'Pending Approval',  cls: 'warning' },
  // Roles
  admin:            { label: 'Admin',             cls: 'dark'    },
  lecturer:         { label: 'Lecturer',          cls: 'info'    },
  student:          { label: 'Student',           cls: 'success' },
  employer:         { label: 'Industry Partner',  cls: 'purple'  },
  // Selection
  selected:         { label: 'Selected',          cls: 'info'    },
  locked:           { label: 'Locked',            cls: 'neutral' },
  // Team
  confirmed:        { label: 'Confirmed',         cls: 'success' },
  draft:            { label: 'Draft',             cls: 'warning' },
  // Departments
  IT:               { label: 'IT',               cls: 'info'    },
  Business:         { label: 'Business',          cls: 'purple'  },
}

export default function Badge({ status, label, variant }) {
  const cfg = CONFIG[status] || { label: label || status, cls: variant || 'neutral' }
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      {cfg.label}
    </span>
  )
}
