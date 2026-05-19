import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, UsersRound, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { api } from '../../utils/api'
import { formatDate, getDaysUntilLock, isSelectionLocked } from '../../utils/helpers'
import styles from './Student.module.css'

export default function StudentDashboard() {
  const { user }      = useAuth()
  const { unreadCount, notifications } = useNotifications()
  const navigate      = useNavigate()
  const [mySelection, setMySelection] = useState(null)
  const [myProposal, setMyProposal]   = useState(null)
  const [myTeam, setMyTeam]           = useState(null)
  const [available, setAvailable]     = useState(0)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sel, team, proposals] = await Promise.all([
          api.getMySelection(), api.getMyTeam(), api.getProposals()
        ])

        setMySelection(sel)
        setMyTeam(team)
        setAvailable(proposals.filter(p => !p.selection).length)

        // Team leader — fetch via selection
        if (sel) {
          const p = await api.getProposalById(sel.proposalId||sel.proposal_id)
          setMyProposal(p)
        }
        // Non-leader — get proposal from team
        else if (team?.proposal) {
          const p = await api.getProposalById(team.proposal.id)
          setMyProposal(p)
        }
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const daysLeft = mySelection && !isSelectionLocked(mySelection.selectedAt||mySelection.selected_at)
    ? getDaysUntilLock(mySelection.selectedAt||mySelection.selected_at) : null
  const locked   = mySelection ? isSelectionLocked(mySelection.selectedAt||mySelection.selected_at) : false
  const recentNotifs = notifications.slice(0, 4)

  return (
    <div className={styles.page}>
      <div style={{ marginBottom:24 }}>
        <h2 className={styles.welcomeTitle}>Welcome, {user.first_name} 👋</h2>
        <p className={styles.welcomeSub}>Track your FYP progress here</p>
      </div>

      <div className={styles.statsGrid} style={{ marginBottom:20 }}>
        <StatCard label="My Project"    value={myProposal?'Assigned':'None'} accent={myProposal?'#16A34A':'#D97706'} icon={BookOpen}
          sub={myProposal?myProposal.title?.slice(0,30)+'…':`${available} available`}/>
        <StatCard label="My Team"       value={myTeam?myTeam.name:'Not Assigned'} accent={myTeam?'#CC0000':'#D97706'} icon={UsersRound}
          sub={myTeam?(myTeam.confirmed?'Confirmed by supervisor':'Pending confirmation'):'Awaiting assignment'}/>
        <StatCard label="Notifications" value={unreadCount} accent="#2563EB" icon={Bell}
          sub={unreadCount>0?'Unread announcements':'All caught up'}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, alignItems:'stretch' }}>
        {/* My Project + My Team */}
        <div className={styles.card} style={{ gridColumn:'span 2', display:'flex', flexDirection:'column' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Project</h3>
            <button className={styles.cardLink} onClick={() => navigate('/student/proposals')}>
              {myProposal?'View proposals →':'Browse →'}
            </button>
          </div>
          {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
          : myProposal ? (
            <div style={{ flex:1 }}>
              <div style={{ padding:'16px 18px', background:'linear-gradient(135deg,#1A1A1A,#2D0000)', borderRadius:'var(--radius-sm)', marginBottom:14 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk', marginBottom:4 }}>{myProposal.title}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{myProposal.companyName}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                {[['Department',myProposal.department?.name||'—'],['Discipline',myProposal.discipline||'—'],['Technologies',(myProposal.technologies||'').split(',').slice(0,2).join(', ')+'…']].map(([l,v]) => (
                  <div key={l} style={{ padding:'10px 12px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
              {daysLeft !== null && (
                <div className={styles.countdown}><span>⏱</span><span>You can drop this selection for <strong>{daysLeft} more day{daysLeft!==1?'s':''}</strong></span></div>
              )}
              {locked && (
                <div className={`${styles.countdown} ${styles.countdownLocked}`}><span>🔒</span><span>Selection locked — contact admin to change.</span></div>
              )}
            </div>
          ) : (
            <div className={styles.empty} style={{ flex:1 }}>
              <BookOpen size={32} style={{ opacity:0.2 }}/>
              <p style={{ fontWeight:500 }}>No project selected yet</p>
              <p style={{ fontSize:12.5 }}>{available} approved proposal{available!==1?'s':''} available</p>
              {available > 0 && <Button size="sm" onClick={() => navigate('/student/proposals')}>Browse Proposals</Button>}
            </div>
          )}

          {/* My Team section */}
          <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h3 className={styles.cardTitle}>My Team</h3>
              {myTeam && <button className={styles.cardLink} onClick={() => navigate('/student/team')}>View details →</button>}
            </div>
            {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
            : myTeam ? (
              <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', fontFamily:'Space Grotesk' }}>{myTeam.name}</div>
                    <Badge status={myTeam.confirmed?'confirmed':'draft'}/>
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:10 }}>{myTeam.proposal?.title||'—'}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {(myTeam.members||[]).map(m => {
                      const s = m.student||m
                      const fn = s.firstName||s.first_name||''
                      const ln = s.lastName||s.last_name||''
                      return (
                        <div key={s.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', background:'var(--bg)', borderRadius:20, border:'1px solid var(--border)' }}>
                          <div className={styles.memberAvatar} style={{ width:22, height:22, fontSize:8 }}>{fn[0]}{ln[0]}</div>
                          <span style={{ fontSize:12.5 }}>{fn}</span>
                          {s.id === user.id && <span className={styles.memberYou}>You</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <UsersRound size={24} style={{ opacity:0.3, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:500, marginBottom:3 }}>No team assigned yet</div>
                  <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>Your supervisor will create and assign you to a team once a project is allocated</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className={styles.card} style={{ display:'flex', flexDirection:'column' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              Announcements
              {unreadCount > 0 && <span style={{ marginLeft:8, background:'var(--red)', color:'#fff', fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:10 }}>{unreadCount}</span>}
            </h3>
            <button className={styles.cardLink} onClick={() => navigate('/student/notifications')}>View all →</button>
          </div>
          {recentNotifs.length === 0 ? (
            <div className={styles.empty} style={{ flex:1 }}><Bell size={24} style={{ opacity:0.3 }}/><p>No announcements yet</p></div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {recentNotifs.map((n, i) => (
                <div key={n.id} style={{ padding:'13px 0', borderBottom:i<recentNotifs.length-1?'1px solid var(--border)':'none' }}>
                  <div style={{ fontSize:13.5, fontWeight:600, marginBottom:4 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{new Date(n.createdAt||n.created_at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})}</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.55 }}>{n.message}</div>
                </div>
              ))}
              <button onClick={() => navigate('/student/notifications')}
                style={{ marginTop:14, width:'100%', padding:'9px', border:'1.5px dashed var(--border)', borderRadius:'var(--radius-sm)', background:'transparent', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontFamily:'DM Sans' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='var(--red)';e.currentTarget.style.color='var(--red)'}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
                View all notifications →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
