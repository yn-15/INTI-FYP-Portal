import { Router } from 'express'
import {
  getProposals, getProposalById,
  createProposal, editProposal,
  approveProposal, returnProposal,
  reassignDepartment,
} from '../controllers/proposal.controller.js'
import {
  getMySelection, selectProposal, dropSelection,
} from '../controllers/combined.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'
import { DISCIPLINES }  from '../utils/disciplines.js'

const router = Router()
router.use(authenticate)

// Specific/static routes must come before /:id to avoid Express treating
// the literal path segment as an :id param
router.get('/disciplines',       (req, res) => res.json(DISCIPLINES))            // #3: discipline → department list
router.get('/my-selection',      authorize('student'),  getMySelection)
router.post('/:id/select',       authorize('student'),  selectProposal)
router.delete('/:id/drop',       authorize('student'),  dropSelection)

router.get('/',                  getProposals)
router.get('/:id',               getProposalById)
router.post('/',                 authorize('employer'),  createProposal)
router.put('/:id',               authorize('employer'),  editProposal)           // #5: edit when returned
router.put('/:id/approve',       authorize('lecturer'),  approveProposal)
router.put('/:id/return',        authorize('lecturer'),  returnProposal)          // #4: was /reject
router.put('/:id/department',    authorize('admin'),     reassignDepartment)

export default router
