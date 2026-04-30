import { useState } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useResponsive } from '../hooks/useResponsive'

import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
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
import GroupChat from '../pages/GroupChat'
import Unauthorized from '../pages/Unauthorized'

// ── App shell: sidebar + navbar wrapping authenticated pages ──────────────
function AppShell() {
  const { isSmall } = useResponsive()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: isSmall ? 0 : '220px' }}>
        <Navbar onMenuToggle={() => setSidebarOpen(v => !v)} />
        <div style={{ padding: '20px', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

// ── Root: show landing page; redirect logged-in users to dashboard ─────────
function RootRoute() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // While auth is resolving, show landing page (no flash)
  if (loading) return <LandingPage />

  // Already logged in — send to dashboard (or complete-profile)
  if (user && profile) return <Navigate to="/dashboard" state={{ from: location }} replace />
  if (user && !profile) return <Navigate to="/complete-profile" replace />

  return <LandingPage />
}

// ── Main route tree ────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* Public — no shell */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Login mode="signin" />} />
      <Route path="/signup" element={<Login mode="signup" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Complete profile — protected but no app shell */}
      <Route path="/complete-profile" element={
        <ProtectedRoute><CompleteProfile /></ProtectedRoute>
      } />

      {/* Authenticated app pages — wrapped in AppShell */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/prayer-requests" element={<PrayerRequests />} />
        <Route path="/bible-studies" element={<BibleStudies />} />
        <Route path="/bible-study/:id" element={<BibleStudyDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-group" element={<MyGroup />} />
        <Route path="/group-chat/:groupId" element={<GroupChat />} />

        {/* Admin-only */}
        <Route path="/members" element={
          <ProtectedRoute requireAdmin><Members /></ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute requireAdmin><GroupsAdvanced /></ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute requireAdmin><Announcements /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
