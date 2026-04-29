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

function AppRoutes() {
  return (
    <Routes>

      {/* ── Public (no auth needed) ─────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Login — public, handles its own redirect if already logged in */}
      <Route path="/login" element={<Login />} />

      {/* Complete profile — only for logged-in users without a profile */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* ── Member routes (any logged-in user with profile) ─── */}
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

      {/* ── Catch-all ──────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
