import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { proposals, chatThreads, teams, users, getDeptById } from '../../data/mockDB'
import { formatDate } from '../../utils/helpers'
import styles from './Employer.module.css'

export default function EmployerDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const myProposals = proposals.filter(p => p.submitted_by === user.id)
  const pending     = myProposals.filter(p => p.status === 'pending')
  const approved    = myProposals.filter(p => p.status === 'approved')
  const rejected    = myProposals.filter(p => p.status === 'rejected')
  const myThreads   = chatThreads.filter(t => myProposals.map(p => p.id).includes(t.proposal_id))
  const statusColor = { pending:'#D97706', approved:'#16A34A', rejected:'#DC2626' }

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h2 className={styles.welcomeTitle}>Welcome, {user.first_name} 👋</h2>
        <p className={styles.welcomeSub}>{user.company_name} · Track your FYP project proposals here</p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid4} style={{ marginBottom: 20 }}>
        <StatCard label="Total Submitted"  value={myProposals.length} accent="#7C3AED" icon={FileText}      sub="All time"/>
        <StatCard label="Pending Review"   value={pending.length}     accent="#D97706" icon={Clock}         sub="Awaiting supervisor"/>
        <StatCard label="Approved"         value={approved.length}    accent="#16A34A" icon={CheckCircle}   sub="Available for selection"/>
        <StatCard label="Active Chats"     value={myThreads.length}   accent="#2563EB" icon={MessageSquare} sub="With supervisors"/>
      </div>

      {/* 2-col — My Proposals + Active Conversations */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20, alignItems:'stretch' }}>

        {/* My Proposals */}
        <div className={styles.card} style={{ display:'flex', flexDirection:'column' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Proposals</h3>
            <button className={styles.cardLink} onClick={() => navigate('/employer/proposals')}>View all →</button>
          </div>
          {myProposals.length === 0 ? (
            <div className={styles.empty} style={{ flex:1 }}>
              <FileText size={28} style={{ opacity:0.3 }}/>
              <p>No proposals submitted yet</p>
              <Button size="sm" onClick={() => navigate('/employer/submit')}>Submit First Proposal</Button>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {myProposals.map(p => {
                const dept    = getDeptById(p.department_id)
                const hasTeam = teams.find(t => t.proposal_id === p.id && t.confirmed)
                return (
                  <div key={p.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:3, minHeight:38, borderRadius:2, background:statusColor[p.status]||'#D1D5DB', flexShrink:0, marginTop:2 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize:11.5, color:'var(--text-muted)', display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span>{dept?.name}</span><span>·</span><span>{formatDate(p.submitted_at)}</span>
                        {hasTeam && <span style={{ color:'#16A34A', fontWeight:600 }}>· Team assigned ✓</span>}
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
            {myThreads.length > 0 && <button className={styles.cardLink} onClick={() => navigate('/employer/chat')}>Open chat →</button>}
          </div>
          {myThreads.length === 0 ? (
            <div className={styles.empty} style={{ flex:1 }}>
              <MessageSquare size={28} style={{ opacity:0.3 }}/>
              <p>No conversations yet</p>
              <p style={{ fontSize:12, textAlign:'center', color:'var(--text-muted)' }}>Chats open automatically when a supervisor reviews your proposal</p>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {myThreads.map(t => {
                const proposal = myProposals.find(p => p.id === t.proposal_id)
                const reviewer = proposal?.reviewed_by ? users.find(u => u.id === proposal.reviewed_by) : null
                return (
                  <div key={t.id} onClick={() => navigate('/employer/chat')}
                    style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'#134770', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                      {reviewer ? `${reviewer.first_name[0]}${reviewer.last_name[0]}` : 'DR'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{proposal?.title || '—'}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                        {reviewer ? `Dr. ${reviewer.first_name} ${reviewer.last_name}` : 'Supervisor'}
                      </div>
                    </div>
                    <span style={{ fontSize:12, color:'#16A34A', fontWeight:600, flexShrink:0 }}>● Active</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* How It Works — full width, 4-col horizontal */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>How It Works</h3>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[
            { step:'1', title:'Submit Proposal',    desc:'Fill in the project brief form with your company and project details.',            color:'#7C3AED', bg:'rgba(124,58,237,0.08)', border:'rgba(124,58,237,0.15)' },
            { step:'2', title:'Supervisor Reviews', desc:'An INTI lecturer reviews your proposal and approves or rejects it.',               color:'#2563EB', bg:'rgba(37,99,235,0.08)',  border:'rgba(37,99,235,0.15)'  },
            { step:'3', title:'Students Select',    desc:'Approved proposals become available for IT or Business students to claim.',        color:'#D97706', bg:'rgba(217,119,6,0.08)',  border:'rgba(217,119,6,0.15)'  },
            { step:'4', title:'Team Assigned',      desc:'Once a team is confirmed, you can view the students and supervisor assigned.',     color:'#16A34A', bg:'rgba(22,163,74,0.08)',  border:'rgba(22,163,74,0.15)'  },
          ].map(s => (
            <div key={s.step} style={{ padding:'18px 16px', background:s.bg, borderRadius:'var(--radius-md)', border:`1px solid ${s.border}` }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:s.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, marginBottom:12, flexShrink:0 }}>{s.step}</div>
              <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text-primary)', fontFamily:'Space Grotesk', marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:12.5, color:'var(--text-muted)', lineHeight:1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
