import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Departments ───────────────────────────────────────────────────────────────
  const it = await prisma.department.upsert({
    where: { name: 'IT' }, update: {}, create: { name: 'IT' },
  })
  const biz = await prisma.department.upsert({
    where: { name: 'Business' }, update: {}, create: { name: 'Business' },
  })
  console.log('✅ Departments seeded')

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@newinti.edu.my' }, update: {},
    create: {
      firstName: 'Admin', lastName: 'Master',
      email: 'admin@newinti.edu.my',
      passwordHash: adminHash, role: 'admin', status: 'active',
    },
  })

  // ── Lecturers ─────────────────────────────────────────────────────────────────
  const lectHash = await bcrypt.hash('Lecturer@1234', 12)
  const robina = await prisma.user.upsert({
    where: { email: 'robina.tinawin@newinti.edu.my' }, update: {},
    create: {
      firstName: 'Robina', lastName: 'Tinawin',
      email: 'robina.tinawin@newinti.edu.my',
      passwordHash: lectHash, role: 'lecturer', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const jonathan = await prisma.user.upsert({
    where: { email: 'jonathan.lee@newinti.edu.my' }, update: {},
    create: {
      firstName: 'Jonathan', lastName: 'Lee',
      email: 'jonathan.lee@newinti.edu.my',
      passwordHash: lectHash, role: 'lecturer', status: 'active',
      departmentId: biz.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })

  // ── Students ──────────────────────────────────────────────────────────────────
  const studHash = await bcrypt.hash('Student@1234', 12)
  const thura = await prisma.user.upsert({
    where: { email: 'J22013456@student.newinti.edu.my' }, update: {},
    create: {
      firstName: 'Thura', lastName: 'Nyi Nyi',
      email: 'J22013456@student.newinti.edu.my',
      passwordHash: studHash, role: 'student', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const lim = await prisma.user.upsert({
    where: { email: 'J22013789@student.newinti.edu.my' }, update: {},
    create: {
      firstName: 'Lim', lastName: 'Chuan Zhe',
      email: 'J22013789@student.newinti.edu.my',
      passwordHash: studHash, role: 'student', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })

  const extraStudents = [
    { firstName:'Muhammad', lastName:'Hafiz',     email:'J22015010@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Nurul',    lastName:'Izzati',    email:'J22015011@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Haziq',    lastName:'Aiman',     email:'J22015012@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Siti',     lastName:'Nabilah',   email:'J22015013@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Arif',     lastName:'Danial',    email:'J22015014@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Fatin',    lastName:'Syahira',   email:'J22015015@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Irfan',    lastName:'Hakimi',    email:'J22015016@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Liyana',   lastName:'Sofea',     email:'J22015017@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Zulaikha', lastName:'Husna',     email:'J22015018@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Danish',   lastName:'Ammar',     email:'J22015019@student.newinti.edu.my', departmentId: it.id  },
    { firstName:'Amirah',   lastName:'Qistina',   email:'J22016010@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Farhan',   lastName:'Syafiq',    email:'J22016011@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Aina',     lastName:'Mardhiah',  email:'J22016012@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Ridhwan',  lastName:'Azizi',     email:'J22016013@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Humaira',  lastName:'Zahra',     email:'J22016014@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Azri',     lastName:'Fikri',     email:'J22016015@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Syafiqah', lastName:'Insyirah',  email:'J22016016@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Luqman',   lastName:'Hakim',     email:'J22016017@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Nadia',    lastName:'Batrisyia', email:'J22016018@student.newinti.edu.my', departmentId: biz.id },
    { firstName:'Harith',   lastName:'Zafran',    email:'J22016019@student.newinti.edu.my', departmentId: biz.id },
  ]
  for (const s of extraStudents) {
    await prisma.user.upsert({
      where: { email: s.email }, update: {},
      create: {
        firstName: s.firstName, lastName: s.lastName,
        email: s.email, passwordHash: studHash,
        role: 'student', status: 'active',
        departmentId: s.departmentId,
        approvedById: admin.id, approvedAt: new Date(),
      },
    })
  }
  console.log('✅ Students seeded (22 total)')

  // ── Employers ─────────────────────────────────────────────────────────────────
  const empHash = await bcrypt.hash('Employer@1234', 12)
  const ahmad = await prisma.user.upsert({
    where: { email: 'ahmad.razif@abctech.com' }, update: {},
    create: {
      firstName: 'Ahmad', lastName: 'Razif',
      email: 'ahmad.razif@abctech.com',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'ABC Technologies Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.wong@xyzsolutions.com' }, update: {},
    create: {
      firstName: 'Sarah', lastName: 'Wong',
      email: 'sarah.wong@xyzsolutions.com',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'XYZ Solutions Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const technova = await prisma.user.upsert({
    where: { email: 'contact@technovasolutions.com' }, update: {},
    create: {
      firstName: 'Reza', lastName: 'Iskandar',
      email: 'contact@technovasolutions.com',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'TechNova Solutions Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const databridge = await prisma.user.upsert({
    where: { email: 'projects@databridge.com.my' }, update: {},
    create: {
      firstName: 'Melissa', lastName: 'Tan',
      email: 'projects@databridge.com.my',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'DataBridge Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const retailpro = await prisma.user.upsert({
    where: { email: 'fyp@retailpro.com.my' }, update: {},
    create: {
      firstName: 'Kevin', lastName: 'Chong',
      email: 'fyp@retailpro.com.my',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'RetailPro Malaysia Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const finsmart = await prisma.user.upsert({
    where: { email: 'partnerships@finsmart.my' }, update: {},
    create: {
      firstName: 'Priya', lastName: 'Nair',
      email: 'partnerships@finsmart.my',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'FinSmart Advisory Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  console.log('✅ Employers seeded (6 total)')

  // ── Proposals (use create since table was cleared) ────────────────────────────
  const p1 = await prisma.proposal.create({
    data: {
      title: 'AI Chatbot for Customer Support',
      companyName: 'ABC Technologies Sdn. Bhd.',
      companyWebsite: 'https://abctech.com',
      companyCategory: 'Technology / Software',
      projectChampion: 'Ahmad Razif',
      processOwner: 'Jenny Lim',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'ABC Technologies is a leading IT solutions provider specialising in enterprise software and AI integrations.',
      problemStatement: 'Our customer support team handles over 5,000 repetitive queries monthly. We need an AI chatbot to reduce response time by 60%.',
      discipline: 'Computer Science / Software Engineering',
      deliverables: 'Working chatbot prototype, API documentation, deployment guide, test reports',
      technologies: 'Python, TensorFlow, React, Node.js, PostgreSQL',
      skillsNeeded: 'NLP, Machine Learning, Full-Stack Development',
      targetAudience: 'Customer support agents and end-customers',
      practicalResources: 'API access, cloud credits, weekly mentor sessions',
      status: 'approved',
      submittedById: ahmad.id,
      reviewedById: robina.id,
      reviewFeedback: 'Strong proposal with clear problem scope. The NLP component is well-justified. Approved.',
      reviewedAt: new Date('2025-02-05'),
      submittedAt: new Date('2025-02-01'),
    },
  })

  const p2 = await prisma.proposal.create({
    data: {
      title: 'Cloud-Based POS System for Retail Chain',
      companyName: 'XYZ Solutions Sdn. Bhd.',
      companyWebsite: 'https://xyzsolutions.com',
      companyCategory: 'Retail Technology',
      projectChampion: 'Sarah Wong',
      processOwner: 'Kevin Chong',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'XYZ Solutions serves over 200 retail outlets across Malaysia.',
      problemStatement: 'Our legacy POS system cannot handle multi-outlet real-time sync. We need a modern cloud-based POS with offline capability.',
      discipline: 'Software Engineering / Cloud Computing',
      deliverables: 'Cloud POS prototype, offline mode, inventory module, analytics dashboard',
      technologies: 'React Native, Node.js, PostgreSQL, AWS',
      skillsNeeded: 'Mobile Development, Cloud Architecture, Database Design',
      targetAudience: 'Retail store managers and cashiers',
      practicalResources: 'Test retail environment, POS hardware, anonymised sales data',
      status: 'approved',
      submittedById: sarah.id,
      reviewedById: robina.id,
      reviewFeedback: 'Well-scoped with clear technical requirements. The offline-first architecture shows strong engineering thinking. Approved.',
      reviewedAt: new Date('2025-02-07'),
      submittedAt: new Date('2025-02-03'),
    },
  })

  const p3 = await prisma.proposal.create({
    data: {
      title: 'Smart Inventory Management System',
      companyName: 'TechNova Solutions Sdn. Bhd.',
      companyWebsite: 'https://technovasolutions.com',
      companyCategory: 'Technology / Enterprise Software',
      projectChampion: 'Reza Iskandar',
      processOwner: 'Anis Sulaiman',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'TechNova Solutions is a B2B enterprise software company with clients across manufacturing and logistics sectors in Malaysia.',
      problemStatement: 'Our clients rely on manual spreadsheets for inventory tracking resulting in frequent stock-outs and overstock situations. We need an automated smart inventory system with predictive restocking alerts.',
      discipline: 'Software Engineering / Data Science',
      deliverables: 'Inventory dashboard, predictive restocking module, barcode scanner integration, mobile app, deployment documentation',
      technologies: 'React, Node.js, Python, PostgreSQL, TensorFlow Lite',
      skillsNeeded: 'Full-Stack Development, Machine Learning, Mobile Development',
      targetAudience: 'Warehouse managers and procurement officers',
      practicalResources: 'Access to anonymised inventory datasets, barcode scanner hardware, bi-weekly review sessions',
      status: 'pending',
      submittedById: technova.id,
      submittedAt: new Date('2025-04-10'),
    },
  })

  const p4 = await prisma.proposal.create({
    data: {
      title: 'Cybersecurity Threat Detection Dashboard',
      companyName: 'DataBridge Sdn. Bhd.',
      companyWebsite: 'https://databridge.com.my',
      companyCategory: 'Cybersecurity / Data Analytics',
      projectChampion: 'Melissa Tan',
      processOwner: 'Hafiz Rahman',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'DataBridge provides managed cybersecurity services to financial institutions and government agencies across Southeast Asia.',
      problemStatement: 'Our SOC team manually reviews thousands of security logs daily. We need an intelligent threat detection dashboard that automatically flags anomalies and prioritises alerts using ML.',
      discipline: 'Computer Science / Cybersecurity',
      deliverables: 'Real-time threat dashboard, anomaly detection model, alert prioritisation engine, admin panel, technical report',
      technologies: 'Python, Elasticsearch, Kibana, React, Scikit-learn',
      skillsNeeded: 'Cybersecurity, Machine Learning, Data Visualisation, Backend Development',
      targetAudience: 'Security Operations Centre (SOC) analysts',
      practicalResources: 'Anonymised log datasets, cloud sandbox environment, weekly technical sessions with senior analysts',
      status: 'pending',
      submittedById: databridge.id,
      submittedAt: new Date('2025-04-15'),
    },
  })

  const p5 = await prisma.proposal.create({
    data: {
      title: 'Mobile Learning Platform for Universities',
      companyName: 'TechNova Solutions Sdn. Bhd.',
      companyWebsite: 'https://technovasolutions.com',
      companyCategory: 'Education Technology',
      projectChampion: 'Reza Iskandar',
      processOwner: 'Syarifah Nora',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'TechNova Solutions is expanding into the EdTech space with a focus on mobile-first learning solutions for Malaysian universities.',
      problemStatement: 'University students struggle with fragmented learning resources across multiple platforms. We need a unified mobile learning app with offline support, progress tracking and gamification.',
      discipline: 'Software Engineering / Mobile Development',
      deliverables: 'Cross-platform mobile app (iOS/Android), content management system, gamification module, progress analytics, deployment guide',
      technologies: 'React Native, Node.js, MongoDB, Firebase',
      skillsNeeded: 'Mobile Development, UI/UX Design, Backend Development',
      targetAudience: 'University students and lecturers',
      practicalResources: 'Sample course content, cloud hosting credits, UX research access',
      status: 'approved',
      submittedById: technova.id,
      reviewedById: robina.id,
      reviewFeedback: 'Well-structured proposal with strong commercial potential. The offline-first approach and gamification elements are well-justified for the Malaysian university context. Approved for student selection.',
      reviewedAt: new Date('2025-03-20'),
      submittedAt: new Date('2025-03-10'),
    },
  })

  const p6 = await prisma.proposal.create({
    data: {
      title: 'IoT Energy Monitoring System',
      companyName: 'DataBridge Sdn. Bhd.',
      companyWebsite: 'https://databridge.com.my',
      companyCategory: 'IoT / Sustainability',
      projectChampion: 'Melissa Tan',
      processOwner: 'Zain Ariff',
      intiContact: 'Dr. Robina Tinawin',
      departmentId: it.id,
      briefProfile: 'DataBridge is expanding into IoT-based sustainability monitoring solutions for commercial buildings and industrial facilities.',
      problemStatement: 'Commercial buildings waste up to 30% of energy due to poor monitoring. We need an IoT dashboard that collects real-time energy data from smart meters and provides actionable insights.',
      discipline: 'Internet of Things / Software Engineering',
      deliverables: 'IoT data pipeline, real-time monitoring dashboard, anomaly alerts, energy report generator, hardware integration guide',
      technologies: 'Raspberry Pi, MQTT, Node.js, InfluxDB, React, Grafana',
      skillsNeeded: 'IoT Development, Backend Engineering, Data Visualisation',
      targetAudience: 'Facilities managers and sustainability officers',
      practicalResources: 'Smart meter hardware, IoT sandbox environment, anonymised energy datasets',
      status: 'approved',
      submittedById: databridge.id,
      reviewedById: robina.id,
      reviewFeedback: 'Technically sound proposal with real-world application. The IoT pipeline architecture is appropriate. Deliverables are clearly scoped. Approved.',
      reviewedAt: new Date('2025-03-25'),
      submittedAt: new Date('2025-03-15'),
    },
  })

  const p7 = await prisma.proposal.create({
    data: {
      title: 'Digital Marketing Analytics Dashboard',
      companyName: 'RetailPro Malaysia Sdn. Bhd.',
      companyWebsite: 'https://retailpro.com.my',
      companyCategory: 'Retail / Digital Marketing',
      projectChampion: 'Kevin Chong',
      processOwner: 'Nurul Hana',
      intiContact: 'Jonathan Lee',
      departmentId: biz.id,
      briefProfile: 'RetailPro Malaysia provides retail management solutions to over 300 SME retailers nationwide.',
      problemStatement: 'Our retail clients spend heavily on digital marketing but cannot measure ROI effectively across channels. We need a unified analytics dashboard consolidating data from Google Ads, Facebook and Shopee.',
      discipline: 'Business Analytics / Digital Marketing',
      deliverables: 'Multi-channel analytics dashboard, ROI calculator, automated reporting, campaign comparison tool, user guide',
      technologies: 'Python, Power BI, Google Analytics API, Facebook Marketing API',
      skillsNeeded: 'Data Analytics, Business Intelligence, API Integration',
      targetAudience: 'SME retail business owners and marketing managers',
      practicalResources: 'Access to anonymised campaign data, API credentials for sandbox environments',
      status: 'pending',
      submittedById: retailpro.id,
      submittedAt: new Date('2025-04-20'),
    },
  })

  const p8 = await prisma.proposal.create({
    data: {
      title: 'HR Management and Payroll System',
      companyName: 'FinSmart Advisory Sdn. Bhd.',
      companyWebsite: 'https://finsmart.my',
      companyCategory: 'Financial Advisory / HR Technology',
      projectChampion: 'Priya Nair',
      processOwner: 'Azlan Yusof',
      intiContact: 'Jonathan Lee',
      departmentId: biz.id,
      briefProfile: 'FinSmart Advisory provides financial planning and HR consultancy services to SMEs across Malaysia.',
      problemStatement: 'Many SME clients manage payroll manually using Excel, leading to frequent errors and compliance issues with EPF, SOCSO and PCB deductions. We need an automated HR and payroll system.',
      discipline: 'Business Information Systems / Finance',
      deliverables: 'Employee management module, automated payroll engine, EPF/SOCSO/PCB calculator, payslip generator, leave management, compliance reports',
      technologies: 'React, Node.js, PostgreSQL, PDF generation library',
      skillsNeeded: 'Full-Stack Development, Business Process Analysis, Malaysian Payroll Compliance Knowledge',
      targetAudience: 'HR managers and finance officers at SMEs',
      practicalResources: 'Anonymised payroll data, Malaysian statutory rate tables, HR consultant mentorship',
      status: 'pending',
      submittedById: finsmart.id,
      submittedAt: new Date('2025-04-22'),
    },
  })

  const p9 = await prisma.proposal.create({
    data: {
      title: 'Customer Loyalty Rewards Platform',
      companyName: 'RetailPro Malaysia Sdn. Bhd.',
      companyWebsite: 'https://retailpro.com.my',
      companyCategory: 'Retail / Customer Experience',
      projectChampion: 'Kevin Chong',
      processOwner: 'Siti Hajar',
      intiContact: 'Jonathan Lee',
      departmentId: biz.id,
      briefProfile: 'RetailPro Malaysia is building a customer engagement ecosystem for Malaysian SME retailers.',
      problemStatement: 'Small retailers lose repeat customers to larger chains with established loyalty programmes. We need a white-label loyalty rewards platform that SME retailers can deploy affordably.',
      discipline: 'Business Information Systems / Mobile Commerce',
      deliverables: 'Loyalty points engine, merchant dashboard, customer mobile app, redemption management, analytics module',
      technologies: 'React Native, Node.js, PostgreSQL, Firebase Push Notifications',
      skillsNeeded: 'Mobile Development, Backend Development, Business Analysis, UI/UX Design',
      targetAudience: 'SME retail merchants and their customers',
      practicalResources: 'Access to pilot merchant network, sample transaction data, UX research sessions',
      status: 'approved',
      submittedById: retailpro.id,
      reviewedById: jonathan.id,
      reviewFeedback: 'Highly relevant to the Malaysian SME context. The white-label approach is commercially sound and deliverables are well-scoped for a FYP team. Approved.',
      reviewedAt: new Date('2025-03-28'),
      submittedAt: new Date('2025-03-18'),
    },
  })

  const p10 = await prisma.proposal.create({
    data: {
      title: 'Supply Chain Visibility Portal',
      companyName: 'FinSmart Advisory Sdn. Bhd.',
      companyWebsite: 'https://finsmart.my',
      companyCategory: 'Supply Chain / Business Intelligence',
      projectChampion: 'Priya Nair',
      processOwner: 'Kamarul Ariff',
      intiContact: 'Jonathan Lee',
      departmentId: biz.id,
      briefProfile: 'FinSmart Advisory is diversifying into supply chain consultancy for Malaysian manufacturers.',
      problemStatement: 'Malaysian SME manufacturers lack real-time visibility into their supply chain, leading to production delays and poor vendor management.',
      discipline: 'Business Information Systems / Operations Management',
      deliverables: 'Supplier management module, purchase order tracker, delivery timeline visualiser, vendor performance scorecard, executive reports',
      technologies: 'React, Node.js, PostgreSQL, Chart.js',
      skillsNeeded: 'Full-Stack Development, Business Process Modelling, Data Visualisation',
      targetAudience: 'Operations managers and procurement officers at SME manufacturers',
      practicalResources: 'Anonymised procurement data, supply chain consultant access, weekly progress reviews',
      status: 'approved',
      submittedById: finsmart.id,
      reviewedById: jonathan.id,
      reviewFeedback: 'Strong business case with clear problem definition. The vendor performance scorecard is a particularly valuable deliverable. Well-scoped for a semester-long FYP. Approved.',
      reviewedAt: new Date('2025-04-01'),
      submittedAt: new Date('2025-03-22'),
    },
  })
  console.log('✅ Proposals seeded (10 total — 6 IT, 4 Business)')

  // ── Chat Threads ──────────────────────────────────────────────────────────────
  await prisma.chatThread.create({
    data: {
      proposalId: p1.id,
      messages: { create: [
        { senderId: robina.id, message: 'Strong proposal with clear problem scope. The NLP component is well-justified. Approved. Looking forward to working with the team.' },
        { senderId: ahmad.id,  message: 'Thank you Dr. Robina! We are excited to collaborate. We will prepare API access for the team.' },
      ]},
    },
  })

  await prisma.chatThread.create({
    data: {
      proposalId: p2.id,
      messages: { create: [
        { senderId: robina.id, message: 'Well-scoped with clear technical requirements. The offline-first architecture shows strong engineering thinking. Approved.' },
        { senderId: sarah.id,  message: 'Wonderful news! We will arrange access to our test retail environment and sample data for the team.' },
      ]},
    },
  })

  await prisma.chatThread.create({
    data: {
      proposalId: p5.id,
      messages: { create: [
        { senderId: robina.id,   message: 'Well-structured proposal with strong commercial potential. The offline-first approach and gamification elements are well-justified. Approved.' },
        { senderId: technova.id, message: 'Thank you Dr. Robina! We will prepare sample course content and set up cloud hosting access for the selected team.' },
      ]},
    },
  })

  await prisma.chatThread.create({
    data: {
      proposalId: p6.id,
      messages: { create: [
        { senderId: robina.id,    message: 'Technically sound proposal with real-world application. The IoT pipeline architecture is appropriate and deliverables are clearly scoped. Approved.' },
        { senderId: databridge.id, message: 'Appreciate the approval Dr. Robina. We will arrange hardware access and the IoT sandbox environment for the team.' },
      ]},
    },
  })

  await prisma.chatThread.create({
    data: {
      proposalId: p9.id,
      messages: { create: [
        { senderId: jonathan.id,  message: 'Highly relevant to the Malaysian SME context. The white-label approach is commercially sound and deliverables are well-scoped. Approved.' },
        { senderId: retailpro.id, message: 'Thank you Mr. Jonathan! We are excited to work with INTI students. We will connect the team with our pilot merchant network.' },
      ]},
    },
  })

  await prisma.chatThread.create({
    data: {
      proposalId: p10.id,
      messages: { create: [
        { senderId: jonathan.id, message: 'Strong business case with clear problem definition. The vendor performance scorecard is a particularly valuable deliverable. Approved.' },
        { senderId: finsmart.id, message: 'Thank you Mr. Jonathan. We will prepare anonymised procurement data and arrange weekly review sessions with our supply chain consultants.' },
      ]},
    },
  })
  console.log('✅ Chat threads seeded (6 threads)')

  // ── Notifications ─────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'FYP Proposal Submission Window Now Open',
        message: 'Industry partners are welcome to submit Final Year Project proposals for the 2025/2026 academic year. The submission window closes on 30 May 2025. All proposals will be reviewed by the relevant department supervisor.',
        createdById: admin.id,
        targetRole: null,
        targetDepartmentId: null,
      },
      {
        title: 'Project Selection Opens for IT Students',
        message: 'Dear IT students, project selection is now open. Browse approved proposals and select your preferred project. Note: each proposal can only be selected by one student — first come, first served.',
        createdById: robina.id,
        targetRole: 'student',
        targetDepartmentId: it.id,
      },
      {
        title: 'Mandatory FYP Briefing — 10 February 2025',
        message: 'All registered FYP students are required to attend the mandatory briefing session on 10 February 2025 at 10:00 AM in Lecture Hall A, Block B. Please bring your student ID.',
        createdById: admin.id,
        targetRole: 'student',
        targetDepartmentId: null,
      },
      {
        title: 'Project Selection Opens for Business Students',
        message: 'Dear Business students, project selection is now open. Two approved proposals are available for your department. Log in and browse proposals to make your selection.',
        createdById: jonathan.id,
        targetRole: 'student',
        targetDepartmentId: biz.id,
      },
    ],
  })
  console.log('✅ Notifications seeded')

  console.log('\n🎉 Seed complete!')
  console.log('\nDemo Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin:          admin@newinti.edu.my            / Admin@1234')
  console.log('  Lecturer (IT):  robina.tinawin@newinti.edu.my   / Lecturer@1234')
  console.log('  Lecturer (Biz): jonathan.lee@newinti.edu.my     / Lecturer@1234')
  console.log('  Student (IT):   J22013456@student.newinti.edu.my / Student@1234')
  console.log('  Student (Biz):  J22016010@student.newinti.edu.my / Student@1234')
  console.log('  Employer 1:     ahmad.razif@abctech.com         / Employer@1234')
  console.log('  Employer 2:     sarah.wong@xyzsolutions.com     / Employer@1234')
  console.log('  Employer 3:     contact@technovasolutions.com   / Employer@1234')
  console.log('  Employer 4:     projects@databridge.com.my      / Employer@1234')
  console.log('  Employer 5:     fyp@retailpro.com.my            / Employer@1234')
  console.log('  Employer 6:     partnerships@finsmart.my        / Employer@1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())