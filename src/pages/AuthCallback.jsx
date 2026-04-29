import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    // Handle the OAuth/email callback directly from Supabase
    async function handleCallback() {
      try {
        setStatus('Completing sign in...')

        // Get the session - Supabase handles the token exchange automatically
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('Error: ' + error.message)
          setTimeout(() => navigate('/login', { replace: true }), 2000)
          return
        }

        if (session?.user) {
          setStatus('Checking profile...')

          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('members')
            .select('id, role')
            .eq('user_id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError)
          }

          if (profile) {
            setStatus('Welcome back! Redirecting...')
            navigate('/dashboard', { replace: true })
          } else {
            setStatus('Please complete your profile...')
            navigate('/complete-profile', { replace: true })
          }
        } else {
          // No session yet - wait a moment and try again (for email confirmation)
          setStatus('Waiting for authentication...')
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession?.user) {
              navigate('/complete-profile', { replace: true })
            } else {
              navigate('/login', { replace: true })
            }
          }, 2000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.spinner}>⏳</div>
        <h2 style={styles.title}>Signing you in...</h2>
        <p style={styles.text}>{status}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb'
  },
  content: {
    textAlign: 'center',
    padding: '40px'
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  text: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  }
}

export default AuthCallback
