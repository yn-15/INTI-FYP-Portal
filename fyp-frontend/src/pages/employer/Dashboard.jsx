import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import StatPanel from '../../components/ui/StatPanel'
import Stepper from '../../components/ui/Stepper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Employer.module.css'

export default function EmployerDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.getProposals()
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending    = proposals.filter(p => p.status === 'pending')
  const approved   = proposals.filter(p => p.status === 'approved')
  const withThread = proposals.filter(p => p.chatThread)

  // Determine which workflow stage to highlight as "current" based on the
  // most recently submitted proposal's actual state — reflects real progress,
  // not generic static instructions.
  const mostRecent = proposals[0]
  const teamAssigned = approved.some(p => p.team?.confirmed)
  const stepStatuses = (() => {
    if (proposals.length === 0)      return ['current', 'upcoming', 'upcoming', 'upcoming']
    if (teamAssigned)                return ['done', 'done', 'done', 'done']
    if (approved.length > 0)         return ['done', 'done', 'current', 'upcoming']
    if (mostRecent?.status === 'returned_for_review') return ['done', 'current', 'upcoming', 'upcoming']
    return ['done', 'current', 'upcoming', 'upcoming'] // pending review
  })()

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h2 className={styles.welcomeTitle}>Welcome, {user.first_name} 👋</h2>
        <p className={styles.welcomeSub}>{user.company_name} · Track your FYP project proposals here</p>
      </div>

      {/* Stat cards */}
      <StatPanel>
        <StatCard label="Total Submitted"  value={loading?'—':proposals.length} tone="neutral" icon={FileText}      sub="All time"/>
        <StatCard label="Pending Review"   value={loading?'—':pending.length}   tone="neutral" icon={Clock}         sub="Awaiting supervisor"/>
        <StatCard label="Approved"         value={loading?'—':approved.length}  tone="live"    icon={CheckCircle}   sub="Available for selection"/>
        <StatCard label="Active Chats"     value={loading?'—':withThread.length} tone="neutral" icon={MessageSquare} sub="With supervisors"/>
      </StatPanel>

      {/* 2-col — My Proposals + Active Conversations */}
      <div className={styles.grid2}>

        {/* My Proposals */}
        <div className={styles.card} style={{ display:'flex', flexDirection:'column' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Proposals</h3>
            <button className={styles.cardLink} onClick={() => navigate('/employer/proposals')}>View all →</button>
          </div>
          {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
          : proposals.length === 0 ? (
            <div className={styles.empty} style={{ flex:1 }}>
              <FileText size={28} style={{ opacity:0.3 }}/>
              <p>No proposals submitted yet</p>
              <Button size="sm" onClick={() => navigate('/employer/submit')}>Submit First Proposal</Button>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {proposals.map(p => {
                const hasTeam = p.team?.confirmed
                return (
                  <div key={p.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:3, minHeight:38, borderRadius:2, background: p.status === 'approved' ? 'var(--success)' : p.status === 'returned_for_review' ? 'var(--corrective)' : 'var(--border-dark)', flexShrink:0, marginTop:2 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize:11.5, color:'var(--text-muted)', display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span>{p.department?.name}</span><span>·</span><span>{formatDate(p.submittedAt)}</span>
                        {hasTeam && <span style={{ color:'var(--success)', fontWeight:600 }}>· Team assigned ✓</span>}
                      </div>
                    </div>
                    <Badge status={p.status}/>
                  </div>
                )
              })}
              <button onClick={() => navigate('/employer/submit')}
                style={{ marginTop:14, width:'100%', padding:'9px', border:'1.5px dashed var(--border)', borderRadius:'var(--radius-sm)', background:'transparent', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontFamily:'DM Sans', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'var(--transition)' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.color='var(--red)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}>
                + Submit New Proposal
              </button>
            </div>
          )}
        </div>

        {/* Active Conversations */}
        <div className={styles.card} style={{ display:'flex', flexDirection:'column' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Active Conversations</h3>
            {withThread.length > 0 && <button className={styles.cardLink} onClick={() => navigate('/employer/chat')}>Open chat →</button>}
          </div>
          {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
          : withThread.length === 0 ? (
            <div className={styles.empty} style={{ flex:1 }}>
              <MessageSquare size={28} style={{ opacity:0.3 }}/>
              <p>No conversations yet</p>
              <p style={{ fontSize:12, textAlign:'center', color:'var(--text-muted)' }}>Chats open automatically when a supervisor reviews your proposal</p>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {withThread.map(p => {
                const reviewer = p.reviewedBy
                return (
                  <div key={p.id} onClick={() => navigate('/employer/chat')}
                    style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--black)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                      {reviewer ? `${reviewer.firstName[0]}${reviewer.lastName[0]}` : 'DR'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                        {reviewer ? `Dr. ${reviewer.firstName} ${reviewer.lastName}` : 'Supervisor'}
                      </div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--success)', fontWeight:600, flexShrink:0 }}>● Active</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Workflow progress */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>How it works</h3>
        </div>
        <Stepper
          steps={[
            { title: 'Submit proposal',    desc: 'Project brief with company and project details.', status: stepStatuses[0] },
            {
              title: 'Supervisor reviews',
              desc: mostRecent?.status === 'returned_for_review'
                ? 'Returned — revise and resubmit.'
                : 'An INTI lecturer reviews and approves, or returns it for revision.',
              status: stepStatuses[1],
            },
            { title: 'Students select',    desc: 'Approved proposals become available for IT or Business students to claim.', status: stepStatuses[2] },
            { title: 'Team assigned',      desc: 'Once a team is confirmed, view the students and supervisor assigned.', status: stepStatuses[3] },
          ]}
        />
      </div>
    </div>
  )
}