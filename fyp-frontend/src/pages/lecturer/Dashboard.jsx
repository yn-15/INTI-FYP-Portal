import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import { FileText, UsersRound, CheckCircle, MessageSquare } from 'lucide-react'
import { api } from '../../utils/api'
import styles from './Lecturer.module.css'
import { formatDate } from '../../utils/helpers'
import Badge from '../../components/ui/Badge'

export default function LecturerReports() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [teams, setTeams]         = useState([])
  const [students, setStudents]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [p, t, s] = await Promise.all([
          api.getProposals(), api.getTeams(), api.getDeptStudents()
        ])
        setProposals(p)
        setTeams(t)
        setStudents(s)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const deptName   = user.department_id === 1 ? 'IT' : 'Business'
  const byStatus   = [
    { label:'Pending',  count:proposals.filter(p=>p.status==='pending').length,  color:'#D97706' },
    { label:'Approved', count:proposals.filter(p=>p.status==='approved').length, color:'#16A34A' },
    { label:'Rejected', count:proposals.filter(p=>p.status==='rejected').length, color:'#DC2626' },
  ]
  const maxCount      = Math.max(...byStatus.map(s=>s.count), 1)
  const assignedIds   = teams.flatMap(t => (t.members||[]).map(m => m.studentId||m.student?.id))
  const unassigned    = students.filter(s => !assignedIds.includes(s.id))
  const withThreads   = proposals.filter(p => p.chatThread)

  if (loading) return <div className={styles.page}><p style={{ color:'var(--text-muted)' }}>Loading...</p></div>

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:24 }}>
        {deptName} Department — analytics visible to you only
      </p>

      <div className={styles.statsGrid} style={{ marginBottom:24 }}>
        <StatCard label="Total Proposals" value={proposals.length}     accent="#CC0000" icon={FileText}      sub={`${deptName} dept`}/>
        <StatCard label="Approved"         value={proposals.filter(p=>p.status==='approved').length} accent="#16A34A" icon={CheckCircle}/>
        <StatCard label="Active Teams"     value={teams.length}         accent="#7C3AED" icon={UsersRound}   sub={`${teams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Active Chats"     value={withThreads.length}   accent="#2563EB" icon={MessageSquare} sub="With employers"/>
      </div>

      <div className={styles.grid2} style={{ marginBottom:20 }}>
        {/* Pending reviews */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pending Review</h3>
          </div>
          {proposals.filter(p => p.status === 'pending').length === 0 ? (
            <div className={styles.empty}>
              <CheckCircle size={26} color="#16A34A"/>
              <p>No proposals pending review</p>
            </div>
          ) : proposals.filter(p => p.status === 'pending').map(p => (
            <div key={p.id} className={styles.proposalRow}>
              <div className={styles.proposalInfo}>
                <div className={styles.proposalTitle}>{p.title}</div>
                <div className={styles.proposalMeta}>{p.companyName} · {formatDate(p.submittedAt)}</div>
              </div>
              <Badge status="pending"/>
            </div>
          ))}
        </div>

        {/* Students overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h3 className={styles.cardTitle}>Students Overview</h3></div>
          {[
            { label:'Total Active', count:students.length,    color:'#2563EB' },
            { label:'Assigned',     count:assignedIds.length, color:'#16A34A' },
            { label:'Unassigned',   count:unassigned.length,  color:'#CC0000' },
          ].map(s => (
            <div key={s.label} className={styles.reportBar}>
              <span className={styles.reportBarLabel}>{s.label}</span>
              <div className={styles.reportBarTrack}>
                <div className={styles.reportBarFill}
                  style={{ width:`${students.length?s.count/students.length*100:0}%`, background:s.color }}/>
              </div>
              <span className={styles.reportBarValue}>{s.count}</span>
            </div>
          ))}

          <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:12 }}>Teams</div>
            {[
              { label:'Total Teams', count:teams.length,                         color:'#2563EB' },
              { label:'Confirmed',   count:teams.filter(t=>t.confirmed).length,  color:'#16A34A' },
              { label:'Draft',       count:teams.filter(t=>!t.confirmed).length, color:'#D97706' },
            ].map(s => (
              <div key={s.label} className={styles.reportBar}>
                <span className={styles.reportBarLabel}>{s.label}</span>
                <div className={styles.reportBarTrack}>
                  <div className={styles.reportBarFill}
                    style={{ width:`${teams.length?s.count/teams.length*100:0}%`, background:s.color }}/>
                </div>
                <span className={styles.reportBarValue}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proposal detail table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}><h3 className={styles.cardTitle}>All Proposals — {deptName}</h3></div>
        <div className={styles.tableWrap} style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Team</th><th>Chat</th></tr></thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.id}>
                  <td><div style={{ fontWeight:600 }}>{p.title}</div></td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{p.companyName}</td>
                  <td>
                    <span style={{ fontSize:12, fontWeight:600, textTransform:'capitalize',
                      color:p.status==='approved'?'#16A34A':p.status==='rejected'?'#DC2626':'#D97706' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{p.team?.name || '—'}</td>
                  <td>
                    {p.chatThread
                      ? <span style={{ fontSize:12, color:'#16A34A', fontWeight:600 }}>● Active</span>
                      : <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              ))}
              {proposals.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:30, color:'var(--text-muted)' }}>No proposals in your department.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}