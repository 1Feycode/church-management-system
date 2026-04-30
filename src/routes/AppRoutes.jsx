import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import LandingPage from '../pages/LandingPage'
import Login from '../pages/Login'
import AuthCallback from '../pages/AuthCallback'
import CompleteProfile from '../pages/CompleteProfile'
import Dashboard from '../pages/Dashboard'
import Members from '../pages/Members'
import GroupsAdvanced from '../pages/GroupsAdvanced'
import Announcements from '../pages/Announcements'
import Events from '../pages/Events'
import PrayerRequests from '../pages/PrayerRequests'
import BibleStudies from '../pages/BibleStudies'
import BibleStudyDetail from '../pages/BibleStudyDetail'
import Notifications from '../pages/Notifications'
import Profile from '../pages/Profile'
import MyGroup from '../pages/MyGroup'
import Unauthorized from '../pages/Unauthorized'
import { useAuth } from '../contexts/AuthContext'

// Smart root: always show landing page first.
// Once auth resolves, redirect logged-in users to their dashboard.
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  // Auth still initializing — show landing page (no flash, no blank screen)
  if (loading) return <LandingPage />

  // Logged in with profile → go to dashboard
  if (user && profile) return <Navigate to="/dashboard" replace />

  // Logged in but no profile yet → complete profile
  if (user && !profile) return <Navigate to="/complete-profile" replace />

  // Not logged in → landing page
  return <LandingPage />
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ─────────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* /login → sign-in mode | /signup → sign-up mode */}
      <Route path="/login" element={<Login mode="signin" />} />
      <Route path="/signup" element={<Login mode="signup" />} />

      {/* Complete profile */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* ── Member routes ───────────────────────────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute><Events /></ProtectedRoute>
      } />
      <Route path="/prayer-requests" element={
        <ProtectedRoute><PrayerRequests /></ProtectedRoute>
      } />
      <Route path="/bible-studies" element={
        <ProtectedRoute><BibleStudies /></ProtectedRoute>
      } />
      <Route path="/bible-study/:id" element={
        <ProtectedRoute><BibleStudyDetail /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Notifications /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/my-group" element={
        <ProtectedRoute><MyGroup /></ProtectedRoute>
      } />

      {/* ── Admin-only routes ───────────────────────────────── */}
      <Route path="/members" element={
        <ProtectedRoute requireAdmin><Members /></ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute requireAdmin><GroupsAdvanced /></ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute requireAdmin><Announcements /></ProtectedRoute>
      } />

      {/* ── Misc ────────────────────────────────────────────── */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
