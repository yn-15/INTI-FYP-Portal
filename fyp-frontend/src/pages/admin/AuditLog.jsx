import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDateTime } from '../../utils/helpers'
import styles from './Admin.module.css'

export default function AuditLog() {
  const [logs, setLogs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [entityFilter, setEntity]   = useState('all')

  useEffect(() => {
    api.getAuditLogs()
     .then(data => {
      const logs = Array.isArray(data) ? data : (data.logs || data.data || [])
      setLogs(logs)
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false))
}, [])

  const deriveStatus = (action = '') => {
    const a = action.toLowerCase()
    if (a.includes('failed') || a.includes('error')) return 'error'
    if (a.includes('rejected') || a.includes('deactivated') || a.includes('dropped')) return 'warning'
    return 'success'
  }

  const filtered = logs.filter(log => {
    const entityType = log.entityType || log.entity_type
    const status     = deriveStatus(log.action)
    if (statusFilter !== 'all' && status !== statusFilter) return false
    if (entityFilter !== 'all' && entityType !== entityFilter) return false
    if (search) {
      const actor = log.user ? `${log.user.firstName||''} ${log.user.lastName||''}` : ''
      return log.action.toLowerCase().includes(search.toLowerCase()) ||
             actor.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const entityTypes = [...new Set(logs.map(l => l.entityType || l.entity_type).filter(Boolean))]

  const statusColor = { success:'#16A34A', warning:'#D97706', error:'#DC2626' }
  const statusBg    = { success:'#F0FDF4', warning:'#FFFBEB', error:'#FEF2F2' }

  return (
    <div className={styles.page}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:20 }}>
        <div className={styles.searchBar} style={{ width:320 }}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search action or user..."/>
        </div>
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} records</span>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', width:110, flexShrink:0 }}>Log Status</span>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','success','warning','error'].map(f => (
              <button key={f} className={`${styles.filterTab} ${statusFilter===f?styles.active:''}`}
                onClick={()=>setStatus(f)} style={{ margin:0, textTransform:'capitalize' }}>
                {f==='all'?'All Status':f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:'var(--border)', margin:'0 0 12px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', width:110, flexShrink:0 }}>Entity Type</span>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button className={`${styles.filterTab} ${entityFilter==='all'?styles.active:''}`}
              onClick={()=>setEntity('all')} style={{ margin:0 }}>All Types</button>
            {entityTypes.map(e => (
              <button key={e} className={`${styles.filterTab} ${entityFilter===e?styles.active:''}`}
                onClick={()=>setEntity(e)} style={{ margin:0, textTransform:'capitalize' }}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr>
            <th>Date / Time</th><th>User</th><th>Action</th><th>Entity</th><th>Status</th><th>Details</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.map(log => {
              const entityType = log.entityType || log.entity_type
              const status = deriveStatus(log.action)
              const actor = log.user
              return (
                <tr key={log.id}>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDateTime(log.createdAt||log.created_at)}</td>
                  <td>
                    {actor ? (
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{actor.firstName||actor.first_name} {actor.lastName||actor.last_name}</div>
                        <div style={{ fontSize:11.5, color:'var(--text-muted)', textTransform:'capitalize' }}>{actor.role}</div>
                      </div>
                    ) : <span style={{ color:'var(--text-muted)' }}>System</span>}
                  </td>
                  <td style={{ fontSize:13.5, fontWeight:500 }}>{log.action}</td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)', textTransform:'capitalize' }}>{entityType || '—'}</td>
                  <td>
                    <span style={{ fontSize:12, fontWeight:600, color:statusColor[status], background:statusBg[status], padding:'3px 10px', borderRadius:10, textTransform:'capitalize' }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ fontSize:12, color:'var(--text-muted)', maxWidth:200 }}>
                    {log.details ? JSON.stringify(log.details).slice(0,80) : '—'}
                  </td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
