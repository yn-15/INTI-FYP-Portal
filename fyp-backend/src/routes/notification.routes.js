import { Router } from 'express'
import { getNotifications, getUnreadCount, createNotification, markRead } from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)
router.get('/',              getNotifications)
router.get('/unread-count',  getUnreadCount)
router.post('/',             authorize('admin','lecturer'), createNotification)
router.put('/:id/read',      markRead)

export default router
