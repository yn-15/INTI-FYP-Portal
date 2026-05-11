// ── Departments ───────────────────────────────────────────────────────────────
export const departments = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'Business' },
]

// ── Users ─────────────────────────────────────────────────────────────────────
// status: 'pending' | 'active' | 'deactivated'
// role:   'admin' | 'lecturer' | 'student' | 'employer'
export const users = [
  {
    id: 1,
    first_name: 'Admin',
    last_name: 'Master',
    email: 'admin@newinti.edu.my',
    password: 'Admin@1234',
    role: 'admin',
    department_id: null,
    company_name: null,
    status: 'active',
    created_at: '2025-01-01T08:00:00Z',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 2,
    first_name: 'Robina',
    last_name: 'Tinawin',
    email: 'robina.tinawin@newinti.edu.my',
    password: 'Lecturer@1234',
    role: 'lecturer',
    department_id: 1, // IT
    company_name: null,
    status: 'active',
    created_at: '2025-01-05T09:00:00Z',
    approved_by: 1,
    approved_at: '2025-01-06T10:00:00Z',
  },
  {
    id: 3,
    first_name: 'Jonathan',
    last_name: 'Lee',
    email: 'jonathan.lee@newinti.edu.my',
    password: 'Lecturer@1234',
    role: 'lecturer',
    department_id: 2, // Business
    company_name: null,
    status: 'active',
    created_at: '2025-01-05T09:30:00Z',
    approved_by: 1,
    approved_at: '2025-01-06T10:30:00Z',
  },
  {
    id: 4,
    first_name: 'Thura',
    last_name: 'Nyi Nyi',
    email: 'J22013456@student.newinti.edu.my',
    password: 'Student@1234',
    role: 'student',
    department_id: 1, // IT
    company_name: null,
    status: 'active',
    created_at: '2025-01-10T10:00:00Z',
    approved_by: 1,
    approved_at: '2025-01-11T09:00:00Z',
  },
  {
    id: 5,
    first_name: 'Lim',
    last_name: 'Chuan Zhe',
    email: 'J22013789@student.newinti.edu.my',
    password: 'Student@1234',
    role: 'student',
    department_id: 1, // IT
    company_name: null,
    status: 'active',
    created_at: '2025-01-10T10:30:00Z',
    approved_by: 1,
    approved_at: '2025-01-11T09:30:00Z',
  },
  {
    id: 6,
    first_name: 'Yoosuf',
    last_name: 'Naseem',
    email: 'J22014001@student.newinti.edu.my',
    password: 'Student@1234',
    role: 'student',
    department_id: 2, // Business
    company_name: null,
    status: 'active',
    created_at: '2025-01-10T11:00:00Z',
    approved_by: 1,
    approved_at: '2025-01-11T10:00:00Z',
  },
  {
    id: 7,
    first_name: 'Ahmad',
    last_name: 'Razif',
    email: 'ahmad.razif@abctech.com',
    password: 'Employer@1234',
    role: 'employer',
    department_id: null,
    company_name: 'ABC Technologies Sdn. Bhd.',
    status: 'active',
    created_at: '2025-01-15T14:00:00Z',
    approved_by: 1,
    approved_at: '2025-01-16T09:00:00Z',
  },
  {
    id: 8,
    first_name: 'Sarah',
    last_name: 'Wong',
    email: 'sarah.wong@xyzsolutions.com',
    password: 'Employer@1234',
    role: 'employer',
    department_id: null,
    company_name: 'XYZ Solutions Sdn. Bhd.',
    status: 'active',
    created_at: '2025-01-15T15:00:00Z',
    approved_by: 1,
    approved_at: '2025-01-16T10:00:00Z',
  },
  // Pending registrations
  {
    id: 9,
    first_name: 'Beatricia',
    last_name: 'Thomas',
    email: 'J22015001@student.newinti.edu.my',
    password: 'Student@1234',
    role: 'student',
    department_id: null,
    company_name: null,
    status: 'pending',
    created_at: '2025-04-28T10:00:00Z',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 10,
    first_name: 'James',
    last_name: 'Tan',
    email: 'james.tan@defcorp.com',
    password: 'Employer@1234',
    role: 'employer',
    department_id: null,
    company_name: 'DEF Corp Sdn. Bhd.',
    status: 'pending',
    created_at: '2025-04-29T11:30:00Z',
    approved_by: null,
    approved_at: null,
  },
]

