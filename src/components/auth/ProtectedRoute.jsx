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

  // ── Not logged in → send to login, remember where they wanted to go ──────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ── Logged in but no profile yet → must complete profile ────────────────
  if (!profile) {
    // Allow /complete-profile itself through
    if (location.pathname === '/complete-profile') return children
    return <Navigate to="/complete-profile" replace />
  }

  // ── Has profile but tries to visit /complete-profile again ───────────────
  if (location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />
  }

  // ── Admin-only page ──────────────────────────────────────────────────────
  if (requireAdmin && profile.role !== 'admin') {
    return (
      <div style={styles.center}>
        <div style={styles.box}>
          <div style={styles.icon}>🔒</div>
          <h1 style={styles.title}>Access Denied</h1>
          <p style={styles.text}>This page is for administrators only.</p>
          <button onClick={() => window.history.back()} style={styles.btn}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  // ── All checks passed ────────────────────────────────────────────────────
  return children
}

const styles = {
  center: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb'
  },
  spinner: { fontSize: '40px', marginBottom: '12px' },
  spinnerText: { fontSize: '16px', color: '#6b7280', margin: 0 },
  box: {
    backgroundColor: '#ffffff', borderRadius: '16px', padding: '48px 40px',
    maxWidth: '440px', width: '100%', textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  icon: { fontSize: '56px', marginBottom: '20px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1f2937', margin: '0 0 12px 0' },
  text: { fontSize: '15px', color: '#6b7280', margin: '0 0 28px 0', lineHeight: '1.6' },
  btn: {
    padding: '12px 28px', backgroundColor: '#8b5cf6', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer'
  }
}

export default ProtectedRoute
