import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile separately - non-blocking
  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // won't error if no row found
      setProfile(data || null)
    } catch (err) {
      console.error('fetchProfile error:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Set a safety timeout - if auth doesn't respond in 5s, stop loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        clearTimeout(timeout)
        if (session?.user) {
          setUser(session.user)
          // Fetch profile async without blocking auth state
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    return { data, error }
  }

  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signUpWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })

    // Supabase silently succeeds for duplicate emails when confirmation is on.
    // Detect this: user exists but identities array is empty.
    if (!error && data?.user && data.user.identities?.length === 0) {
      return {
        data: null,
        error: { message: 'This email is already registered. Please sign in instead.' }
      }
    }

    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  async function updateProfile(profileData) {
    if (!user) return { data: null, error: new Error('Not logged in') }
    const { data, error } = await supabase
      .from('members')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const value = {
    user,
    profile,
    loading,
    setProfile,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isMember: profile?.role === 'member',
    hasProfile: !!profile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
