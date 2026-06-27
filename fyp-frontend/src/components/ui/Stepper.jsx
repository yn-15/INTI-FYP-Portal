import styles from './Stepper.module.css'

/**
 * Stepper — connected horizontal progress indicator for sequential workflows.
 * Replaces static "how it works" cards with a real progress visualization
 * that can reflect actual state (done / current / upcoming).
 *
 * Usage:
 *   <Stepper
 *     steps={[
 *       { title: 'Submit proposal', desc: 'Project brief with company details.', status: 'done' },
 *       { title: 'Supervisor reviews', desc: 'Reviewed by Dr. Robina Tinawin.', status: 'done' },
 *       { title: 'Students select', desc: 'Visible to IT students now.', status: 'current' },
 *       { title: 'Team assigned', desc: 'View students once confirmed.', status: 'upcoming' },
 *     ]}
 *   />
 *
 * step.status: 'done' | 'current' | 'upcoming'
 */
export default function Stepper({ steps = [] }) {
  const fillPercent = (() => {
    const doneCount = steps.filter(s => s.status === 'done').length
    const hasCurrent = steps.some(s => s.status === 'current')
    const segments = steps.length - 1
    if (segments <= 0) return 0
    const completedSegments = hasCurrent ? doneCount : Math.max(doneCount - 1, 0)
    return Math.min(100, (completedSegments / segments) * 100)
  })()

  return (
    <div className={styles.stepper}>
      <div className={styles.line} />
      <div className={styles.lineFill} style={{ width: `calc(${fillPercent}% )` }} />
      {steps.map((step, i) => (
        <div key={i} className={`${styles.node} ${styles[step.status] || ''}`}>
          <div className={styles.circle}>
            {step.status === 'done'
              ? <CheckIcon />
              : i + 1}
          </div>
          <div className={styles.tag}>
            {step.status === 'done' ? 'Done' : step.status === 'current' ? 'In progress' : 'Upcoming'}
          </div>
          <div className={styles.title}>{step.title}</div>
          {step.desc && <div className={styles.desc}>{step.desc}</div>}
        </div>
      ))}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
