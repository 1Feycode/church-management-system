import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

const EVENT_TYPES = [
  'Sunday Service',
  'Prayer Meeting',
  'Bible Study',
  'Choir Practice',
  'Youth Meeting',
  'Special Program',
  'Other'
]

function Events() {
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: '',
    event_date: '',
    location: ''
  })

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        throw error
      }

      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
      alert('Error loading events: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    if (!form.title || !form.event_type || !form.event_date) {
      alert('Please fill in Title, Event Type, and Date fields.')
      return
    }

    try {
      let error

      if (editingEvent) {
        // Update existing event
        ;({ error } = await supabase
          .from('events')
          .update({
            title: form.title,
            description: form.description,
            event_type: form.event_type,
            event_date: form.event_date,
            location: form.location || null
          })
          .eq('id', editingEvent.id)
          .select())
      } else {
        // Create new event
        ;({ error } = await supabase
          .from('events')
          .insert([{
            title: form.title,
            description: form.description,
            event_type: form.event_type,
            event_date: form.event_date,
            location: form.location || null
          }])
          .select())
      }

      if (error) {
        console.error('Error saving event:', error)
        alert('Error saving event: ' + error.message)
        return
      }

      closeModal()
      await loadEvents()
      alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!')
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event: ' + error.message)
    }
  }

  function handleEditClick(event) {
    setEditingEvent(event)
    setForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      event_date: event.event_date.split('+')[0], // Remove timezone for input
      location: event.location || ''
    })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting event:', error)
        alert('Error deleting event: ' + error.message)
        return
      }

      setEvents(events.filter((e) => e.id !== id))
      alert('Event deleted successfully!')
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingEvent(null)
    setForm({
      title: '',
      description: '',
      event_type: '',
      event_date: '',
      location: ''
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function isUpcoming(dateString) {
    return new Date(dateString) >= new Date()
  }

  const filteredEvents = filterType
    ? events.filter(e => e.event_type === filterType)
    : events

  const upcomingEvents = filteredEvents.filter(e => isUpcoming(e.event_date))
  const pastEvents = filteredEvents.filter(e => !isUpcoming(e.event_date))

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading events...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Events & Schedule</h1>
        {isAdmin && (
          <Button onClick={() => { setEditingEvent(null); setShowModal(true); }}>
            + Create Event
          </Button>
        )}
      </div>

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>Filter by Type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Events</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {filterType && (
          <Button variant="secondary" onClick={() => setFilterType('')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Upcoming Events */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📅 Upcoming Events ({upcomingEvents.length})</h2>
        <div style={styles.eventsList}>
          {upcomingEvents.length === 0 ? (
            <p style={styles.empty}>No upcoming events found.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventHeader}>
                  <div>
                    <h3 style={styles.eventTitle}>{event.title}</h3>
                    <span style={styles.eventType}>{event.event_type}</span>
                  </div>
                  <div style={styles.actions}>
                    {isAdmin && (
                      <>
                        <Button variant="outline" onClick={() => handleEditClick(event)}>Edit</Button>
                        <Button variant="danger" onClick={() => handleDelete(event.id)}>Delete</Button>
                      </>
                    )}
                  </div>
                </div>

                <div style={styles.eventDetails}>
                  <div style={styles.eventInfo}>
                    <span style={styles.icon}>🕒</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div style={styles.eventInfo}>
                      <span style={styles.icon}>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p style={styles.eventDescription}>{event.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📜 Past Events ({pastEvents.length})</h2>
          <div style={styles.eventsList}>
            {pastEvents.map((event) => (
              <div key={event.id} style={{ ...styles.eventCard, ...styles.pastEvent }}>
                <div style={styles.eventHeader}>
                  <div>
                    <h3 style={styles.eventTitle}>{event.title}</h3>
                    <span style={styles.eventType}>{event.event_type}</span>
                  </div>
                  <div style={styles.actions}>
                    {isAdmin && (
                      <Button variant="danger" onClick={() => handleDelete(event.id)}>Delete</Button>
                    )}
                  </div>
                </div>

                <div style={styles.eventDetails}>
                  <div style={styles.eventInfo}>
                    <span style={styles.icon}>🕒</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div style={styles.eventInfo}>
                      <span style={styles.icon}>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p style={styles.eventDescription}>{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p style={styles.empty}>{isAdmin ? 'No events found. Create your first event!' : 'No events found.'}</p>
      )}

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Event Type *</label>
              <select
                name="event_type"
                value={form.event_type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date & Time *</label>
              <input
                name="event_date"
                type="datetime-local"
                value={form.event_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter event location (optional)"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter event description (optional)"
                rows="4"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingEvent ? 'Update' : 'Save'}
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
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    minWidth: '200px'
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
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #3b82f6'
  },
  pastEvent: {
    opacity: 0.7,
    borderLeft: '4px solid #9ca3af'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  eventTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    color: '#1f2937',
    fontWeight: '600'
  },
  eventType: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px'
  },
  eventInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280'
  },
  icon: {
    fontSize: '16px'
  },
  eventDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0
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

export default Events
