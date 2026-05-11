import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import { api } from '../../utils/api'
import styles from './Employer.module.css'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab]     = useState('profile')
  const [alert, setAlert] = useState(null)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    first_name:   user.first_name,
    last_name:    user.last_name,
    company_name: user.company_name || '',
  })
  const [passwords, setPasswords] = useState({ current:'', new_pw:'', confirm:'' })

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const handleSave = async () => {
    if (!profile.first_name || !profile.last_name) return
    setSaving(true)
    try {
      await api.updateUser(user.id, { firstName: profile.first_name, lastName: profile.last_name, companyName: profile.company_name || undefined })
      await refreshUser()
      showAlert('success', 'Profile updated successfully.')
    } catch(e) { showAlert('error', e.message) }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new_pw || !passwords.confirm) return
    if (passwords.new_pw !== passwords.confirm) { showAlert('error', 'New passwords do not match.'); return }
    if (passwords.new_pw.length < 8) { showAlert('error', 'Password must be at least 8 characters.'); return }
    setSaving(true)
    try {
      await api.updatePassword(user.id, { currentPassword: passwords.current, newPassword: passwords.new_pw })
      showAlert('success', 'Password changed successfully.')
      setPasswords({ current:'', new_pw:'', confirm:'' })
    } catch(e) { showAlert('error', e.message || 'Current password is incorrect.') }
    finally { setSaving(false) }
  }

  const TABS = [{ key:'profile', label:'Profile' }, { key:'security', label:'Security' }]

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:24 }}>Manage your account and preferences</p>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className={styles.settingsTabs}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.settingsTab} ${tab===t.key?styles.activeTab:''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className={styles.settingsCard}>
          <div className={styles.settingsProfileRow}>
            <div className={styles.settingsAvatar}>{user.first_name[0]}{user.last_name[0]}</div>
            <div>
              <div className={styles.settingsName}>{user.first_name} {user.last_name}</div>
              <div className={styles.settingsEmail}>{user.email}</div>
              <div style={{ marginTop:8 }}><Badge status={user.role}/></div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Input label="First Name" name="fname" value={profile.first_name} onChange={v=>setProfile(p=>({...p,first_name:v}))} required/>
            <Input label="Last Name"  name="lname" value={profile.last_name}  onChange={v=>setProfile(p=>({...p,last_name:v}))}  required/>
          </div>
          <Input label="Email Address" name="email" type="email" value={user.email} onChange={()=>{}} disabled hint="Email cannot be changed. Contact admin if needed."/>
          {user.role === 'employer' && (
            <Input label="Company Name" name="co" value={profile.company_name} onChange={v=>setProfile(p=>({...p,company_name:v}))}/>
          )}
          <Button onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</Button>
        </div>
      )}

      {tab === 'security' && (
        <div className={styles.settingsCard}>
          <h3 style={{ fontFamily:'Space Grotesk', fontWeight:700, marginBottom:18, fontSize:15 }}>Change Password</h3>
          <Input label="Current Password" name="cur"  type="password" value={passwords.current} onChange={v=>setPasswords(p=>({...p,current:v}))} placeholder="••••••••"/>
          <Input label="New Password"     name="new"  type="password" value={passwords.new_pw}  onChange={v=>setPasswords(p=>({...p,new_pw:v}))}  placeholder="Min 8 characters"/>
          <Input label="Confirm Password" name="conf" type="password" value={passwords.confirm} onChange={v=>setPasswords(p=>({...p,confirm:v}))} placeholder="Repeat new password"/>
          {passwords.new_pw && passwords.confirm && passwords.new_pw !== passwords.confirm && (
            <p style={{ fontSize:12.5, color:'var(--error)', marginTop:-10, marginBottom:14 }}>Passwords do not match</p>
          )}
          <Button onClick={handleChangePassword} disabled={saving||!passwords.current||!passwords.new_pw||!passwords.confirm}>
            {saving?'Updating…':'Update Password'}
          </Button>
        </div>
      )}
    </div>
  )
}
