import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function GroupsAdvanced() {
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showLeaderModal, setShowLeaderModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')

      if (groupsError) {
        console.error('Error fetching groups:', groupsError)
        throw groupsError
      }

      // Fetch all members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, group_id')

      if (membersError) {
        console.error('Error fetching members:', membersError)
        throw membersError
      }

      // Manually attach leader info to each group
      const groupsWithLeaders = groupsData.map(group => {
        const leader = membersData.find(m => m.id === group.leader_id)
        return {
          ...group,
          leader: leader ? { id: leader.id, name: leader.name } : null
        }
      })

      setGroups(groupsWithLeaders || [])
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

  async function handleSave() {
    if (!form.name) {
      alert('Please enter a group name.')
      return
    }

    try {
      let error

      if (editingGroup) {
        ;({ error } = await supabase
          .from('groups')
          .update({
            name: form.name,
            description: form.description
          })
          .eq('id', editingGroup.id)
          .select())
      } else {
        ;({ error } = await supabase
          .from('groups')
          .insert([{
            name: form.name,
            description: form.description
          }])
          .select())
      }

      if (error) {
        console.error('Error saving group:', error)
        alert('Error saving group: ' + error.message)
        return
      }

      closeModal()
      await loadData() // Reload all data
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
        alert('Error deleting group: ' + error.message)
        return
      }

      setGroups(groups.filter((g) => g.id !== id))
    } catch (error) {
      alert('Error deleting group: ' + error.message)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingGroup(null)
    setForm({ name: '', description: '' })
  }

  // Leader Management
  function openLeaderModal(group) {
    setSelectedGroup(group)
    setShowLeaderModal(true)
  }

  async function assignLeader(memberId) {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ leader_id: memberId })
        .eq('id', selectedGroup.id)
        .select()

      if (error) {
        console.error('Error assigning leader:', error)
        alert('Error assigning leader: ' + error.message)
        return
      }

      setShowLeaderModal(false)
      setSelectedGroup(null)
      await loadData() // Reload all data
      alert('Leader assigned successfully!')
    } catch (error) {
      console.error('Error assigning leader:', error)
      alert('Error assigning leader: ' + error.message)
    }
  }

  // Attendance Management
  function openAttendanceModal(group) {
    setSelectedGroup(group)
    setShowAttendanceModal(true)
    loadAttendanceForGroup(group.id)
  }

  async function loadAttendanceForGroup(groupId) {
    try {
      // Get members in this group
      const { data: groupMembers, error } = await supabase
        .from('members')
        .select('id, name')
        .eq('group_id', groupId)

      if (error) throw error

      // Initialize attendance records
      const records = {}
      groupMembers.forEach(member => {
        records[member.id] = 'present'
      })
      setAttendanceRecords(records)
    } catch (error) {
      console.error('Error loading group members:', error)
    }
  }

  function toggleAttendance(memberId) {
    setAttendanceRecords({
      ...attendanceRecords,
      [memberId]: attendanceRecords[memberId] === 'present' ? 'absent' : 'present'
    })
  }

  async function saveAttendance() {
    try {
      const attendanceData = Object.entries(attendanceRecords).map(([memberId, status]) => ({
        group_id: selectedGroup.id,
        member_id: parseInt(memberId),
        date: attendanceDate,
        status: status
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceData, {
          onConflict: 'group_id,member_id,date'
        })

      if (error) {
        alert('Error saving attendance: ' + error.message)
        return
      }

      alert('Attendance saved successfully!')
      setShowAttendanceModal(false)
      setSelectedGroup(null)
      setAttendanceRecords({})
    } catch (error) {
      alert('Error saving attendance: ' + error.message)
    }
  }

  const getGroupMembers = (groupId) => {
    return members.filter(m => m.group_id === groupId)
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
        <h1 style={styles.title}>Groups Management</h1>
        <Button onClick={() => { setEditingGroup(null); setShowModal(true); }}>+ Create Group</Button>
      </div>

      <div style={styles.grid}>
        {groups.map((group) => {
          const groupMembers = getGroupMembers(group.id)
          const memberCount = groupMembers.length

          return (
            <div key={group.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.groupName}>{group.name}</h3>
              </div>

              <p style={styles.description}>{group.description}</p>

              <div style={styles.info}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>👥 Members:</span>
                  <span style={styles.infoValue}>{memberCount}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>👑 Leader:</span>
                  <span style={styles.infoValue}>
                    {group.leader?.name || 'Not assigned'}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.actions}>
                  <Button variant="outline" onClick={() => handleEditClick(group)}>Edit</Button>
                  <Button variant="outline" onClick={() => openLeaderModal(group)}>Set Leader</Button>
                  <Button variant="outline" onClick={() => openAttendanceModal(group)}>Attendance</Button>
                  <Button variant="danger" onClick={() => handleDelete(group.id)}>Delete</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {groups.length === 0 && (
        <p style={styles.empty}>No groups found. Create your first group!</p>
      )}

      {/* Create/Edit Group Modal */}
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
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingGroup ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Leader Modal */}
      {showLeaderModal && selectedGroup && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Assign Leader for {selectedGroup.name}</h2>

            <div style={styles.memberList}>
              {getGroupMembers(selectedGroup.id).length === 0 ? (
                <p style={styles.emptyText}>No members in this group yet.</p>
              ) : (
                getGroupMembers(selectedGroup.id).map((member) => (
                  <div key={member.id} style={styles.memberItem}>
                    <span>{member.name}</span>
                    <Button
                      variant="outline"
                      onClick={() => assignLeader(member.id)}
                    >
                      Set as Leader
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowLeaderModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedGroup && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Take Attendance - {selectedGroup.name}</h2>

            <div style={styles.field}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.attendanceList}>
              {getGroupMembers(selectedGroup.id).length === 0 ? (
                <p style={styles.emptyText}>No members in this group yet.</p>
              ) : (
                getGroupMembers(selectedGroup.id).map((member) => (
                  <div key={member.id} style={styles.attendanceItem}>
                    <label style={styles.attendanceLabel}>
                      <input
                        type="checkbox"
                        checked={attendanceRecords[member.id] === 'present'}
                        onChange={() => toggleAttendance(member.id)}
                        style={styles.checkbox}
                      />
                      <span>{member.name}</span>
                    </label>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: attendanceRecords[member.id] === 'present' ? '#10b981' : '#ef4444'
                    }}>
                      {attendanceRecords[member.id] === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</Button>
              <Button onClick={saveAttendance}>Save Attendance</Button>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
  groupName: { margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: '600' },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
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
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
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
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  memberItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  attendanceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    marginTop: '16px'
  },
  attendanceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  attendanceLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff'
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '20px'
  }
}

export default GroupsAdvanced
