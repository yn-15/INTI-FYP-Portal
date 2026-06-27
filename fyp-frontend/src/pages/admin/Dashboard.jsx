import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, UsersRound, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import StatPanel from '../../components/ui/StatPanel'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Admin.module.css'

export default function AdminDashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [stats, setStats]       = useState({ users:0, proposals:0, teams:0, pending:0 })
  const [pending, setPending]   = useState([])
  const [proposals, setProposals] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [users, props, teams, logsRes, deptList] = await Promise.all([
          api.getUsers(), api.getProposals(), api.getTeams(),
          api.getAuditLogs(), api.getDepartments()
        ]) 
        const pendingUsers = users.filter(u => u.status === 'pending')
        setPending(pendingUsers.slice(0, 5))
        setProposals(props)
        const logs = Array.isArray(logsRes) ? logsRes : (logsRes.logs || logsRes.data || [])
        setAuditLogs(logs.slice(0, 6))
        setDepts(deptList)
        setStats({
          users:     users.filter(u => u.status === 'active').length,
          proposals: props.length,
          teams:     teams.length,
          pending:   pendingUsers.length,
        })
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const normalise = u => ({
    ...u,
    first_name: u.firstName ?? u.first_name,
    last_name:  u.lastName  ?? u.last_name,
  })

  // Proposal breakdown
  const byStatus = {
    pending:             proposals.filter(p => p.status === 'pending').length,
    approved:            proposals.filter(p => p.status === 'approved').length,
    returned_for_review: proposals.filter(p => p.status === 'returned_for_review').length,
  }

  // Proposals by department
  const byDept = depts.map(d => ({
    name:  d.name,
    count: proposals.filter(p => (p.departmentId||p.department_id) === d.id).length,
  }))
  const maxDeptCount = Math.max(...byDept.map(d => d.count), 1)

  // Audit log icon
  const actionIcon = (action = '') => {
    const a = action.toLowerCase()
    if (a.includes('failed') || a.includes('error')) return <XCircle size={14} color="var(--error)"/>
    if (a.includes('returned') || a.includes('deactivated') || a.includes('dropped')) return <XCircle size={14} color="var(--warning)"/>
    return <CheckCircle size={14} color="var(--success)"/>
  }

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h2 className={styles.welcomeTitle}>Welcome back, {user.first_name} 👋</h2>
        <p className={styles.welcomeSub}>Here's what's happening across the FYP system today.</p>
      </div>

      {/* Pending alert banner */}
      {stats.pending > 0 && (
        <div style={{ padding:'14px 18px', background:'var(--warning-faint)', borderRadius:'var(--radius-md)', border:'1px solid var(--warning-border)', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <AlertCircle size={18} color="var(--warning)"/>
          <span style={{ fontSize:13.5, color:'var(--warning)', flex:1 }}>
            <strong>{stats.pending} pending</strong> account registration{stats.pending!==1?'s':''} awaiting your approval
          </span>
          <Button size="sm" onClick={() => navigate('/admin/users')}>Review →</Button>
        </div>
      )}

      {/* Stat cards */}
      <StatPanel>
        <StatCard label="Active Users"      value={loading?'—':stats.users}     tone="neutral" icon={Users}       sub={`${stats.pending} pending approval`}/>
        <StatCard label="Total Proposals"   value={loading?'—':stats.proposals}  tone="neutral" icon={FileText}    sub={`${byStatus.pending} pending review`}/>
        <StatCard label="Approved Proposals" value={loading?'—':byStatus.approved} tone="live"    icon={CheckCircle} sub="Available for selection"/>
        <StatCard label="Active Teams"      value={loading?'—':stats.teams}      tone="neutral" icon={UsersRound}  sub={`${depts.length} departments`}/>
      </StatPanel>

      {/* Middle row — Pending registrations + Proposals Overview */}
      <div className={styles.grid2} style={{ marginBottom:20, alignItems:'stretch' }}>

        {/* Pending Registrations */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pending Registrations</h3>
            <button className={styles.cardLink} onClick={() => navigate('/admin/users')}>View all →</button>
          </div>
          {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
          : pending.length === 0
          ? <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>No pending registrations.</p>
          : pending.map(u => {
            const norm = normalise(u)
            return (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                  {norm.first_name?.[0]}{norm.last_name?.[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{norm.first_name} {norm.last_name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                </div>
                <Badge status={u.role}/>
              </div>
            )
          })}
        </div>

        {/* Proposals Overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Proposals Overview</h3>
            <button className={styles.cardLink} onClick={() => navigate('/admin/proposals')}>View all →</button>
          </div>

          {/* Status rows */}
          {[
            { label:'Pending Review',       count:byStatus.pending,             color:'var(--warning)', dot:'var(--warning)' },
            { label:'Approved',             count:byStatus.approved,            color:'var(--success)', dot:'var(--success)' },
            { label:'Returned for Review',  count:byStatus.returned_for_review, color:'var(--corrective)', dot:'var(--corrective)' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:s.dot, flexShrink:0 }}/>
              <span style={{ fontSize:13.5, color:'var(--text-secondary)', flex:1 }}>{s.label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'Space Grotesk' }}>{loading?'—':s.count}</span>
            </div>
          ))}

          {/* By department */}
          {byDept.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
                By Department
              </div>
              {byDept.map((d, i) => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:12, marginBottom: i < byDept.length-1 ? 10 : 0 }}>
                  <span style={{ fontSize:13, color:'var(--text-secondary)', width:70, flexShrink:0 }}>{d.name}</span>
                  <div style={{ flex:1, height:7, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:4, width:`${(d.count/maxDeptCount)*100}%`, background: i===0?'var(--red)':'var(--info)', transition:'width 0.5s ease' }}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', width:16, textAlign:'right', flexShrink:0 }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent System Activity — full width */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent System Activity</h3>
          <button className={styles.cardLink} onClick={() => navigate('/admin/audit')}>View audit log →</button>
        </div>
        <div style={{ width:'100%', overflowX:'auto' }}>
          <div style={{ minWidth:520 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'8px 0', borderBottom:'2px solid var(--border)', marginBottom:4 }}>
            {['User','Action','Entity','Time'].map(h => (
              <div key={h} style={{ fontSize:11.5, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</div>
            ))}
          </div>
          {loading ? <p style={{ color:'var(--text-muted)', fontSize:13, padding:'16px 0' }}>Loading...</p>
          : auditLogs.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'16px 0' }}>No activity yet.</p>
          : auditLogs.map(log => {
            const actor = log.user
            const fn = actor?.firstName || actor?.first_name || ''
            const ln = actor?.lastName  || actor?.last_name  || ''
            const entityType = log.entityType || log.entity_type || ''
            const entityId   = log.entityId   || log.entity_id   || ''
            return (
              <div key={log.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'12px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                {/* User */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>
                    {fn[0]}{ln[0]}
                  </div>
                  <span style={{ fontSize:13.5, fontWeight:500, color:'var(--text-primary)' }}>{fn} {ln}</span>
                </div>
                {/* Action */}
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  {actionIcon(log.action)}
                  <span style={{ fontSize:13.5, color:'var(--text-primary)' }}>{log.action}</span>
                </div>
                {/* Entity */}
                <div style={{ fontSize:13, color:'var(--text-muted)', textTransform:'capitalize' }}>
                  {entityType} {entityId ? `#${entityId}` : ''}
                </div>
                {/* Time */}
                <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>
                  {formatDate(log.createdAt || log.created_at)}, {new Date(log.createdAt || log.created_at).toLocaleTimeString('en-MY', { hour:'2-digit', minute:'2-digit', hour12:true })}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
