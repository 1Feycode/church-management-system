import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [form, setForm] = useState({ title: '', message: '' })

  // Fetch announcements from Supabase on component mount
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })

        console.log('announcements data:', data)
        console.log('announcements error:', error)

        if (error) {
          console.error('Error fetching announcements:', error)
          return
        }

        setAnnouncements(data || [])
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    if (!form.title || !form.message) {
      alert('Please fill in Title and Message fields.')
      return
    }

    try {
      let data, error
      
      if (editingAnnouncement) {
        // Edit existing announcement
        ;({ data, error } = await supabase
          .from('announcements')
          .update({
            title: form.title,
            message: form.message
          })
          .eq('id', editingAnnouncement.id)
          .select())
      } else {
        // Create new announcement
        ;({ data, error } = await supabase
          .from('announcements')
          .insert([{
            title: form.title,
            message: form.message
          }])
          .select())
      }

      console.log('save data:', data)
      console.log('save error:', error)

      if (error) {
        console.error('Error saving announcement:', error)
        alert('Error saving announcement: ' + error.message)
        return
      }

      if (editingAnnouncement) {
        // Update in local state
        setAnnouncements(announcements.map((a) => a.id === editingAnnouncement.id ? data[0] : a))
      } else {
        // Add to local state
        setAnnouncements([data[0], ...announcements])
      }
      
      closeModal()
    } catch (error) {
      console.error('Error saving announcement:', error)
      alert('Error saving announcement: ' + error.message)
    }
  }

  function handleEditClick(announcement) {
    setEditingAnnouncement(announcement)
    setForm({ title: announcement.title, message: announcement.message })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting announcement:', error)
        alert('Error deleting announcement: ' + error.message)
        return
      }

      setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Error deleting announcement: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingAnnouncement(null)
    setForm({ title: '', message: '' })
  }

  function handleCancel() {
    setForm({ title: '', message: '' })
    setShowModal(false)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading announcements...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Announcements</h1>
        <Button onClick={() => { setEditingAnnouncement(null); setShowModal(true); }}>+ Add Announcement</Button>
      </div>

      <div style={styles.list}>
        {announcements.map((announcement) => (
          <div key={announcement.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.announcementTitle}>{announcement.title}</h3>
                <span style={styles.date}>
                  📅 {new Date(announcement.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.actions}>
                <Button variant="outline" onClick={() => handleEditClick(announcement)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(announcement.id)}>Delete</Button>
              </div>
            </div>
            <p style={styles.message}>{announcement.message}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Enter announcement message"
                rows="6"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingAnnouncement ? 'Update' : 'Save'}
              </Button>
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  announcementTitle: {
    margin: '0 0 6px 0',
    fontSize: '18px',
    color: '#1f2937',
    fontWeight: '600'
  },
  date: {
    fontSize: '13px',
    color: '#6b7280'
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0
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
    maxWidth: '520px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: { margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' },
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

export default Announcements
