import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MyGroup() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState({}) // groupId → bool

  function toggleMembers(groupId) {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  useEffect(() => {
    async function loadMyGroups() {
      if (!profile?.id) { setLoading(false); return }
      try {
        setLoading(true)

        // Get all group_ids this member belongs to
        const { data: gmRows, error: gmErr } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('member_id', profile.id)

        if (gmErr) throw gmErr
        if (!gmRows || gmRows.length === 0) { setGroups([]); return }

        const groupIds = gmRows.map(r => r.group_id)

        // Fetch those groups
        const { data: groupsData, error: gErr } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('name')

        if (gErr) throw gErr

        // For each group, fetch its members and leader
        const enriched = await Promise.all((groupsData || []).map(async group => {
          const [{ data: gmData }, { data: leaderData }] = await Promise.all([
            supabase
              .from('group_members')
              .select('member_id, members(id, name, gender, baptism_status)')
              .eq('group_id', group.id),
            group.leader_id
              ? supabase.from('members').select('id, name, phone').eq('id', group.leader_id).single()
              : Promise.resolve({ data: null })
          ])

          return {
            ...group,
            members: (gmData || []).map(r => r.members).filter(Boolean),
            leader: leaderData || null
          }
        }))

        setGroups(enriched)
      } catch (err) {
        console.error('Error loading my groups:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMyGroups()
  }, [profile?.id])

  if (loading) return <div style={s.container}><p style={{ color: '#6b7280' }}>Loading your groups...</p></div>

  if (groups.length === 0) {
    return (
      <div style={s.container}>
        <h1 style={s.title}>👥 My Groups</h1>
        <div style={s.emptyState}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👥</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>Not in any group yet</h2>
          <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
            You haven&apos;t been added to a group yet. Contact your church administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <h1 style={s.title}>👥 My Groups</h1>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        You are a member of <strong>{groups.length}</strong> group{groups.length !== 1 ? 's' : ''}.
      </p>

      <div style={s.groupList}>
        {groups.map(group => (
          <div key={group.id} style={s.groupCard}>
            {/* Header */}
            <div style={s.groupHeader}>
              <div style={s.groupIconWrap}>🤝</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={s.groupName}>{group.name}</h2>
                {group.description && <p style={s.groupDesc}>{group.description}</p>}
              </div>
            </div>

            {/* Stats row */}
            <div style={s.statsRow}>
              <div style={s.stat}>
                <span style={s.statVal}>{group.members.length}</span>
                <span style={s.statLabel}>Members</span>
              </div>
              <div style={s.stat}>
                <span style={s.statVal}>{group.leader?.name || '—'}</span>
                <span style={s.statLabel}>Leader</span>
              </div>
            </div>

            {/* Chat button */}
            <button
              onClick={() => navigate(`/group-chat/${group.id}`)}
              style={s.chatBtn}
            >
              💬 Open Group Chat
            </button>

            {/* Leader card */}
            {group.leader && (
              <div style={s.leaderCard}>
                <div style={{ ...s.avatar, background: '#f59e0b' }}>
                  {group.leader.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{group.leader.name}</div>
                  {group.leader.phone && <div style={{ fontSize: 12, color: '#6b7280' }}>📞 {group.leader.phone}</div>}
                </div>
                <span style={s.leaderBadge}>👑 Leader</span>
              </div>
            )}

            {/* Members list — collapsible */}
            <div>
              <button
                onClick={() => toggleMembers(group.id)}
                style={s.membersToggle}
              >
                <span style={s.sectionLabel}>👥 Members ({group.members.length})</span>
                <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>
                  {expandedGroups[group.id] ? '▲ Hide' : '▼ Show all'}
                </span>
              </button>

              {/* Always show yourself + first 2 others */}
              <div style={s.membersList}>
                {(expandedGroups[group.id]
                  ? group.members
                  : [
                      // Always show "you" first
                      ...group.members.filter(m => m.id === profile.id),
                      ...group.members.filter(m => m.id !== profile.id).slice(0, 2)
                    ]
                ).map(m => {
                  const isMe = m.id === profile.id
                  const isLeader = m.id === group.leader_id
                  return (
                    <div key={m.id} style={{ ...s.memberRow, ...(isMe ? s.memberRowSelf : {}) }}>
                      <div style={{ ...s.avatar, background: isMe ? '#4f46e5' : '#8b5cf6' }}>
                        {m.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{m.name}</span>
                          {isMe && <span style={s.youBadge}>You</span>}
                          {isLeader && <span style={s.leaderBadge}>👑 Leader</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 12, color: '#6b7280' }}>
                          {m.gender && <span>{m.gender}</span>}
                          {m.baptism_status && <span style={{ color: '#059669' }}>✓ Baptized</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Collapsed summary */}
                {!expandedGroups[group.id] && group.members.length > 3 && (
                  <button onClick={() => toggleMembers(group.id)} style={s.showMoreBtn}>
                    +{group.members.length - 3} more members — tap to expand
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { padding: 20, maxWidth: 860 },
  title: { fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  groupList: { display: 'flex', flexDirection: 'column', gap: 24 },
  groupCard: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 },
  groupHeader: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  groupIconWrap: { width: 48, height: 48, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  groupName: { margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1f2937' },
  groupDesc: { margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
  statsRow: { display: 'flex', gap: 32, paddingTop: 12, borderTop: '1px solid #f3f4f6' },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { fontSize: 18, fontWeight: 700, color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  leaderCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px' },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' },
  membersToggle: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', marginBottom: 0 },
  showMoreBtn: { width: '100%', padding: '10px', borderRadius: 8, background: '#f5f3ff', border: '1px dashed #c4b5fd', color: '#7c3aed', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  membersList: { display: 'flex', flexDirection: 'column', gap: 8 },
  memberRow: { display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '10px 14px' },
  memberRowSelf: { background: '#f5f3ff', border: '1.5px solid #ddd6fe' },
  avatar: { width: 36, height: 36, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  chatBtn: { width: '100%', padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  youBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#e0e7ff', color: '#3730a3' },
  leaderBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e' }
}

export default MyGroup
