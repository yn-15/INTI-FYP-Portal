import { useState, useEffect } from 'react'
import { Search, BookOpen, CheckCircle, Crown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate, getDaysUntilLock, isSelectionLocked } from '../../utils/helpers'
import styles from './Student.module.css'

export default function BrowseProposals() {
  const { user }    = useAuth()
  const [proposals, setProposals]   = useState([])
  const [myTeam, setMyTeam]         = useState(null)
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
      const [p, team] = await Promise.all([api.getProposals(), api.getMyTeam()])
      setProposals(p)
      setMyTeam(team)
    } catch(e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const isLeader     = myTeam?.isLeader === true
  const teamProposal = myTeam?.proposal
  const isTaken = (pid) => {
    const proposal = proposals.find(p => p.id === pid)
    // Taken if it has a selection OR if it's linked to a team (via team relation)
    const hasSelection = !!proposal?.selection
    const linkedToOtherTeam = teamProposal?.id !== pid && !!proposal?.team
    return hasSelection || linkedToOtherTeam
  }
  const filtered = proposals.filter(p => {
    if (filter === 'available') return !isTaken(p.id)
    if (filter === 'taken') return isTaken(p.id) || teamProposal?.id === p.id
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||'').toLowerCase().includes(search.toLowerCase())
    return true
  }).filter(p => {
    if (search) return p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.companyName||'').toLowerCase().includes(search.toLowerCase())
    return true
  })

  const handleSelect = async () => {
    if (!myTeam) return
    try {
      const updated = await api.linkProposal(myTeam.id, selected.id)
      setMyTeam({ ...updated, isLeader: true })
      await load()
      showAlert('success', `"${selected.title}" has been selected for ${myTeam.name}. You have 7 days to change your selection.`)
      setModal(null); setSelected(null)
    } catch(e) { showAlert('error', e.message) }
  }

  const handleDrop = async () => {
    if (!myTeam) return
    try {
      const updated = await api.unlinkProposal(myTeam.id)
      setMyTeam({ ...updated, isLeader: true })
      await load()
      showAlert('success', 'Project selection dropped. You can now choose a different proposal.')
      setModal(null)
    } catch(e) { showAlert('error', e.message) }
  }

  // Get selection date from proposalSelection
  const mySelection   = proposals.find(p => p.id === teamProposal?.id)?.selection
  const selectedAt    = mySelection?.selectedAt || mySelection?.selected_at
  const daysLeft      = selectedAt && !isSelectionLocked(selectedAt) ? getDaysUntilLock(selectedAt) : null
  const locked        = selectedAt ? isSelectionLocked(selectedAt) : false

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Team + role info banner */}
      {myTeam ? (
        <div style={{ padding:'14px 18px', background: isLeader?'linear-gradient(135deg,#1A1A1A,#2D0000)':'var(--card)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
          {isLeader && <Crown size={20} color="#D97706"/>}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color: isLeader?'#fff':'var(--text-primary)', marginBottom:3 }}>
              {isLeader ? `You are the Team Leader of ${myTeam.name}` : `You are a member of ${myTeam.name}`}
            </div>
            <div style={{ fontSize:12.5, color: isLeader?'rgba(255,255,255,0.6)':'var(--text-muted)' }}>
              {isLeader
                ? teamProposal
                  ? `Selected project: ${teamProposal.title}`
                  : 'Select a project proposal for your team below'
                : teamProposal
                  ? `Team project: ${teamProposal.title}`
                  : 'Your team leader has not selected a project yet'
              }
            </div>
          </div>
          {isLeader && teamProposal && !locked && (
            <Button variant="outline" size="sm"
              style={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff', background:'rgba(255,255,255,0.08)' }}
              onClick={() => setModal('drop')}>
              Drop Selection
            </Button>
          )}
        </div>
      ) : (
        <Alert type="warning" style={{ marginBottom:20 }}>
          You have not been assigned to a team yet. Your supervisor will create a team and assign you. Once assigned, if you are the Team Leader you can select a project here.
        </Alert>
      )}

      {/* Only leader can see the selection info */}
      {isLeader && !teamProposal && (
        <Alert type="info" style={{ marginBottom:16 }}>
          As Team Leader, browse approved proposals below and click <strong>Select for My Team</strong> to claim one. First come, first served.
        </Alert>
      )}

      <p className={styles.sectionSub} style={{ marginBottom:16 }}>
        {proposals.length} approved proposal{proposals.length!==1?'s':''} available in your department
      </p>

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
        <div className={`${styles.card} ${styles.empty}`}><BookOpen size={32} style={{ opacity:0.3 }}/><p>No proposals found</p></div>
      ) : filtered.map(p => {
        const taken    = isTaken(p.id)
        const isMyTeam = teamProposal?.id === p.id
        return (
          <div key={p.id} className={`${styles.proposalCard} ${taken?styles.taken:''} ${isMyTeam?styles.mine:''}`}
            onClick={() => { setSelected(p); setModal('detail') }}>
            <div className={styles.proposalCardHeader}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                  {isMyTeam && <Badge status="selected"/>}
                  {taken && !isMyTeam && <span style={{ fontSize:12, color:'var(--text-muted)' }}>Taken by another team</span>}
                  {!isMyTeam && !taken && <Badge status="approved"/>}
                </div>
                <div className={styles.proposalCardTitle}>{p.title}</div>
                <div className={styles.proposalCardCompany}>{p.companyName} · {p.department?.name}</div>
              </div>
              {/* Only leader can select, only if team has no proposal yet */}
              {isLeader && !taken && !isMyTeam && !teamProposal && (
                <Button size="sm" variant="primary" style={{ flexShrink:0 }}
                  onClick={e => { e.stopPropagation(); setSelected(p); setModal('confirm') }}>
                  Select for My Team
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
            {isLeader && !isTaken(selected.id) && teamProposal?.id !== selected.id && !teamProposal && (
              <Button variant="primary" onClick={() => setModal('confirm')}>Select for My Team</Button>
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
          <Alert type="warning">
            This project will be linked to <strong>{myTeam?.name}</strong>. You have <strong>7 days</strong> to change your selection. After that it is locked.
          </Alert>
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
            {!locked && <Button variant="danger" onClick={handleDrop}>Drop Selection</Button>}
          </>}>
          {locked
            ? <Alert type="error">Your 7-day drop window has passed. Contact the FYP Administrator to request a change.</Alert>
            : <Alert type="warning">Dropping will remove <strong>"{teamProposal?.title}"</strong> from {myTeam?.name}. You have <strong>{daysLeft} day{daysLeft!==1?'s':''}</strong> remaining.</Alert>
          }
        </Modal>
      )}
    </div>
  )
}
