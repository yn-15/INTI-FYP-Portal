import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Admin.module.css'

export default function AdminTeams() {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const confirmed   = teams.filter(t => t.confirmed).length
  const unconfirmed = teams.filter(t => !t.confirmed).length

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:20 }}>
        Overview of all project groups across departments. Read-only view.
      </p>

      {/* Summary cards */}
      <div className={styles.statsGrid3}>
        {[
          { label:'Total Teams',       count:teams.length,  color:'var(--red)' },
          { label:'Confirmed',         count:confirmed,     color:'var(--success)' },
          { label:'Not Yet Confirmed', count:unconfirmed,   color:'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', padding:'16px 20px' }}>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'Space Grotesk' }}>{loading?'—':s.count}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Project</th>
              <th>Department</th>
              <th>Supervisor</th>
              <th>Members</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading...</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No teams created yet.</td></tr>
            ) : teams.map(team => {
              const members    = (team.members||[]).map(m => m.student||m)
              const supervisor = team.supervisor
              const proposal   = team.proposal
              const dept       = proposal?.department
              const fn = supervisor?.firstName||supervisor?.first_name||''
              const ln = supervisor?.lastName||supervisor?.last_name||''

              return (
                <tr key={team.id}>
                  <td><div style={{ fontWeight:600, fontSize:13.5 }}>{team.name}</div></td>
                  <td style={{ fontSize:13, color:'var(--text-muted)', maxWidth:180 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {proposal?.title || '—'}
                    </div>
                  </td>
                  <td>
                    {dept && (
                      <span style={{ fontSize:12, padding:'2px 10px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-muted)', fontWeight:500 }}>
                        {dept.name}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize:13, color:'var(--text-muted)' }}>{fn} {ln}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      {members.slice(0,3).map(m => {
                        const mfn = m.firstName||m.first_name||''
                        const mln = m.lastName||m.last_name||''
                        return (
                          <div key={m.id} style={{ width:28, height:28, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }} title={`${mfn} ${mln}`}>
                            {mfn[0]}{mln[0]}
                          </div>
                        )
                      })}
                      {members.length > 3 && (
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--border)', color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>
                          +{members.length - 3}
                        </div>
                      )}
                      {members.length === 0 && <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td><Badge status={team.confirmed ? 'confirmed' : 'draft'}/></td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{formatDate(team.createdAt)}</td>
                  <td>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(team)}>View</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal title={`${selected.name} — Details`}
          onClose={() => setSelected(null)}
          footer={<Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>}>

          {/* Team info grid */}
          <div className={styles.detailGrid}>
            {[
              ['Team Name',   selected.name],
              ['Status',      null],
              ['Supervisor',  `${selected.supervisor?.firstName||''} ${selected.supervisor?.lastName||''}`],
              ['Department',  selected.proposal?.department?.name || '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>{l}</div>
                {v === null ? <Badge status={selected.confirmed ? 'confirmed' : 'draft'}/> : <div style={{ fontSize:13.5, fontWeight:500 }}>{v}</div>}
              </div>
            ))}
          </div>

          {/* Assigned project */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:6 }}>Assigned Project</div>
            <div style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', fontSize:13.5 }}>
              {selected.proposal?.title || '—'}
            </div>
          </div>

          {/* Members */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:10 }}>
              Team Members ({(selected.members||[]).length})
            </div>
            {(selected.members||[]).length === 0 ? (
              <p style={{ fontSize:13.5, color:'var(--text-muted)' }}>No students assigned yet.</p>
            ) : (selected.members||[]).map(m => {
              const s  = m.student || m
              const fn = s.firstName||s.first_name||''
              const ln = s.lastName||s.last_name||''
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                    {fn[0]}{ln[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:500 }}>{fn} {ln}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.email}</div>
                  </div>
                  <Badge status="student"/>
                </div>
              )
            })}
          </div>
        </Modal>
      )}
    </div>
  )
}