import { useState, useEffect } from 'react'
import { Search, Eye } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Admin.module.css'

export default function AdminProposals() {
  const [proposals, setProposals] = useState([])
  const [depts, setDepts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [newDeptId, setNewDeptId] = useState('')
  const [alert, setAlert]         = useState(null)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const load = async () => {
    try {
      setLoading(true)
      const [p, d] = await Promise.all([api.getProposals(), api.getDepartments()])
      setProposals(p)
      setDepts(d)
    } catch (e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = proposals.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||p.company_name||'').toLowerCase().includes(search.toLowerCase())
    return true
  })

  const handleReassignDept = async () => {
    if (!newDeptId) return
    try {
      const updated = await api.updateProposalDept(selected.id, parseInt(newDeptId))
      setProposals(prev => prev.map(p => p.id === selected.id ? updated : p))
      showAlert('success', 'Department updated.')
      setModal(null); setSelected(null); setNewDeptId('')
    } catch (e) { showAlert('error', e.message) }
  }

  const getField = (p, ...keys) => { for (const k of keys) if (p[k]) return p[k]; return null }

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div className={styles.searchBar}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or company..."/>
        </div>
        <div className={styles.filterTabs}>
          {['all','pending','approved','returned_for_review'].map(f => (
            <button key={f} className={`${styles.filterTab} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)} style={{ textTransform:'capitalize' }}>
              {f==='all'?'All':f==='returned_for_review'?'Returned for Review':f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Department</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'monospace', fontWeight:600 }}>#{p.id}</td>
                <td><div style={{ fontWeight:600, fontSize:13.5 }}>{p.title}</div></td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{getField(p,'companyName','company_name')}</td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{p.department?.name || '—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{formatDate(p.submittedAt || p.submitted_at)}</td>
                <td><Badge status={p.status}/></td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(p); setNewDeptId(''); setModal('detail') }}>
                      <Eye size={13}/> View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No proposals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'detail' && selected && (
        <Modal title="Proposal Details" size="lg" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>
            <Button onClick={() => setModal('reassign')}>Reassign Department</Button>
          </>}>
          {getField(selected,'attachmentUrl','attachment_url') && (
            <div style={{ marginBottom:14 }}>
              <a href={getField(selected,'attachmentUrl','attachment_url')} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                <Button variant="outline">📄 View Project Brief PDF</Button>
              </a>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              ['Title',      selected.title],
              ['Company',    getField(selected,'companyName','company_name')],
              ['Status',     null],
              ['Department', selected.department?.name || '—'],
            ].map(([l,v]) => (
              <div key={l} style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:3 }}>{l}</div>
                {v===null ? <Badge status={selected.status}/> : <div style={{ fontSize:13.5, fontWeight:500 }}>{v}</div>}
              </div>
            ))}
          </div>
          {[['Problem Statement', getField(selected,'problemStatement','problem_statement')],
            ['Deliverables', selected.deliverables],
            ['Technologies', selected.technologies],
            ['Review Feedback', getField(selected,'reviewFeedback','review_feedback')],
          ].filter(([,v])=>v).map(([l,v]) => (
            <div key={l} style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', lineHeight:1.6 }}>{v}</div>
            </div>
          ))}
        </Modal>
      )}

      {modal === 'reassign' && selected && (
        <Modal title="Reassign Department" onClose={() => setModal('detail')}
          footer={<>
            <Button variant="ghost" onClick={() => setModal('detail')}>← Back</Button>
            <Button onClick={handleReassignDept} disabled={!newDeptId}>Save</Button>
          </>}>
          <p style={{ fontSize:13.5, color:'var(--text-secondary)', marginBottom:16 }}>Reassign <strong>{selected.title}</strong> to a different department.</p>
          <Input label="New Department" name="dept" type="select" value={newDeptId} onChange={setNewDeptId}
            options={depts.map(d=>({value:String(d.id),label:d.name}))} required/>
        </Modal>
      )}
    </div>
  )
}
