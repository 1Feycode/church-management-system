import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function BibleStudies() {
  const navigate = useNavigate()
  const [bibleStudies, setBibleStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({
    title: '',
    verses: '',
    notes: ''
  })

  useEffect(() => {
    loadBibleStudies()
  }, [])

  async function loadBibleStudies() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bible studies:', error)
        throw error
      }

      console.log('Bible studies data:', data)
      setBibleStudies(data || [])
    } catch (error) {
      console.error('Error loading bible studies:', error)
      alert('Error loading bible studies: ' + error.message)
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
    const trimmedVerses = form.verses.trim()
    const trimmedNotes = form.notes.trim()

    if (!trimmedTitle || !trimmedVerses || !trimmedNotes) {
      alert('Please fill in all required fields (Title, Verses, and Notes).')
      return
    }

    try {
      const { data, error } = await supabase
        .from('bible_studies')
        .insert([{
          title: trimmedTitle,
          verses: trimmedVerses,
          notes: trimmedNotes
        }])
        .select()

      console.log('Submit data:', data)
      console.log('Submit error:', error)

      if (error) {
        console.error('Error publishing bible study:', error)
        alert('Error publishing bible study: ' + error.message)
        return
      }

      closeModal()
      await loadBibleStudies()
      alert('Bible study published successfully!')
    } catch (error) {
      console.error('Error publishing bible study:', error)
      alert('Error publishing bible study: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this Bible study?')) return

    try {
      const { error } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting bible study:', error)
        alert('Error deleting bible study: ' + error.message)
        return
      }

      setBibleStudies(bibleStudies.filter((study) => study.id !== id))
      alert('Bible study deleted successfully!')
    } catch (error) {
      console.error('Error deleting bible study:', error)
      alert('Error deleting bible study: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setForm({
      title: '',
      verses: '',
      notes: ''
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter bible studies by search term
  const filteredStudies = bibleStudies.filter(study => {
    const searchLower = searchTerm.toLowerCase()
    return (
      study.title.toLowerCase().includes(searchLower) ||
      study.verses.toLowerCase().includes(searchLower) ||
      study.notes.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading Bible studies...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📖 Bible Studies</h1>
        <Button onClick={() => setShowModal(true)}>+ Publish Bible Study</Button>
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="🔍 Search by title, verses, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <Button variant="secondary" onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        )}
      </div>

      {/* Bible Studies List */}
      <div style={styles.studiesList}>
        {filteredStudies.length === 0 && searchTerm === '' ? (
          <p style={styles.empty}>No Bible studies found. Publish your first study!</p>
        ) : filteredStudies.length === 0 && searchTerm !== '' ? (
          <p style={styles.empty}>No Bible studies match your search.</p>
        ) : (
          filteredStudies.map((study) => (
            <div key={study.id} style={styles.studyCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.studyTitle}>{study.title}</h2>
                  <p style={styles.studyDate}>📅 {formatDate(study.created_at)}</p>
                </div>
                <div style={styles.cardActions}>
                  <Button onClick={() => navigate(`/bible-study/${study.id}`)}>
                    📖 Read
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(study.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              <div style={styles.versesSection}>
                <div style={styles.versesLabel}>📜 Scripture:</div>
                <div style={styles.versesText}>{study.verses}</div>
              </div>

              <div style={styles.notesSection}>
                <div style={styles.notesLabel}>✍️ Study Notes:</div>
                <div style={styles.notesText}>{study.notes}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Bible Study Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Publish Bible Study</h2>

            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Faith and Trust in God"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Bible Verses *</label>
              <textarea
                name="verses"
                value={form.verses}
                onChange={handleChange}
                placeholder="e.g., John 3:16 - For God so loved the world..."
                rows="4"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Study Notes *</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Enter your teaching, explanation, and insights..."
                rows="8"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSubmit}>Publish</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { 
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: { 
    fontSize: '28px', 
    color: '#1f2937', 
    margin: 0 
  },
  searchSection: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none'
  },
  studiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  studyCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '5px solid #8b5cf6'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '12px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  studyTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    color: '#1f2937',
    fontWeight: '700'
  },
  studyDate: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  versesSection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#faf5ff',
    borderRadius: '8px',
    borderLeft: '4px solid #8b5cf6'
  },
  versesLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6b21a8',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  versesText: {
    fontSize: '16px',
    color: '#1f2937',
    lineHeight: '1.8',
    fontStyle: 'italic',
    fontWeight: '500'
  },
  notesSection: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  notesLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  notesText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '60px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    fontSize: '16px'
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
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: {
    margin: '0 0 24px 0',
    fontSize: '22px',
    color: '#1f2937',
    fontWeight: '700'
  },
  field: { 
    marginBottom: '20px' 
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px'
  }
}

export default BibleStudies
