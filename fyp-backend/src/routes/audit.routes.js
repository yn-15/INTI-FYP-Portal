import { Router } from 'express'
import { getAuditLogs } from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)
router.get('/', authorize('admin'), getAuditLogs)

export default router
