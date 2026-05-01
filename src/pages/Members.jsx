import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Table from '../components/common/Table'
import Button from '../components/common/Button'
import { useResponsive } from '../hooks/useResponsive'

const TABLE_HEADERS = ['Name', 'Phone', 'Email', 'Gender', 'Age', 'Baptized', 'Group', 'Role', 'Actions']

function Members() {
  const { isMobile } = useResponsive()
  const [members, setMembers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    gender: '',
    age: '',
    address: '',
    baptism_status: false,
    group_id: '',
    role: 'member',
    education_level: '',
    christian_since: ''
  })
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterBaptized, setFilterBaptized] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const [
          { data: membersData, error: membersError },
          { data: groupsData, error: groupsError },
          { data: gmData, error: gmError }
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('groups').select('id, name'),
          supabase.from('group_members').select('member_id, group_id')
        ])

        if (membersError) throw membersError
        if (groupsError) throw groupsError
        if (gmError) throw gmError

        // Build member_id → group names[] map from group_members (source of truth)
        const memberGroupMap = {}
        ;(gmData || []).forEach(({ member_id, group_id }) => {
          if (!memberGroupMap[member_id]) memberGroupMap[member_id] = []
          const g = (groupsData || []).find(x => x.id === group_id)
          if (g) memberGroupMap[member_id].push(g)
        })

        const membersWithGroups = (membersData || []).map(member => ({
          ...member,
          memberGroups: memberGroupMap[member.id] || [],
          // Keep first group for display compat
          groups: memberGroupMap[member.id]?.[0] ? { name: memberGroupMap[member.id].map(g => g.name).join(', ') } : null
        }))

        setMembers(membersWithGroups)
        setGroups(groupsData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  // --- ADD ---
  async function handleAddMember() {
    if (!form.name || !form.phone) {
      alert('Please fill in Name and Phone fields.')
      return
    }

    const { data, error } = await supabase
      .from('members')
      .insert([{
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        gender: form.gender || null,
        age: form.age ? Number(form.age) : null,
        address: form.address || null,
        baptism_status: form.baptism_status,
        group_id: form.group_id ? Number(form.group_id) : null,
        role: form.role || 'member',
        education_level: form.education_level || null,
        christian_since: form.christian_since || null
      }])
      .select()

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    const newMemberId = data[0].id

    // Sync to group_members (source of truth)
    if (form.group_id) {
      await supabase.from('group_members').upsert(
        [{ group_id: Number(form.group_id), member_id: newMemberId }],
        { onConflict: 'group_id,member_id' }
      )
    }

    const group = groups.find(g => g.id === data[0].group_id)
    const memberWithGroup = {
      ...data[0],
      memberGroups: group ? [group] : [],
      groups: group ? { name: group.name } : null
    }

    setMembers([memberWithGroup, ...members])
    closeModal()
  }

  // --- EDIT: open modal pre-filled ---
  function handleEditClick(member) {
    setEditingMember(member)
    setForm({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      gender: member.gender || '',
      age: member.age ? String(member.age) : '',
      address: member.address || '',
      baptism_status: member.baptism_status || false,
      group_id: member.group_id ? String(member.group_id) : '',
      role: member.role || 'member',
      education_level: member.education_level || '',
      christian_since: member.christian_since || ''
    })
    setShowModal(true)
  }

  // --- EDIT: save changes to Supabase ---
  async function handleUpdateMember() {
    if (!form.name || !form.phone) {
      alert('Please fill in Name and Phone fields.')
      return
    }

    const newGroupId = form.group_id ? Number(form.group_id) : null
    const oldGroupId = editingMember.group_id || null

    const { data, error } = await supabase
      .from('members')
      .update({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        gender: form.gender || null,
        age: form.age ? Number(form.age) : null,
        address: form.address || null,
        baptism_status: form.baptism_status,
        group_id: newGroupId,
        role: form.role || 'member',
        education_level: form.education_level || null,
        christian_since: form.christian_since || null
      })
      .eq('id', editingMember.id)
      .select()

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    // Sync group_members: remove old group entry, add new one
    if (oldGroupId && oldGroupId !== newGroupId) {
      await supabase.from('group_members')
        .delete()
        .eq('group_id', oldGroupId)
        .eq('member_id', editingMember.id)
    }
    if (newGroupId && newGroupId !== oldGroupId) {
      await supabase.from('group_members').upsert(
        [{ group_id: newGroupId, member_id: editingMember.id }],
        { onConflict: 'group_id,member_id' }
      )
    }

    const group = groups.find(g => g.id === data[0].group_id)
    const memberWithGroup = {
      ...data[0],
      memberGroups: group ? [group] : [],
      groups: group ? { name: group.name } : null
    }

    setMembers(members.map((m) => m.id === editingMember.id ? memberWithGroup : m))
    closeModal()
  }

  // --- DELETE ---
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this member?')) return

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    setMembers(members.filter((m) => m.id !== id))
  }

  function closeModal() {
    setShowModal(false)
    setEditingMember(null)
    setForm({ 
      name: '', 
      phone: '', 
      email: '',
      gender: '',
      age: '',
      address: '',
      baptism_status: false,
      group_id: '',
      role: 'member',
      education_level: '',
      christian_since: ''
    })
  }

  // Filter and search logic
  const filteredMembers = members.filter((member) => {
    // Search filter (name, phone, email)
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))

    // Gender filter
    const matchesGender = filterGender === '' || member.gender === filterGender

    // Group filter — check group_members (source of truth)
    const matchesGroup = filterGroup === '' || (member.memberGroups || []).some(g => String(g.id) === filterGroup)

    // Baptized filter
    const matchesBaptized = filterBaptized === '' || 
      (filterBaptized === 'yes' && member.baptism_status) ||
      (filterBaptized === 'no' && !member.baptism_status)

    return matchesSearch && matchesGender && matchesGroup && matchesBaptized
  })

  function clearFilters() {
    setSearchTerm('')
    setFilterGender('')
    setFilterGroup('')
    setFilterBaptized('')
  }

  if (loading) {
    return <div style={styles.container}><p>Loading members...</p></div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Members</h1>
        <Button onClick={() => { setEditingMember(null); setShowModal(true) }}>+ Add Member</Button>
      </div>

      {/* Search and Filter Section */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterRow}>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            value={filterBaptized}
            onChange={(e) => setFilterBaptized(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Baptism Status</option>
            <option value="yes">Baptized</option>
            <option value="no">Not Baptized</option>
          </select>

          <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
        </div>

        <div style={styles.resultsCount}>
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Mobile: stacked cards | Desktop: table */}
      {isMobile ? (
        <div style={styles.cardList}>
          {filteredMembers.map(member => (
            <div key={member.id} style={styles.memberCard}>
              <div style={styles.memberCardHeader}>
                <div style={styles.memberCardAvatar}>{member.name[0].toUpperCase()}</div>
                <div>
                  <div style={styles.memberCardName}>{member.name}</div>
                  <div style={styles.memberCardPhone}>{member.phone}</div>
                </div>
                <span style={{ ...styles.rolePill, backgroundColor: member.role === 'admin' ? '#ede9fe' : '#dbeafe', color: member.role === 'admin' ? '#5b21b6' : '#1e40af' }}>
                  {member.role || 'member'}
                </span>
              </div>
              <div style={styles.memberCardBody}>
                {member.email && <div style={styles.memberCardRow}><span style={styles.memberCardLabel}>Email</span><span>{member.email}</span></div>}
                {member.gender && <div style={styles.memberCardRow}><span style={styles.memberCardLabel}>Gender</span><span>{member.gender}</span></div>}
                {member.age && <div style={styles.memberCardRow}><span style={styles.memberCardLabel}>Age</span><span>{member.age}</span></div>}
                <div style={styles.memberCardRow}><span style={styles.memberCardLabel}>Baptized</span><span>{member.baptism_status ? '✓ Yes' : 'No'}</span></div>
                {member.groups?.name && <div style={styles.memberCardRow}><span style={styles.memberCardLabel}>Group</span><span>{member.groups.name}</span></div>}
              </div>
              <div style={styles.memberCardActions}>
                <Button variant="outline" onClick={() => handleEditClick(member)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(member.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table headers={TABLE_HEADERS}>
          {filteredMembers.map((member) => (
            <tr key={member.id} style={styles.row}>
              <td style={styles.td}>{member.name}</td>
              <td style={styles.td}>{member.phone}</td>
              <td style={styles.td}>{member.email || '—'}</td>
              <td style={styles.td}>{member.gender || '—'}</td>
              <td style={styles.td}>{member.age || '—'}</td>
              <td style={styles.td}>{member.baptism_status ? '✓' : '—'}</td>
              <td style={styles.td}>{member.groups?.name || '—'}</td>
              <td style={styles.td}>
                <span style={{ ...styles.rolePill, backgroundColor: member.role === 'admin' ? '#ede9fe' : '#dbeafe', color: member.role === 'admin' ? '#5b21b6' : '#1e40af' }}>
                  {member.role || 'member'}
                </span>
              </td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  <Button variant="outline" onClick={() => handleEditClick(member)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(member.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {filteredMembers.length === 0 && members.length > 0 && (
        <p style={styles.empty}>No members match your search criteria.</p>
      )}

      {members.length === 0 && (
        <p style={styles.empty}>No members found. Add your first member!</p>
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingMember ? 'Edit Member' : 'Add Member'}
            </h2>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Age</label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  style={styles.input}
                  min="0"
                  max="150"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Group</label>
                <select name="group_id" value={form.group_id} onChange={handleChange} style={styles.input}>
                  <option value="">Select a group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
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
                <input name="christian_since" value={form.christian_since} onChange={handleChange} placeholder="e.g. 2010" style={styles.input} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter residential address"
                style={styles.input}
              />
            </div>

            <div style={styles.checkboxField}>
              <label style={styles.checkboxLabel}>
                <input
                  name="baptism_status"
                  type="checkbox"
                  checked={form.baptism_status}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span>Baptized</span>
              </label>
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={editingMember ? handleUpdateMember : handleAddMember}>
                {editingMember ? 'Update' : 'Save'}
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
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  searchBox: {
    marginBottom: '16px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },
  filterSelect: {
    flex: '1',
    minWidth: '150px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff'
  },
  resultsCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  row: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: { margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  checkboxField: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  // Mobile card list
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  memberCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  memberCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  memberCardAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  memberCardName: { fontSize: '15px', fontWeight: '700', color: '#1f2937' },
  memberCardPhone: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  memberCardBody: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' },
  memberCardRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' },
  memberCardLabel: { color: '#6b7280', fontWeight: '500' },
  memberCardActions: { display: 'flex', gap: '8px' },
  rolePill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', marginLeft: 'auto', flexShrink: 0 }
}

export default Members
