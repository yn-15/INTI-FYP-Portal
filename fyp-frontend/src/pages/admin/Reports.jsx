import { useState, useEffect } from 'react'
import { Users, FileText, UsersRound, Activity } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { api } from '../../utils/api'
import styles from './Admin.module.css'

export default function AdminReports() {
  const [users, setUsers]         = useState([])
  const [proposals, setProposals] = useState([])
  const [teams, setTeams]         = useState([])
  const [depts, setDepts]         = useState([])
  const [auditCount, setAuditCount] = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, p, t, d, logsRes] = await Promise.all([
          api.getUsers(), api.getProposals(), api.getTeams(),
          api.getDepartments(), api.getAuditLogs(),
        ])
        setUsers(u)
        setProposals(p)
        setTeams(t)
        setDepts(d)
        const logs = Array.isArray(logsRes) ? logsRes : (logsRes.logs || logsRes.data || [])
        setAuditCount(Array.isArray(logsRes) ? logsRes.length : (logsRes.total || logs.length))
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const activeUsers  = users.filter(u => u.status === 'active')
  const pendingUsers = users.filter(u => u.status === 'pending')

  const byRole = ['admin','lecturer','student','employer'].map(role => ({
    role,
    count: activeUsers.filter(u => u.role === role).length,
    color: role==='admin'?'#CC0000':role==='lecturer'?'#2563EB':role==='student'?'#16A34A':'#7C3AED',
  }))

  const byStatus = [
    { status:'pending',  color:'#D97706', count: proposals.filter(p=>p.status==='pending').length  },
    { status:'approved', color:'#16A34A', count: proposals.filter(p=>p.status==='approved').length },
    { status:'rejected', color:'#DC2626', count: proposals.filter(p=>p.status==='rejected').length },
  ]

  const byDept = depts.map((d, i) => ({
    name:      d.name,
    proposals: proposals.filter(p => (p.departmentId||p.department_id) === d.id).length,
    students:  activeUsers.filter(u => u.role==='student' && (u.departmentId||u.department_id)===d.id).length,
    teams:     teams.filter(t => (t.departmentId||t.department_id)===d.id).length,
    confirmed: teams.filter(t => (t.departmentId||t.department_id)===d.id && t.confirmed).length,
    color:     i===0?'#CC0000':'#2563EB',
  }))

  const maxRole      = Math.max(...byRole.map(r=>r.count), 1)
  const maxStatus    = Math.max(...byStatus.map(s=>s.count), 1)
  const maxDeptProp  = Math.max(...byDept.map(d=>d.proposals), 1)

  const Bar = ({ count, max, color }) => (
    <div style={{ flex:1, height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${(count/max)*100}%`, background:color, borderRadius:4, transition:'width 0.5s ease' }}/>
    </div>
  )

  if (loading) return <div className={styles.page}><p style={{ color:'var(--text-muted)' }}>Loading reports...</p></div>

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:24 }}>System-wide analytics across all departments</p>

      {/* Stat cards */}
      <div className={styles.statsGrid} style={{ marginBottom:24 }}>
        <StatCard label="Active Users"    value={activeUsers.length}   accent="#CC0000" icon={Users}      sub={`${pendingUsers.length} pending`}/>
        <StatCard label="Total Proposals" value={proposals.length}      accent="#2563EB" icon={FileText}   sub={`${byStatus[1].count} approved`}/>
        <StatCard label="Active Teams"    value={teams.length}          accent="#16A34A" icon={UsersRound} sub={`${teams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Audit Events"    value={auditCount}            accent="#7C3AED" icon={Activity}   sub="All time"/>
      </div>

      {/* Users + Proposals side by side */}
      <div className={styles.grid2} style={{ marginBottom:24 }}>
        {/* Users by Role */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom:18 }}>Users by Role</h3>
          {byRole.map(r => (
            <div key={r.role} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <span style={{ fontSize:13.5, color:'var(--text-secondary)', width:80, flexShrink:0, textTransform:'capitalize' }}>{r.role}</span>
              <Bar count={r.count} max={maxRole} color={r.color}/>
              <span style={{ fontSize:13.5, fontWeight:700, color:'var(--text-primary)', width:20, textAlign:'right', flexShrink:0 }}>{r.count}</span>
            </div>
          ))}
        </div>

        {/* Proposals by Status */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom:18 }}>Proposals by Status</h3>
          {byStatus.map(s => (
            <div key={s.status} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <span style={{ fontSize:13.5, color:'var(--text-secondary)', width:80, flexShrink:0, textTransform:'capitalize' }}>{s.status}</span>
              <Bar count={s.count} max={maxStatus} color={s.color}/>
              <span style={{ fontSize:13.5, fontWeight:700, color:'var(--text-primary)', width:20, textAlign:'right', flexShrink:0 }}>{s.count}</span>
            </div>
          ))}

          {byDept.length > 0 && (
            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Proposals by Department</div>
              {byDept.map(d => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
                  <span style={{ fontSize:13.5, color:'var(--text-secondary)', width:80, flexShrink:0 }}>{d.name}</span>
                  <Bar count={d.proposals} max={maxDeptProp} color={d.color}/>
                  <span style={{ fontSize:13.5, fontWeight:700, color:'var(--text-primary)', width:20, textAlign:'right', flexShrink:0 }}>{d.proposals}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Breakdown table */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle} style={{ marginBottom:18 }}>Department Breakdown</h3>
        <div className={styles.tableWrap} style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Proposals</th>
                <th>Active Students</th>
                <th>Teams</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {byDept.map(d => {
                const completion = d.proposals > 0 ? Math.round((d.confirmed / d.proposals) * 100) : 0
                return (
                  <tr key={d.name}>
                    <td style={{ fontWeight:600 }}>{d.name}</td>
                    <td style={{ color:'var(--text-muted)' }}>{d.proposals}</td>
                    <td style={{ color:'var(--text-muted)' }}>{d.students}</td>
                    <td style={{ color:'var(--text-muted)' }}>{d.teams}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${completion}%`, background:d.color, borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text-muted)', width:32 }}>{completion}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {byDept.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:30, color:'var(--text-muted)' }}>No departments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}