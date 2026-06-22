import { useState, useEffect } from 'react'
import { Eye, MessageSquare, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Employer.module.css'

const COMPANY_CATEGORIES = [
  'Sole Proprietorship','Partnership','Private Limited (Sdn. Bhd.)','Public Limited (Bhd.)',
  'Small & Medium Enterprise (SME)','Business-to-Business (B2B)','Business-to-Consumer (B2C)',
  'Limited Liability Company (LLC)','Multinational Corporation (MNC)','Government-Linked Company (GLC)',
  'Non-Governmental Organisation (NGO)','Start-Up','Social Enterprise','Cooperative','Other',
]

export default function MyProposals() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert]         = useState(null)
  const [disciplines, setDisciplines] = useState([])

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  useEffect(() => {
    api.getProposals().then(setProposals).catch(console.error).finally(() => setLoading(false))
    api.getDisciplines().then(setDisciplines).catch(() => {})
  }, [])

  const filtered = proposals.filter(p => filter === 'all' ? true : p.status === filter)

  const openEdit = (p) => {
    setSelected(p)
    setEditForm({
      title:              p.title || '',
      companyName:        p.companyName || '',
      companyWebsite:     p.companyWebsite || '',
      companyCategory:    p.companyCategory || '',
      projectChampion:    p.projectChampion || '',
      processOwner:       p.processOwner || '',
      intiContact:        p.intiContact || '',
      briefProfile:       p.briefProfile || '',
      problemStatement:   p.problemStatement || '',
      discipline:         p.discipline || '',
      deliverables:       p.deliverables || '',
      technologies:       p.technologies || '',
      skillsNeeded:       p.skillsNeeded || '',
      targetAudience:     p.targetAudience || '',
      practicalResources: p.practicalResources || '',
    })
    setModal('edit')
  }

  const handleEditSubmit = async () => {
    if (!editForm.title?.trim() || !editForm.problemStatement?.trim() || !editForm.deliverables?.trim()) {
      showAlert('error', 'Title, Problem Statement, and Deliverables are required.')
      return
    }
    setSubmitting(true)
    try {
      const updated = await api.editProposal(selected.id, editForm)
      setProposals(prev => prev.map(p => p.id === selected.id ? updated : p))
      showAlert('success', `Proposal #${selected.id} resubmitted successfully — it is now back in the review queue.`)
      setModal(null); setSelected(null)
    } catch (e) { showAlert('error', e.message) }
    finally { setSubmitting(false) }
  }

  const getField = (p, ...keys) => { for (const k of keys) if (p[k]) return p[k]; return null }
  const set = key => val => setEditForm(p => ({ ...p, [key]: val }))

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className={styles.sectionHeader}>
        <p className={styles.sectionSub}>{user.company_name} · Track all your submitted proposals</p>
        <Button onClick={() => navigate('/employer/submit')}>+ Submit New Proposal</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          ['Total',    proposals.length,                                              '#1A1A1A'],
          ['Pending',  proposals.filter(p=>p.status==='pending').length,              '#D97706'],
          ['Approved', proposals.filter(p=>p.status==='approved').length,             '#16A34A'],
          ['Returned', proposals.filter(p=>p.status==='returned_for_review').length,  '#D97706'],
        ].map(([l,c,col]) => (
          <div key={l} style={{ background:'var(--card)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', padding:'14px 18px' }}>
            <div style={{ fontSize:24, fontWeight:700, color:col, fontFamily:'Space Grotesk' }}>{loading?'—':c}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className={styles.filterTabs}>
        {['all','pending','approved','returned_for_review'].map(f => (
          <button key={f} className={`${styles.filterTab} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)}>
            {f==='all'?'All':f==='returned_for_review'?'Returned for Review':f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
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
        const isReturned = p.status === 'returned_for_review'
        return (
          <div key={p.id} className={`${styles.proposalStatusCard} ${styles[isReturned ? 'pending' : p.status]}`}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                  <Badge status={p.status}/>
                  <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'monospace' }}>#{p.id}</span>
                  {p.department && <span style={{ fontSize:12, padding:'2px 8px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-muted)' }}>{p.department.name}</span>}
                  {team?.confirmed && <span style={{ fontSize:12, color:'#16A34A', fontWeight:600 }}>● Team Assigned</span>}
                </div>
                <div className={styles.proposalCardTitle}>{p.title}</div>
                <div className={styles.proposalCardMeta}>
                  <span>Submitted {formatDate(p.submittedAt)}</span>
                  {reviewer && <><span>·</span><span>Reviewed by {reviewer.firstName} {reviewer.lastName}</span></>}
                </div>

                {isReturned && (
                  <div style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', border:'1px solid #FDE68A', background:'#FFFBEB', color:'#92400E', fontSize:13, lineHeight:1.55, marginBottom:10 }}>
                    <strong>Action Required:</strong> This proposal has been returned for review. Please read the feedback below and edit your proposal before resubmitting.
                  </div>
                )}

                {p.reviewFeedback && (
                  <div style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', border:'1px solid', marginBottom:10,
                    background: p.status==='approved' ? '#F0FDF4' : '#FFFBEB',
                    borderColor: p.status==='approved' ? '#86EFAC' : '#FDE68A',
                    color: p.status==='approved' ? '#16A34A' : '#92400E',
                    fontSize:13.5, lineHeight:1.55 }}>
                    <strong>Supervisor Feedback:</strong> {p.reviewFeedback}
                  </div>
                )}

                {team?.confirmed && (
                  <div className={styles.teamReveal}>
                    <div className={styles.teamRevealTitle}>
                      Assigned Team — {team.name}
                      {team.supervisor && <span style={{ fontWeight:400, color:'rgba(255,255,255,0.6)', marginLeft:8 }}>· Supervisor: {team.supervisor.firstName} {team.supervisor.lastName}</span>}
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
                {isReturned && (
                  <Button size="sm" variant="primary" onClick={() => openEdit(p)}>
                    <Edit2 size={13}/> Edit & Resubmit
                  </Button>
                )}
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

      {/* Detail modal */}
      {modal === 'detail' && selected && (
        <Modal title={`Proposal #${selected.id}`} size="lg" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>
            {selected.status === 'returned_for_review' && <Button onClick={() => openEdit(selected)}><Edit2 size={14}/> Edit & Resubmit</Button>}
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
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>Supervisor Feedback</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'#FFFBEB', borderRadius:'var(--radius-sm)', border:'1px solid #FDE68A', lineHeight:1.6 }}>{selected.reviewFeedback}</div>
            </div>
          )}
        </Modal>
      )}

      {/* Edit & Resubmit modal */}
      {modal === 'edit' && selected && (
        <Modal title={`Edit Proposal #${selected.id} — Resubmit for Review`} size="lg"
          onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => setModal('detail')}>← Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Resubmit Proposal'}
            </Button>
          </>}>
          <Alert type="info">
            You are editing Proposal #{selected.id}. The proposal ID will remain the same after resubmission. It will return to the review queue once submitted.
          </Alert>
          {selected.reviewFeedback && (
            <div style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', border:'1px solid #FDE68A', background:'#FFFBEB', color:'#92400E', fontSize:13, lineHeight:1.6, marginBottom:16 }}>
              <strong>Feedback to address:</strong> {selected.reviewFeedback}
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <Input label="Project Title" name="title" value={editForm.title} onChange={set('title')} required/>
            <Input label="Company Name" name="co" value={editForm.companyName} onChange={set('companyName')} required/>
            <Input label="Company Website" name="web" value={editForm.companyWebsite} onChange={set('companyWebsite')}/>
            <Input label="Company Category" name="cat" type="select" value={editForm.companyCategory} onChange={set('companyCategory')}
              options={COMPANY_CATEGORIES.map(c=>({value:c,label:c}))}/>
            <Input label="Relevant Discipline" name="disc" type="select" value={editForm.discipline} onChange={set('discipline')}
              options={disciplines.map(d=>({value:d.label,label:d.label}))}
              hint={editForm.discipline ? `Maps to: ${disciplines.find(d=>d.label===editForm.discipline)?.department||'—'} department` : 'Department assigned automatically'}/>
            <Input label="Technologies Required" name="tech" value={editForm.technologies} onChange={set('technologies')}/>
            <Input label="Skills Needed" name="skills" value={editForm.skillsNeeded} onChange={set('skillsNeeded')}/>
            <Input label="Target Audience" name="audience" value={editForm.targetAudience} onChange={set('targetAudience')}/>
          </div>
          <Input label="Problem Statement / Objectives" name="ps" type="textarea" rows={4} value={editForm.problemStatement} onChange={set('problemStatement')} required/>
          <Input label="Expected Deliverables" name="del" type="textarea" rows={3} value={editForm.deliverables} onChange={set('deliverables')} required/>
          <Input label="Resources / Support Provided" name="res" type="textarea" rows={2} value={editForm.practicalResources} onChange={set('practicalResources')}/>
        </Modal>
      )}
    </div>
  )
}
