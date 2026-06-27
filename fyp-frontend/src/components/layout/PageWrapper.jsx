import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './PageWrapper.module.css'

export default function PageWrapper({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
