import { Router } from 'express'
import {
  getProposals, getProposalById,
  createProposal, approveProposal, rejectProposal,
  reassignDepartment,
} from '../controllers/proposal.controller.js'
import {
  getMySelection, selectProposal, dropSelection,
} from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)

// Selection must come before /:id to avoid conflict
router.get('/my-selection',      authorize('student'), getMySelection)
router.post('/:id/select',       authorize('student'), selectProposal)
router.delete('/:id/drop',       authorize('student'), dropSelection)

router.get('/',                  getProposals)
router.get('/:id',               getProposalById)
router.post('/',                 authorize('employer'),  createProposal)
router.put('/:id/approve',       authorize('lecturer'),  approveProposal)
router.put('/:id/reject',        authorize('lecturer'),  rejectProposal)
router.put('/:id/department',    authorize('admin'),     reassignDepartment)

export default router
