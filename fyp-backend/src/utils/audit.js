import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function logAction({ userId, action, entityType, entityId, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType: entityType || null,
        entityId:   entityId   || null,
        details:    details    || null,
      },
    })
  } catch (err) {
    // Don't let audit failures crash the main request
    console.error('Audit log error:', err.message)
  }
}
