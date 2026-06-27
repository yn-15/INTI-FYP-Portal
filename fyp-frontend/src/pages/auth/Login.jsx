import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, XCircle, FileText, CheckCircle, BookOpen, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'

const ROLE_REDIRECTS = {
  admin:    '/admin',
  lecturer: '/lecturer',
  student:  '/student',
  employer: '/employer',
}

const FEATURES = [
  { icon: FileText,     title: 'Proposal Submission', desc: 'Industry partners submit project proposals for faculty review.'       },
  { icon: CheckCircle, title: 'Proposal Review',      desc: 'Admins categorise and supervisors approve proposals by department.'   },
  { icon: BookOpen,    title: 'Project Selection',    desc: 'Students browse approved proposals and claim projects first-come.'    },
  { icon: Users,       title: 'Team Formation',       desc: 'Supervisors create and manage project groups for each proposal.'      },
]

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate(ROLE_REDIRECTS[result.user.role])
    } else if (result.error === 'pending') {
      sessionStorage.setItem('pending_email', email); navigate('/pending-approval')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>

      {/* ── LEFT HERO ── */}
      <div className={styles.hero}>
        <svg className={styles.circuit} viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
          <line x1="0" y1="120" x2="260" y2="120" stroke="#CC0000" strokeWidth="1.5"/>
          <circle cx="260" cy="120" r="5" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
          <line x1="260" y1="120" x2="260" y2="280" stroke="#CC0000" strokeWidth="1.5"/>
          <line x1="260" y1="280" x2="460" y2="280" stroke="#CC0000" strokeWidth="1.5"/>
          <circle cx="460" cy="280" r="5" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
          <line x1="260" y1="200" x2="380" y2="200" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="380" cy="200" r="3.5" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="0" y1="400" x2="140" y2="400" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="140" cy="400" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="140" y1="400" x2="140" y2="560" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="140" cy="560" r="7" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="140" cy="560" r="3" fill="#CC0000"/>
          <line x1="60" y1="620" x2="100" y2="620" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="100" cy="620" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="100" y1="620" x2="100" y2="670" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="100" cy="670" r="6" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="100" cy="670" r="2.5" fill="#CC0000"/>
          <rect x="237" y="266" width="14" height="26" rx="2" fill="none" stroke="#CC0000" strokeWidth="1" opacity="0.5"/>
          <line x1="720" y1="80" x2="880" y2="80" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="720" cy="80" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="720" y1="80" x2="720" y2="200" stroke="#CC0000" strokeWidth="1"/>
          <line x1="720" y1="200" x2="840" y2="200" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="840" cy="200" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <rect x="710" y="188" width="14" height="26" rx="2" fill="none" stroke="#CC0000" strokeWidth="1" opacity="0.5"/>
          <line x1="780" y1="460" x2="900" y2="460" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="460" r="3.5" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="780" y1="460" x2="780" y2="580" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="580" r="6" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="580" r="2.5" fill="#CC0000"/>
        </svg>

        <div className={styles.heroContent}>
          {/* Logo + badge */}
          <div className={styles.heroTop}>
            <img src="/IICS-logo-red.svg" alt="INTI" className={styles.heroLogoImg}/>
            {/* <span className={styles.heroBadge}>FYP Portal</span> */}
          </div>

          {/* Title */}
          <h1 className={styles.heroTitle}>
            Industry Collaboration &<br/>
            <span>FYP Management System</span>
          </h1>
          <p className={styles.heroDesc}>
            A unified platform connecting students, faculty supervisors and industry partners —
            managing final year project proposals, team formation and collaboration end-to-end.
          </p>

          {/* Feature list */}
          <div className={styles.featureList}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <f.icon size={16}/>
                </div>
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.panel}>
        <div className={styles.formCard}>
          <div className={styles.formCardTop}/>
          <div className={styles.formCardBody}>

            <div className={styles.cardLogo}>
              <img src="/IICS-logo-new.svg" alt="INTI International College Subang" className={styles.cardLogoImg}/>
            </div>

            <div className={styles.formHeading}>
              <h2>Sign In to Your Account</h2>
              <p>Enter your credentials to access the FYP portal</p>
            </div>

            {error && (
              <div className={`${styles.alertBox} ${styles.alertError}`}>
                <XCircle size={15} style={{ flexShrink:0, marginTop:1 }}/>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="email">
                  Email Address <span className={styles.req}>*</span>
                </label>
                <input id="email" type="email"
                  className={`${styles.input} ${error ? styles.inputError : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="your@newinti.edu.my"
                  autoComplete="email"/>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="password">
                  Password <span className={styles.req}>*</span>
                </label>
                <div className={styles.inputWrap}>
                  <input id="password" type={showPw ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithEye} ${error ? styles.inputError : ''}`}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    autoComplete="current-password"/>
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <p className={styles.inputHint}>Minimum 8 characters with numbers and symbols</p>
              </div>

              <button type="submit" className={styles.submitBtn}
                disabled={!email || !password || loading}>
                {loading ? 'Signing in…' : 'Log In'}
              </button>
            </form>

            <div className={styles.switchRow}>
              New to the portal?{' '}
              <Link to="/register">Create an account</Link>
            </div>

            <div className={styles.accountTypes}>
              <div className={styles.accountTypesTitle}>Account Types</div>
              {[
                { label:'Students',          hint:'J[ID]@student.newinti.edu.my', color:'var(--info)' },
                { label:'Lecturers',         hint:'name@newinti.edu.my',          color:'var(--success)' },
                { label:'Industry Partners', hint:'company email address',        color:'var(--red)' },
              ].map(a => (
                <div key={a.label} className={styles.accountTypeRow}>
                  <div className={styles.accountTypeDot} style={{ background: a.color }}/>
                  <span><strong>{a.label}:</strong> {a.hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
