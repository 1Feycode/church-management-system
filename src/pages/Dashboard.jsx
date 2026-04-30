import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} style={{ ...cardStyles.card, borderTop: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={cardStyles.icon}>{icon}</div>
      <div style={cardStyles.value}>{value}</div>
      <div style={cardStyles.label}>{label}</div>
    </div>
  )
}

const cardStyles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '24px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s'
  },
  icon: { fontSize: '32px', marginBottom: '10px' },
  value: { fontSize: '36px', fontWeight: '800', color: '#1f2937', marginBottom: '6px' },
  label: { fontSize: '14px', color: '#6b7280', fontWeight: '500' }
}

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ members: 0, groups: 0, upcomingEvents: 0, newPrayerRequests: 0 })
  const [recentPrayer, setRecentPrayer] = useState([])
  const [recentBible, setRecentBible] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const now = new Date().toISOString()

        const [
          { count: membersCount },
          { count: groupsCount },
          { count: upcomingCount },
          { count: prayerCount },
          { data: prayerData },
          { data: bibleData }
        ] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }),
          supabase.from('groups').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', now),
          supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('prayer_requests').select('id, title, member_id, created_at, status, visibility').order('created_at', { ascending: false }).limit(5),
          supabase.from('bible_studies').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
        ])

        setStats({
          members: membersCount || 0,
          groups: groupsCount || 0,
          upcomingEvents: upcomingCount || 0,
          newPrayerRequests: prayerCount || 0
        })
        setRecentPrayer(prayerData || [])
        setRecentBible(bibleData || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return <div style={styles.container}><p style={{ color: '#6b7280' }}>Loading dashboard...</p></div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard icon="👥" label="Total Members" value={stats.members} color="#3b82f6" onClick={() => navigate('/members')} />
        <StatCard icon="🤝" label="Total Groups" value={stats.groups} color="#10b981" onClick={() => navigate('/groups')} />
        <StatCard icon="📅" label="Upcoming Events" value={stats.upcomingEvents} color="#f59e0b" onClick={() => navigate('/events')} />
        <StatCard icon="🙏" label="New Prayer Requests" value={stats.newPrayerRequests} color="#8b5cf6" onClick={() => navigate('/prayer-requests')} />
      </div>

      <div style={styles.twoCol}>
        {/* Recent Prayer Requests */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>🙏 Recent Prayer Requests</h2>
            <button onClick={() => navigate('/prayer-requests')} style={styles.viewAll}>View All</button>
          </div>
          {recentPrayer.length === 0 ? (
            <p style={styles.empty}>No prayer requests yet.</p>
          ) : (
            recentPrayer.map(r => (
              <div key={r.id} style={styles.listItem}>
                <div style={styles.listItemMain}>
                  <span style={styles.listItemTitle}>{r.title}</span>
                  <span style={{ ...styles.badge, backgroundColor: r.status === 'new' ? '#dbeafe' : '#d1fae5', color: r.status === 'new' ? '#1e40af' : '#065f46' }}>
                    {r.status}
                  </span>
                </div>
                <span style={styles.listItemDate}>{formatDate(r.created_at)}</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Bible Studies */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>📖 Recent Bible Studies</h2>
            <button onClick={() => navigate('/bible-studies')} style={styles.viewAll}>View All</button>
          </div>
          {recentBible.length === 0 ? (
            <p style={styles.empty}>No bible studies yet.</p>
          ) : (
            recentBible.map(b => (
              <div key={b.id} style={styles.listItem}>
                <span style={styles.listItemTitle}>{b.title}</span>
                <span style={styles.listItemDate}>{formatDate(b.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px' },
  title: { fontSize: '28px', color: '#1f2937', margin: '0 0 24px 0', fontWeight: '700' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  panelTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' },
  viewAll: {
    background: 'none',
    border: 'none',
    color: '#8b5cf6',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    gap: '8px'
  },
  listItemMain: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 },
  listItemTitle: { fontSize: '14px', color: '#374151', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listItemDate: { fontSize: '12px', color: '#9ca3af', flexShrink: 0 },
  badge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
  empty: { fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }
}

export default Dashboard
