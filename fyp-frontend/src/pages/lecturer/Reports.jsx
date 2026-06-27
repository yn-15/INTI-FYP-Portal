import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import StatPanel from '../../components/ui/StatPanel'
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
    { label:'Pending Review',      count: myProposals.filter(p=>p.status==='pending').length,             color:'var(--warning)' },
    { label:'Approved',            count: myProposals.filter(p=>p.status==='approved').length,            color:'var(--success)' },
    { label:'Returned for Review', count: myProposals.filter(p=>p.status==='returned_for_review').length, color:'var(--corrective)' },
  ]

  return (
    <div className={styles.page}>
      <div style={{ marginBottom:24 }}>
        
        <p className={styles.sectionSub}>{dept?.name} Department — analytics visible to you only</p>
      </div>

      {/* Stats */}
      <StatPanel>
        <StatCard label="Total Proposals" value={myProposals.length}     tone="neutral" icon={FileText}      sub={`${dept?.name} dept`}/>
        <StatCard label="Approved"         value={myProposals.filter(p=>p.status==='approved').length} tone="live" icon={CheckCircle}/>
        <StatCard label="Active Teams"     value={myTeams.length}         tone="neutral" icon={UsersRound}   sub={`${myTeams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Active Chats"     value={myThreads.length}       tone="neutral" icon={MessageSquare} sub="With employers"/>
      </StatPanel>

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
            { label:'Total Active',   count: deptStudents.length,                              color:'var(--text-primary)' },
            { label:'Assigned',       count: assignedIds.length,                               color:'var(--success)' },
            { label:'Unassigned',     count: deptStudents.length - assignedIds.length,         color:'var(--warning)' },
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
              { label:'Total Teams',    count: myTeams.length,                          color:'var(--text-primary)' },
              { label:'Confirmed',      count: myTeams.filter(t=>t.confirmed).length,   color:'var(--success)' },
              { label:'Draft',          count: myTeams.filter(t=>!t.confirmed).length,  color:'var(--warning)' },
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
                      <span style={{ fontSize:12, fontWeight:600, color: p.status==='approved'?'var(--success)':p.status==='returned_for_review'?'var(--corrective)':'var(--warning)' }}>
                        {p.status === 'returned_for_review' ? 'Returned for Review' : p.status}
                      </span>
                    </td>
                    <td className={styles.tdMuted}>{team ? team.name : '—'}</td>
                    <td>
                      {thread
                        ? <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>● Yes</span>
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
