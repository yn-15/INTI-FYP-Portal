import bcrypt          from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { logAction }    from '../utils/audit.js'

const prisma = new PrismaClient()

// ── POST /api/users/bulk-upload ── (admin) ────────────────────────────────────
// Accepts JSON array parsed from CSV on the frontend.
// Expected fields per row: firstName, lastName, email, studentId (optional),
//                          department (name string: 'IT' or 'Business')
//
// CSV format (header row required):
//   firstName,lastName,email,department
//   John,Doe,john.doe@student.newinti.edu.my,IT
//
// IMPORTANT: All student emails MUST use the @student.newinti.edu.my domain.
const STUDENT_EMAIL_DOMAIN = '@student.newinti.edu.my'

export async function bulkUploadStudents(req, res) {
  try {
    const { students } = req.body  // array of student objects

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'No student data provided.' })
    }

    if (students.length > 500) {
      return res.status(400).json({ error: 'Maximum 500 students per upload.' })
    }

    const depts = await prisma.department.findMany()
    const deptMap = Object.fromEntries(depts.map(d => [d.name.toLowerCase(), d.id]))

    const results = { created: [], skipped: [], errors: [] }

    for (let i = 0; i < students.length; i++) {
      const row = students[i]
      const rowNum = i + 2  // +2 accounts for header row

      const firstName = row.firstName?.trim()
      const lastName  = row.lastName?.trim()
      const email     = row.email?.trim().toLowerCase()
      const deptName  = row.department?.trim()

      // Validate required fields
      if (!firstName || !lastName || !email) {
        results.errors.push({ row: rowNum, email: email || '(blank)', reason: 'Missing required field (firstName, lastName, or email).' })
        continue
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.errors.push({ row: rowNum, email, reason: 'Invalid email format.' })
        continue
      }

      // Enforce student email domain
      if (!email.endsWith(STUDENT_EMAIL_DOMAIN)) {
        results.errors.push({ row: rowNum, email, reason: `Student emails must use the domain "${STUDENT_EMAIL_DOMAIN}".` })
        continue
      }

      const departmentId = deptMap[deptName?.toLowerCase()]
      if (!departmentId) {
        results.errors.push({ row: rowNum, email, reason: `Department "${deptName}" not found. Use: ${Object.keys(deptMap).join(', ')}.` })
        continue
      }

      // Check for duplicate email
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        results.skipped.push({ row: rowNum, email, reason: 'Email already registered.' })
        continue
      }

      // Default password: first part of email (before @) — student must change on first login
      const defaultPassword = email.split('@')[0] + '@INTI'
      const passwordHash = await bcrypt.hash(defaultPassword, 12)

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role:         'student',
          status:       'active',
          departmentId,
          approvedById: req.user.id,
          approvedAt:   new Date(),
        },
      })

      results.created.push({ row: rowNum, email, name: `${firstName} ${lastName}`, defaultPassword })
    }

    await logAction({
      userId: req.user.id,
      action: 'Bulk Student Upload',
      entityType: 'user',
      entityId: null,
      details: {
        total:   students.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors:  results.errors.length,
      },
    })

    return res.status(207).json({
      message: `Upload complete. ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors.`,
      results,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error during bulk upload.' })
  }
}
