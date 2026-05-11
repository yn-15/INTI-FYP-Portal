import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, RefreshCw } from 'lucide-react'
import styles from './PendingApproval.module.css'

const POLL_INTERVAL = 8000

export default function PendingApproval() {
  const navigate      = useNavigate()
  const [status, setStatus]       = useState('pending')
  const [checking, setChecking]   = useState(false)
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000)
  const intervalRef  = useRef(null)
  const countdownRef = useRef(null)
  const pendingEmail = sessionStorage.getItem('pending_email')

  const checkStatus = async () => {
    if (!pendingEmail) return
    setChecking(true)
    setCountdown(POLL_INTERVAL / 1000)
    try {
      // Try logging in silently — backend returns 403 'pending' or success
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, password: '__status_check__' }),
      })
      const data = await res.json()
      // If error is NOT 'pending' that means account moved to active or deactivated
      if (res.status === 401) {
        // Wrong password but no 'pending' = account is now active
        setStatus('approved')
        clearInterval(intervalRef.current)
        clearInterval(countdownRef.current)
      } else if (data.error === 'deactivated') {
        setStatus('rejected')
        clearInterval(intervalRef.current)
        clearInterval(countdownRef.current)
      }
      // If still 'pending', do nothing
    } catch { /* network error, try again next interval */ }
    setChecking(false)
  }

  useEffect(() => {
    checkStatus()
    intervalRef.current  = setInterval(checkStatus, POLL_INTERVAL)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => prev <= 1 ? POLL_INTERVAL / 1000 : prev - 1)
    }, 1000)
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(countdownRef.current)
    }
  }, [])

  const handleLoginNow = () => {
    sessionStorage.removeItem('pending_email')
    navigate('/login')
  }

  if (status === 'approved') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/IICS-logo-new.svg" alt="INTI" className={styles.logo}/>
          <div className={styles.iconWrap} style={{ background:'#F0FDF4', borderColor:'#86EFAC' }}>
            <CheckCircle size={32} color="#16A34A"/>
          </div>
          <h1 style={{ color:'#166534' }}>Account Approved! 🎉</h1>
          <p>Your account has been activated by the INTI FYP Administrator. You now have full access to the portal.</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Check your <strong>notification bell</strong> after logging in for a welcome message.</p>
          <button onClick={handleLoginNow} style={{ width:'100%', padding:'12px', marginTop:8, background:'#CC0000', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans', boxShadow:'0 2px 8px rgba(204,0,0,0.28)' }}>
            Log In Now →
          </button>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/IICS-logo-new.svg" alt="INTI" className={styles.logo}/>
          <div className={styles.iconWrap} style={{ background:'#FEF2F2', borderColor:'#FECACA' }}>
            <Clock size={32} color="#DC2626"/>
          </div>
          <h1 style={{ color:'#991B1B' }}>Registration Not Approved</h1>
          <p>Your registration was not approved. Please contact the FYP Coordinator for more information.</p>
          <p className={styles.contact}><a href="mailto:fyp@newinti.edu.my">fyp@newinti.edu.my</a></p>
          <button onClick={() => navigate('/login')} style={{ width:'100%', padding:'11px', background:'#1A1A1A', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans' }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src="/IICS-logo-new.svg" alt="INTI" className={styles.logo}/>
        <div className={styles.iconWrap}><Clock size={32} color="#D97706"/></div>
        <h1>Account Pending Approval</h1>
        <p>Thank you for registering. Your account is awaiting review by the INTI FYP Administrator.</p>

        <div className={styles.pollingBox}>
          <div className={styles.pollingRow}>
            <RefreshCw size={14} style={{ color: checking ? 'var(--red)' : 'var(--text-muted)', animation: checking ? 'spin 0.8s linear infinite' : 'none', flexShrink:0 }}/>
            <span style={{ fontSize:13, color: checking ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {checking ? 'Checking account status…' : `Checking again in ${countdown}s`}
            </span>
          </div>
          <div className={styles.pollingBar}>
            <div className={styles.pollingBarFill} style={{ width:`${((POLL_INTERVAL/1000 - countdown) / (POLL_INTERVAL/1000)) * 100}%` }}/>
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', margin:'8px 0 0', lineHeight:1.5 }}>This page checks automatically — you don't need to refresh.</p>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoTitle}>What happens next?</div>
          <ol className={styles.steps}>
            <li>The FYP Administrator reviews your registration</li>
            <li>Your role and department are assigned</li>
            <li>Your account is activated — this page updates automatically</li>
            <li>You receive a welcome notification when you log in</li>
          </ol>
        </div>

        <p className={styles.contact}>Questions? Contact <a href="mailto:fyp@newinti.edu.my">fyp@newinti.edu.my</a></p>
        <button onClick={() => navigate('/login')} style={{ width:'100%', padding:'10px', background:'transparent', color:'var(--text-muted)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13.5, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans' }}>
          Back to Login
        </button>
      </div>
    </div>
  )
}
