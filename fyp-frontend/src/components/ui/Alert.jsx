import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import styles from './Alert.module.css'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
}

export default function Alert({ type = 'info', children, className = '' }) {
  const Icon = ICONS[type] || Info
  return (
    <div className={`${styles.alert} ${styles[type]} ${className}`}>
      <Icon size={16} className={styles.icon} />
      <span>{children}</span>
    </div>
  )
}