// ── Proposals ─────────────────────────────────────────────────────────────────
// status: 'pending' | 'approved' | 'rejected'
export const proposals = [
  {
    id: 1,
    title: 'AI Chatbot for Customer Support',
    company_name: 'ABC Technologies Sdn. Bhd.',
    company_website: 'https://abctech.com',
    company_category: 'Technology / Software',
    project_champion: 'Ahmad Razif',
    process_owner: 'Jenny Lim',
    inti_contact: 'Dr. Robina Tinawin',
    department_id: 1, // IT
    brief_profile: 'ABC Technologies is a leading IT solutions provider specialising in enterprise software and AI integrations for Fortune 500 companies across Southeast Asia.',
    problem_statement: 'Our customer support team handles over 5,000 repetitive queries monthly. We need an AI-powered chatbot to handle FAQs, ticket routing and basic troubleshooting — reducing response time by 60% and freeing agents for complex issues.',
    discipline: 'Computer Science / Software Engineering',
    deliverables: 'Working chatbot prototype, NLP pipeline documentation, REST API documentation, deployment guide, user manual, test reports',
    technologies: 'Python, TensorFlow, React, Node.js, PostgreSQL, Docker',
    skills_needed: 'NLP, Machine Learning, Full-Stack Development, API Design',
    target_audience: 'Customer support agents and end-customers',
    practical_resources: 'API access, cloud credits (AWS), weekly mentor sessions with senior engineers',
    status: 'approved',
    attachment_url: 'https://www.africau.edu/images/default/sample.pdf',
    submitted_by: 7,
    reviewed_by: 2,
    review_feedback: 'Strong proposal with clear problem scope and measurable outcomes. The NLP component is well-justified. Approved.',
    submitted_at: '2025-02-01T09:00:00Z',
    reviewed_at: '2025-02-05T14:00:00Z',
  },
  {
    id: 2,
    title: 'Cloud-Based POS System for Retail Chain',
    company_name: 'XYZ Solutions Sdn. Bhd.',
    company_website: 'https://xyzsolutions.com',
    company_category: 'Retail Technology',
    project_champion: 'Sarah Wong',
    process_owner: 'Kevin Chong',
    inti_contact: 'Dr. Robina Tinawin',
    department_id: 1, // IT
    brief_profile: 'XYZ Solutions serves over 200 retail outlets across Malaysia with integrated POS and inventory management software.',
    problem_statement: 'Our legacy POS system cannot handle multi-outlet real-time inventory sync. We need a modern cloud-based POS with offline-first capability, real-time sync across outlets, and an analytics dashboard for store managers.',
    discipline: 'Software Engineering / Cloud Computing',
    deliverables: 'Cloud POS prototype, offline mode implementation, inventory module, analytics dashboard, test reports, deployment documentation',
    technologies: 'React Native, Node.js, PostgreSQL, AWS, Redux',
    skills_needed: 'Mobile Development, Cloud Architecture, Database Design, UI/UX',
    target_audience: 'Retail store managers, cashiers, and HQ operations team',
    practical_resources: 'Access to test retail environment, POS hardware devices, anonymised sales data',
    status: 'approved',
    submitted_by: 8,
    attachment_url: 'https://www.africau.edu/images/default/sample.pdf',
    reviewed_by: 2,
    review_feedback: 'Well-scoped with clear technical requirements. The offline-first architecture shows strong engineering thinking. Approved.',
    submitted_at: '2025-02-03T10:30:00Z',
    reviewed_at: '2025-02-07T11:00:00Z',
  },
  {
    id: 3,
    title: 'Digital Marketing Analytics Dashboard',
    company_name: 'XYZ Solutions Sdn. Bhd.',
    company_website: 'https://xyzsolutions.com',
    company_category: 'Marketing Technology',
    project_champion: 'Sarah Wong',
    process_owner: 'Mary Tan',
    inti_contact: 'Dr. Jonathan Lee',
    department_id: 2, // Business
    brief_profile: 'XYZ Solutions expanded into digital marketing services in 2023 and now manages campaigns for over 50 SMEs across Malaysia.',
    problem_statement: 'Our marketing team manually compiles performance reports from 5 different platforms monthly. We need a unified dashboard that pulls data automatically, visualises KPIs and generates executive-ready reports.',
    discipline: 'Business Analytics / Digital Marketing',
    deliverables: 'Analytics dashboard prototype, API integrations (Google Ads, Meta, etc.), automated report generation, user guide',
    technologies: 'React, Python, FastAPI, PostgreSQL, Chart.js',
    skills_needed: 'Data Analytics, Business Intelligence, API Integration, Dashboard Design',
    target_audience: 'Marketing managers and C-suite executives',
    practical_resources: 'Access to campaign data (anonymised), marketing tool API keys, bi-weekly review sessions',
    status: 'pending',
    submitted_by: 8,
    reviewed_by: null,
    review_feedback: null,
    submitted_at: '2025-04-20T14:00:00Z',
    reviewed_at: null,
  },
  {
    id: 4,
    title: 'Smart Meter IoT Data Platform',
    company_name: 'ABC Technologies Sdn. Bhd.',
    company_website: 'https://abctech.com',
    company_category: 'Energy / IoT',
    project_champion: 'Ahmad Razif',
    process_owner: 'Hassan Malik',
    inti_contact: 'Dr. Robina Tinawin',
    department_id: 1, // IT
    brief_profile: 'ABC Technologies recently expanded into IoT solutions for energy management across industrial and residential estates in Malaysia.',
    problem_statement: 'We collect millions of meter readings daily but lack a platform to visualise consumption patterns and predict failures. Manual reporting currently takes 3 days per billing cycle.',
    discipline: 'Data Science / IoT / Software Engineering',
    deliverables: 'IoT dashboard, anomaly detection module, automated billing report engine, REST API, system documentation',
    technologies: 'Python, Pandas, React, D3.js, PostgreSQL, MQTT, Redis',
    skills_needed: 'Data Analysis, IoT Protocols, Data Visualisation, Backend Development',
    target_audience: 'Facility managers and billing teams',
    practical_resources: 'Anonymised 2-year meter dataset, IoT test devices, expert mentoring sessions',
    status: 'rejected',
    submitted_by: 7,
    reviewed_by: 2,
    review_feedback: 'The scope is too broad for a single FYP team. Please narrow down to either the visualisation dashboard or the anomaly detection module and resubmit.',
    submitted_at: '2025-03-10T11:00:00Z',
    reviewed_at: '2025-03-15T16:00:00Z',
  },
  {
    id: 5,
    title: 'E-Commerce Platform for SMEs',
    company_name: 'TechStart Sdn. Bhd.',
    company_website: 'https://techstart.com.my',
    company_category: 'E-Commerce / Technology',
    project_champion: 'Farid Hakim',
    process_owner: 'Nurul Ain',
    inti_contact: 'Dr. Robina Tinawin',
    department_id: 1,
    brief_profile: 'TechStart is a Malaysian startup helping SMEs build their digital presence through affordable e-commerce solutions and digital marketing tools.',
    problem_statement: 'Many Malaysian SMEs lack the technical resources to build and maintain a proper e-commerce platform. We need a scalable, affordable multi-vendor e-commerce system with inventory management, payment gateway integration and a seller dashboard.',
    discipline: 'Software Engineering / Web Development',
    deliverables: 'Working e-commerce prototype, seller dashboard, payment gateway integration (FPX/card), inventory module, admin panel, deployment guide',
    technologies: 'React, Node.js, PostgreSQL, Stripe API, AWS S3',
    skills_needed: 'Full-Stack Development, Payment Integration, UI/UX Design, Database Design',
    target_audience: 'Malaysian SME business owners and their customers',
    practical_resources: 'Access to sandbox payment gateway, sample product data, bi-weekly review sessions with the tech team',
    status: 'pending',
    attachment_url: 'https://www.africau.edu/images/default/sample.pdf',
    submitted_by: 7,
    reviewed_by: null,
    review_feedback: null,
    selected_by: null,
    submitted_at: '2025-05-01T10:00:00Z',
    reviewed_at: null,
  },
]

