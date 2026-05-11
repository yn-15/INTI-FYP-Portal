import { useState, useEffect } from 'react'
import { Search, BookOpen, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate, getDaysUntilLock, isSelectionLocked } from '../../utils/helpers'
import styles from './Student.module.css'

export default function BrowseProposals() {
  const { user } = useAuth()
  const [proposals, setProposals]   = useState([])
  const [mySelection, setMySelection] = useState(null)
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(null)
  const [selected, setSelected]     = useState(null)
  const [alert, setAlert]           = useState(null)
  const [loading, setLoading]       = useState(true)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  const load = async () => {
    try {
      setLoading(true)
      const [p, sel] = await Promise.all([api.getProposals(), api.getMySelection()])
      setProposals(p)
      setMySelection(sel)
    } catch(e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const myProposal = mySelection ? proposals.find(p => p.id === mySelection.proposalId) : null
  const isTaken = (pid) => proposals.find(p => p.id === pid)?.selection && mySelection?.proposalId !== pid
  const isMySelection = (pid) => mySelection?.proposalId === pid

  const filtered = proposals.filter(p => {
    if (filter === 'available') return !isTaken(p.id) && !isMySelection(p.id)
    if (filter === 'taken')     return isTaken(p.id)
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||'').toLowerCase().includes(search.toLowerCase())
    return true
  }).filter(p => {
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||'').toLowerCase().includes(search.toLowerCase())
    return true
  })

  const handleSelect = async () => {
    try {
      const sel = await api.selectProposal(selected.id)
      setMySelection(sel)
      await load()
      showAlert('success', `You have selected "${selected.title}". You have 7 days to change your mind.`)
      setModal(null); setSelected(null)
    } catch(e) { showAlert('error', e.message) }
  }

  const handleDrop = async () => {
    try {
      await api.dropProposal(mySelection.proposalId)
      setMySelection(null)
      await load()
      showAlert('success', 'Selection dropped. You can now choose a different proposal.')
      setModal(null)
    } catch(e) { showAlert('error', e.message) }
  }

  const daysLeft = mySelection && !isSelectionLocked(mySelection.selectedAt||mySelection.selected_at)
    ? getDaysUntilLock(mySelection.selectedAt||mySelection.selected_at) : null
  const locked   = mySelection ? isSelectionLocked(mySelection.selectedAt||mySelection.selected_at) : false

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Selected banner */}
      {myProposal && (
        <div className={styles.selectedBanner} style={{ marginBottom:20 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <CheckCircle size={16} color="#4ADE80"/>
              <span style={{ fontSize:12, fontWeight:700, color:'#4ADE80', textTransform:'uppercase', letterSpacing:'0.4px' }}>Your Selected Project</span>
            </div>
            <div className={styles.selectedBannerTitle}>{myProposal.title}</div>
            <div className={styles.selectedBannerSub}>{myProposal.companyName}</div>
            {daysLeft !== null && (
              <div style={{ marginTop:10, display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', background:'rgba(217,119,6,0.15)', borderRadius:20, border:'1px solid rgba(217,119,6,0.3)' }}>
                <span style={{ fontSize:12, color:'#FCD34D' }}>⏱ {daysLeft} day{daysLeft!==1?'s':''} left to drop</span>
              </div>
            )}
            {locked && (
              <div style={{ marginTop:10, display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', background:'rgba(220,38,38,0.15)', borderRadius:20, border:'1px solid rgba(220,38,38,0.3)' }}>
                <span style={{ fontSize:12, color:'#FCA5A5' }}>🔒 Selection locked — contact admin to change</span>
              </div>
            )}
          </div>
          {!locked && (
            <Button variant="outline" size="sm"
              style={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff', background:'rgba(255,255,255,0.08)', flexShrink:0 }}
              onClick={() => setModal('drop')}>
              Drop Selection
            </Button>
          )}
        </div>
      )}

      <p className={styles.sectionSub} style={{ marginBottom:16 }}>
        {proposals.length} approved proposal{proposals.length!==1?'s':''} available in your department
      </p>

      {!myProposal && (
        <Alert type="info">Browse approved proposals below and click <strong>Select Project</strong> to claim one. First come, first served.</Alert>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div className={styles.searchBar}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or company..."/>
        </div>
        <div className={styles.filterTabs} style={{ margin:0 }}>
          {[{key:'all',label:'All'},{key:'available',label:'Available'},{key:'taken',label:'Taken'}].map(f => (
            <button key={f.key} className={`${styles.filterTab} ${filter===f.key?styles.active:''}`} onClick={()=>setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>
      : filtered.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <BookOpen size={32} style={{ opacity:0.3 }}/>
          <p>No proposals found</p>
        </div>
      ) : filtered.map(p => {
        const taken  = isTaken(p.id)
        const ismine = isMySelection(p.id)
        return (
          <div key={p.id} className={`${styles.proposalCard} ${taken?styles.taken:''} ${ismine?styles.mine:''}`}
            onClick={() => { setSelected(p); setModal('detail') }}>
            <div className={styles.proposalCardHeader}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                  {ismine && <Badge status="selected"/>}
                  {taken && <span style={{ fontSize:12, color:'var(--text-muted)' }}>Taken by another student</span>}
                  {!ismine && !taken && <Badge status="approved"/>}
                </div>
                <div className={styles.proposalCardTitle}>{p.title}</div>
                <div className={styles.proposalCardCompany}>{p.companyName} · {p.department?.name}</div>
              </div>
              {!taken && !ismine && !myProposal && (
                <Button size="sm" variant="primary" style={{ flexShrink:0 }}
                  onClick={e => { e.stopPropagation(); setSelected(p); setModal('confirm') }}>
                  Select Project
                </Button>
              )}
            </div>
            <div className={styles.proposalCardDesc}>{p.problemStatement}</div>
            <div className={styles.proposalCardTags}>
              {(p.technologies||'').split(',').slice(0,5).map(t => (
                <span key={t} className={styles.proposalTag}>{t.trim()}</span>
              ))}
            </div>
          </div>
        )
      })}

      {/* Detail modal */}
      {modal === 'detail' && selected && (
        <Modal title="Proposal Details" size="lg" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>
            {!myProposal && !isTaken(selected.id) && (
              <Button variant="primary" onClick={() => setModal('confirm')}>Select This Project</Button>
            )}
          </>}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Title',selected.title],['Company',selected.companyName],['Discipline',selected.discipline||'—'],['Technologies',selected.technologies||'—']].map(([l,v]) => (
              <div key={l} style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:13.5, fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          {[['Problem Statement',selected.problemStatement],['Deliverables',selected.deliverables],['Skills Needed',selected.skillsNeeded]].filter(([,v])=>v).map(([l,v]) => (
            <div key={l} style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', lineHeight:1.6 }}>{v}</div>
            </div>
          ))}
          {selected.reviewFeedback && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>Supervisor Note</div>
              <div style={{ fontSize:13.5, padding:'12px 14px', background:'#F0FDF4', borderRadius:'var(--radius-sm)', border:'1px solid #86EFAC', lineHeight:1.6 }}>{selected.reviewFeedback}</div>
            </div>
          )}
        </Modal>
      )}

      {/* Confirm modal */}
      {modal === 'confirm' && selected && (
        <Modal title="Confirm Project Selection" onClose={() => setModal(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="success" onClick={handleSelect}><CheckCircle size={14}/> Confirm Selection</Button>
          </>}>
          <Alert type="warning">Once confirmed, this project is <strong>reserved for you</strong>. You may drop it within <strong>7 days</strong>. After that your selection is locked.</Alert>
          <div style={{ padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700, fontSize:14.5, fontFamily:'Space Grotesk', marginBottom:4 }}>{selected.title}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>{selected.companyName}</div>
          </div>
        </Modal>
      )}

      {/* Drop modal */}
      {modal === 'drop' && (
        <Modal title="Drop Project Selection" onClose={() => setModal(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDrop}>Drop Selection</Button>
          </>}>
          {locked
            ? <Alert type="error">Your 7-day drop window has passed. Contact the FYP Administrator to request a change.</Alert>
            : <Alert type="warning">Dropping will make <strong>"{myProposal?.title}"</strong> available for other students. You have <strong>{daysLeft} day{daysLeft!==1?'s':''}</strong> remaining in your drop window.</Alert>
          }
        </Modal>
      )}
    </div>
  )
}
