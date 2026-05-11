import { Router } from 'express'
import {
  getAllUsers, getPendingUsers, createUser,
  approveUser, rejectUser, deactivateUser, reactivateUser,
  updateUser, updatePassword,
  getDepartments, createDepartment, deleteDepartment,
  getDeptStudents,
} from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize }    from '../middleware/rbac.middleware.js'

const router = Router()
router.use(authenticate)

// Departments
router.get('/departments',           getDepartments)
router.post('/departments',          authorize('admin'), createDepartment)
router.delete('/departments/:id',    authorize('admin'), deleteDepartment)

// Lecturers can fetch students in their own department
router.get('/dept-students', authorize('lecturer', 'admin'), getDeptStudents)

// Users (admin only for most operations)
router.get('/',                      authorize('admin'), getAllUsers)
router.get('/pending',               authorize('admin'), getPendingUsers)
router.post('/',                     authorize('admin'), createUser)
router.put('/:id/approve',           authorize('admin'), approveUser)
router.put('/:id/reject',            authorize('admin'), rejectUser)
router.put('/:id/deactivate',        authorize('admin'), deactivateUser)
router.put('/:id/reactivate',        authorize('admin'), reactivateUser)
router.put('/:id/password',          updatePassword)   // user updates own password
router.put('/:id',                   updateUser)       // admin edits any, user edits self

export default router
