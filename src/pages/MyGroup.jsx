import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function MyGroup() {
  const { profile } = useAuth()
  const [group, setGroup] = useState(null)
  const [leader, setLeader] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGroup() {
      if (!profile?.group_id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', profile.group_id)
          .single()

        if (groupError) throw groupError
        setGroup(groupData)

        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, name, phone, gender, baptism_status')
          .eq('group_id', profile.group_id)
          .order('name', { ascending: true })

        if (membersError) throw membersError
        setMembers(membersData || [])

        if (groupData.leader_id) {
          const { data: leaderData } = await supabase
            .from('members')
            .select('id, name, phone')
            .eq('id', groupData.leader_id)
            .single()
          setLeader(leaderData || null)
        }
      } catch (err) {
        console.error('Error loading group:', err)
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [profile?.group_id, profile?.id])

  if (loading) {
    return <div style={styles.container}><p style={styles.loading}>Loading group...</p></div>
  }

  if (!profile?.group_id || !group) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>👥 My Group</h1>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👥</div>
          <h2 style={styles.emptyTitle}>Not assigned to a group</h2>
          <p style={styles.emptyText}>You haven&apos;t been assigned to a group yet. Please contact your church administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👥 My Group</h1>

      {/* Group Info Card */}
      <div style={styles.groupCard}>
        <div style={styles.groupHeader}>
          <div style={styles.groupIconWrap}>
            <span style={styles.groupIcon}>🤝</span>
          </div>
          <div>
            <h2 style={styles.groupName}>{group.name}</h2>
            {group.description && <p style={styles.groupDesc}>{group.description}</p>}
          </div>
        </div>

        <div style={styles.groupStats}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{members.length}</span>
            <span style={styles.statLabel}>Members</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{leader ? leader.name : '—'}</span>
            <span style={styles.statLabel}>Group Leader</span>
          </div>
        </div>
      </div>

      {/* Leader Card */}
      {leader && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>👑 Group Leader</h2>
          <div style={styles.leaderCard}>
            <div style={styles.memberAvatar}>{leader.name[0].toUpperCase()}</div>
            <div>
              <div style={styles.memberName}>{leader.name}</div>
              {leader.phone && <div style={styles.memberPhone}>📞 {leader.phone}</div>}
            </div>
            <span style={styles.leaderBadge}>Leader</span>
          </div>
        </div>
      )}

      {/* Members List */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👥 Group Members ({members.length})</h2>
        {members.length === 0 ? (
          <p style={styles.empty}>No members in this group yet.</p>
        ) : (
          <div style={styles.membersList}>
            {members.map(m => (
              <div key={m.id} style={{ ...styles.memberCard, ...(m.id === profile.id ? styles.memberCardSelf : {}) }}>
                <div style={{ ...styles.memberAvatar, backgroundColor: m.id === profile.id ? '#4f46e5' : '#8b5cf6' }}>
                  {m.name[0].toUpperCase()}
                </div>
                <div style={styles.memberInfo}>
                  <div style={styles.memberName}>
                    {m.name}
                    {m.id === profile.id && <span style={styles.youBadge}>You</span>}
                    {m.id === group.leader_id && <span style={styles.leaderBadge}>Leader</span>}
                  </div>
                  <div style={styles.memberMeta}>
                    {m.gender && <span>{m.gender}</span>}
                    {m.baptism_status && <span style={styles.baptizedBadge}>✓ Baptized</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '20px', maxWidth: '800px' },
  loading: { color: '#6b7280' },
  title: { fontSize: '28px', color: '#1f2937', margin: '0 0 24px 0', fontWeight: '700' },
  // Empty state
  emptyState: { textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  emptyIcon: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' },
  emptyText: { fontSize: '15px', color: '#6b7280', margin: 0 },
  // Group card
  groupCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  groupHeader: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' },
  groupIconWrap: { width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  groupIcon: { fontSize: '28px' },
  groupName: { margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' },
  groupDesc: { margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' },
  groupStats: { display: 'flex', gap: '32px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { fontSize: '18px', fontWeight: '700', color: '#1f2937' },
  statLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '500' },
  // Sections
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 14px 0' },
  // Leader card
  leaderCard: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #ede9fe' },
  // Members list
  membersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberCard: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#fff', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  memberCardSelf: { border: '2px solid #e0e7ff', backgroundColor: '#f5f3ff' },
  memberAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontSize: '15px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  memberPhone: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  memberMeta: { display: 'flex', gap: '8px', marginTop: '4px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' },
  // Badges
  youBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#3730a3' },
  leaderBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#92400e' },
  baptizedBadge: { fontSize: '12px', color: '#059669', fontWeight: '500' },
  empty: { color: '#6b7280', textAlign: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }
}

export default MyGroup
