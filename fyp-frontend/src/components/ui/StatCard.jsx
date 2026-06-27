import styles from './StatCard.module.css'

/**
 * StatCard — a single cell inside a StatPanel.
 * Replaces the old arbitrary `accent` hex prop with a constrained `tone`:
 *   - "neutral" (default): quiet icon chip, used for most stats
 *   - "live": red icon chip, reserved for the ONE stat that's actionable/positive-now
 *   - "warning": amber icon chip, for a stat that genuinely needs attention
 * This keeps color meaningful instead of decorative.
 */
export default function StatCard({ label, value, sub, tone = 'neutral', icon: Icon }) {
  return (
    <div className={styles.cell}>
      <div className={styles.topRow}>
        {Icon && (
          <div className={`${styles.iconWrap} ${styles[tone] || styles.neutral}`}>
            <Icon size={14} />
          </div>
        )}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  )
}