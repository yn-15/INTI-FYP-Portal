import { useState, useEffect } from 'react'
import { Plus, UserPlus, CheckCircle, Crown, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import styles from './Lecturer.module.css'

export default function LecturerTeams() {
  const { user }    = useAuth()
  const [teams, setTeams]       = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [newTeamName, setNewTeamName]           = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [leaderId, setLeaderId]                 = useState('')
  const [alert, setAlert]       = useState(null)
  const [editName, setEditName] = useState('')

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const load = async () => {
    try {
      setLoading(true)
      const [t, s] = await Promise.all([api.getTeams(), api.getDeptStudents()])
      setTeams(t)
      setStudents(s.map(st => ({ ...st, first_name: st.firstName??st.first_name, last_name: st.lastName??st.last_name })))
    } catch(e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleEdit = async () => {
    if (!editName.trim()) return
    try {
      const updated = await api.updateTeam(selected.id, editName.trim())
      setTeams(prev => prev.map(t => t.id === selected.id ? updated : t))
      showAlert('success', `Team renamed to "${updated.name}".`)
      setModal(null); setSelected(null); setEditName('')
    } catch(e) { showAlert('error', e.message) }
  }

  const handleDelete = async (team) => {
    try {
      await api.deleteTeam(team.id)
      setTeams(prev => prev.filter(t => t.id !== team.id))
      showAlert('success', `Team "${team.name}" deleted.`)
      setModal(null); setSelected(null)
    } catch(e) { showAlert('error', e.message) }
  }

  const handleCreate = async () => {
    if (!newTeamName.trim()) return
    try {
      const team = await api.createTeam({ name: newTeamName.trim(), departmentId: user.department_id })
      setTeams(prev => [team, ...prev])
      showAlert('success', `Team "${team.name}" created. Now assign students.`)
      setModal(null); setNewTeamName('')
    } catch(e) { showAlert('error', e.message) }
  }

  const handleAssign = async () => {
    if (selectedStudents.length === 0) return
    if (!leaderId) { showAlert('error', 'Please select a Team Leader.'); return }
    try {
      const updated = await api.assignMembers(selected.id, selectedStudents.map(Number), parseInt(leaderId))
      setTeams(prev => prev.map(t => t.id === selected.id ? updated : t))
      showAlert('success', `${selectedStudents.length} student(s) assigned. ${students.find(s=>s.id===parseInt(leaderId))?.first_name} is the Team Leader.`)
      setModal(null); setSelected(null); setSelectedStudents([]); setLeaderId('')
    } catch(e) { showAlert('error', e.message) }
  }

  const handleConfirm = async (team) => {
    try {
      const updated = await api.confirmTeam(team.id)
      setTeams(prev => prev.map(t => t.id === team.id ? updated : t))
      showAlert('success', `${team.name} confirmed. Employer can now view the team.`)
    } catch(e) { showAlert('error', e.message) }
  }

  const toggleStudent = (sid) => {
    const s = String(sid)
    setSelectedStudents(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    // If deselecting the current leader, clear leader
    if (String(leaderId) === s) setLeaderId('')
  }

  const assignedIds = teams.flatMap(t => (t.members||[]).map(m => m.studentId || m.student?.id))

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}
      <div className={styles.sectionHeader}>
        <p className={styles.sectionSub}>Create and manage project groups</p>
        <Button onClick={() => setModal('create')}><Plus size={15}/> Create Team</Button>
      </div>

      {loading ? <p style={{ color:'var(--text-muted)' }}>Loading...</p>
      : teams.length === 0 ? (
        <div className={styles.card} style={{ textAlign:'center', padding:48 }}>
          <h3 style={{ fontFamily:'Space Grotesk', marginBottom:8 }}>No teams yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>Create a team and assign students. The team leader will select a project.</p>
        </div>
      ) : teams.map(team => {
        const members = (team.members||[]).map(m => m.student||m)
        const leader  = (team.members||[]).find(m => m.isLeader)
        const leaderStudent = leader ? (leader.student || leader) : null

        return (
          <div key={team.id} className={styles.teamCard}>
            <div className={styles.teamCardHeader}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <div className={styles.teamName}>{team.name}</div>
                  <Badge status={team.confirmed ? 'confirmed' : 'draft'}/>
                </div>
                {team.proposal ? (
                  <div className={styles.teamProject}>📁 {team.proposal.title} · {team.proposal.companyName}</div>
                ) : (
                  <div style={{ fontSize:13, color:'#D97706', marginBottom:4 }}>
                    ⏳ Waiting for team leader to select a project
                  </div>
                )}
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Created {formatDate(team.createdAt)}</div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <Button size="sm" variant="ghost"
                  onClick={() => { setSelected(team); setEditName(team.name); setModal('edit') }}>
                  <Edit2 size={13}/> Edit
                </Button>
                <Button size="sm" variant="ghost"
                  onClick={() => {
                    setSelected(team)
                    setSelectedStudents((team.members||[]).map(m => String(m.studentId||m.student?.id)))
                    const ldr = (team.members||[]).find(m => m.isLeader)
                    setLeaderId(ldr ? String(ldr.studentId||ldr.student?.id) : '')
                    setModal('assign')
                  }}>
                  <UserPlus size={13}/> Assign Students
                </Button>
                {!team.confirmed && members.length > 0 && team.proposal && (
                  <Button size="sm" variant="success" onClick={() => handleConfirm(team)}>
                    <CheckCircle size={13}/> Confirm Team
                  </Button>
                )}
                {!team.confirmed && (
                  <Button size="sm" variant="danger" onClick={() => { setSelected(team); setModal('delete') }}>
                    <Trash2 size={13}/>
                  </Button>
                )}
              </div>
            </div>

            <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>
                Members ({members.length})
              </div>
              {members.length === 0 ? (
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>No students assigned yet. Assign students so the team leader can select a project.</p>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {(team.members||[]).map(m => {
                    const s  = m.student || m
                    const fn = s.firstName||s.first_name||''
                    const ln = s.lastName||s.last_name||''
                    return (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'var(--bg)', borderRadius:20, border:`1px solid ${m.isLeader?'#D97706':'var(--border)'}`, background: m.isLeader?'#FFFBEB':'var(--bg)' }}>
                        {m.isLeader && <Crown size={12} color="#D97706"/>}
                        <div style={{ width:22, height:22, borderRadius:'50%', background: m.isLeader?'#D97706':'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700 }}>
                          {fn[0]}{ln[0]}
                        </div>
                        <span style={{ fontSize:13, fontWeight:500 }}>{fn} {ln}</span>
                        {m.isLeader && <span style={{ fontSize:11, color:'#D97706', fontWeight:700 }}>Leader</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {team.confirmed && (
              <div style={{ marginTop:12, padding:'10px 14px', background:'#F0FDF4', borderRadius:'var(--radius-sm)', border:'1px solid #86EFAC', fontSize:13, color:'#16A34A' }}>
                ✓ Team confirmed — employer can now view this team.
              </div>
            )}

            {!team.confirmed && !team.proposal && members.length > 0 && (
              <div style={{ marginTop:12, padding:'10px 14px', background:'#FFFBEB', borderRadius:'var(--radius-sm)', border:'1px solid #FDE68A', fontSize:13, color:'#92400E' }}>
                ℹ The team leader ({leaderStudent ? `${leaderStudent.firstName||leaderStudent.first_name} ${leaderStudent.lastName||leaderStudent.last_name}` : '—'}) needs to log in and select a project before you can confirm this team.
              </div>
            )}
          </div>
        )
      })}

      {/* Edit Team modal */}
      {modal === 'edit' && selected && (
        <Modal title="Edit Team" onClose={() => { setModal(null); setSelected(null); setEditName('') }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null); setEditName('') }}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editName.trim() || editName.trim()===selected.name}><Edit2 size={14}/> Save</Button>
          </>}>
          <Input label="Team Name" name="name" value={editName} onChange={setEditName} placeholder="e.g. Group 3" required/>
        </Modal>
      )}

      {/* Delete Team modal */}
      {modal === 'delete' && selected && (
        <Modal title="Delete Team" onClose={() => { setModal(null); setSelected(null) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null) }}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(selected)}><Trash2 size={14}/> Delete Team</Button>
          </>}>
          <Alert type="warning">
            Are you sure you want to delete <strong>{selected.name}</strong>? This will remove all student assignments. This cannot be undone.
          </Alert>
          {selected.confirmed && (
            <Alert type="error">Confirmed teams cannot be deleted.</Alert>
          )}
        </Modal>
      )}

      {/* Create Team modal */}
      {modal === 'create' && (
        <Modal title="Create New Team" onClose={() => { setModal(null); setNewTeamName('') }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setNewTeamName('') }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTeamName.trim()}><Plus size={14}/> Create Team</Button>
          </>}>
          <p style={{ fontSize:13.5, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.6 }}>
            Create a team and then assign students. The student you mark as <strong>Team Leader</strong> will be able to select a project proposal for the group.
          </p>
          <Input label="Team Name" name="name" value={newTeamName} onChange={setNewTeamName} placeholder="e.g. Group 3" required/>
        </Modal>
      )}

      {/* Assign Students modal */}
      {modal === 'assign' && selected && (
        <Modal title={`Assign Students — ${selected.name}`}
          onClose={() => { setModal(null); setSelected(null); setSelectedStudents([]); setLeaderId('') }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null); setSelectedStudents([]); setLeaderId('') }}>Cancel</Button>
            <Button onClick={handleAssign} disabled={selectedStudents.length === 0 || !leaderId}>
              <UserPlus size={14}/> Save Assignment
            </Button>
          </>}>

          <Alert type="info">
            Select students and mark one as <strong>Team Leader</strong>. The leader will log in and choose a project proposal for the group.
          </Alert>

          <div style={{ marginBottom:16 }}>
            {students.map(s => {
              const isOtherTeam  = assignedIds.includes(s.id) && !(selected.members||[]).find(m=>(m.studentId||m.student?.id)===s.id)
              const checked      = selectedStudents.includes(String(s.id))
              const isLeader     = String(leaderId) === String(s.id)
              const atMax        = selectedStudents.length >= 5 && !checked
              const isDisabled   = isOtherTeam || atMax

              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)', opacity:isDisabled&&!checked?0.45:1 }}>
                  {/* Select checkbox */}
                  <input type="checkbox" checked={checked}
                    onChange={() => !isDisabled && toggleStudent(s.id)}
                    disabled={!!isDisabled}
                    style={{ accentColor:'var(--red)', width:16, height:16, cursor:'pointer', flexShrink:0 }}/>

                  {/* Student info */}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:500 }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.email}{isOtherTeam?' · Already in another team':atMax&&!checked?' · Max 5 members reached':''}</div>
                  </div>

                  {/* Leader radio — only shown if student is selected */}
                  {checked && (
                    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', padding:'4px 10px', borderRadius:20, background:isLeader?'#FFFBEB':'var(--bg)', border:`1px solid ${isLeader?'#D97706':'var(--border)'}`, flexShrink:0 }}>
                      <input type="radio" name="leader" value={String(s.id)}
                        checked={isLeader}
                        onChange={() => setLeaderId(String(s.id))}
                        style={{ accentColor:'#D97706' }}/>
                      <Crown size={12} color={isLeader?'#D97706':'var(--text-muted)'}/>
                      <span style={{ fontSize:12, fontWeight:600, color:isLeader?'#D97706':'var(--text-muted)' }}>Leader</span>
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>
            {selectedStudents.length} student(s) selected
            {leaderId && ` · Leader: ${students.find(s=>String(s.id)===String(leaderId))?.first_name||''}`}
          </div>
        </Modal>
      )}
    </div>
  )
}
