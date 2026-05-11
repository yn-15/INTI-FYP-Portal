import { useState, useEffect } from 'react'
import { Plus, UserPlus, CheckCircle } from 'lucide-react'
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
  const { user } = useAuth()
  const [teams, setTeams]       = useState([])
  const [proposals, setProposals] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [newTeamName, setNewTeamName]         = useState('')
  const [newTeamProposal, setNewTeamProposal] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [alert, setAlert]       = useState(null)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const load = async () => {
    try {
      setLoading(true)
      const [t, p, u] = await Promise.all([api.getTeams(), api.getProposals(), api.getDeptStudents()])
      setTeams(t)
      setProposals(p.filter(p => p.status === 'approved' && !p.team))
      setStudents(u.map(s => ({ ...s, first_name: s.firstName??s.first_name, last_name: s.lastName??s.last_name })))
    } catch(e) { showAlert('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newTeamName.trim() || !newTeamProposal) return
    try {
      const team = await api.createTeam({ name:newTeamName.trim(), proposalId:parseInt(newTeamProposal), departmentId:user.department_id })
      setTeams(prev => [team, ...prev])
      showAlert('success', `Team "${team.name}" created.`)
      setModal(null); setNewTeamName(''); setNewTeamProposal('')
      load()
    } catch(e) { showAlert('error', e.message) }
  }

  const handleAssign = async () => {
    try {
      const updated = await api.assignMembers(selected.id, selectedStudents.map(Number))
      setTeams(prev => prev.map(t => t.id===selected.id ? updated : t))
      showAlert('success', `${selectedStudents.length} student(s) assigned.`)
      setModal(null); setSelected(null); setSelectedStudents([])
    } catch(e) { showAlert('error', e.message) }
  }

  const handleConfirm = async (team) => {
    try {
      const updated = await api.confirmTeam(team.id)
      setTeams(prev => prev.map(t => t.id===team.id ? updated : t))
      showAlert('success', `${team.name} confirmed. Employer can now view the team.`)
    } catch(e) { showAlert('error', e.message) }
  }

  const toggleStudent = (sid) => {
    setSelectedStudents(prev => prev.includes(String(sid)) ? prev.filter(s=>s!==String(sid)) : [...prev, String(sid)])
  }

  const assignedIds = teams.flatMap(t => (t.members||[]).map(m => m.studentId||m.student_id))

  return (
    <div className={styles.page}>
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}
      <div className={styles.sectionHeader}>
        <p className={styles.sectionSub}>Create and manage project groups</p>
        <Button onClick={() => setModal('create')} disabled={proposals.length===0}><Plus size={15}/> Create Team</Button>
      </div>

      {loading ? <p style={{ color:'var(--text-muted)' }}>Loading...</p>
      : teams.length === 0 ? (
        <div className={styles.card} style={{ textAlign:'center', padding:48 }}>
          <h3 style={{ fontFamily:'Space Grotesk', marginBottom:8 }}>No teams yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>Create a team by linking an approved proposal.</p>
        </div>
      ) : teams.map(team => {
        const members = (team.members||[]).map(m => m.student||m)
        return (
          <div key={team.id} className={styles.teamCard}>
            <div className={styles.teamCardHeader}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <div className={styles.teamName}>{team.name}</div>
                  <Badge status={team.confirmed?'confirmed':'draft'}/>
                </div>
                <div className={styles.teamProject}>{team.proposal?.title} · {team.proposal?.companyName}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Created {formatDate(team.createdAt)}</div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <Button size="sm" variant="ghost"
                  onClick={() => { setSelected(team); setSelectedStudents((team.members||[]).map(m=>String(m.studentId||m.student?.id))); setModal('assign') }}>
                  <UserPlus size={13}/> Assign Students
                </Button>
                {!team.confirmed && members.length > 0 && (
                  <Button size="sm" variant="success" onClick={() => handleConfirm(team)}>
                    <CheckCircle size={13}/> Confirm Team
                  </Button>
                )}
              </div>
            </div>
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>
                Members ({members.length})
              </div>
              {members.length === 0 ? (
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>No students assigned yet.</p>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {members.map(s => {
                    const fn = s.firstName||s.first_name||''
                    const ln = s.lastName||s.last_name||''
                    return (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'var(--bg)', borderRadius:20, border:'1px solid var(--border)' }}>
                        <div style={{ width:22,height:22,borderRadius:'50%',background:'var(--red)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700 }}>
                          {fn[0]}{ln[0]}
                        </div>
                        <span style={{ fontSize:13, fontWeight:500 }}>{fn} {ln}</span>
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
          </div>
        )
      })}

      {modal === 'create' && (
        <Modal title="Create New Team" onClose={() => { setModal(null); setNewTeamName(''); setNewTeamProposal('') }}
          footer={<>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTeamName.trim()||!newTeamProposal}><Plus size={14}/> Create Team</Button>
          </>}>
          <Input label="Team Name" name="name" value={newTeamName} onChange={setNewTeamName} placeholder="e.g. Group 3" required/>
          <Input label="Link to Approved Proposal" name="proposal" type="select" value={newTeamProposal} onChange={setNewTeamProposal}
            options={proposals.map(p=>({value:String(p.id),label:p.title}))} required/>
        </Modal>
      )}

      {modal === 'assign' && selected && (
        <Modal title={`Assign Students — ${selected.name}`} onClose={() => { setModal(null); setSelected(null); setSelectedStudents([]) }}
          footer={<>
            <Button variant="ghost" onClick={() => { setModal(null); setSelected(null); setSelectedStudents([]) }}>Cancel</Button>
            <Button onClick={handleAssign}><UserPlus size={14}/> Save Assignment</Button>
          </>}>
          <p style={{ fontSize:13.5, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.6 }}>
            Select students to assign to <strong>{selected.name}</strong>.
          </p>
          {students.map(s => {
            const isOtherTeam = assignedIds.includes(s.id) && !((selected.members||[]).find(m=>(m.studentId||m.student?.id)===s.id))
            const checked = selectedStudents.includes(String(s.id))
            return (
              <label key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid var(--border)', cursor:isOtherTeam?'not-allowed':'pointer', opacity:isOtherTeam?0.5:1 }}>
                <input type="checkbox" checked={checked} onChange={() => !isOtherTeam && toggleStudent(s.id)} disabled={!!isOtherTeam} style={{ accentColor:'var(--red)', width:16, height:16 }}/>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{s.first_name} {s.last_name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.email}{isOtherTeam?' · Already in another team':''}</div>
                </div>
              </label>
            )
          })}
          <div style={{ marginTop:12, fontSize:12.5, color:'var(--text-muted)' }}>{selectedStudents.length} student(s) selected</div>
        </Modal>
      )}
    </div>
  )
}
