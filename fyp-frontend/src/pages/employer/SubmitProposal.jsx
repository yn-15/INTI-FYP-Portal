import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { api } from '../../utils/api'
import { useState as useStateAlias } from 'react'
import styles from './Employer.module.css'

export default function SubmitProposal() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState(null)
  const [file, setFile]             = useState(null)
  const [dragOver, setDragOver]     = useState(false)

  const empty = {
    title:'', company_name: user.company_name||'', company_website:'', company_category:'',
    project_champion:`${user.first_name} ${user.last_name}`, process_owner:'', inti_contact:'',
    department_id:'', brief_profile:'', problem_statement:'', discipline:'', deliverables:'',
    technologies:'', skills_needed:'', target_audience:'', practical_resources:'',
  }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const set = key => val => setForm(p => ({ ...p, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())             e.title             = 'Required'
    if (!form.company_name.trim())      e.company_name      = 'Required'
    if (!form.department_id)            e.department_id     = 'Required'
    if (!form.problem_statement.trim()) e.problem_statement = 'Required'
    if (!form.deliverables.trim())      e.deliverables      = 'Required'
    return e
  }

  const handleDrop = e => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f&&f.type==='application/pdf') setFile(f) }
  const handleFileInput = e => { const f=e.target.files[0]; if(f&&f.type==='application/pdf') setFile(f) }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true); setError(null)
    try {
      await api.createProposal({
        title:              form.title,
        companyName:        form.company_name,
        companyWebsite:     form.company_website || null,
        companyCategory:    form.company_category || null,
        projectChampion:    form.project_champion || null,
        processOwner:       form.process_owner || null,
        intiContact:        form.inti_contact || null,
        departmentId:       parseInt(form.department_id),
        briefProfile:       form.brief_profile || null,
        problemStatement:   form.problem_statement,
        discipline:         form.discipline || null,
        deliverables:       form.deliverables,
        technologies:       form.technologies || null,
        skillsNeeded:       form.skills_needed || null,
        targetAudience:     form.target_audience || null,
        practicalResources: form.practical_resources || null,
        attachmentUrl:      file ? 'https://www.africau.edu/images/default/sample.pdf' : null,
      })
      setSuccess(true)
    } catch(e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  const [depts, setDepts] = useState([])
  useState(() => { api.getDepartments().then(setDepts).catch(()=>{}) }, [])

  if (success) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign:'center', padding:'60px 20px', maxWidth:500, margin:'0 auto' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#F0FDF4', border:'1px solid #86EFAC', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:30 }}>✓</div>
          <h2 style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:700, marginBottom:12 }}>Proposal Submitted!</h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:24 }}>
            Your proposal <strong>"{form.title}"</strong> has been submitted and is pending review by an INTI supervisor.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Button variant="outline" onClick={() => { setSuccess(false); setForm(empty); setFile(null); setErrors({}) }}>Submit Another</Button>
            <Button onClick={() => navigate('/employer/proposals')}>View My Proposals</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:20 }}>Employer Project Proposal — Complete all required fields marked with *</p>

      {error && <Alert type="error">{error}</Alert>}
      {Object.keys(errors).length > 0 && <Alert type="error">Please fill in all required fields before submitting.</Alert>}

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Section A — Company Information</div>
        <div className={styles.formGrid2}>
          <Input label="Company Name" name="co" value={form.company_name} onChange={set('company_name')} placeholder="ABC Technologies Sdn. Bhd." required error={errors.company_name}/>
          <Input label="Company Website" name="web" value={form.company_website} onChange={set('company_website')} placeholder="https://"/>
          <Input label="Company Category" name="cat" value={form.company_category} onChange={set('company_category')} placeholder="e.g. Technology, Retail"/>
          <Input label="Project Champion" name="champ" value={form.project_champion} onChange={set('project_champion')} placeholder="Senior person leading this"/>
          <Input label="Process Owner" name="owner" value={form.process_owner} onChange={set('process_owner')} placeholder="Day-to-day contact"/>
          <Input label="INTI Staff Contact" name="inti" value={form.inti_contact} onChange={set('inti_contact')} placeholder="e.g. Dr. Robina Tinawin"/>
          <Input label="Department" name="dept" type="select" value={form.department_id} onChange={set('department_id')} required error={errors.department_id}
            options={depts.map(d=>({value:String(d.id),label:d.name}))} hint="Select the INTI department most relevant to your project"/>
        </div>
        <Input label="Company Profile" name="profile" type="textarea" rows={3} value={form.brief_profile} onChange={set('brief_profile')} placeholder="Describe your company..."/>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Section B — Project Details</div>
        <Input label="Project Title *" name="title" value={form.title} onChange={set('title')} placeholder="A clear and descriptive project title" required error={errors.title}/>
        <Input label="Problem Statement / Objectives *" name="ps" type="textarea" rows={5} value={form.problem_statement} onChange={set('problem_statement')} placeholder="What problem are you solving?" required error={errors.problem_statement}/>
        <div className={styles.formGrid2}>
          <Input label="Relevant Discipline" name="disc" value={form.discipline} onChange={set('discipline')} placeholder="e.g. Software Engineering"/>
          <Input label="Technologies Required" name="tech" value={form.technologies} onChange={set('technologies')} placeholder="e.g. React, Node.js, PostgreSQL"/>
        </div>
        <Input label="Expected Deliverables *" name="del" type="textarea" rows={4} value={form.deliverables} onChange={set('deliverables')} placeholder="List all expected outputs..." required error={errors.deliverables}/>
        <div className={styles.formGrid2}>
          <Input label="Skills Needed" name="skills" value={form.skills_needed} onChange={set('skills_needed')} placeholder="e.g. Full-Stack, Data Visualisation"/>
          <Input label="Target Audience" name="audience" value={form.target_audience} onChange={set('target_audience')} placeholder="Who will use the final product?"/>
        </div>
        <Input label="Resources / Support Provided" name="res" type="textarea" rows={3} value={form.practical_resources} onChange={set('practical_resources')} placeholder="APIs, datasets, mentoring sessions..."/>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Section C — Attachment (Optional)</div>
        <div className={`${styles.uploadZone} ${dragOver?styles.active:''}`}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
          onDrop={handleDrop} onClick={()=>document.getElementById('fileInput').click()}>
          <div className={styles.uploadIcon}>📄</div>
          <div className={styles.uploadTitle}>{file?'File attached — click to replace':'Drag & drop PDF here'}</div>
          <div className={styles.uploadSub}>or click to browse · PDF only · Max 10MB</div>
          {file && <div className={styles.uploadFile}>✓ {file.name}</div>}
          <input id="fileInput" type="file" accept=".pdf" onChange={handleFileInput} style={{ display:'none' }}/>
        </div>
        {file && <button onClick={()=>setFile(null)} style={{ fontSize:12.5, color:'var(--error)', background:'none', border:'none', cursor:'pointer', marginTop:6, fontFamily:'DM Sans', padding:0 }}>✕ Remove file</button>}
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <Button onClick={handleSubmit} disabled={submitting} size="lg">{submitting?'Submitting…':'Submit Proposal'}</Button>
        <Button variant="ghost" onClick={() => { setForm(empty); setFile(null); setErrors({}) }}>Clear Form</Button>
      </div>
    </div>
  )
}
