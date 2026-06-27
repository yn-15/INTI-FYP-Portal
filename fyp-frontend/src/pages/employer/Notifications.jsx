import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDateTime } from '../../utils/helpers'
import styles from './Employer.module.css'

export default function Notifications() {
  const { user }   = useAuth()
  const { notifications, unreadCount, loading, markRead, markAllRead, fetchNotifications } = useNotifications()
  const [showForm, setShowForm] = useState(false)
  const [alert, setAlert]   = useState(null)
  const [form, setForm]     = useState({ title:'', message:'' })

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }
  const canPost = user.role === 'admin' || user.role === 'lecturer'

  const handlePost = async () => {
    if (!form.title.trim() || !form.message.trim()) return
    try {
      await api.createNotification({
        title:               form.title,
        message:             form.message,
        targetRole:          user.role === 'admin' ? null : 'student',
        targetDepartmentId:  user.department_id || null,
      })
      await fetchNotifications()
      showAlert('success', 'Announcement posted successfully.')
      setForm({ title:'', message:'' }); setShowForm(false)
    } catch(e) { showAlert('error', e.message) }
  }

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>System announcements and updates</p>
            {unreadCount > 0 && <span style={{ background:'var(--red)', color:'#fff', fontSize:12, fontWeight:700, padding:'2px 9px', borderRadius:12 }}>{unreadCount} unread</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck size={14}/> Mark all read</Button>}
          {canPost && <Button size="sm" onClick={() => setShowForm(!showForm)}>+ Post Announcement</Button>}
        </div>
      </div>

      {showForm && canPost && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'20px 22px', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, marginBottom:16 }}>New Announcement</h3>
          <Input label="Title" name="title" value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="Announcement title" required/>
          <Input label="Message" name="msg" type="textarea" rows={4} value={form.message} onChange={v=>setForm(p=>({...p,message:v}))} placeholder="Write your announcement..." required/>
          <div style={{ display:'flex', gap:10 }}>
            <Button onClick={handlePost} disabled={!form.title||!form.message}><Bell size={14}/> Post</Button>
            <Button variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.card} style={{ padding: 'var(--sp-7)', textAlign: 'center' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--fs-small)' }}>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.card} style={{ padding: 'var(--sp-7)', textAlign: 'center' }}>
          <Bell size={28} style={{ color:'var(--text-muted)', margin:'0 auto 12px', display:'block', opacity: 0.5 }}/>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--fs-small)' }}>No notifications yet.</p>
        </div>
      ) : notifications.map(n => {
        const creator = n.createdBy
        return (
          <div key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={`${styles.notifCard} ${!n.isRead ? styles.unread : ''}`}
            style={{ cursor: n.isRead ? 'default' : 'pointer', opacity: n.isRead ? 0.75 : 1 }}>
            <div className={styles.notifTitle} style={{ display:'flex', alignItems:'center', gap: 'var(--sp-2)' }}>
              {!n.isRead && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--red)', flexShrink:0, display:'inline-block' }}/>}
              {n.title}
            </div>
            <div className={styles.notifMeta}>
              <span>{creator?`${creator.firstName||creator.first_name} ${creator.lastName||creator.last_name}`:'System'}</span>
              <span>·</span>
              <span>{formatDateTime(n.createdAt||n.created_at)}</span>
              {n.isRead && <span style={{ color:'var(--text-muted)' }}>· Read</span>}
            </div>
            <div className={styles.notifBody}>{n.message}</div>
            {!n.isRead && <div style={{ marginTop:'var(--sp-2)', fontSize:'var(--fs-micro)', color:'var(--text-muted)' }}>Click to mark as read</div>}
          </div>
        )
      })}
    </div>
  )
}
