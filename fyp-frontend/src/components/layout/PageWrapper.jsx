import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './PageWrapper.module.css'

export default function PageWrapper({ title, children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar title={title} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
