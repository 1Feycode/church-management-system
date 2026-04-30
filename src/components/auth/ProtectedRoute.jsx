import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * ProtectedRoute — guards pages based on auth state and role
 *
 * Props:
 *   requireAdmin  — only admins can access (default false)
 */
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // ── Still checking auth ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}>⏳</div>
        <p style={styles.spinnerText}>Loading...</p>
      </div>
    )
  }

  // ── Not logged in → send to login ────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ── Logged in but no profile yet → must complete profile ────────────────
  if (!profile) {
    if (location.pathname === '/complete-profile') return children
    return <Navigate to="/complete-profile" replace />
  }

  // ── Has profile but tries to visit /complete-profile again ───────────────
  if (location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />
  }

  // ── Admin-only page → redirect to /unauthorized ──────────────────────────
  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  // ── All checks passed ────────────────────────────────────────────────────
  return children
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb'
  },
  spinner: { fontSize: '40px', marginBottom: '12px' },
  spinnerText: { fontSize: '16px', color: '#6b7280', margin: 0 }
}

export default ProtectedRoute
