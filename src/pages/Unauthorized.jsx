import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Unauthorized() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  return (
    <div style={styles.center}>
      <div style={styles.box}>
        <div style={styles.icon}>🔒</div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.text}>
          You don&apos;t have permission to view this page.
          {!isAdmin && ' This area is for administrators only.'}
        </p>
        <div style={styles.actions}>
          <button onClick={() => navigate('/dashboard')} style={styles.btnPrimary}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate(-1)} style={styles.btnSecondary}>
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '20px'
  },
  box: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  icon: { fontSize: '56px', marginBottom: '20px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1f2937', margin: '0 0 12px 0' },
  text: { fontSize: '15px', color: '#6b7280', margin: '0 0 28px 0', lineHeight: '1.6' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btnPrimary: {
    padding: '12px 28px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '12px 28px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  }
}

export default Unauthorized
