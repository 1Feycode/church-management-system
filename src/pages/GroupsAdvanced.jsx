import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function GroupsAdvanced() {
  const [groups, setGroups] = useState([])       // groups with leader + member list
  const [allMembers, setAllMembers] = useState([]) // every member (for pickers)
  const [loading, setLoading] = useState(true)

  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showLeaderModal, setShowLeaderModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  const [editingGroup, setEditingGroup] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState({})

  useEffect(() => { loadData() }, [])

  // ── Load everything ────────────────────────────────────────────────────
  async function loadData() {
    try {
      setLoading(true)

      const [
        { data: groupsData, error: gErr },
        { data: membersData, error: mErr },
        { data: gmData, error: gmErr }
      ] = await Promise.all([
        supabase.from('groups').select('*').order('name'),
        supabase.from('members').select('id, name, phone, gender').order('name'),
        supabase.from('group_members').select('group_id, member_id')
      ])

      if (gErr) throw gErr
      if (mErr) throw mErr
      if (gmErr) throw gmErr

      // Build a map: group_id → member rows
      const memberMap = {}
      ;(gmData || []).forEach(({ group_id, member_id }) => {
        if (!memberMap[group_id]) memberMap[group_id] = []
        const member = (membersData || []).find(m => m.id === member_id)
        if (member) memberMap[group_id].push(member)
      })

      // Attach leader name + members list to each group
      const enriched = (groupsData || []).map(g => ({
        ...g,
        leader: (membersData || []).find(m => m.id === g.leader_id) || null,
        members: memberMap[g.id] || []
      }))

      setGroups(enriched)
      setAllMembers(membersData || [])
    } catch (err) {
      console.error('Error loading data:', err)
      alert('Error loading data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Group CRUD ─────────────────────────────────────────────────────────
  async function handleSaveGroup() {
    if (!form.name.trim()) { alert('Please enter a group name.'); return }
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() }
      const { error } = editingGroup
        ? await supabase.from('groups').update(payload).eq('id', editingGroup.id)
        : await supabase.from('groups').insert([payload])
      if (error) throw error
      closeGroupModal()
      await loadData()
    } catch (err) {
      alert('Error saving group: ' + err.message)
    }
  }

  async function handleDeleteGroup(id) {
    if (!window.confirm('Delete this group? Members will be removed from it.')) return
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id)
      if (error) throw error
      setGroups(groups.filter(g => g.id !== id))
    } catch (err) {
      alert('Error deleting group: ' + err.message)
    }
  }

  function openEditGroup(group) {
    setEditingGroup(group)
    setForm({ name: group.name, description: group.description || '' })
    setShowGroupModal(true)
  }

  function closeGroupModal() {
    setShowGroupModal(false)
    setEditingGroup(null)
    setForm({ name: '', description: '' })
  }

  // ── Leader assignment ──────────────────────────────────────────────────
  async function assignLeader(memberId) {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ leader_id: memberId || null })
        .eq('id', selectedGroup.id)
      if (error) throw error
      setShowLeaderModal(false)
      setSelectedGroup(null)
      await loadData()
    } catch (err) {
      alert('Error assigning leader: ' + err.message)
    }
  }

  // ── Member management ──────────────────────────────────────────────────
  async function addMemberToGroup(memberId) {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: selectedGroup.id, member_id: memberId }])
      if (error) throw error
      await loadData()
      // Refresh selectedGroup reference
      setSelectedGroup(prev => ({
        ...prev,
        members: [...prev.members, allMembers.find(m => m.id === memberId)]
      }))
    } catch (err) {
      alert('Error adding member: ' + err.message)
    }
  }

  async function removeMemberFromGroup(memberId) {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroup.id)
        .eq('member_id', memberId)
      if (error) throw error
      await loadData()
      setSelectedGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }))
    } catch (err) {
      alert('Error removing member: ' + err.message)
    }
  }

  // ── Attendance ─────────────────────────────────────────────────────────
  function openAttendanceModal(group) {
    setSelectedGroup(group)
    const records = {}
    group.members.forEach(m => { records[m.id] = 'present' })
    setAttendanceRecords(records)
    setShowAttendanceModal(true)
  }

  async function saveAttendance() {
    try {
      const rows = Object.entries(attendanceRecords).map(([memberId, status]) => ({
        group_id: selectedGroup.id,
        member_id: parseInt(memberId),
        date: attendanceDate,
        status
      }))
      const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'group_id,member_id,date' })
      if (error) throw error
      alert('Attendance saved!')
      setShowAttendanceModal(false)
      setSelectedGroup(null)
      setAttendanceRecords({})
    } catch (err) {
      alert('Error saving attendance: ' + err.message)
    }
  }

  if (loading) return <div style={s.container}><p>Loading groups...</p></div>

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Groups Management</h1>
        <Button onClick={() => { setEditingGroup(null); setForm({ name: '', description: '' }); setShowGroupModal(true) }}>
          + Create Group
        </Button>
      </div>

      {groups.length === 0 && <p style={s.empty}>No groups yet. Create your first group!</p>}

      <div style={s.grid}>
        {groups.map(group => (
          <div key={group.id} style={s.card}>
            <div style={s.cardTop}>
              <h3 style={s.groupName}>{group.name}</h3>
              {group.description && <p style={s.desc}>{group.description}</p>}
            </div>

            <div style={s.infoBox}>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>👥 Members</span>
                <span style={s.infoVal}>{group.members.length}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>👑 Leader</span>
                <span style={s.infoVal}>{group.leader?.name || 'Not assigned'}</span>
              </div>
            </div>

            {/* Member chips */}
            {group.members.length > 0 && (
              <div style={s.chips}>
                {group.members.slice(0, 5).map(m => (
                  <span key={m.id} style={s.chip}>{m.name}</span>
                ))}
                {group.members.length > 5 && (
                  <span style={{ ...s.chip, background: '#e5e7eb', color: '#6b7280' }}>
                    +{group.members.length - 5} more
                  </span>
                )}
              </div>
            )}

            <div style={s.cardActions}>
              <Button variant="outline" onClick={() => openEditGroup(group)}>Edit</Button>
              <Button variant="outline" onClick={() => { setSelectedGroup(group); setShowLeaderModal(true) }}>Leader</Button>
              <Button variant="outline" onClick={() => { setSelectedGroup(group); setShowMembersModal(true) }}>Members</Button>
              <Button variant="outline" onClick={() => openAttendanceModal(group)}>Attendance</Button>
              <Button variant="danger" onClick={() => handleDeleteGroup(group.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Group Modal ── */}
      {showGroupModal && (
        <Modal title={editingGroup ? 'Edit Group' : 'Create Group'} onClose={closeGroupModal}>
          <Field label="Group Name *">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Youth Ministry" style={s.input} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" style={{ ...s.input, resize: 'vertical' }} />
          </Field>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={closeGroupModal}>Cancel</Button>
            <Button onClick={handleSaveGroup}>{editingGroup ? 'Update' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {/* ── Assign Leader Modal ── */}
      {showLeaderModal && selectedGroup && (
        <Modal title={`Set Leader — ${selectedGroup.name}`} onClose={() => setShowLeaderModal(false)}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            Current: <strong>{selectedGroup.leader?.name || 'None'}</strong>
          </p>
          <div style={s.scrollList}>
            {/* Remove leader option */}
            <div style={s.listRow}>
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>— No leader</span>
              <Button variant="outline" onClick={() => assignLeader(null)}>Remove</Button>
            </div>
            {allMembers.map(m => (
              <div key={m.id} style={s.listRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  {m.phone && <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.phone}</div>}
                </div>
                <Button variant={selectedGroup.leader?.id === m.id ? 'primary' : 'outline'} onClick={() => assignLeader(m.id)}>
                  {selectedGroup.leader?.id === m.id ? '✓ Leader' : 'Set'}
                </Button>
              </div>
            ))}
          </div>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => setShowLeaderModal(false)}>Close</Button>
          </div>
        </Modal>
      )}

      {/* ── Manage Members Modal ── */}
      {showMembersModal && selectedGroup && (
        <Modal title={`Members — ${selectedGroup.name}`} onClose={() => setShowMembersModal(false)}>
          {/* Current members */}
          <div style={{ marginBottom: 20 }}>
            <div style={s.sectionLabel}>Current Members ({selectedGroup.members.length})</div>
            {selectedGroup.members.length === 0
              ? <p style={{ fontSize: 13, color: '#9ca3af' }}>No members yet.</p>
              : (
                <div style={s.scrollList}>
                  {selectedGroup.members.map(m => (
                    <div key={m.id} style={s.listRow}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                      <Button variant="danger" onClick={() => removeMemberFromGroup(m.id)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Add members */}
          <div>
            <div style={s.sectionLabel}>Add Members</div>
            <div style={s.scrollList}>
              {allMembers
                .filter(m => !selectedGroup.members.find(sm => sm.id === m.id))
                .map(m => (
                  <div key={m.id} style={s.listRow}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                    <Button variant="outline" onClick={() => addMemberToGroup(m.id)}>+ Add</Button>
                  </div>
                ))
              }
              {allMembers.filter(m => !selectedGroup.members.find(sm => sm.id === m.id)).length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af' }}>All members are already in this group.</p>
              )}
            </div>
          </div>

          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => setShowMembersModal(false)}>Close</Button>
          </div>
        </Modal>
      )}

      {/* ── Attendance Modal ── */}
      {showAttendanceModal && selectedGroup && (
        <Modal title={`Attendance — ${selectedGroup.name}`} onClose={() => setShowAttendanceModal(false)}>
          <Field label="Date">
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} style={s.input} />
          </Field>
          <div style={s.scrollList}>
            {selectedGroup.members.length === 0
              ? <p style={{ fontSize: 13, color: '#9ca3af' }}>No members in this group.</p>
              : selectedGroup.members.map(m => (
                <div key={m.id} style={s.attendanceRow}>
                  <label style={s.checkLabel}>
                    <input
                      type="checkbox"
                      checked={attendanceRecords[m.id] === 'present'}
                      onChange={() => setAttendanceRecords(prev => ({ ...prev, [m.id]: prev[m.id] === 'present' ? 'absent' : 'present' }))}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                  </label>
                  <span style={{ ...s.badge, background: attendanceRecords[m.id] === 'present' ? '#10b981' : '#ef4444' }}>
                    {attendanceRecords[m.id] === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))
            }
          </div>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</Button>
            <Button onClick={saveAttendance}>Save Attendance</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  container: { padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, color: '#1f2937', margin: 0, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop: {},
  groupName: { margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' },
  desc: { margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
  infoBox: { background: '#f9fafb', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  infoLabel: { color: '#6b7280', fontWeight: 500 },
  infoVal: { color: '#111827', fontWeight: 600 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { background: '#ede9fe', color: '#5b21b6', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  cardActions: { display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f3f4f6' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  scrollList: { maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  listRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: 8 },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  attendanceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: 8 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#fff' }
}

export default GroupsAdvanced
