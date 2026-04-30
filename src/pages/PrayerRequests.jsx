import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

function PrayerRequests() {
  const { profile, isAdmin } = useAuth()

  const [prayerRequests, setPrayerRequests] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('')
  const [form, setForm] = useState({ title: '', message: '', visibility: 'public' })

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function loadData() {
    try {
      setLoading(true)

      let requestsQuery = supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isAdmin) {
        // Members see: their own requests OR public requests
        requestsQuery = requestsQuery.or(`member_id.eq.${profile?.id},visibility.eq.public`)
      }

      const { data: requestsData, error: requestsError } = await requestsQuery
      if (requestsError) throw requestsError

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name')
      if (membersError) throw membersError

      const requestsWithMembers = (requestsData || []).map(req => {
        const member = membersData.find(m => m.id === req.member_id)
        return { ...req, member_name: member?.name || 'Unknown' }
      })

      setPrayerRequests(requestsWithMembers)
      setMembers(membersData || [])
    } catch (error) {
      console.error('Error loading prayer requests:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    const trimmedTitle = form.title.trim()
    const trimmedMessage = form.message.trim()

    if (!trimmedTitle || !trimmedMessage) {
      alert('Please fill in Title and Message.')
      return
    }

    // Admin must pick a member; member submits as themselves
    const memberId = isAdmin ? Number(form.member_id) : profile?.id
    if (!memberId) {
      alert(isAdmin ? 'Please select a member.' : 'Could not identify your profile. Please refresh.')
      return
    }

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([{ member_id: memberId, title: trimmedTitle, message: trimmedMessage, visibility: form.visibility, status: 'new' }])
        .select()

      if (error) throw error

      closeModal()
      await loadData()
      alert('Prayer request submitted successfully!')
    } catch (error) {
      alert('Error submitting prayer request: ' + error.message)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase.from('prayer_requests').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Error updating status: ' + error.message)
    }
  }

  async function updateVisibility(id, newVisibility) {
    try {
      const { error } = await supabase.from('prayer_requests').update({ visibility: newVisibility }).eq('id', id)
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Error updating visibility: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this prayer request?')) return
    try {
      const { error } = await supabase.from('prayer_requests').delete().eq('id', id)
      if (error) throw error
      setPrayerRequests(prev => prev.filter(pr => pr.id !== id))
    } catch (error) {
      alert('Error deleting: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setForm({ title: '', message: '', visibility: 'public', member_id: '' })
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const isOwn = (req) => req.member_id === profile?.id

  const filtered = prayerRequests.filter(r => {
    const matchStatus = !filterStatus || r.status === filterStatus
    const matchVis = !filterVisibility || r.visibility === filterVisibility
    return matchStatus && matchVis
  })

  const newRequests = filtered.filter(r => r.status === 'new')
  const prayedRequests = filtered.filter(r => r.status === 'prayed')

  if (loading) return <div style={styles.container}><p>Loading prayer requests...</p></div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🙏 Prayer Requests</h1>
        <Button onClick={() => setShowModal(true)}>+ Submit Prayer Request</Button>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
            <option value="">All</option>
            <option value="new">New</option>
            <option value="prayed">Prayed</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Visibility:</label>
          <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)} style={styles.filterSelect}>
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        {(filterStatus || filterVisibility) && (
          <Button variant="secondary" onClick={() => { setFilterStatus(''); setFilterVisibility('') }}>Clear</Button>
        )}
      </div>

      {/* New Requests */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🆕 New Requests ({newRequests.length})</h2>
        <div style={styles.list}>
          {newRequests.length === 0 ? (
            <p style={styles.empty}>No new prayer requests.</p>
          ) : newRequests.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              isAdmin={isAdmin}
              isOwn={isOwn(req)}
              onStatusChange={updateStatus}
              onVisibilityChange={updateVisibility}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>

      {/* Prayed Requests */}
      {prayedRequests.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>✅ Prayed Requests ({prayedRequests.length})</h2>
          <div style={styles.list}>
            {prayedRequests.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                isAdmin={isAdmin}
                isOwn={isOwn(req)}
                onStatusChange={updateStatus}
                onVisibilityChange={updateVisibility}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {prayerRequests.length === 0 && (
        <p style={styles.empty}>No prayer requests found. Submit your first prayer request!</p>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Submit Prayer Request</h2>

            {/* Admin picks a member; member submits as themselves */}
            {isAdmin && (
              <div style={styles.field}>
                <label style={styles.label}>Member *</label>
                <select name="member_id" value={form.member_id || ''} onChange={handleChange} style={styles.input}>
                  <option value="">Select member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Prayer request title" style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe your prayer request..." rows="5" style={{ ...styles.input, resize: 'vertical' }} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Visibility</label>
              <select name="visibility" value={form.visibility} onChange={handleChange} style={styles.input}>
                <option value="public">Public — everyone can see</option>
                <option value="private">Private — only admin can see</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Request card ──────────────────────────────────────────────────────────────
function RequestCard({ req, isAdmin, isOwn, onStatusChange, onVisibilityChange, onDelete, formatDate }) {
  const canManage = isAdmin || isOwn

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${req.status === 'prayed' ? '#10b981' : '#3b82f6'}`, opacity: req.status === 'prayed' ? 0.9 : 1 }}>
      <div style={styles.cardTop}>
        <h3 style={styles.cardTitle}>{req.title}</h3>
        <div style={styles.badges}>
          <span style={{ ...styles.badge, backgroundColor: req.status === 'new' ? '#dbeafe' : '#d1fae5', color: req.status === 'new' ? '#1e40af' : '#065f46' }}>
            {req.status === 'new' ? 'New' : 'Prayed'}
          </span>
          <span style={{ ...styles.badge, backgroundColor: req.visibility === 'public' ? '#e0e7ff' : '#fef3c7', color: req.visibility === 'public' ? '#3730a3' : '#92400e' }}>
            {req.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
          </span>
          {isOwn && <span style={{ ...styles.badge, backgroundColor: '#f0fdf4', color: '#166534' }}>Mine</span>}
        </div>
      </div>

      <p style={styles.cardMessage}>{req.message}</p>

      <div style={styles.cardMeta}>
        <span>👤 {req.member_name}</span>
        <span>📅 {formatDate(req.created_at)}</span>
      </div>

      {canManage && (
        <div style={styles.cardActions}>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => onStatusChange(req.id, req.status === 'new' ? 'prayed' : 'new')}>
                {req.status === 'new' ? 'Mark Prayed' : 'Mark New'}
              </Button>
              <Button variant="outline" onClick={() => onVisibilityChange(req.id, req.visibility === 'public' ? 'private' : 'public')}>
                Toggle Visibility
              </Button>
              <Button variant="danger" onClick={() => onDelete(req.id)}>Delete</Button>
            </>
          )}
          {!isAdmin && isOwn && (
            <Button variant="danger" onClick={() => onDelete(req.id)}>Delete</Button>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', color: '#1f2937', margin: 0 },
  filterSection: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  filterLabel: { fontSize: '14px', fontWeight: '500', color: '#374151' },
  filterSelect: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', minWidth: '140px' },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '20px', color: '#1f2937', marginBottom: '16px', fontWeight: '600' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTop: { marginBottom: '10px' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '17px', color: '#1f2937', fontWeight: '600' },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' },
  cardMessage: { margin: '0 0 12px 0', fontSize: '14px', color: '#374151', lineHeight: '1.6', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' },
  cardMeta: { display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', marginBottom: '12px', flexWrap: 'wrap' },
  cardActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  empty: { textAlign: 'center', color: '#6b7280', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }
}

export default PrayerRequests
