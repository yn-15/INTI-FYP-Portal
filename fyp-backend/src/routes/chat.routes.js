import { Router } from 'express'
import { getThread, sendMessage } from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()
router.use(authenticate)
router.get('/:proposalId',  getThread)
router.post('/:proposalId', sendMessage)

export default router
