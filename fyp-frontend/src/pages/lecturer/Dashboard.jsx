import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, UsersRound, Bell, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  proposals, users, teams, teamMembers,
  notifications, getDeptById
} from '../../data/mockDB'
import { formatDate, formatDateTime } from '../../utils/helpers'
import styles from './Lecturer.module.css'

export default function LecturerDashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const dept       = getDeptById(user.department_id)

  // Filter everything to this lecturer's department
  const myProposals   = proposals.filter(p => p.department_id === user.department_id)
  const pending       = myProposals.filter(p => p.status === 'pending')
  const approved      = myProposals.filter(p => p.status === 'approved')
  const myTeams       = teams.filter(t => t.supervisor_id === user.id)
  const myNotifs      = notifications.filter(n => n.created_by === user.id)

  // Students in my department
  const deptStudents  = users.filter(u => u.role === 'student' && u.department_id === user.department_id && u.status === 'active')
  const assignedIds   = teamMembers.filter(m => myTeams.map(t => t.id).includes(m.team_id)).map(m => m.student_id)
  const unassigned    = deptStudents.filter(s => !assignedIds.includes(s.id))

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h2 className={styles.welcomeTitle}>Welcome back, {user.first_name} 👋</h2>
        <p className={styles.welcomeSub}>
          {dept?.name} Department · Manage your proposals, teams and students
        </p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard label="Pending Review"   value={pending.length}      accent="#D97706" icon={Clock}      sub="Awaiting your decision"/>
        <StatCard label="Approved Projects" value={approved.length}     accent="#16A34A" icon={CheckCircle} sub="Available for selection"/>
        <StatCard label="My Teams"          value={myTeams.length}       accent="#CC0000" icon={UsersRound} sub={`${myTeams.filter(t=>t.confirmed).length} confirmed`}/>
        <StatCard label="Unassigned Students" value={unassigned.length} accent="#2563EB" icon={UsersRound} sub={`of ${deptStudents.length} total`}/>
      </div>

      <div className={styles.grid2} style={{ marginBottom: 20 }}>
        {/* Pending proposals review queue */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pending Review</h3>
            <button className={styles.cardLink} onClick={() => navigate('/lecturer/proposals')}>View all →</button>
          </div>
          {pending.length === 0 ? (
            <div className={styles.empty}>
              <CheckCircle size={26} color="#16A34A"/>
              <p>No proposals pending review</p>
            </div>
          ) : pending.map(p => {
            const submitter = users.find(u => u.id === p.submitted_by)
            return (
              <div key={p.id} className={styles.proposalRow}>
                <div className={styles.proposalInfo}>
                  <div className={styles.proposalTitle}>{p.title}</div>
                  <div className={styles.proposalMeta}>
                    {submitter?.company_name || p.company_name} · {formatDate(p.submitted_at)}
                  </div>
                </div>
                <div className={styles.proposalActions}>
                  <Badge status="pending"/>
                  <Button size="sm" variant="subtle" onClick={() => navigate('/lecturer/proposals')}>Review</Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* My teams */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Teams</h3>
            <button className={styles.cardLink} onClick={() => navigate('/lecturer/teams')}>Manage →</button>
          </div>
          {myTeams.length === 0 ? (
            <div className={styles.empty}>
              <UsersRound size={26} style={{ opacity: 0.3 }}/>
              <p>No teams created yet</p>
            </div>
          ) : myTeams.map(t => {
            const proposal  = proposals.find(p => p.id === t.proposal_id)
            const members   = teamMembers.filter(m => m.team_id === t.id)
            const memberUsers = members.map(m => users.find(u => u.id === m.student_id)).filter(Boolean)
            return (
              <div key={t.id} className={styles.proposalRow}>
                <div className={styles.proposalInfo}>
                  <div className={styles.proposalTitle}>{t.name}</div>
                  <div className={styles.proposalMeta}>{proposal?.title || '—'} · {memberUsers.length} member{memberUsers.length !== 1 ? 's' : ''}</div>
                </div>
                <div className={styles.proposalActions}>
                  <Badge status={t.confirmed ? 'confirmed' : 'draft'}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Proposals — {dept?.name} Department</h3>
        </div>
        <div className={styles.tableWrap} style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead><tr>
              <th>Title</th><th>Company</th><th>Submitted</th><th>Status</th>
            </tr></thead>
            <tbody>
              {myProposals.slice(0, 5).map(p => (
                <tr key={p.id} style={{ cursor:'pointer' }} onClick={() => navigate('/lecturer/proposals')}>
                  <td><div className={styles.tdBold}>{p.title}</div></td>
                  <td className={styles.tdMuted}>{p.company_name}</td>
                  <td className={styles.tdMuted}>{formatDate(p.submitted_at)}</td>
                  <td><Badge status={p.status}/></td>
                </tr>
              ))}
              {myProposals.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:30, color:'var(--text-muted)' }}>No proposals in your department yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