// ── Proposal Selections ───────────────────────────────────────────────────────
export const proposalSelections = [
  {
    id: 1,
    proposal_id: 1,
    student_id: 4,
    selected_at: '2025-02-10T08:30:00Z',
    dropped_at: null,
    is_locked: true, // past 7 days
  },
  {
    id: 2,
    proposal_id: 2,
    student_id: 5,
    selected_at: '2025-02-10T09:00:00Z',
    dropped_at: null,
    is_locked: true,
  },
]

// ── Teams ─────────────────────────────────────────────────────────────────────
export const teams = [
  {
    id: 1,
    name: 'Group 1',
    proposal_id: 1,
    department_id: 1,
    supervisor_id: 2,
    confirmed: true,
    created_at: '2025-02-12T10:00:00Z',
  },
  {
    id: 2,
    name: 'Group 2',
    proposal_id: 2,
    department_id: 1,
    supervisor_id: 2,
    confirmed: true,
    created_at: '2025-02-12T11:00:00Z',
  },
]

// ── Team Members ──────────────────────────────────────────────────────────────
export const teamMembers = [
  { team_id: 1, student_id: 4 },
  { team_id: 2, student_id: 5 },
]

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications = [
  {
    id: 1,
    title: 'FYP Proposal Submission Window Now Open',
    message: 'Industry partners are now welcome to submit Final Year Project proposals for the 2025/2026 academic year. All proposals will be reviewed by the relevant department supervisor. The submission window closes on 30 May 2025.',
    created_by: 1,
    target_role: null, // all roles
    target_department_id: null,
    created_at: '2025-04-01T08:00:00Z',
  },
  {
    id: 2,
    title: 'Project Selection Opens for IT Students',
    message: 'Dear IT students, project selection is now open. You may browse approved proposals and select your preferred project. Please note: each project can only be selected by one student — first come, first served. Selection closes on 28 February 2025.',
    created_by: 2,
    target_role: 'student',
    target_department_id: 1,
    created_at: '2025-02-08T09:00:00Z',
  },
  {
    id: 3,
    title: 'Mandatory FYP Briefing — 10 February 2025',
    message: 'All registered FYP students are required to attend the mandatory briefing session on 10 February 2025 at 10:00 AM in Lecture Hall A, Block B. Attendance is compulsory. The session will cover deliverable expectations, milestone deadlines, and supervisor expectations. Please bring your student ID.',
    created_by: 2,
    target_role: 'student',
    target_department_id: null,
    created_at: '2025-02-05T07:45:00Z',
  },
]

