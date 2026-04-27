import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  // Fetch groups from Supabase on component mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('groups')
          .select('*')
        
        console.log('groups data:', data)
        console.log('groups error:', error)
        
        if (error) {
          console.error('Error fetching groups:', error)
          return
        }
        
        setGroups(data || [])
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    if (!form.name) {
      alert('Please enter a group name.')
      return
    }

    try {
      let data, error
      
      if (editingGroup) {
        // Edit existing group
        ;({ data, error } = await supabase
          .from('groups')
          .update({
            name: form.name,
            description: form.description
          })
          .eq('id', editingGroup.id)
          .select())
      } else {
        // Create new group
        ;({ data, error } = await supabase
          .from('groups')
          .insert([{
            name: form.name,
            description: form.description
          }])
          .select())
      }

      console.log('save data:', data)
      console.log('save error:', error)

      if (error) {
        console.error('Error saving group:', error)
        alert('Error saving group: ' + error.message)
        return
      }

      if (editingGroup) {
        // Update in local state
        setGroups(groups.map((g) => g.id === editingGroup.id ? data[0] : g))
      } else {
        // Add to local state
        setGroups([...groups, data[0]])
      }
      
      closeModal()
    } catch (error) {
      console.error('Error saving group:', error)
      alert('Error saving group: ' + error.message)
    }
  }

  function handleEditClick(group) {
    setEditingGroup(group)
    setForm({ name: group.name, description: group.description || '' })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this group?')) return

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting group:', error)
        alert('Error deleting group: ' + error.message)
        return
      }

      setGroups(groups.filter((g) => g.id !== id))
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('Error deleting group: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingGroup(null)
    setForm({ name: '', description: '' })
  }

  function handleCancel() {
    setForm({ name: '', description: '' })
    setShowModal(false)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading groups...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Groups</h1>
        <Button onClick={() => { setEditingGroup(null); setShowModal(true); }}>+ Create Group</Button>
      </div>

      <div style={styles.grid}>
        {groups.map((group) => (
          <div key={group.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.groupName}>{group.name}</h3>
            </div>
            
            <p style={styles.description}>{group.description}</p>
            
            <div style={styles.cardFooter}>
              <div style={styles.actions}>
                <Button variant="outline" onClick={() => handleEditClick(group)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(group.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <p style={styles.empty}>No groups found. Create your first group!</p>
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingGroup ? 'Edit Group' : 'Create Group'}
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>Group Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter group name"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter group description (optional)"
                rows="4"
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingGroup ? 'Update' : 'Save'}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  groupName: { margin: 0, fontSize: '18px', color: '#1f2937' },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  },
  actions: { display: 'flex', gap: '8px' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: '40px' },
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
    maxWidth: '480px',
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

export default Groups