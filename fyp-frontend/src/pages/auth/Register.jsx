import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, XCircle, UserPlus, ShieldCheck, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { validateRegisterForm, getPasswordStrength } from '../../utils/validators'
import { departments } from '../../data/mockDB'
import styles from './Auth.module.css'

const ROLES = [
  { value: 'student',  label: 'Student',         hint: 'J[ID]@student.newinti.edu.my' },
  { value: 'lecturer', label: 'Lecturer',         hint: 'name@newinti.edu.my'          },
  { value: 'employer', label: 'Industry Partner', hint: 'company email'               },
]

const REG_STEPS = [
  { icon: UserPlus,    title: 'Register Account', desc: 'Students, lecturers, and industry partners submit their account details.' },
  { icon: ShieldCheck, title: 'Admin Approval',   desc: 'The FYP Admin reviews registrations and activates valid accounts.'        },
  { icon: LogIn,       title: 'Access Portal',    desc: 'Approved users can log in and access role-based features immediately.'    },
]

export default function Register() {
  const { register } = useAuth()
  const [role, setRole]       = useState('student')
  const [form, setForm]       = useState({ first_name:'', last_name:'', email:'', password:'', company_name:'', agreed:false })
  const [errors, setErrors]   = useState({})
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = key => val => setForm(p => ({ ...p, [key]: val }))
  const pwStrength = getPasswordStrength(form.password)

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validateRegisterForm({ ...form, role })
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const result = await register({ ...form, role })
    setLoading(false)
    if (result.success) { sessionStorage.setItem('pending_email', form.email); setSuccess(true) }
    else setErrors({ general: result.error })
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <svg className={styles.circuit} viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
            <line x1="0" y1="120" x2="260" y2="120" stroke="#CC0000" strokeWidth="1.5"/>
            <circle cx="260" cy="120" r="5" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
            <line x1="260" y1="120" x2="260" y2="280" stroke="#CC0000" strokeWidth="1.5"/>
            <circle cx="460" cy="280" r="5" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
            <line x1="720" y1="80" x2="880" y2="80" stroke="#CC0000" strokeWidth="1"/>
            <circle cx="720" cy="80" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          </svg>
          <div className={styles.heroContent}>
            <div className={styles.heroTop}>
              <img src="/IICS-logo-red.svg" alt="INTI" className={styles.heroLogoImg}/>
              <span className={styles.heroBadge}>FYP Portal</span>
            </div>
            <h1 className={styles.heroTitle}>Registration<br/><span>Submitted</span></h1>
            <p className={styles.heroDesc}>Your account is now pending review by the INTI FYP Administrator. You'll be notified once it's activated.</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.formCard}>
            <div className={styles.formCardTop}/>
            <div className={styles.formCardBody}>
              <div className={styles.cardLogo}>
                <img src="/IICS-logo-new.svg" alt="INTI" className={styles.cardLogoImg}/>
              </div>
              <div className={styles.successState}>
                <div className={styles.successIcon}>✓</div>
                <h3>Registration Submitted!</h3>
                <p>
                  Your account request has been received. The INTI FYP Administrator will review and activate your account within <strong>1–2 business days</strong>.
                  <br/><br/>
                  <strong>Submitted email:</strong> {form.email}
                </p>
                <button className={styles.submitBtn} onClick={() => window.location.href = '/login'}>
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <line x1="720" y1="80" x2="880" y2="80" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="720" cy="80" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="720" y1="80" x2="720" y2="200" stroke="#CC0000" strokeWidth="1"/>
          <line x1="720" y1="200" x2="840" y2="200" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="840" cy="200" r="4" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="780" y1="460" x2="900" y2="460" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="460" r="3.5" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <line x1="780" y1="460" x2="780" y2="580" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="580" r="6" fill="none" stroke="#CC0000" strokeWidth="1"/>
          <circle cx="780" cy="580" r="2.5" fill="#CC0000"/>
        </svg>

        <div className={styles.heroContent}>
          <div className={styles.heroTop}>
            <img src="/IICS-logo-red.svg" alt="INTI" className={styles.heroLogoImg}/>
            <span className={styles.heroBadge}>FYP Portal</span>
          </div>

          <h1 className={styles.heroTitle}>
            Join the INTI<br/>
            <span>FYP Programme</span>
          </h1>
          <p className={styles.heroDesc}>
            Register to participate in the INTI International College Subang Final Year Project
            programme. All accounts require administrator approval before access is granted.
          </p>

          <div className={styles.featureList}>
            {REG_STEPS.map(s => (
              <div key={s.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <s.icon size={16}/>
                </div>
                <div>
                  <div className={styles.featureTitle}>{s.title}</div>
                  <div className={styles.featureDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Email format hints */}
          <div className={styles.heroHintBox}>
            <div className={styles.heroHintTitle}>Email Format by Role</div>
            {ROLES.map(r => (
              <div key={r.value} className={styles.heroHintRow}>
                <div className={styles.heroHintDot} style={{ background: r.value==='student'?'#2563EB':r.value==='lecturer'?'#16A34A':'#7C3AED' }}/>
                <span><strong>{r.label}:</strong> {r.hint}</span>
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
              <h2>Create Your Account</h2>
              <p>Register for the INTI FYP Portal — all accounts pending admin approval</p>
            </div>

            {errors.general && (
              <div className={`${styles.alertBox} ${styles.alertError}`}>
                <XCircle size={15} style={{ flexShrink:0, marginTop:1 }}/>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Role tabs */}
            <div className={styles.roleTabs}>
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  className={`${styles.roleTab} ${role===r.value ? styles.activeTab : ''}`}
                  onClick={() => { setRole(r.value); setErrors({}) }}>
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name <span className={styles.req}>*</span></label>
                  <input type="text"
                    className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
                    value={form.first_name} onChange={e => set('first_name')(e.target.value)} placeholder="First"/>
                  {errors.first_name && <p className={styles.inputErrMsg}>{errors.first_name}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name <span className={styles.req}>*</span></label>
                  <input type="text"
                    className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
                    value={form.last_name} onChange={e => set('last_name')(e.target.value)} placeholder="Last"/>
                  {errors.last_name && <p className={styles.inputErrMsg}>{errors.last_name}</p>}
                </div>
              </div>

              {role === 'employer' && (
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Company Name <span className={styles.req}>*</span></label>
                  <input type="text"
                    className={`${styles.input} ${errors.company_name ? styles.inputError : ''}`}
                    value={form.company_name} onChange={e => set('company_name')(e.target.value)}
                    placeholder="ABC Technologies Sdn. Bhd."/>
                  {errors.company_name && <p className={styles.inputErrMsg}>{errors.company_name}</p>}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email Address <span className={styles.req}>*</span></label>
                <input type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  value={form.email} onChange={e => set('email')(e.target.value)}
                  placeholder={role==='student' ? 'J22012345@student.newinti.edu.my' : role==='lecturer' ? 'firstname.lastname@newinti.edu.my' : 'yourname@company.com'}
                  autoComplete="email"/>
                {errors.email && <p className={styles.inputErrMsg}>{errors.email}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password <span className={styles.req}>*</span></label>
                <div className={styles.inputWrap}>
                  <input type={showPw ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithEye} ${errors.password ? styles.inputError : ''}`}
                    value={form.password} onChange={e => set('password')(e.target.value)}
                    placeholder="Min 8 characters" autoComplete="new-password"/>
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {form.password && (
                  <>
                    <div className={styles.strengthBar}>
                      {[1,2,3,4].map(i => (
                        <div key={i} className={styles.strengthSeg}
                          style={{ background: i <= pwStrength.score ? pwStrength.color : '#EEE' }}/>
                      ))}
                    </div>
                    <p className={styles.strengthLabel} style={{ color: pwStrength.color }}>{pwStrength.label} password</p>
                  </>
                )}
                {errors.password && <p className={styles.inputErrMsg}>{errors.password}</p>}
              </div>

              <label className={styles.termsWrap}>
                <input type="checkbox" checked={form.agreed} onChange={e => set('agreed')(e.target.checked)}/>
                <span>
                  I agree to abide by INTI's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                  Violations may lead to restriction of website privileges and/or disciplinary action.
                </span>
              </label>
              {errors.agreed && <p className={styles.inputErrMsg} style={{ marginTop:-10, marginBottom:14 }}>{errors.agreed}</p>}

              <button type="submit" className={styles.submitBtn}
                disabled={!form.agreed || loading}>
                {loading ? 'Submitting…' : 'Create Account'}
              </button>
            </form>

            <div className={styles.switchRow}>
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
