import { Router } from 'express'
import {
  getTeams, getMyTeam, createTeam,
  updateTeam, deleteTeam,
  assignStudents, confirmTeam,
  linkProposal, unlinkProposal,
} from '../controllers/team.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)

router.get('/',                     getTeams)
router.get('/mine',                 authorize('student'),  getMyTeam)
router.post('/',                    authorize('lecturer'), createTeam)
router.put('/:id',                  authorize('lecturer'), updateTeam)
router.delete('/:id',               authorize('lecturer'), deleteTeam)
router.put('/:id/assign',           authorize('lecturer'), assignStudents)
router.put('/:id/confirm',          authorize('lecturer'), confirmTeam)
router.put('/:id/link-proposal',    authorize('student'),  linkProposal)
router.delete('/:id/link-proposal', authorize('student'),  unlinkProposal)

export default router
