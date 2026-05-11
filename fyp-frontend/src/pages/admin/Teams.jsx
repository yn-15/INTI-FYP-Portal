import { useState } from 'react'
import { UsersRound } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { teams, users, proposals, departments } from '../../data/mockDB'
import { formatDate } from '../../utils/helpers'
import styles from './Admin.module.css'

export default function AdminTeams() {
  const [modal, setModal]   = useState(null)
  const [selected, setSelected] = useState(null)

  const getUser     = id => users.find(u => u.id === id)
  const getProposal = id => proposals.find(p => p.id === id)
  const getDept     = id => departments.find(d => d.id === id)
  const getMembers  = teamId => {
    // In mock mode, return students whose selection matches the proposal
    const team = teams.find(t => t.id === teamId)
    if (!team) return []
    return users.filter(u => u.role === 'student' && u.department_id === team.department_id).slice(0, 2)
  }

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionSub}>Overview of all project groups across departments. Read-only view.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Teams',     count: teams.length,                          color:'#1A1A1A' },
          { label:'Confirmed',       count: teams.filter(t=>t.confirmed).length,   color:'#16A34A' },
          { label:'Not Yet Confirmed', count: teams.filter(t=>!t.confirmed).length, color:'#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', padding:'16px 20px' }}>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'Space Grotesk' }}>{s.count}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr>
            <th>Group</th><th>Project</th><th>Department</th>
            <th>Supervisor</th><th>Members</th><th>Status</th><th>Created</th><th></th>
          </tr></thead>
          <tbody>
            {teams.map(t => {
              const proposal  = getProposal(t.proposal_id)
              const supervisor = getUser(t.supervisor_id)
              const dept      = getDept(t.department_id)
              const members   = getMembers(t.id)
              return (
                <tr key={t.id}>
                  <td><div className={styles.tdBold}>{t.name}</div></td>
                  <td>
                    <div style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {proposal?.title || '—'}
                    </div>
                  </td>
                  <td><Badge status={dept?.name || 'IT'}/></td>
                  <td className={styles.tdMuted}>{supervisor ? `${supervisor.first_name} ${supervisor.last_name}` : '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      {members.map(m => (
                        <div key={m.id} title={`${m.first_name} ${m.last_name}`}
                          style={{ width:26, height:26, borderRadius:'50%', background:'#CC0000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                      ))}
                      {members.length === 0 && <span className={styles.tdMuted}>No members</span>}
                    </div>
                  </td>
                  <td><Badge status={t.confirmed ? 'confirmed' : 'draft'}/></td>
                  <td className={styles.tdMuted}>{formatDate(t.created_at)}</td>
                  <td>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(t); setModal('detail') }}>
                      View
                    </Button>
                  </td>
                </tr>
              )
            })}
            {teams.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                <UsersRound size={28} style={{ margin:'0 auto 8px', display:'block', opacity:0.3 }}/>
                No teams have been created yet.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {modal === 'detail' && selected && (() => {
        const proposal   = getProposal(selected.proposal_id)
        const supervisor = getUser(selected.supervisor_id)
        const members    = getMembers(selected.id)
        return (
          <Modal title={`${selected.name} — Details`} onClose={() => { setModal(null); setSelected(null) }}
            footer={<Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Close</Button>}>
            <div className={styles.detailGrid}>
              {[
                ['Team Name',  selected.name],
                ['Status',     null],
                ['Supervisor', supervisor ? `${supervisor.first_name} ${supervisor.last_name}` : '—'],
                ['Department', getDept(selected.department_id)?.name || '—'],
              ].map(([label, val]) => (
                <div key={label} className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>{label}</div>
                  {val === null ? <Badge status={selected.confirmed ? 'confirmed' : 'draft'}/> : <div className={styles.detailItemValue}>{val}</div>}
                </div>
              ))}
            </div>
            <div className={styles.detailBlock}>
              <div className={styles.detailBlockLabel}>Assigned Project</div>
              <div className={styles.detailBlockValue}>{proposal?.title || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:10 }}>Team Members</div>
              {members.length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>No members assigned yet.</p>
              ) : members.map(m => (
                <div key={m.id} className={styles.userRow}>
                  <div className={styles.userAvatar}>{m.first_name[0]}{m.last_name[0]}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{m.first_name} {m.last_name}</div>
                    <div className={styles.userEmail}>{m.email}</div>
                  </div>
                  <Badge status="student"/>
                </div>
              ))}
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
