import { useState, useEffect, useRef } from 'react'
import { Search, UserPlus, CheckCircle, XCircle, UserX, Edit2, Upload, Download } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate, roleLabels } from '../../utils/helpers'
import styles from './Admin.module.css'

const STATUS_FILTERS = ['all','active','pending','deactivated']
const ROLE_FILTERS   = ['all','admin','lecturer','student','employer']

// Parse CSV text into array of objects using first row as header
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
  })
}

const CSV_TEMPLATE = `firstName,lastName,email,department\nJohn,Doe,john.doe@student.newinti.edu.my,IT\nJane,Smith,jane.smith@student.newinti.edu.my,Business`

export default function UserManagement() {
  const [users, setUsers]       = useState([])
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [roleFilter, setRole]   = useState('all')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [deptId, setDeptId]     = useState('')
  const [alert, setAlert]       = useState(null)
  const [newUser, setNewUser]   = useState({ first_name:'', last_name:'', email:'', password:'', role:'student', department_id:'', company_name:'' })

  // Bulk upload state
  const fileInputRef            = useRef(null)
  const [csvRows, setCsvRows]   = useState([])
  const [csvError, setCsvError] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading]       = useState(false)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  const load = async () => {
    try {
      setLoading(true)
      const [u, d] = await Promise.all([api.getUsers(), api.getDepartments()])
      setUsers(u.map(normalise))
      setDepts(d)
    } catch (e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const normalise = u => ({
    ...u,
    first_name:    u.firstName    ?? u.first_name,
    last_name:     u.lastName     ?? u.last_name,
    department_id: u.departmentId ?? u.department_id,
    company_name:  u.companyName  ?? u.company_name,
    created_at:    u.createdAt    ?? u.created_at,
  })

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search) {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase()
      return name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const handleApprove = async () => {
    if (['student','lecturer'].includes(selected.role) && !deptId) return
    try {
      const updated = await api.approveUser(selected.id, deptId ? parseInt(deptId) : null)
      setUsers(prev => prev.map(u => u.id === selected.id ? normalise(updated) : u))
      showAlert('success', `${selected.first_name} ${selected.last_name} approved — a welcome notification has been sent.`)
      setModal(null); setSelected(null); setDeptId('')
    } catch (e) { showAlert('error', e.message) }
  }

  const handleReject = async () => {
    try {
      await api.rejectUser(selected.id)
      setUsers(prev => prev.filter(u => u.id !== selected.id))
      showAlert('success', 'Registration rejected and removed.')
      setModal(null); setSelected(null)
    } catch (e) { showAlert('error', e.message) }
  }

  const handleDeactivate = async (u) => {
    try {
      const updated = await api.deactivateUser(u.id)
      setUsers(prev => prev.map(x => x.id === u.id ? normalise(updated) : x))
      showAlert('success', `${u.first_name} ${u.last_name} deactivated.`)
    } catch (e) { showAlert('error', e.message) }
  }

  const handleReactivate = async (u) => {
    try {
      const updated = await api.reactivateUser(u.id)
      setUsers(prev => prev.map(x => x.id === u.id ? normalise(updated) : x))
      showAlert('success', `${u.first_name} ${u.last_name} reactivated.`)
    } catch (e) { showAlert('error', e.message) }
  }

  const handleCreate = async () => {
    try {
      const created = await api.createUser({
        firstName: newUser.first_name, lastName: newUser.last_name,
        email: newUser.email, password: newUser.password,
        role: newUser.role,
        status: 'active',
        departmentId: newUser.department_id ? parseInt(newUser.department_id) : null,
        companyName: newUser.company_name || null,
      })
      setUsers(prev => [normalise(created), ...prev])
      showAlert('success', 'User created successfully.')
      setModal(null)
      setNewUser({ first_name:'', last_name:'', email:'', password:'', role:'student', department_id:'', company_name:'' })
    } catch (e) { showAlert('error', e.message) }
  }

  // ── CSV Bulk Upload handlers ──────────────────────────────────────────────
  const handleCSVFile = (e) => {
    setCsvError(null); setCsvRows([]); setUploadResult(null)
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) { setCsvError('Please select a .csv file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target.result)
        if (rows.length === 0) { setCsvError('CSV file is empty.'); return }
        setCsvRows(rows)
      } catch (err) { setCsvError(err.message) }
    }
    reader.readAsText(file)
  }

  const handleBulkUpload = async () => {
    if (!csvRows.length) return
    setUploading(true); setUploadResult(null)
    try {
      const result = await api.bulkUploadStudents(csvRows)
      setUploadResult(result)
      if (result.results?.created?.length > 0) {
        await load()  // refresh user list
      }
    } catch (e) { setCsvError(e.message) }
    finally { setUploading(false) }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'student_upload_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const resetBulkModal = () => {
    setCsvRows([]); setCsvError(null); setUploadResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getDeptName = (id) => depts.find(d => d.id === id)?.name || '—'
  const set = key => val => setNewUser(p => ({ ...p, [key]: val }))

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:20 }}>
        <div className={styles.searchBar} style={{ width:320 }}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..."/>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="outline" onClick={() => { resetBulkModal(); setModal('bulk') }}>
            <Upload size={15}/> Bulk Upload CSV
          </Button>
          <Button onClick={() => setModal('create')}><UserPlus size={15}/> Add User</Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', width:110, flexShrink:0 }}>Account Status</span>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} className={`${styles.filterTab} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)} style={{ margin:0, textTransform:'capitalize' }}>
                {f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:'var(--border)', margin:'0 0 12px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', width:110, flexShrink:0 }}>User Role</span>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {ROLE_FILTERS.map(r => (
              <button key={r} className={`${styles.filterTab} ${roleFilter===r?styles.active:''}`} onClick={()=>setRole(r)} style={{ margin:0 }}>
                {r==='all'?'All Roles':roleLabels[r]||r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr>
            <th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Registered</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13.5 }}>{u.first_name} {u.last_name}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><Badge status={u.role}/></td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{u.company_name || getDeptName(u.department_id)}</td>
                <td><Badge status={u.status}/></td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{formatDate(u.created_at || u.createdAt)}</td>
                <td>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {u.status === 'pending' && <>
                      <Button size="sm" variant="success" onClick={() => { setSelected(u); setDeptId(''); setModal('approve') }}>
                        <CheckCircle size={13}/> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => { setSelected(u); setModal('reject') }}>
                        <XCircle size={13}/> Reject
                      </Button>
                    </>}
                    {u.status === 'active' && u.role !== 'admin' && (
                      <Button size="sm" variant="outline" onClick={() => handleDeactivate(u)}>
                        <UserX size={13}/> Deactivate
                      </Button>
                    )}
                    {u.status === 'deactivated' && (
                      <Button size="sm" variant="subtle" onClick={() => handleReactivate(u)}>Reactivate</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(u); setModal('edit') }}>
                      <Edit2 size={13}/>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Bulk Upload CSV Modal ── */}
      {modal === 'bulk' && (
        <Modal title="Bulk Upload Students via CSV" size="lg"
          onClose={() => { setModal(null); resetBulkModal() }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); resetBulkModal() }}>Close</Button>
            {csvRows.length > 0 && !uploadResult && (
              <Button onClick={handleBulkUpload} disabled={uploading}>
                <Upload size={14}/> {uploading ? 'Uploading…' : `Upload ${csvRows.length} Students`}
              </Button>
            )}
          </>}>

          {!uploadResult ? (
            <>
              <Alert type="info">
                Upload a CSV file to create student accounts in bulk. Student emails must use the <code>@student.newinti.edu.my</code> domain. Accounts are created as active with a default password of <code>emailprefix@INTI</code> (e.g. <code>john.doe@INTI</code>). Students should change their password on first login.
              </Alert>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>Required columns: <code>firstName, lastName, email, department</code></span>
                <Button size="sm" variant="outline" onClick={downloadTemplate}>
                  <Download size={13}/> Download Template
                </Button>
              </div>

              {/* Drop zone */}
              <div
                style={{ border:'2px dashed var(--border)', borderRadius:'var(--radius-md)', padding:'32px 20px', textAlign:'center', cursor:'pointer', marginBottom:16, background:'var(--bg)' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='var(--red)' }}
                onDragLeave={e => { e.currentTarget.style.borderColor='var(--border)' }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor='var(--border)'; const f=e.dataTransfer.files[0]; if(f){ fileInputRef.current.files=e.dataTransfer.files; handleCSVFile({target:{files:[f]}}) } }}>
                <Upload size={24} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>
                  {csvRows.length > 0 ? `✓ ${csvRows.length} rows loaded — click to replace` : 'Click or drag a CSV file here'}
                </div>
                <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>CSV files only</div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVFile} style={{ display:'none' }}/>
              </div>

              {csvError && <Alert type="error">{csvError}</Alert>}

              {/* Preview table */}
              {csvRows.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>
                    Preview — first 5 rows of {csvRows.length}
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', fontSize:12.5, borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'var(--bg)' }}>
                          {Object.keys(csvRows[0]).map(h => (
                            <th key={h} style={{ padding:'6px 10px', textAlign:'left', borderBottom:'1px solid var(--border)', color:'var(--text-muted)', fontWeight:700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0,5).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((v, j) => (
                              <td key={j} style={{ padding:'6px 10px', borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' }}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvRows.length > 5 && (
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>...and {csvRows.length - 5} more rows</div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Upload results */
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
                {[
                  ['Created',  uploadResult.results.created.length,  '#16A34A'],
                  ['Skipped',  uploadResult.results.skipped.length,  '#D97706'],
                  ['Errors',   uploadResult.results.errors.length,   '#DC2626'],
                ].map(([l,c,col]) => (
                  <div key={l} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 18px', textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:700, color:col, fontFamily:'Space Grotesk' }}>{c}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>

              {uploadResult.results.errors.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Errors</div>
                  {uploadResult.results.errors.map((e, i) => (
                    <div key={i} style={{ fontSize:12.5, padding:'6px 10px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'var(--radius-sm)', marginBottom:4, color:'#DC2626' }}>
                      Row {e.row} — {e.email}: {e.reason}
                    </div>
                  ))}
                </div>
              )}

              {uploadResult.results.skipped.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Skipped (already exists)</div>
                  {uploadResult.results.skipped.map((s, i) => (
                    <div key={i} style={{ fontSize:12.5, padding:'6px 10px', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'var(--radius-sm)', marginBottom:4, color:'#92400E' }}>
                      Row {s.row} — {s.email}: {s.reason}
                    </div>
                  ))}
                </div>
              )}

              {uploadResult.results.created.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Successfully Created</div>
                  {uploadResult.results.created.map((c, i) => (
                    <div key={i} style={{ fontSize:12.5, padding:'6px 10px', background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:'var(--radius-sm)', marginBottom:4, color:'#166534', display:'flex', justifyContent:'space-between' }}>
                      <span>{c.name} — {c.email}</span>
                      <span style={{ fontFamily:'monospace', opacity:0.7 }}>pw: {c.defaultPassword}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Approve modal */}
      {modal === 'approve' && selected && (
        <Modal title="Approve Registration" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Cancel</Button>
            <Button variant="success" onClick={handleApprove}
              disabled={['student','lecturer'].includes(selected.role) && !deptId}>
              <CheckCircle size={14}/> Approve Account
            </Button>
          </>}>
          <div style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', marginBottom:16 }}>
            <div style={{ fontWeight:600 }}>{selected.first_name} {selected.last_name}</div>
            <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{selected.email} · <Badge status={selected.role}/></div>
          </div>
          {['student','lecturer'].includes(selected.role) && (
            <Input label="Assign Department" name="dept" type="select" value={deptId} onChange={setDeptId}
              options={depts.map(d => ({ value:String(d.id), label:d.name }))} required/>
          )}
        </Modal>
      )}

      {/* Reject modal */}
      {modal === 'reject' && selected && (
        <Modal title="Reject Registration" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}><XCircle size={14}/> Confirm Rejection</Button>
          </>}>
          <Alert type="warning">This will permanently remove {selected.first_name} {selected.last_name}'s registration.</Alert>
        </Modal>
      )}

      {/* Create user modal */}
      {modal === 'create' && (
        <Modal title="Add User" onClose={() => setModal(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newUser.first_name||!newUser.last_name||!newUser.email||!newUser.password}>
              <UserPlus size={14}/> Create User
            </Button>
          </>}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Input label="First Name" name="fn" value={newUser.first_name} onChange={set('first_name')} required/>
            <Input label="Last Name"  name="ln" value={newUser.last_name}  onChange={set('last_name')}  required/>
          </div>
          <Input label="Email"    name="em" type="email"    value={newUser.email}    onChange={set('email')}    required/>
          <Input label="Password" name="pw" type="password" value={newUser.password} onChange={set('password')} required/>
          <Input label="Role" name="role" type="select" value={newUser.role} onChange={set('role')}
            options={[{value:'admin',label:'Admin'},{value:'lecturer',label:'Lecturer'},{value:'student',label:'Student'},{value:'employer',label:'Industry Partner'}]}/>
          {['student','lecturer'].includes(newUser.role) && (
            <Input label="Department" name="dept" type="select" value={newUser.department_id} onChange={set('department_id')}
              options={depts.map(d=>({value:String(d.id),label:d.name}))}/>
          )}
          {newUser.role === 'employer' && (
            <Input label="Company Name" name="co" value={newUser.company_name} onChange={set('company_name')}/>
          )}
        </Modal>
      )}

      {/* Edit user modal */}
      {modal === 'edit' && selected && (
        <Modal title="Edit User" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Cancel</Button>
            <Button onClick={async () => {
              try {
                const updated = await api.updateUser(selected.id, {
                  firstName: selected.first_name,
                  lastName:  selected.last_name,
                  departmentId: selected.department_id || undefined,
                  companyName: selected.company_name || undefined,
                })
                setUsers(prev => prev.map(u => u.id === selected.id ? normalise(updated) : u))
                showAlert('success', 'User updated successfully.')
                setModal(null); setSelected(null)
              } catch(e) { showAlert('error', e.message) }
            }}>Save Changes</Button>
          </>}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Input label="First Name" name="fn" value={selected.first_name || ''}
              onChange={v => setSelected(p => ({ ...p, first_name: v }))} required/>
            <Input label="Last Name" name="ln" value={selected.last_name || ''}
              onChange={v => setSelected(p => ({ ...p, last_name: v }))} required/>
          </div>
          <Input label="Email" name="em" value={selected.email || ''} onChange={() => {}}
            disabled hint="Email cannot be changed."/>
          <Input label="Role" name="role" value={selected.role || ''} onChange={() => {}}
            disabled hint="Role cannot be changed here."/>
          {['student','lecturer'].includes(selected.role) && (
            <Input label="Department" name="dept" type="select"
            value={String(selected.department_id || '')}
            onChange={v => setSelected(p => ({ ...p, department_id: parseInt(v) }))}
            options={depts.map(d => ({ value: String(d.id), label: d.name }))}/>
          )}
          {selected.role === 'employer' && (
            <Input label="Company Name" name="co" value={selected.company_name || ''}
              onChange={v => setSelected(p => ({ ...p, company_name: v }))}/>
          )}
        </Modal>
      )}
    </div>
  )
}
