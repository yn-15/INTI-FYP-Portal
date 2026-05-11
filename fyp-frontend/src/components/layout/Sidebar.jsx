import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, UsersRound,
  Bell, ClipboardList, BarChart2, Settings,
  MessageSquare, LogOut, BookOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

const NAV = {
  admin: [
    { to: '/admin',                    icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/admin/users',              icon: Users,           label: 'User Management' },
    { to: '/admin/proposals',          icon: FileText,        label: 'Proposals'       },
    { to: '/admin/teams',              icon: UsersRound,      label: 'Teams'           },
    { to: '/admin/notifications',      icon: Bell,            label: 'Notifications'   },
    { to: '/admin/audit',              icon: ClipboardList,   label: 'Audit Log'       },
    { to: '/admin/reports',            icon: BarChart2,       label: 'Reports'         },
    { to: '/admin/settings',           icon: Settings,        label: 'Settings'        },
  ],
  lecturer: [
    { to: '/lecturer',                 icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/lecturer/proposals',       icon: FileText,        label: 'Proposals'       },
    { to: '/lecturer/chat',            icon: MessageSquare,   label: 'Chat'            },
    { to: '/lecturer/teams',           icon: UsersRound,      label: 'Teams'           },
    { to: '/lecturer/notifications',   icon: Bell,            label: 'Notifications'   },
    { to: '/lecturer/reports',         icon: BarChart2,       label: 'Reports'         },
    { to: '/lecturer/settings',        icon: Settings,        label: 'Settings'        },
  ],
  student: [
    { to: '/student',                  icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/student/proposals',        icon: BookOpen,        label: 'Browse Proposals'},
    { to: '/student/team',             icon: UsersRound,      label: 'My Team'         },
    { to: '/student/notifications',    icon: Bell,            label: 'Notifications'   },
    { to: '/student/settings',         icon: Settings,        label: 'Settings'        },
  ],
  employer: [
    { to: '/employer',                 icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/employer/submit',          icon: FileText,        label: 'Submit Proposal' },
    { to: '/employer/proposals',       icon: ClipboardList,   label: 'My Proposals'    },
    { to: '/employer/chat',            icon: MessageSquare,   label: 'Chat'            },
    { to: '/employer/notifications',   icon: Bell,            label: 'Notifications'   },
    { to: '/employer/settings',        icon: Settings,        label: 'Settings'        },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const links = NAV[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoArea}>
        <img src="/IICS-logo-red.svg" alt="INTI International College Subang" className={styles.logo} />
      </div>

      {/* User info */}
      <div className={styles.userArea}>
        <div className={styles.userInitials}>
          {user.first_name[0]}{user.last_name[0]}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.first_name} {user.last_name}</span>
          <span className={styles.userRole}>
            {user.role === 'employer' ? 'Industry Partner' : user.role === 'lecturer' ? 'Lecturer / Supervisor' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${user.role}`}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <link.icon size={17} className={styles.navIcon} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
