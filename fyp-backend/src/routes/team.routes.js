// team.routes.js
import { Router } from 'express'
import { getTeams, getMyTeam, createTeam, assignStudents, confirmTeam } from '../controllers/team.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)
router.get('/',          getTeams)
router.get('/mine',      authorize('student'),  getMyTeam)
router.post('/',         authorize('lecturer'), createTeam)
router.put('/:id/assign',authorize('lecturer'), assignStudents)
router.put('/:id/confirm',authorize('lecturer'),confirmTeam)

export default router
