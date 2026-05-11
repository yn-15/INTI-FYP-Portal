import { useState, useEffect } from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Employer.module.css'

export default function MyProposals() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    api.getProposals()
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = proposals.filter(p => filter === 'all' ? true : p.status === filter)

  const getField = (p, ...keys) => { for (const k of keys) if (p[k]) return p[k]; return null }

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionSub}>{user.company_name} · Track all your submitted proposals</p>
        <Button onClick={() => navigate('/employer/submit')}>+ Submit New Proposal</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[['Total',proposals.length,'#1A1A1A'],['Pending',proposals.filter(p=>p.status==='pending').length,'#D97706'],
          ['Approved',proposals.filter(p=>p.status==='approved').length,'#16A34A'],['Rejected',proposals.filter(p=>p.status==='rejected').length,'#DC2626'],
        ].map(([l,c,col]) => (
          <div key={l} style={{ background:'var(--card)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', padding:'14px 18px' }}>
            <div style={{ fontSize:24, fontWeight:700, color:col, fontFamily:'Space Grotesk' }}>{loading?'—':c}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className={styles.filterTabs}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} className={`${styles.filterTab} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)} style={{ textTransform:'capitalize' }}>{f==='all'?'All':f}</button>
        ))}
      </div>

      {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>
      : filtered.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`} style={{ padding:60 }}>
          <p>No proposals found</p>
          <Button size="sm" onClick={() => navigate('/employer/submit')}>Submit a Proposal</Button>
        </div>
      ) : filtered.map(p => {
        const reviewer  = p.reviewedBy
        const team      = p.team
        return (
          <div key={p.id} className={`${styles.proposalStatusCard} ${styles[p.status]}`}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                  <Badge status={p.status}/>
                  {p.department && <span style={{ fontSize:12, padding:'2px 8px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-muted)' }}>{p.department.name}</span>}
                  {team?.confirmed && <span style={{ fontSize:12, color:'#16A34A', fontWeight:600 }}>● Team Assigned</span>}
                </div>
                <div className={styles.proposalCardTitle}>{p.title}</div>
                <div className={styles.proposalCardMeta}>
                  <span>Submitted {formatDate(p.submittedAt)}</span>
                  {reviewer && <><span>·</span><span>Reviewed by Dr. {reviewer.firstName} {reviewer.lastName}</span></>}
                </div>

                {p.reviewFeedback && (
                  <div style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', border:'1px solid', marginBottom:10,
                    background:p.status==='approved'?'#F0FDF4':p.status==='rejected'?'#FEF2F2':'#FFFBEB',
                    borderColor:p.status==='approved'?'#86EFAC':p.status==='rejected'?'#FCA5A5':'#FDE68A',
                    color:p.status==='approved'?'#16A34A':p.status==='rejected'?'#DC2626':'#D97706',
                    fontSize:13.5, lineHeight:1.55 }}>
                    <strong>Supervisor Feedback:</strong> {p.reviewFeedback}
                  </div>
                )}

                {team?.confirmed && (
                  <div className={styles.teamReveal}>
                    <div className={styles.teamRevealTitle}>
                      Assigned Team — {team.name}
                      {team.supervisor && <span style={{ fontWeight:400, color:'rgba(255,255,255,0.6)', marginLeft:8 }}>· Supervisor: Dr. {team.supervisor.firstName} {team.supervisor.lastName}</span>}
                    </div>
                    {(team.members||[]).map(m => {
                      const s = m.student||m
                      return (
                        <div key={s.id} className={styles.teamMemberRow}>
                          <div className={styles.teamMemberAvatar}>{(s.firstName||'')[0]}{(s.lastName||'')[0]}</div>
                          <div className={styles.teamMemberName}>{s.firstName} {s.lastName}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(p); setModal('detail') }}>
                  <Eye size={13}/> View
                </Button>
                {p.chatThread && (
                  <Button size="sm" variant="subtle" onClick={() => navigate('/employer/chat')}>
                    <MessageSquare size={13}/> Chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {modal === 'detail' && selected && (
        <Modal title="Proposal Details" size="lg" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>
            {selected.chatThread && <Button onClick={() => { setModal(null); navigate('/employer/chat') }}><MessageSquare size={14}/> Open Chat</Button>}
          </>}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Title',selected.title],['Status',null],['Department',selected.department?.name||'—'],['Submitted',formatDate(selected.submittedAt)]].map(([l,v]) => (
              <div key={l} style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:3 }}>{l}</div>
                {v===null ? <Badge status={selected.status}/> : <div style={{ fontSize:13.5, fontWeight:500 }}>{v}</div>}
              </div>
            ))}
          </div>
          {[['Problem Statement',selected.problemStatement],['Deliverables',selected.deliverables]].filter(([,v])=>v).map(([l,v]) => (
            <div key={l} style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', lineHeight:1.6 }}>{v}</div>
            </div>
          ))}
          {selected.reviewFeedback && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>Supervisor Feedback</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:selected.status==='approved'?'#F0FDF4':'#FEF2F2', borderRadius:'var(--radius-sm)', border:`1px solid ${selected.status==='approved'?'#86EFAC':'#FCA5A5'}`, lineHeight:1.6 }}>{selected.reviewFeedback}</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
