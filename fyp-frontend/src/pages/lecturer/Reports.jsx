import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import { FileText, UsersRound, CheckCircle, MessageSquare } from 'lucide-react'
import { proposals, users, teams, teamMembers, chatThreads, departments } from '../../data/mockDB'
import styles from './Lecturer.module.css'

export default function LecturerReports() {
  const { user } = useAuth()
  const dept = departments.find(d => d.id === user.department_id)

  // All data scoped to this department
  const myProposals  = proposals.filter(p => p.department_id === user.department_id)
  const myTeams      = teams.filter(t => t.department_id === user.department_id)
  const deptStudents = users.filter(u => u.role === 'student' && u.department_id === user.department_id && u.status === 'active')
  const assignedIds  = teamMembers.filter(m => myTeams.map(t=>t.id).includes(m.team_id)).map(m => m.student_id)
  const myThreads    = chatThreads.filter(t => myProposals.map(p=>p.id).includes(t.proposal_id))

  const byStatus = [
    { label:'Pending Review', count: myProposals.filter(p=>p.status==='pending').length,  color:'#D97706' },
    { label:'Approved',       count: myProposals.filter(p=>p.status==='approved').length, color:'#16A34A' },
    { label:'Rejected',       count: myProposals.filter(p=>p.status==='rejected').length, color:'#DC2626' },
  ]

  const maxCount = Math.max(...byStatus.map(s=>s.count), 1)

  return (
    <div className={styles.page}>
      <div style={{ marginBottom:24 }}>
        
        <p className={styles.sectionSub}>{dept?.name} Department — analytics visible to you only</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid} style={{ marginBottom:24 }}>
        <StatCard label="Total Proposals" value={myProposals.length}     accent="#CC0000" icon={FileText}      sub={`${dept?.name} dept`}/>
        <StatCard label="Approved"         value={myProposals.filter(p=>p.status==='approved').length} accent="#16A34A" icon={CheckCircle}/>
        <StatCard label="Active Teams"     value={myTeams.length}         accent="#7C3AED" icon={UsersRound}   sub={`${myTeams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Active Chats"     value={myThreads.length}       accent="#2563EB" icon={MessageSquare} sub="With employers"/>
      </div>

      <div className={styles.grid2} style={{ marginBottom:20 }}>
        {/* Proposals by status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Proposals by Status</h3>
          </div>
          {byStatus.map(s => (
            <div key={s.label} className={styles.reportBar}>
              <span className={styles.reportBarLabel}>{s.label}</span>
              <div className={styles.reportBarTrack}>
                <div className={styles.reportBarFill} style={{ width:`${myProposals.length?s.count/myProposals.length*100:0}%`, background:s.color }}/>
              </div>
              <span className={styles.reportBarValue}>{s.count}</span>
            </div>
          ))}

          {myProposals.length === 0 && (
            <p style={{ color:'var(--text-muted)', fontSize:13.5, textAlign:'center', padding:'16px 0' }}>No proposals yet.</p>
          )}
        </div>

        {/* Students overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Students Overview</h3>
          </div>

          {[
            { label:'Total Active',   count: deptStudents.length,                              color:'#1A1A1A' },
            { label:'Assigned',       count: assignedIds.length,                               color:'#16A34A' },
            { label:'Unassigned',     count: deptStudents.length - assignedIds.length,         color:'#D97706' },
          ].map(s => (
            <div key={s.label} className={styles.reportBar}>
              <span className={styles.reportBarLabel}>{s.label}</span>
              <div className={styles.reportBarTrack}>
                <div className={styles.reportBarFill}
                  style={{ width:`${deptStudents.length?s.count/deptStudents.length*100:0}%`, background:s.color }}/>
              </div>
              <span className={styles.reportBarValue}>{s.count}</span>
            </div>
          ))}

          <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:12 }}>Teams</div>
            {[
              { label:'Total Teams',    count: myTeams.length,                          color:'#1A1A1A' },
              { label:'Confirmed',      count: myTeams.filter(t=>t.confirmed).length,   color:'#16A34A' },
              { label:'Draft',          count: myTeams.filter(t=>!t.confirmed).length,  color:'#D97706' },
            ].map(s => (
              <div key={s.label} className={styles.reportBar}>
                <span className={styles.reportBarLabel}>{s.label}</span>
                <div className={styles.reportBarTrack}>
                  <div className={styles.reportBarFill}
                    style={{ width:`${myTeams.length?s.count/myTeams.length*100:0}%`, background:s.color }}/>
                </div>
                <span className={styles.reportBarValue}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proposal detail table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>All Proposals — {dept?.name}</h3>
        </div>
        <div className={styles.tableWrap} style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead><tr>
              <th>Title</th><th>Company</th><th>Status</th><th>Team Assigned</th><th>Chat Active</th>
            </tr></thead>
            <tbody>
              {myProposals.map(p => {
                const team   = myTeams.find(t => t.proposal_id === p.id)
                const thread = myThreads.find(t => t.proposal_id === p.id)
                return (
                  <tr key={p.id}>
                    <td><div className={styles.tdBold}>{p.title}</div></td>
                    <td className={styles.tdMuted}>{p.company_name}</td>
                    <td>
                      <span style={{ fontSize:12, fontWeight:600, color: p.status==='approved'?'#16A34A':p.status==='rejected'?'#DC2626':'#D97706', textTransform:'capitalize' }}>
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.tdMuted}>{team ? team.name : '—'}</td>
                    <td>
                      {thread
                        ? <span style={{ fontSize:12, color:'#16A34A', fontWeight:600 }}>● Yes</span>
                        : <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>
                      }
                    </td>
                  </tr>
                )
              })}
              {myProposals.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:30, color:'var(--text-muted)' }}>No proposals in your department.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
