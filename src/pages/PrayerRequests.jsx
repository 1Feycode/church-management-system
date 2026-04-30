import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function PrayerRequests() {
  const [prayerRequests, setPrayerRequests] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('')
  const [form, setForm] = useState({
    member_id: '',
    title: '',
    message: '',
    visibility: 'public'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // Fetch prayer requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Error fetching prayer requests:', requestsError)
        throw requestsError
      }

      // Fetch members to get names
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name')

      if (membersError) {
        console.error('Error fetching members:', membersError)
        throw membersError
      }

      // Manually attach member name to each request
      const requestsWithMembers = requestsData.map(request => {
        const member = membersData.find(m => m.id === request.member_id)
        return {
          ...request,
          member_name: member ? member.name : 'Unknown'
        }
      })

      setPrayerRequests(requestsWithMembers || [])
      setMembers(membersData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    // Trim whitespace from inputs
    const trimmedTitle = form.title.trim()
    const trimmedMessage = form.message.trim()
    
    if (!form.member_id || !trimmedTitle || !trimmedMessage) {
      alert('Please fill in all required fields (Member, Title, and Message).')
      return
    }

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([{
          member_id: Number(form.member_id),
          title: trimmedTitle,
          message: trimmedMessage,
          visibility: form.visibility,
          status: 'new'
        }])
        .select()

      if (error) {
        console.error('Error submitting prayer request:', error)
        alert('Error submitting prayer request: ' + error.message)
        return
      }

      closeModal()
      await loadData()
      alert('Prayer request submitted successfully!')
    } catch (error) {
      console.error('Error submitting prayer request:', error)
      alert('Error submitting prayer request: ' + error.message)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error updating status:', error)
        alert('Error updating status: ' + error.message)
        return
      }

      await loadData()
      alert(`Prayer request marked as ${newStatus}!`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status: ' + error.message)
    }
  }

  async function updateVisibility(id, newVisibility) {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ visibility: newVisibility })
        .eq('id', id)

      if (error) {
        console.error('Error updating visibility:', error)
        alert('Error updating visibility: ' + error.message)
        return
      }

      await loadData()
      alert(`Visibility changed to ${newVisibility}!`)
    } catch (error) {
      console.error('Error updating visibility:', error)
      alert('Error updating visibility: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this prayer request?')) return

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting prayer request:', error)
        alert('Error deleting prayer request: ' + error.message)
        return
      }

      setPrayerRequests(prayerRequests.filter((pr) => pr.id !== id))
      alert('Prayer request deleted successfully!')
    } catch (error) {
      console.error('Error deleting prayer request:', error)
      alert('Error deleting prayer request: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setForm({
      member_id: '',
      title: '',
      message: '',
      visibility: 'public'
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRequests = prayerRequests.filter(request => {
    const matchesStatus = filterStatus === '' || request.status === filterStatus
    const matchesVisibility = filterVisibility === '' || request.visibility === filterVisibility
    return matchesStatus && matchesVisibility
  })

  const newRequests = filteredRequests.filter(r => r.status === 'new')
  const prayedRequests = filteredRequests.filter(r => r.status === 'prayed')

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading prayer requests...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🙏 Prayer Requests</h1>
        <Button onClick={() => setShowModal(true)}>+ Submit Prayer Request</Button>
      </div>

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="prayed">Prayed</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Visibility:</label>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {(filterStatus || filterVisibility) && (
          <Button variant="secondary" onClick={() => { setFilterStatus(''); setFilterVisibility(''); }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* New Prayer Requests */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🆕 New Requests ({newRequests.length})</h2>
        <div style={styles.requestsList}>
          {newRequests.length === 0 ? (
            <p style={styles.empty}>No new prayer requests.</p>
          ) : (
            newRequests.map((request) => (
              <div key={request.id} style={styles.requestCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.requestTitle}>{request.title}</h3>
                    <div style={styles.badges}>
                      <span style={styles.statusBadgeNew}>New</span>
                      <span style={request.visibility === 'public' ? styles.visibilityBadgePublic : styles.visibilityBadgePrivate}>
                        {request.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={styles.requestMessage}>{request.message}</p>

                <div style={styles.cardFooter}>
                  <div style={styles.requestInfo}>
                    <span style={styles.infoLabel}>👤 Submitted by:</span>
                    <span style={styles.infoValue}>{request.member_name}</span>
                  </div>
                  <div style={styles.requestInfo}>
                    <span style={styles.infoLabel}>📅 Date:</span>
                    <span style={styles.infoValue}>{formatDate(request.created_at)}</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <Button variant="outline" onClick={() => updateStatus(request.id, 'prayed')}>
                    Mark as Prayed
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => updateVisibility(request.id, request.visibility === 'public' ? 'private' : 'public')}
                  >
                    Toggle Visibility
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(request.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prayed Requests */}
      {prayedRequests.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>✅ Prayed Requests ({prayedRequests.length})</h2>
          <div style={styles.requestsList}>
            {prayedRequests.map((request) => (
              <div key={request.id} style={{ ...styles.requestCard, ...styles.prayedCard }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.requestTitle}>{request.title}</h3>
                    <div style={styles.badges}>
                      <span style={styles.statusBadgePrayed}>Prayed</span>
                      <span style={request.visibility === 'public' ? styles.visibilityBadgePublic : styles.visibilityBadgePrivate}>
                        {request.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={styles.requestMessage}>{request.message}</p>

                <div style={styles.cardFooter}>
                  <div style={styles.requestInfo}>
                    <span style={styles.infoLabel}>👤 Submitted by:</span>
                    <span style={styles.infoValue}>{request.member_name}</span>
                  </div>
                  <div style={styles.requestInfo}>
                    <span style={styles.infoLabel}>📅 Date:</span>
                    <span style={styles.infoValue}>{formatDate(request.created_at)}</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <Button variant="outline" onClick={() => updateStatus(request.id, 'new')}>
                    Mark as New
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => updateVisibility(request.id, request.visibility === 'public' ? 'private' : 'public')}
                  >
                    Toggle Visibility
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(request.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prayerRequests.length === 0 && (
        <p style={styles.empty}>No prayer requests found. Submit your first prayer request!</p>
      )}

      {/* Submit Prayer Request Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Submit Prayer Request</h2>

            <div style={styles.field}>
              <label style={styles.label}>Member *</label>
              <select
                name="member_id"
                value={form.member_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter prayer request title"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Enter your prayer request details"
                rows="6"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Visibility *</label>
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="public">Public - Everyone can see</option>
                <option value="private">Private - Only admin can see</option>
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

const styles = {
  container: { padding: '20px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: { fontSize: '28px', color: '#1f2937', margin: 0 },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    minWidth: '150px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#1f2937',
    marginBottom: '16px',
    fontWeight: '600'
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #3b82f6'
  },
  prayedCard: {
    borderLeft: '4px solid #10b981',
    opacity: 0.9
  },
  cardHeader: {
    marginBottom: '12px'
  },
  requestTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    color: '#1f2937',
    fontWeight: '600'
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  statusBadgeNew: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusBadgePrayed: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  visibilityBadgePublic: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  visibilityBadgePrivate: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  requestMessage: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  requestInfo: {
    display: 'flex',
    gap: '8px',
    fontSize: '14px'
  },
  infoLabel: {
    color: '#6b7280',
    fontWeight: '500'
  },
  infoValue: {
    color: '#1f2937',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#1f2937'
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px'
  }
}

export default PrayerRequests
