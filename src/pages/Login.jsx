import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, profile, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (profile) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/complete-profile', { replace: true })
      }
    }
  }, [user, profile, loading, navigate])

  async function handleGoogleLogin() {
    setSubmitting(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
    setSubmitting(false)
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setSubmitting(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { data, error } = await signUpWithEmail(email, password)
      if (error) {
        // Supabase returns this when email already exists
        if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already been registered') ||
            error.message.toLowerCase().includes('user already registered')) {
          setError('This email is already registered. Please sign in instead.')
          setIsSignUp(false) // Switch to sign in mode
        } else {
          setError(error.message)
        }
      } else if (data?.user && !data.session) {
        // Email confirmation required
        setMessage('✅ Check your email for the confirmation link, then sign in.')
      }
      // If data.session exists, onAuthStateChange will fire and redirect automatically
    } else {
      const { error } = await signInWithEmail(email, password)
      if (error) setError(error.message)
      // On success, onAuthStateChange fires → AuthContext updates → useEffect redirects
    }

    setSubmitting(false)
  }

  // Always show the form — useEffect handles redirect when auth resolves

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>⛪ Church System</h1>
          <p style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleEmailAuth} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
              disabled={submitting}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={submitting}
            />
            {isSignUp && <p style={styles.hint}>Minimum 6 characters</p>}
          </div>

          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        <button onClick={handleGoogleLogin} style={styles.googleButton} disabled={submitting}>
          <span>🔐</span>
          Continue with Google
        </button>

        <div style={styles.footer}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            style={styles.toggleButton}
            disabled={submitting}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '20px'
  },
  loginBox: {
    backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px',
    width: '100%', maxWidth: '440px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px 0' },
  subtitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
  error: {
    backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca'
  },
  success: {
    backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #a7f3d0'
  },
  form: { marginBottom: '24px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  hint: { margin: '6px 0 0 0', fontSize: '12px', color: '#9ca3af' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit'
  },
  submitButton: {
    width: '100%', padding: '14px', backgroundColor: '#8b5cf6', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px'
  },
  divider: {
    textAlign: 'center', margin: '24px 0',
    borderTop: '1px solid #e5e7eb', paddingTop: '24px'
  },
  dividerText: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  googleButton: {
    width: '100%', padding: '14px', backgroundColor: '#ffffff', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px',
    fontWeight: '600', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '12px'
  },
  footer: { marginTop: '24px', textAlign: 'center' },
  toggleButton: {
    backgroundColor: 'transparent', border: 'none', color: '#8b5cf6',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '8px'
  }
}

export default Login
