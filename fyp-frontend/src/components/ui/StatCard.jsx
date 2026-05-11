import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div className={styles.card} style={{ '--accent': accent || 'var(--red)' }}>
      <div className={styles.top}>
        <div>
          <div className={styles.value}>{value}</div>
          <div className={styles.label}>{label}</div>
          {sub && <div className={styles.sub}>{sub}</div>}
        </div>
        {Icon && (
          <div className={styles.iconWrap} style={{ background: `${accent || 'var(--red)'}18` }}>
            <Icon size={20} style={{ color: accent || 'var(--red)' }} />
          </div>
        )}
      </div>
    </div>
  )
}
