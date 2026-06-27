import styles from './StatPanel.module.css'

/**
 * StatPanel — a connected container for StatCard cells.
 * Renders children (StatCard instances) as a single ledger-style panel
 * with hairline dividers between cells, instead of separate floating cards.
 *
 * Usage:
 *   <StatPanel>
 *     <StatCard label="Total" value={12} tone="neutral" icon={FileText} sub="All time" />
 *     <StatCard label="Approved" value={4} tone="live" icon={CheckCircle} sub="Available now" />
 *   </StatPanel>
 */
export default function StatPanel({ children }) {
  return (
    <div className={styles.panel}>
      {children}
    </div>
  )
}
