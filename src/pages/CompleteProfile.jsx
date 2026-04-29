import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function CompleteProfile() {
  const navigate = useNavigate()
  const { user, setProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    email: user?.email || '',
    address: '',
    baptism_status: false,
    education_level: '',
    christian_since: ''
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setErrorMsg('First name and last name are required.')
      return
    }

    if (!user) {
      setErrorMsg('You are not logged in. Please login first.')
      setTimeout(() => navigate('/login'), 1500)
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          user_id: user.id,
          name: `${form.first_name.trim()} ${form.last_name.trim()}`,
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim() || null,
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || user.email || null,
          address: form.address.trim() || null,
          baptism_status: form.baptism_status,
          education_level: form.education_level || null,
          christian_since: form.christian_since ? Number(form.christian_since) : null,
          role: 'member'
        }])
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        if (error.code === '42501') {
          setErrorMsg('Permission denied. Please run DISABLE-RLS-NOW.sql in Supabase SQL Editor.')
        } else if (error.code === '23505') {
          setErrorMsg('Profile already exists.')
          setTimeout(() => navigate('/dashboard'), 1000)
        } else {
          setErrorMsg(`Error: ${error.message}`)
        }
        return
      }

      // Update context profile directly so no extra fetch needed
      if (typeof setProfile === 'function') {
        setProfile(data)
      }

      // Navigate immediately
      navigate('/dashboard', { replace: true })

    } catch (err) {
      console.error('Unexpected error:', err)
      setErrorMsg('Unexpected error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>Complete Your Profile</h1>
          <p style={styles.subtitle}>Please provide your information to continue</p>
        </div>

        {errorMsg && (
          <div style={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>First Name *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Middle Name</label>
              <input
                name="middle_name"
                value={form.middle_name}
                onChange={handleChange}
                placeholder="Michael"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Last Name *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Education Level</label>
              <select
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select education level</option>
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                <option value="Master's Degree">Master&apos;s Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Christian Since (Year)</label>
              <input
                name="christian_since"
                type="number"
                value={form.christian_since}
                onChange={handleChange}
                placeholder="2020"
                style={styles.input}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State, ZIP"
              rows="3"
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                name="baptism_status"
                type="checkbox"
                checked={form.baptism_status}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>I have been baptized</span>
            </label>
          </div>

          <button
            type="submit"
            style={{ ...styles.submitButton, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
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
    backgroundColor: '#f3f4f6',
    padding: '20px'
  },
  formBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '700px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  field: { display: 'flex', flexDirection: 'column' },
  fieldFull: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  checkboxField: { padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#374151', cursor: 'pointer' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  submitButton: {
    padding: '14px',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  }
}

export default CompleteProfile
