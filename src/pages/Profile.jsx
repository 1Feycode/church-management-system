import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    gender: profile?.gender || '',
    age: profile?.age ? String(profile.age) : '',
    address: profile?.address || '',
    education_level: profile?.education_level || '',
    christian_since: profile?.christian_since || '',
    baptism_status: profile?.baptism_status || false
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await updateProfile({
      name: form.name,
      phone: form.phone || null,
      gender: form.gender || null,
      age: form.age ? Number(form.age) : null,
      address: form.address || null,
      education_level: form.education_level || null,
      christian_since: form.christian_since || null,
      baptism_status: form.baptism_status
    })
    setSaving(false)
    if (error) {
      alert('Error saving profile: ' + error.message)
    } else {
      setEditing(false)
      alert('Profile updated successfully!')
    }
  }

  function handleCancel() {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || '',
      age: profile?.age ? String(profile.age) : '',
      address: profile?.address || '',
      education_level: profile?.education_level || '',
      christian_since: profile?.christian_since || '',
      baptism_status: profile?.baptism_status || false
    })
    setEditing(false)
  }

  const roleBadgeStyle = {
    ...styles.roleBadge,
    backgroundColor: profile?.role === 'admin' ? '#ede9fe' : '#dbeafe',
    color: profile?.role === 'admin' ? '#5b21b6' : '#1e40af'
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 My Profile</h1>
        {!editing && <Button onClick={() => setEditing(true)}>Edit Profile</Button>}
      </div>

      <div style={styles.card}>
        {/* Avatar + basic info */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {(profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={styles.profileName}>{profile?.name || 'No name set'}</h2>
            <p style={styles.profileEmail}>{user?.email}</p>
            <span style={roleBadgeStyle}>{profile?.role === 'admin' ? '⭐ Administrator' : '👤 Member'}</span>
          </div>
        </div>

        <hr style={styles.divider} />

        {editing ? (
          <div style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} style={styles.input} placeholder="Your full name" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} style={styles.input} placeholder="Phone number" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} style={styles.input}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Age</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} style={styles.input} placeholder="Age" min="0" max="150" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Education Level</label>
                <select name="education_level" value={form.education_level} onChange={handleChange} style={styles.input}>
                  <option value="">Select level</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor&apos;s Degree</option>
                  <option value="Master">Master&apos;s Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Christian Since (Year)</label>
                <input name="christian_since" value={form.christian_since} onChange={handleChange} style={styles.input} placeholder="e.g. 2010" />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <input name="address" value={form.address} onChange={handleChange} style={styles.input} placeholder="Residential address" />
            </div>

            <div style={styles.checkboxField}>
              <label style={styles.checkboxLabel}>
                <input name="baptism_status" type="checkbox" checked={form.baptism_status} onChange={handleChange} style={styles.checkbox} />
                <span>Baptized</span>
              </label>
            </div>

            <div style={styles.formActions}>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        ) : (
          <div style={styles.infoGrid}>
            <InfoRow label="Phone" value={profile?.phone} />
            <InfoRow label="Gender" value={profile?.gender} />
            <InfoRow label="Age" value={profile?.age} />
            <InfoRow label="Address" value={profile?.address} />
            <InfoRow label="Education Level" value={profile?.education_level} />
            <InfoRow label="Christian Since" value={profile?.christian_since} />
            <InfoRow label="Baptized" value={profile?.baptism_status ? 'Yes ✓' : 'No'} />
            <InfoRow label="Group" value={profile?.group_id ? `Group #${profile.group_id}` : 'Not assigned'} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={infoStyles.row}>
      <span style={infoStyles.label}>{label}</span>
      <span style={infoStyles.value}>{value || '—'}</span>
    </div>
  )
}

const infoStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  label: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  value: { fontSize: '14px', color: '#1f2937', fontWeight: '600' }
}

const styles = {
  container: { padding: '20px', maxWidth: '700px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', color: '#1f2937', margin: 0, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    backgroundColor: '#8b5cf6', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '800', flexShrink: 0
  },
  profileName: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' },
  profileEmail: { margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' },
  roleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 20px 0' },
  infoGrid: { display: 'flex', flexDirection: 'column' },
  form: {},
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
  },
  checkboxField: { marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }
}

export default Profile
