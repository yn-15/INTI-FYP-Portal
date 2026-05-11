import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import styles from './Topbar.module.css'

export default function Topbar({ title }) {
  const { user }         = useAuth()
  const { unreadCount }  = useNotifications()
  const navigate         = useNavigate()

  if (!user) return null

  const unread      = unreadCount || 0
  const notifPath   = `/${user.role}/notifications`

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.right}>
        <button
          className={styles.bellBtn}
          onClick={() => navigate(notifPath)}
          title="Notifications"
        >
          <Bell size={19}/>
          {unread > 0 && (
            <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
          )}
        </button>

        <div className={styles.userChip}>
          <div className={styles.userInitials}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.name}>{user.first_name} {user.last_name}</span>
            <span className={styles.role}>
              {user.role === 'employer'
                ? 'Industry Partner'
                : user.role === 'lecturer'
                ? 'Lecturer'
                : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}