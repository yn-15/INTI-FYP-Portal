import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Lecturer.module.css'

export default function LecturerProposals() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [feedback, setFeedback]   = useState('')
  const [alert, setAlert]         = useState(null)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  useEffect(() => {
    api.getProposals()
      .then(data => setProposals(data))
      .catch(e => showAlert('error', e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = proposals.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||'').toLowerCase().includes(search.toLowerCase())
    return true
  })

  const handleApprove = async () => {
    if (!feedback.trim()) return
    try {
      const updated = await api.approveProposal(selected.id, feedback)
      setProposals(prev => prev.map(p => p.id === selected.id ? updated : p))
      showAlert('success', `"${selected.title}" approved. A chat thread has been opened with the employer.`)
      setModal(null); setSelected(null); setFeedback('')
    } catch (e) { showAlert('error', e.message) }
  }

  const handleReject = async () => {
    if (!feedback.trim()) return
    try {
      const updated = await api.rejectProposal(selected.id, feedback)
      setProposals(prev => prev.map(p => p.id === selected.id ? updated : p))
      showAlert('success', `"${selected.title}" rejected. Feedback sent to employer.`)
      setModal(null); setSelected(null); setFeedback('')
    } catch (e) { showAlert('error', e.message) }
  }

  const getField = (p, ...keys) => { for (const k of keys) if (p[k]) return p[k]; return null }

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <p className={styles.sectionSub}>Review and manage proposals for your department</p>

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

      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div className={styles.searchBar}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or company..."/>
        </div>
        <div className={styles.filterTabs} style={{ margin:0 }}>
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} className={`${styles.filterTab} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)} style={{ textTransform:'capitalize' }}>
              {f==='all'?'All':f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Title</th><th>Company</th><th>Submitted</th><th>Status</th><th>Chat</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight:600, fontSize:13.5 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.discipline}</div>
                </td>
                <td style={{ fontSize:13, color:'var(--text-muted)' }}>{p.companyName}</td>
                <td style={{ fontSize:13, color:'var(--text-muted)' }}>{formatDate(p.submittedAt)}</td>
                <td><Badge status={p.status}/></td>
                <td>
                  {p.chatThread
                    ? <span style={{ fontSize:12, color:'#16A34A', fontWeight:600 }}>● Active</span>
                    : <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>
                  }
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(p); setFeedback(getField(p,'reviewFeedback','review_feedback')||''); setModal('detail') }}>
                      <Eye size={13}/> View
                    </Button>
                    {p.status === 'pending' && <>
                      <Button size="sm" variant="success" onClick={() => { setSelected(p); setFeedback(''); setModal('approve') }}>
                        <CheckCircle size={13}/> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => { setSelected(p); setFeedback(''); setModal('reject') }}>
                        <XCircle size={13}/> Reject
                      </Button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No proposals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {modal === 'detail' && selected && (
        <Modal title="Proposal Details" size="lg" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>
            {selected.status === 'pending' && <>
              <Button variant="danger" onClick={() => { setModal('reject'); setFeedback('') }}><XCircle size={14}/> Reject</Button>
              <Button variant="success" onClick={() => { setModal('approve'); setFeedback('') }}><CheckCircle size={14}/> Approve</Button>
            </>}
          </>}>
          {getField(selected,'attachmentUrl','attachment_url') && (
            <div style={{ marginBottom:14 }}>
              <a href={getField(selected,'attachmentUrl','attachment_url')} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                <Button variant="outline">📄 View Project Brief PDF</Button>
              </a>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Title',selected.title],['Company',selected.companyName],['Status',null],['Discipline',selected.discipline||'—'],['Champion',selected.projectChampion||'—'],['Technologies',selected.technologies||'—']].map(([l,v]) => (
              <div key={l} style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:3 }}>{l}</div>
                {v===null ? <Badge status={selected.status}/> : <div style={{ fontSize:13.5, fontWeight:500 }}>{v}</div>}
              </div>
            ))}
          </div>
          {[['Problem Statement',getField(selected,'problemStatement','problem_statement')],
            ['Deliverables',selected.deliverables],['Skills Needed',getField(selected,'skillsNeeded','skills_needed')],
          ].filter(([,v])=>v).map(([l,v]) => (
            <div key={l} style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', lineHeight:1.6 }}>{v}</div>
            </div>
          ))}
          {getField(selected,'reviewFeedback','review_feedback') && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>Your Feedback</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'#FFFBEB', borderRadius:'var(--radius-sm)', border:'1px solid #FDE68A', lineHeight:1.6 }}>
                {getField(selected,'reviewFeedback','review_feedback')}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Approve modal */}
      {modal === 'approve' && selected && (
        <Modal title="Approve Proposal" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => setModal('detail')}>← Back</Button>
            <Button variant="success" onClick={handleApprove} disabled={!feedback.trim()}>
              <CheckCircle size={14}/> Confirm Approval
            </Button>
          </>}>
          <Alert type="info">Approving will open a chat thread with the employer seeded with your feedback.</Alert>
          <div style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>{selected.title}</div>
            <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{selected.companyName}</div>
          </div>
          <Input label="Approval Feedback" name="feedback" type="textarea" rows={4} value={feedback}
            onChange={setFeedback} placeholder="Write feedback to the employer..." required/>
        </Modal>
      )}

      {/* Reject modal */}
      {modal === 'reject' && selected && (
        <Modal title="Reject Proposal" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => setModal('detail')}>← Back</Button>
            <Button variant="danger" onClick={handleReject} disabled={!feedback.trim()}>
              <XCircle size={14}/> Confirm Rejection
            </Button>
          </>}>
          <Alert type="warning">Rejecting will notify the employer with your feedback via chat.</Alert>
          <Input label="Rejection Reason *" name="feedback" type="textarea" rows={4} value={feedback}
            onChange={setFeedback} placeholder="Explain why and what can be improved..." required/>
        </Modal>
      )}
    </div>
  )
}