// ── Notification Reads ────────────────────────────────────────────────────────
export const notificationReads = [
  { notification_id: 1, user_id: 4, read_at: '2025-04-01T10:00:00Z' },
  { notification_id: 3, user_id: 4, read_at: '2025-02-05T12:00:00Z' },
]

// ── Chat Threads ──────────────────────────────────────────────────────────────
export const chatThreads = [
  { id: 1, proposal_id: 1, created_at: '2025-02-05T14:00:00Z' },
  { id: 2, proposal_id: 2, created_at: '2025-02-07T11:00:00Z' },
]

// ── Chat Messages ─────────────────────────────────────────────────────────────
export const chatMessages = [
  {
    id: 1,
    thread_id: 1,
    sender_id: 2, // Robina (lecturer) — first message is feedback
    message: 'Strong proposal with clear problem scope and measurable outcomes. The NLP component is well-justified. Approved. Looking forward to working with the assigned team on this project. Please feel free to reach out if you have any questions.',
    sent_at: '2025-02-05T14:00:00Z',
  },
  {
    id: 2,
    thread_id: 1,
    sender_id: 7, // Ahmad (employer) responds
    message: 'Thank you Dr. Robina! We are excited to collaborate. We will prepare API access and cloud credentials for the team. Should we schedule an introductory call once the team is assigned?',
    sent_at: '2025-02-06T09:00:00Z',
  },
  {
    id: 3,
    thread_id: 1,
    sender_id: 2,
    message: 'Yes, absolutely. I will confirm the team by end of this week and then we can schedule a kick-off call for the following week.',
    sent_at: '2025-02-06T10:30:00Z',
  },
  {
    id: 4,
    thread_id: 2,
    sender_id: 2,
    message: 'Well-scoped with clear technical requirements. The offline-first architecture shows strong engineering thinking. Approved. The team assigned to your project will be in touch soon.',
    sent_at: '2025-02-07T11:00:00Z',
  },
  {
    id: 5,
    thread_id: 2,
    sender_id: 8, // Sarah (employer)
    message: 'Wonderful news! We will arrange access to our test retail environment and sample data for the team. Please let us know if there is anything else needed before the project begins.',
    sent_at: '2025-02-07T14:00:00Z',
  },
]

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogs = [
  { id: 1,  user_id: 4, action: 'Proposal Selected',   entity_type: 'proposal', entity_id: 1, status: 'success', details: { note: 'First-come-first-served selection' },            created_at: '2025-02-10T08:30:00Z' },
  { id: 2,  user_id: 2, action: 'Proposal Approved',   entity_type: 'proposal', entity_id: 1, status: 'success', details: { feedback: 'Approved. Strong proposal.' },               created_at: '2025-02-05T14:00:00Z' },
  { id: 3,  user_id: 2, action: 'Team Confirmed',      entity_type: 'team',     entity_id: 1, status: 'success', details: { team_name: 'Group 1', members: ['Thura Nyi Nyi'] },     created_at: '2025-02-12T10:00:00Z' },
  { id: 4,  user_id: 1, action: 'User Approved',       entity_type: 'user',     entity_id: 4, status: 'success', details: { role: 'student', department: 'IT' },                    created_at: '2025-01-11T09:00:00Z' },
  { id: 5,  user_id: 7, action: 'Proposal Submitted',  entity_type: 'proposal', entity_id: 4, status: 'success', details: { title: 'Smart Meter IoT Data Platform' },              created_at: '2025-03-10T11:00:00Z' },
  { id: 6,  user_id: 2, action: 'Proposal Rejected',   entity_type: 'proposal', entity_id: 4, status: 'warning', details: { feedback: 'Scope too broad, please resubmit.' },       created_at: '2025-03-15T16:00:00Z' },
  { id: 7,  user_id: 9, action: 'User Registered',     entity_type: 'user',     entity_id: 9, status: 'success', details: { role: 'student', status: 'pending' },                  created_at: '2025-04-28T10:00:00Z' },
  { id: 8,  user_id: 10,action: 'User Registered',     entity_type: 'user',     entity_id: 10,status: 'success', details: { role: 'employer', status: 'pending' },                 created_at: '2025-04-29T11:30:00Z' },
  { id: 9,  user_id: 1, action: 'Login Failed',        entity_type: 'user',     entity_id: null, status: 'error', details: { reason: 'Invalid credentials', email: 'unknown@test.com' }, created_at: '2025-04-30T08:15:00Z' },
  { id: 10, user_id: 1, action: 'Department Created',  entity_type: 'department', entity_id: 1, status: 'success', details: { name: 'Information Technology' },   created_at: '2025-01-05T10:00:00Z' },
  { id: 11, user_id: 2, action: 'Proposal Feedback',   entity_type: 'proposal', entity_id: 2, status: 'success', details: { feedback: 'Approved with minor notes.' },              created_at: '2025-02-07T11:30:00Z' },
  { id: 12, user_id: 1, action: 'User Deactivated',    entity_type: 'user',     entity_id: 5, status: 'warning', details: { reason: 'Account inactivity' },                       created_at: '2025-04-15T14:00:00Z' },
]

