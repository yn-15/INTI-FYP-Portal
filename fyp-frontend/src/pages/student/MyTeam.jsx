import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { UsersRound } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Student.module.css'

export default function MyTeam() {
  const { user }  = useAuth()
  const [team, setTeam]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyTeam()
      .then(setTeam)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.page}><p style={{ color:'var(--text-muted)' }}>Loading...</p></div>

  if (!team) {
    return (
      <div className={styles.page}>
        <p className={styles.sectionSub} style={{ marginBottom:24 }}>Your project group details</p>
        <div className={`${styles.card} ${styles.empty}`} style={{ padding:60 }}>
          <UsersRound size={40} style={{ opacity:0.2 }}/>
          <h3 style={{ fontFamily:'Space Grotesk', color:'var(--text-primary)' }}>No Team Assigned Yet</h3>
          <p>Your supervisor will create a team and assign you once a project is approved and allocated.</p>
        </div>
      </div>
    )
  }

  const supervisor = team.supervisor
  const members    = (team.members||[]).map(m => m.student||m)
  const proposal   = team.proposal

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:24 }}>{team.name}</p>

      <div className={styles.grid2} style={{ marginBottom:20 }}>
        <div className={styles.teamCard}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>Your Group</div>
              <div className={styles.teamName}>{team.name}</div>
              <div className={styles.teamMeta}>Created {formatDate(team.createdAt)}</div>
            </div>
            <Badge status={team.confirmed?'confirmed':'draft'}/>
          </div>

          {!team.confirmed && (
            <div style={{ padding:'10px 14px', background:'var(--warning-faint)', borderRadius:'var(--radius-sm)', border:'1px solid var(--warning-border)', fontSize:13, color:'var(--warning)', marginBottom:16 }}>
              ⏳ Awaiting supervisor confirmation.
            </div>
          )}
          {team.confirmed && (
            <div style={{ padding:'10px 14px', background:'var(--success-faint)', borderRadius:'var(--radius-sm)', border:'1px solid var(--success-border)', fontSize:13, color:'var(--success)', marginBottom:16 }}>
              ✓ Team confirmed — the employer has been notified.
            </div>
          )}

          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Supervisor</div>
          {supervisor && (
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', marginBottom:16 }}>
              <div className={styles.memberAvatar} style={{ background:'#1A1A1A' }}>
                {(supervisor.firstName||supervisor.first_name||'')[0]}{(supervisor.lastName||supervisor.last_name||'')[0]}
              </div>
              <div>
                <div className={styles.memberName}>{supervisor.firstName||supervisor.first_name} {supervisor.lastName||supervisor.last_name}</div>
                <div className={styles.memberEmail}>{supervisor.email}</div>
              </div>
            </div>
          )}

          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Members ({members.length})</div>
          {members.map(m => {
            const fn = m.firstName||m.first_name||''
            const ln = m.lastName||m.last_name||''
            return (
              <div key={m.id} className={styles.memberRow}>
                <div className={styles.memberAvatar}>{fn[0]}{ln[0]}</div>
                <div style={{ flex:1 }}>
                  <div className={styles.memberName}>{fn} {ln}{m.id===user.id&&<span className={styles.memberYou}>You</span>}</div>
                  <div className={styles.memberEmail}>{m.email}</div>
                </div>
                <Badge status="student"/>
              </div>
            )
          })}
        </div>

        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}><h3 className={styles.cardTitle}>Assigned Project</h3></div>
            {proposal ? (
              <>
                <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#1A1A1A,#2D0000)', borderRadius:'var(--radius-sm)', marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk', marginBottom:3 }}>{proposal.title}</div>
                  <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.6)' }}>{proposal.companyName}</div>
                </div>
                {/* Project detail fields #10 */}
                {[
                  ['Company', proposal.companyName],
                  ['Department', proposal.department?.name],
                  ['Discipline', proposal.discipline],
                  ['Company Category', proposal.companyCategory],
                  ['Technologies', proposal.technologies],
                  ['Skills Needed', proposal.skillsNeeded],
                ].filter(([,v])=>v).map(([l,v]) => (
                  <div key={l} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{v}</div>
                  </div>
                ))}
                {proposal.problemStatement && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>Problem Statement</div>
                    <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>{proposal.problemStatement}</div>
                  </div>
                )}
                {proposal.deliverables && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>Expected Deliverables</div>
                    <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>{proposal.deliverables}</div>
                  </div>
                )}
                {proposal.companyWebsite && (
                  <a href={proposal.companyWebsite} target="_blank" rel="noreferrer" style={{ fontSize:12.5, color:'var(--red)', textDecoration:'none', display:'block', marginTop:4 }}>
                    🔗 {proposal.companyWebsite}
                  </a>
                )}
              </>
            ) : <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>No proposal linked.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
