import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import TaskForm from './pages/TaskForm'
import Trash from './pages/Trash'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

/** Blocks a route until the session is known. */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="tm-loading" style={{ minHeight: '100vh' }}>
        <span className="tm-spinner" aria-hidden="true" />
        <span>Loading TaskMate...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/** Keeps signed-in users away from the guest-only screens. */
function RequireGuest({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="tm-loading" style={{ minHeight: '100vh' }}>
        <span className="tm-spinner" aria-hidden="true" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />
      <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/tasks"
          element={
            <TaskList
              title="All Tasks"
              subtitle="Every active task in your account."
              emptyTitle="No tasks found"
              emptyText="Try adjusting your filters, or create a new task."
            />
          }
        />

        <Route
          path="/tasks/in-progress"
          element={
            <TaskList
              lockedStatus="In Progress"
              title="In Progress"
              subtitle="Tasks you are currently working on."
              emptyTitle="Nothing in progress"
              emptyText="Tasks you start will show up here until you mark them as completed."
            />
          }
        />

        <Route
          path="/tasks/completed"
          element={
            <TaskList
              lockedStatus="Completed"
              title="Completed"
              subtitle="Everything you have already finished."
              emptyTitle="No completed tasks"
              emptyText="Tick a task off and it will appear here."
            />
          }
        />

        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />

        <Route path="/trash" element={<Trash />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
