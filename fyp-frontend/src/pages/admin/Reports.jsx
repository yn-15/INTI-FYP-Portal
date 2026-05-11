import { users, proposals, teams, departments, auditLogs } from '../../data/mockDB'
import StatCard from '../../components/ui/StatCard'
import { Users, FileText, UsersRound, Activity } from 'lucide-react'
import styles from './Admin.module.css'

export default function AdminReports() {
  const activeUsers   = users.filter(u => u.status === 'active')
  const pendingUsers  = users.filter(u => u.status === 'pending')

  const byRole = ['admin','lecturer','student','employer'].map(role => ({
    role,
    count: activeUsers.filter(u => u.role === role).length,
  }))

  const byStatus = ['pending','approved','rejected'].map(status => ({
    status,
    count: proposals.filter(p => p.status === status).length,
    color: status==='approved'?'#16A34A':status==='rejected'?'#DC2626':'#D97706',
  }))

  const byDept = departments.map(d => ({
    name: d.name,
    proposals: proposals.filter(p => p.department_id === d.id).length,
    students:  users.filter(u => u.role==='student'&&u.department_id===d.id&&u.status==='active').length,
    teams:     teams.filter(t => t.department_id === d.id).length,
    color: d.id===1?'#CC0000':'#2563EB',
  }))

  const maxProposals = Math.max(...byDept.map(d=>d.proposals), 1)
  const maxStudents  = Math.max(...byDept.map(d=>d.students),  1)

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <div>
          
          <p className={styles.sectionSub}>System-wide analytics across all departments</p>
        </div>
      </div>

      {/* Top stats */}
      <div className={styles.statsGrid} style={{ marginBottom:24 }}>
        <StatCard label="Active Users"    value={activeUsers.length}    accent="#CC0000" icon={Users}      sub={`${pendingUsers.length} pending`}/>
        <StatCard label="Total Proposals" value={proposals.length}      accent="#2563EB" icon={FileText}   sub={`${proposals.filter(p=>p.status==='approved').length} approved`}/>
        <StatCard label="Active Teams"    value={teams.length}           accent="#16A34A" icon={UsersRound} sub={`${teams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Audit Events"    value={auditLogs.length}       accent="#7C3AED" icon={Activity}   sub="All time"/>
      </div>

      <div className={styles.grid2} style={{ marginBottom:20 }}>
        {/* Users by role */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Users by Role</h3>
          </div>
          {byRole.map(r => {
            const pct = activeUsers.length ? Math.round(r.count/activeUsers.length*100) : 0
            const colors = { admin:'#CC0000', lecturer:'#2563EB', student:'#16A34A', employer:'#7C3AED' }
            return (
              <div key={r.role} className={styles.reportBar}>
                <span className={styles.reportBarLabel} style={{ textTransform:'capitalize' }}>{r.role}</span>
                <div className={styles.reportBarTrack}>
                  <div className={styles.reportBarFill} style={{ width:`${pct}%`, background: colors[r.role] }}/>
                </div>
                <span className={styles.reportBarValue}>{r.count}</span>
              </div>
            )
          })}
        </div>

        {/* Proposals by status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Proposals by Status</h3>
          </div>
          {byStatus.map(s => {
            const pct = proposals.length ? Math.round(s.count/proposals.length*100) : 0
            return (
              <div key={s.status} className={styles.reportBar}>
                <span className={styles.reportBarLabel} style={{ textTransform:'capitalize' }}>{s.status}</span>
                <div className={styles.reportBarTrack}>
                  <div className={styles.reportBarFill} style={{ width:`${pct}%`, background:s.color }}/>
                </div>
                <span className={styles.reportBarValue}>{s.count}</span>
              </div>
            )
          })}
          <div style={{ marginTop:16, padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Proposals by Department</div>
            {byDept.map(d => (
              <div key={d.name} className={styles.reportBar} style={{ marginBottom:8 }}>
                <span className={styles.reportBarLabel}>{d.name}</span>
                <div className={styles.reportBarTrack}>
                  <div className={styles.reportBarFill} style={{ width:`${proposals.length?d.proposals/proposals.length*100:0}%`, background:d.color }}/>
                </div>
                <span className={styles.reportBarValue}>{d.proposals}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department breakdown table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Department Breakdown</h3>
        </div>
        <div className={styles.tableWrap} style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead><tr>
              <th>Department</th><th>Proposals</th><th>Active Students</th><th>Teams</th><th>Completion</th>
            </tr></thead>
            <tbody>
              {byDept.map(d => {
                const pct = d.proposals > 0 ? Math.round(d.teams/d.proposals*100) : 0
                return (
                  <tr key={d.name}>
                    <td><span style={{ fontWeight:600 }}>{d.name}</span></td>
                    <td>{d.proposals}</td>
                    <td>{d.students}</td>
                    <td>{d.teams}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:d.color, borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text-secondary)', width:36 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
