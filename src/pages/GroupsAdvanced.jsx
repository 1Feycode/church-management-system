import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

// ── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ title, onClose, wide, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: wide ? 680 : 500, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
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

// ── Main component ─────────────────────────────────────────────────────────
function GroupsAdvanced() {
  const [groups, setGroups] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Active modal: 'group' | 'leader' | 'members' | 'attendance' | null
  const [modal, setModal] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  // Member search inside modals
  const [memberSearch, setMemberSearch] = useState('')

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState({})

  useEffect(() => { loadData() }, [])

  // ── Data loading ───────────────────────────────────────────────────────
  async function loadData() {
    try {
      setLoading(true)
      const [
        { data: groupsData, error: gErr },
        { data: membersData, error: mErr },
        { data: gmData, error: gmErr }
      ] = await Promise.all([
        supabase.from('groups').select('*').order('name'),
        supabase.from('members').select('id, name, phone, gender, role').order('name'),
        supabase.from('group_members').select('group_id, member_id')
      ])
      if (gErr) throw gErr
      if (mErr) throw mErr
      if (gmErr) throw gmErr

      const memberMap = {}
      ;(gmData || []).forEach(({ group_id, member_id }) => {
        if (!memberMap[group_id]) memberMap[group_id] = []
        const m = (membersData || []).find(x => x.id === member_id)
        if (m) memberMap[group_id].push(m)
      })

      const enriched = (groupsData || []).map(g => ({
        ...g,
        leader: (membersData || []).find(m => m.id === g.leader_id) || null,
        members: memberMap[g.id] || []
      }))

      setGroups(enriched)
      setAllMembers(membersData || [])
    } catch (err) {
      alert('Error loading data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function openModal(type, group) {
    setSelectedGroup(group)
    setModal(type)
    setMemberSearch('')
    if (type === 'attendance') {
      const records = {}
      group.members.forEach(m => { records[m.id] = 'present' })
      setAttendanceRecords(records)
    }
  }

  function closeModal() {
    setModal(null)
    setSelectedGroup(null)
    setMemberSearch('')
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
      setModal(null)
      setEditingGroup(null)
      setForm({ name: '', description: '' })
      await loadData()
    } catch (err) { alert('Error: ' + err.message) }
  }

  async function handleDeleteGroup(id) {
    if (!window.confirm('Delete this group? All memberships will be removed.')) return
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id)
      if (error) throw error
      setGroups(g => g.filter(x => x.id !== id))
    } catch (err) { alert('Error: ' + err.message) }
  }

  // ── Leader ─────────────────────────────────────────────────────────────
  async function assignLeader(memberId) {
    try {
      const { error } = await supabase.from('groups').update({ leader_id: memberId || null }).eq('id', selectedGroup.id)
      if (error) throw error
      await loadData()
      // Refresh selectedGroup so modal updates immediately
      setSelectedGroup(prev => ({
        ...prev,
        leader_id: memberId,
        leader: memberId ? allMembers.find(m => m.id === memberId) : null
      }))
    } catch (err) { alert('Error: ' + err.message) }
  }

  // ── Members ────────────────────────────────────────────────────────────
  async function addMember(memberId) {
    try {
      const { error } = await supabase.from('group_members').insert([{ group_id: selectedGroup.id, member_id: memberId }])
      if (error) throw error
      const newMember = allMembers.find(m => m.id === memberId)
      setSelectedGroup(prev => ({ ...prev, members: [...prev.members, newMember] }))
      setGroups(gs => gs.map(g => g.id === selectedGroup.id ? { ...g, members: [...g.members, newMember] } : g))
    } catch (err) { alert('Error: ' + err.message) }
  }

  async function removeMember(memberId) {
    try {
      const { error } = await supabase.from('group_members').delete().eq('group_id', selectedGroup.id).eq('member_id', memberId)
      if (error) throw error
      setSelectedGroup(prev => ({ ...prev, members: prev.members.filter(m => m.id !== memberId) }))
      setGroups(gs => gs.map(g => g.id === selectedGroup.id ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g))
    } catch (err) { alert('Error: ' + err.message) }
  }

  // ── Attendance ─────────────────────────────────────────────────────────
  async function saveAttendance() {
    try {
      const rows = Object.entries(attendanceRecords).map(([memberId, status]) => ({
        group_id: selectedGroup.id, member_id: parseInt(memberId), date: attendanceDate, status
      }))
      const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'group_id,member_id,date' })
      if (error) throw error
      alert('Attendance saved!')
      closeModal()
    } catch (err) { alert('Error: ' + err.message) }
  }

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.loadingWrap}>
          <div style={s.loadingSpinner}>🤝</div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading groups...</p>
        </div>
      </div>
    )
  }

  const inGroup = selectedGroup ? selectedGroup.members.map(m => m.id) : []
  const notInGroup = allMembers.filter(m => !inGroup.includes(m.id))
  const filteredInGroup = selectedGroup?.members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())) || []
  const filteredNotInGroup = notInGroup.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
  const filteredAllMembers = allMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🤝 Groups Management</h1>
          <p style={s.subtitle}>{groups.length} group{groups.length !== 1 ? 's' : ''} · Members can belong to multiple groups</p>
        </div>
        <Button onClick={() => { setEditingGroup(null); setForm({ name: '', description: '' }); setModal('group') }}>
          + Create Group
        </Button>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div style={s.emptyState}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#1f2937' }}>No groups yet</h2>
          <p style={{ margin: '0 0 20px', color: '#6b7280' }}>Create your first group to start organizing members.</p>
          <Button onClick={() => { setEditingGroup(null); setForm({ name: '', description: '' }); setModal('group') }}>+ Create First Group</Button>
        </div>
      )}

      {/* Groups grid */}
      <div style={s.grid}>
        {groups.map(group => (
          <div key={group.id} style={s.card}>
            {/* Card header */}
            <div style={s.cardHeader}>
              <div style={s.groupAvatar}>{group.name[0].toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={s.groupName}>{group.name}</h3>
                {group.description
                  ? <p style={s.groupDesc}>{group.description}</p>
                  : <p style={{ ...s.groupDesc, fontStyle: 'italic', color: '#d1d5db' }}>No description</p>
                }
              </div>
            </div>

            {/* Stats */}
            <div style={s.statsRow}>
              <div style={s.stat}>
                <span style={s.statNum}>{group.members.length}</span>
                <span style={s.statLabel}>Members</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={{ ...s.statNum, fontSize: 14, fontWeight: 600 }}>{group.leader?.name || '—'}</span>
                <span style={s.statLabel}>Leader</span>
              </div>
            </div>

            {/* Member avatars */}
            {group.members.length > 0 && (
              <div style={s.avatarRow}>
                {group.members.slice(0, 6).map((m, i) => (
                  <div key={m.id} style={{ ...s.miniAvatar, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }} title={m.name}>
                    {m.name[0].toUpperCase()}
                  </div>
                ))}
                {group.members.length > 6 && (
                  <div style={{ ...s.miniAvatar, marginLeft: -8, background: '#e5e7eb', color: '#6b7280', fontSize: 11, fontWeight: 700 }}>
                    +{group.members.length - 6}
                  </div>
                )}
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Leader badge */}
            {group.leader && (
              <div style={s.leaderBadge}>
                <span style={{ fontSize: 14 }}>👑</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{group.leader.name}</span>
                <span style={{ fontSize: 12, color: '#b45309' }}>· Leader</span>
              </div>
            )}

            {/* Actions */}
            <div style={s.cardActions}>
              <button style={s.actionBtn} onClick={() => { setEditingGroup(group); setForm({ name: group.name, description: group.description || '' }); setModal('group') }}>
                ✏️ Edit
              </button>
              <button style={s.actionBtn} onClick={() => openModal('leader', group)}>
                👑 Leader
              </button>
              <button style={{ ...s.actionBtn, background: '#ede9fe', color: '#5b21b6' }} onClick={() => openModal('members', group)}>
                👥 Members
              </button>
              <button style={s.actionBtn} onClick={() => openModal('attendance', group)}>
                📋 Attendance
              </button>
              <button style={{ ...s.actionBtn, background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDeleteGroup(group.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Group Modal ── */}
      {modal === 'group' && (
        <Modal title={editingGroup ? `Edit — ${editingGroup.name}` : 'Create New Group'} onClose={() => { setModal(null); setEditingGroup(null) }}>
          <Field label="Group Name *">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Youth Ministry" style={s.input} autoFocus />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" placeholder="What is this group about?" style={{ ...s.input, resize: 'vertical' }} />
          </Field>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => { setModal(null); setEditingGroup(null) }}>Cancel</Button>
            <Button onClick={handleSaveGroup}>{editingGroup ? 'Update Group' : 'Create Group'}</Button>
          </div>
        </Modal>
      )}

      {/* ── Assign Leader Modal ── */}
      {modal === 'leader' && selectedGroup && (
        <Modal title={`Set Leader — ${selectedGroup.name}`} onClose={closeModal}>
          <div style={s.currentInfo}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Current leader:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginLeft: 6 }}>
              {selectedGroup.leader?.name || 'None assigned'}
            </span>
          </div>
          <div style={s.searchWrap}>
            <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="🔍 Search members..." style={s.searchInput} />
          </div>
          <div style={s.scrollList}>
            <div style={s.listRow} onClick={() => assignLeader(null)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ ...s.listAvatar, background: '#e5e7eb', color: '#9ca3af' }}>—</div>
                <span style={{ fontSize: 14, color: '#9ca3af', fontStyle: 'italic' }}>Remove leader</span>
              </div>
              {!selectedGroup.leader && <span style={s.activeBadge}>Current</span>}
            </div>
            {filteredAllMembers.map(m => {
              const isLeader = selectedGroup.leader?.id === m.id
              return (
                <div key={m.id} style={{ ...s.listRow, ...(isLeader ? s.listRowActive : {}) }} onClick={() => assignLeader(m.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ ...s.listAvatar, background: isLeader ? '#f59e0b' : '#8b5cf6' }}>{m.name[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{m.name}</div>
                      {m.phone && <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.phone}</div>}
                    </div>
                  </div>
                  {isLeader ? <span style={s.activeBadge}>👑 Leader</span> : <span style={s.setBtn}>Set</span>}
                </div>
              )
            })}
          </div>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={closeModal}>Done</Button>
          </div>
        </Modal>
      )}

      {/* ── Manage Members Modal ── */}
      {modal === 'members' && selectedGroup && (
        <Modal title={`Manage Members — ${selectedGroup.name}`} onClose={closeModal} wide>
          <div style={s.searchWrap}>
            <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="🔍 Search all members..." style={s.searchInput} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* In group */}
            <div>
              <div style={s.colHeader}>
                <span style={s.colTitle}>In this group</span>
                <span style={s.colCount}>{selectedGroup.members.length}</span>
              </div>
              <div style={s.scrollList}>
                {filteredInGroup.length === 0
                  ? <p style={s.emptyText}>{memberSearch ? 'No match' : 'No members yet'}</p>
                  : filteredInGroup.map(m => (
                    <div key={m.id} style={s.memberRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ ...s.listAvatar, width: 30, height: 30, fontSize: 12, background: m.id === selectedGroup.leader_id ? '#f59e0b' : '#8b5cf6' }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{m.name}</div>
                          {m.id === selectedGroup.leader_id && <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>👑 Leader</div>}
                        </div>
                      </div>
                      <button style={s.removeBtn} onClick={() => removeMember(m.id)}>✕ Remove</button>
                    </div>
                  ))
                }
              </div>
            </div>
            {/* Not in group */}
            <div>
              <div style={s.colHeader}>
                <span style={s.colTitle}>Available to add</span>
                <span style={s.colCount}>{notInGroup.length}</span>
              </div>
              <div style={s.scrollList}>
                {filteredNotInGroup.length === 0
                  ? <p style={s.emptyText}>{memberSearch ? 'No match' : 'All members are in this group'}</p>
                  : filteredNotInGroup.map(m => (
                    <div key={m.id} style={s.memberRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ ...s.listAvatar, width: 30, height: 30, fontSize: 12, background: '#6b7280' }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{m.name}</div>
                      </div>
                      <button style={s.addBtn} onClick={() => addMember(m.id)}>+ Add</button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={closeModal}>Done</Button>
          </div>
        </Modal>
      )}

      {/* ── Attendance Modal ── */}
      {modal === 'attendance' && selectedGroup && (
        <Modal title={`Attendance — ${selectedGroup.name}`} onClose={closeModal}>
          <Field label="Date">
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} style={s.input} />
          </Field>
          {selectedGroup.members.length === 0
            ? <p style={s.emptyText}>No members in this group yet.</p>
            : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={s.colTitle}>
                    {Object.values(attendanceRecords).filter(v => v === 'present').length} / {selectedGroup.members.length} present
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={s.bulkBtn} onClick={() => { const r = {}; selectedGroup.members.forEach(m => { r[m.id] = 'present' }); setAttendanceRecords(r) }}>All Present</button>
                    <button style={s.bulkBtn} onClick={() => { const r = {}; selectedGroup.members.forEach(m => { r[m.id] = 'absent' }); setAttendanceRecords(r) }}>All Absent</button>
                  </div>
                </div>
                <div style={s.scrollList}>
                  {selectedGroup.members.map(m => {
                    const present = attendanceRecords[m.id] === 'present'
                    return (
                      <div key={m.id} style={{ ...s.attendanceRow, background: present ? '#f0fdf4' : '#fff7f7', border: `1px solid ${present ? '#bbf7d0' : '#fecaca'}` }}
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [m.id]: present ? 'absent' : 'present' }))}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ ...s.listAvatar, width: 32, height: 32, fontSize: 13, background: present ? '#10b981' : '#ef4444' }}>
                            {m.name[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{m.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ ...s.attendanceBadge, background: present ? '#10b981' : '#ef4444' }}>
                            {present ? '✓ Present' : '✗ Absent'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          }
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={saveAttendance}>Save Attendance</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const s = {
  container: { padding: 20, maxWidth: 1200 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#6b7280', margin: 0 },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12 },
  loadingSpinner: { fontSize: 48 },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 14, border: '1px solid #f3f4f6' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  groupAvatar: { width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 },
  groupName: { margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#111827' },
  groupDesc: { margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
  statsRow: { display: 'flex', alignItems: 'center', gap: 0, background: '#f9fafb', borderRadius: 10, padding: '10px 16px' },
  stat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontWeight: 800, color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  statDivider: { width: 1, height: 32, background: '#e5e7eb', margin: '0 8px' },
  avatarRow: { display: 'flex', alignItems: 'center' },
  miniAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, border: '2px solid #fff', flexShrink: 0 },
  leaderBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '7px 12px' },
  cardActions: { display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f3f4f6' },
  actionBtn: { flex: '1 1 auto', minWidth: 70, padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  // Modal internals
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' },
  currentInfo: { background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 },
  searchWrap: { marginBottom: 14 },
  searchInput: { width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  scrollList: { maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 },
  listRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: 10, cursor: 'pointer', border: '1px solid transparent' },
  listRowActive: { background: '#fffbeb', border: '1px solid #fde68a' },
  listAvatar: { width: 34, height: 34, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  activeBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fef3c7', color: '#92400e' },
  setBtn: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, background: '#ede9fe', color: '#5b21b6', border: 'none', cursor: 'pointer' },
  // Members modal
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  colTitle: { fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },
  colCount: { fontSize: 12, fontWeight: 700, background: '#e5e7eb', color: '#374151', padding: '2px 8px', borderRadius: 20 },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f9fafb', borderRadius: 8 },
  removeBtn: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' },
  addBtn: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer' },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '16px 0', margin: 0 },
  // Attendance
  attendanceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, cursor: 'pointer' },
  attendanceBadge: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color: '#fff' },
  bulkBtn: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }
}

export default GroupsAdvanced
