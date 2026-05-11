import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Departments ──
  const it = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: { name: 'IT' },
  })
  const biz = await prisma.department.upsert({
    where: { name: 'Business' },
    update: {},
    create: { name: 'Business' },
  })
  console.log('✅ Departments seeded')

  // ── Admin ──
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@newinti.edu.my' },
    update: {},
    create: {
      firstName: 'Admin', lastName: 'Master',
      email: 'admin@newinti.edu.my',
      passwordHash: adminHash,
      role: 'admin', status: 'active',
    },
  })

  // ── Lecturers ──
  const lectHash = await bcrypt.hash('Lecturer@1234', 12)
  const robina = await prisma.user.upsert({
    where: { email: 'robina.tinawin@newinti.edu.my' },
    update: {},
    create: {
      firstName: 'Robina', lastName: 'Tinawin',
      email: 'robina.tinawin@newinti.edu.my',
      passwordHash: lectHash, role: 'lecturer', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const jonathan = await prisma.user.upsert({
    where: { email: 'jonathan.lee@newinti.edu.my' },
    update: {},
    create: {
      firstName: 'Jonathan', lastName: 'Lee',
      email: 'jonathan.lee@newinti.edu.my',
      passwordHash: lectHash, role: 'lecturer', status: 'active',
      departmentId: biz.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })

  // ── Students ──
  const studHash = await bcrypt.hash('Student@1234', 12)
  const thura = await prisma.user.upsert({
    where: { email: 'J22013456@student.newinti.edu.my' },
    update: {},
    create: {
      firstName: 'Thura', lastName: 'Nyi Nyi',
      email: 'J22013456@student.newinti.edu.my',
      passwordHash: studHash, role: 'student', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const lim = await prisma.user.upsert({
    where: { email: 'J22013789@student.newinti.edu.my' },
    update: {},
    create: {
      firstName: 'Lim', lastName: 'Chuan Zhe',
      email: 'J22013789@student.newinti.edu.my',
      passwordHash: studHash, role: 'student', status: 'active',
      departmentId: it.id, approvedById: admin.id, approvedAt: new Date(),
    },
  })

  // ── Employers ──
  const empHash = await bcrypt.hash('Employer@1234', 12)
  const ahmad = await prisma.user.upsert({
    where: { email: 'ahmad.razif@abctech.com' },
    update: {},
    create: {
      firstName: 'Ahmad', lastName: 'Razif',
      email: 'ahmad.razif@abctech.com',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'ABC Technologies Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.wong@xyzsolutions.com' },
    update: {},
    create: {
      firstName: 'Sarah', lastName: 'Wong',
      email: 'sarah.wong@xyzsolutions.com',
      passwordHash: empHash, role: 'employer', status: 'active',
      companyName: 'XYZ Solutions Sdn. Bhd.',
      approvedById: admin.id, approvedAt: new Date(),
    },
  })
  console.log('✅ Users seeded')

  // ── Proposals ──
  const p1 = await prisma.proposal.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
      reviewedAt: new Date(),
    },
  })

  const p2 = await prisma.proposal.upsert({
    where: { id: 2 },
    update: {},
    create: {
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
      status: 'pending',
      submittedById: sarah.id,
      reviewedById: null,
    },
  })
  console.log('✅ Proposals seeded')

  // ── Chat thread for approved proposal ──
  await prisma.chatThread.upsert({
    where: { proposalId: p1.id },
    update: {},
    create: {
      proposalId: p1.id,
      messages: {
        create: [
          {
            senderId: robina.id,
            message: 'Strong proposal with clear problem scope. The NLP component is well-justified. Approved. Looking forward to working with the team on this project.',
          },
          {
            senderId: ahmad.id,
            message: 'Thank you Dr. Robina! We are excited to collaborate. We will prepare API access for the team.',
          },
        ],
      },
    },
  })
  console.log('✅ Chat thread seeded')

  // ── Notifications ──
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'FYP Proposal Submission Window Now Open',
        message: 'Industry partners are welcome to submit Final Year Project proposals for the 2025/2026 academic year. The submission window closes on 30 May 2025.',
        createdById: admin.id,
        targetRole: null,
        targetDepartmentId: null,
      },
      {
        title: 'Project Selection Opens for IT Students',
        message: 'Dear IT students, project selection is now open. Browse approved proposals and select your preferred project. First come, first served.',
        createdById: robina.id,
        targetRole: 'student',
        targetDepartmentId: it.id,
      },
    ],
  })
  console.log('✅ Notifications seeded')

  console.log('\n🎉 Seed complete!')
  console.log('\nDemo Credentials:')
  console.log('  Admin:    admin@newinti.edu.my         / Admin@1234')
  console.log('  Lecturer: robina.tinawin@newinti.edu.my / Lecturer@1234')
  console.log('  Student:  J22013456@student.newinti.edu.my / Student@1234')
  console.log('  Employer: ahmad.razif@abctech.com       / Employer@1234')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