// ── Helper: get user by id ────────────────────────────────────────────────────
export function getUserById(id) {
  return users.find(u => u.id === id) || null
}

// ── Helper: get department by id ──────────────────────────────────────────────
export function getDeptById(id) {
  return departments.find(d => d.id === id) || null
}

// ── Helper: get full name ─────────────────────────────────────────────────────
export function getFullName(user) {
  if (!user) return 'Unknown'
  return `${user.first_name} ${user.last_name}`
}

// ── Helper: get proposals visible to a user ───────────────────────────────────
export function getProposalsForUser(user) {
  if (user.role === 'admin') return proposals
  if (user.role === 'lecturer') return proposals.filter(p => p.department_id === user.department_id)
  if (user.role === 'student') return proposals.filter(p => p.department_id === user.department_id && p.status === 'approved')
  if (user.role === 'employer') return proposals.filter(p => p.submitted_by === user.id)
  return []
}

// ── Helper: get student's current selection ───────────────────────────────────
export function getStudentSelection(studentId) {
  return proposalSelections.find(s => s.student_id === studentId && !s.dropped_at) || null
}

// ── Helper: get team for student ──────────────────────────────────────────────
export function getTeamForStudent(studentId) {
  const member = teamMembers.find(m => m.student_id === studentId)
  if (!member) return null
  return teams.find(t => t.id === member.team_id) || null
}

// ── Helper: get unread notification count ─────────────────────────────────────
export function getUnreadCount(userId, userRole, deptId) {
  const myNotifs = notifications.filter(n => {
    if (n.target_role && n.target_role !== userRole) return false
    if (n.target_department_id && n.target_department_id !== deptId) return false
    return true
  })
  const readIds = notificationReads.filter(r => r.user_id === userId).map(r => r.notification_id)
  return myNotifs.filter(n => !readIds.includes(n.id)).length
}
