import { Router } from 'express'
import { getAdminReports, getLecturerReports } from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)
router.get('/admin',    authorize('admin'),    getAdminReports)
router.get('/lecturer', authorize('lecturer'), getLecturerReports)

export default router
