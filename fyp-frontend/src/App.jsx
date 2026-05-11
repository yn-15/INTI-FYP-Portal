import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import PendingApproval from './pages/auth/PendingApproval'

// Admin
import AdminDashboard     from './pages/admin/Dashboard'
import UserManagement     from './pages/admin/UserManagement'
import AdminProposals     from './pages/admin/Proposals'
import AdminTeams         from './pages/admin/Teams'
import AdminNotifications from './pages/admin/Notifications'
import AuditLog           from './pages/admin/AuditLog'
import AdminReports       from './pages/admin/Reports'
import AdminSettings      from './pages/admin/Settings'

// Lecturer
import LecturerDashboard     from './pages/lecturer/Dashboard'
import LecturerProposals     from './pages/lecturer/Proposals'
import LecturerChat          from './pages/lecturer/Chat'
import LecturerTeams         from './pages/lecturer/Teams'
import LecturerNotifications from './pages/lecturer/Notifications'
import LecturerReports       from './pages/lecturer/Reports'
import LecturerSettings      from './pages/lecturer/Settings'

// Student
import StudentDashboard     from './pages/student/Dashboard'
import BrowseProposals      from './pages/student/BrowseProposals'
import MyTeam               from './pages/student/MyTeam'
import StudentNotifications from './pages/student/Notifications'
import StudentSettings      from './pages/student/Settings'

// Employer
import EmployerDashboard     from './pages/employer/Dashboard'
import SubmitProposal        from './pages/employer/SubmitProposal'
import MyProposals           from './pages/employer/MyProposals'
import EmployerChat          from './pages/employer/Chat'
import EmployerNotifications from './pages/employer/Notifications'
import EmployerSettings      from './pages/employer/Settings'

// ── Guards ────────────────────────────────────────────────────────────────────
function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}`} replace />
  return children
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={`/${user.role}`} replace />
  return children
}

import PageWrapper from './components/layout/PageWrapper'

const AdminPage    = ({ title, children }) => <RequireAuth allowedRoles={['admin']}>   <PageWrapper title={title}>{children}</PageWrapper></RequireAuth>
const LecturerPage = ({ title, children }) => <RequireAuth allowedRoles={['lecturer']}><PageWrapper title={title}>{children}</PageWrapper></RequireAuth>
const StudentPage  = ({ title, children }) => <RequireAuth allowedRoles={['student']}> <PageWrapper title={title}>{children}</PageWrapper></RequireAuth>
const EmployerPage = ({ title, children }) => <RequireAuth allowedRoles={['employer']}><PageWrapper title={title}>{children}</PageWrapper></RequireAuth>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"            element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/register"         element={<RequireGuest><Register /></RequireGuest>} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/"                 element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin"               element={<AdminPage title="Dashboard">       <AdminDashboard />     </AdminPage>} />
        <Route path="/admin/users"         element={<AdminPage title="User Management"> <UserManagement />     </AdminPage>} />
        <Route path="/admin/proposals"     element={<AdminPage title="Proposals">       <AdminProposals />     </AdminPage>} />
        <Route path="/admin/teams"         element={<AdminPage title="Teams">           <AdminTeams />         </AdminPage>} />
        <Route path="/admin/notifications" element={<AdminPage title="Notifications">   <AdminNotifications /> </AdminPage>} />
        <Route path="/admin/audit"         element={<AdminPage title="Audit Log">       <AuditLog />           </AdminPage>} />
        <Route path="/admin/reports"       element={<AdminPage title="Reports">         <AdminReports />       </AdminPage>} />
        <Route path="/admin/settings"      element={<AdminPage title="Settings">        <AdminSettings />      </AdminPage>} />

        {/* Lecturer */}
        <Route path="/lecturer"               element={<LecturerPage title="Dashboard">     <LecturerDashboard />     </LecturerPage>} />
        <Route path="/lecturer/proposals"     element={<LecturerPage title="Proposals">     <LecturerProposals />     </LecturerPage>} />
        <Route path="/lecturer/chat"          element={<LecturerPage title="Chat">          <LecturerChat />          </LecturerPage>} />
        <Route path="/lecturer/teams"         element={<LecturerPage title="Teams">         <LecturerTeams />         </LecturerPage>} />
        <Route path="/lecturer/notifications" element={<LecturerPage title="Notifications"> <LecturerNotifications /> </LecturerPage>} />
        <Route path="/lecturer/reports"       element={<LecturerPage title="Reports">       <LecturerReports />       </LecturerPage>} />
        <Route path="/lecturer/settings"      element={<LecturerPage title="Settings">      <LecturerSettings />      </LecturerPage>} />

        {/* Student */}
        <Route path="/student"               element={<StudentPage title="Dashboard">        <StudentDashboard />     </StudentPage>} />
        <Route path="/student/proposals"     element={<StudentPage title="Browse Proposals"> <BrowseProposals />      </StudentPage>} />
        <Route path="/student/team"          element={<StudentPage title="My Team">          <MyTeam />               </StudentPage>} />
        <Route path="/student/notifications" element={<StudentPage title="Notifications">    <StudentNotifications /> </StudentPage>} />
        <Route path="/student/settings"      element={<StudentPage title="Settings">         <StudentSettings />      </StudentPage>} />

        {/* Employer */}
        <Route path="/employer"               element={<EmployerPage title="Dashboard">       <EmployerDashboard />     </EmployerPage>} />
        <Route path="/employer/submit"        element={<EmployerPage title="Submit Proposal"> <SubmitProposal />        </EmployerPage>} />
        <Route path="/employer/proposals"     element={<EmployerPage title="My Proposals">    <MyProposals />           </EmployerPage>} />
        <Route path="/employer/chat"          element={<EmployerPage title="Chat">            <EmployerChat />          </EmployerPage>} />
        <Route path="/employer/notifications" element={<EmployerPage title="Notifications">   <EmployerNotifications /> </EmployerPage>} />
        <Route path="/employer/settings"      element={<EmployerPage title="Settings">        <EmployerSettings />      </EmployerPage>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
