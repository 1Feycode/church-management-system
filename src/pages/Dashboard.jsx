import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ── Shared stat card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ ...cardStyles.card, borderTop: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}
    >
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
    textAlign: 'center'
  },
  icon: { fontSize: '32px', marginBottom: '10px' },
  value: { fontSize: '36px', fontWeight: '800', color: '#1f2937', marginBottom: '6px' },
  label: { fontSize: '14px', color: '#6b7280', fontWeight: '500' }
}

// ── Admin dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ members: 0, groups: 0, upcomingEvents: 0, newPrayerRequests: 0 })
  const [recentPrayer, setRecentPrayer] = useState([])
  const [recentBible, setRecentBible] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
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
          supabase.from('prayer_requests').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(5),
          supabase.from('bible_studies').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
        ])
        setStats({ members: membersCount || 0, groups: groupsCount || 0, upcomingEvents: upcomingCount || 0, newPrayerRequests: prayerCount || 0 })
        setRecentPrayer(prayerData || [])
        setRecentBible(bibleData || [])
      } catch (err) {
        console.error('Admin dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function fmt(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div style={styles.container}><p style={styles.loading}>Loading dashboard...</p></div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <div style={styles.statsGrid}>
        <StatCard icon="👥" label="Total Members" value={stats.members} color="#3b82f6" onClick={() => navigate('/members')} />
        <StatCard icon="🤝" label="Total Groups" value={stats.groups} color="#10b981" onClick={() => navigate('/groups')} />
        <StatCard icon="📅" label="Upcoming Events" value={stats.upcomingEvents} color="#f59e0b" onClick={() => navigate('/events')} />
        <StatCard icon="🙏" label="New Prayer Requests" value={stats.newPrayerRequests} color="#8b5cf6" onClick={() => navigate('/prayer-requests')} />
      </div>
      <div style={styles.twoCol}>
        <Panel title="🙏 Recent Prayer Requests" onViewAll={() => navigate('/prayer-requests')}>
          {recentPrayer.length === 0 ? <Empty text="No prayer requests yet." /> : recentPrayer.map(r => (
            <ListItem key={r.id} title={r.title} date={fmt(r.created_at)}>
              <Badge text={r.status} color={r.status === 'new' ? '#dbeafe' : '#d1fae5'} textColor={r.status === 'new' ? '#1e40af' : '#065f46'} />
            </ListItem>
          ))}
        </Panel>
        <Panel title="📖 Recent Bible Studies" onViewAll={() => navigate('/bible-studies')}>
          {recentBible.length === 0 ? <Empty text="No bible studies yet." /> : recentBible.map(b => (
            <ListItem key={b.id} title={b.title} date={fmt(b.created_at)} />
          ))}
        </Panel>
      </div>
    </div>
  )
}

// ── Member dashboard ──────────────────────────────────────────────────────────
function MemberDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [recentBible, setRecentBible] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = profile?.name?.split(' ')[0] || profile?.first_name || 'there'

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date().toISOString()
        const [{ data: eventsData }, { data: announcementsData }, { data: bibleData }] = await Promise.all([
          supabase.from('events').select('id, title, event_type, event_date, location').gte('event_date', now).order('event_date', { ascending: true }).limit(5),
          supabase.from('announcements').select('id, title, message, created_at').order('created_at', { ascending: false }).limit(4),
          supabase.from('bible_studies').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
        ])
        setUpcomingEvents(eventsData || [])
        setAnnouncements(announcementsData || [])
        setRecentBible(bibleData || [])
      } catch (err) {
        console.error('Member dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function fmt(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function fmtEvent(d) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={styles.container}><p style={styles.loading}>Loading...</p></div>

  return (
    <div style={styles.container}>
      {/* Welcome banner */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeText}>
          <h1 style={styles.welcomeTitle}>Welcome back, {firstName}! 👋</h1>
          <p style={styles.welcomeSub}>Here&apos;s what&apos;s happening in your church community.</p>
        </div>
        <div style={styles.welcomeIcon}>✝️</div>
      </div>

      {/* Quick stats */}
      <div style={styles.statsGrid}>
        <StatCard icon="📅" label="Upcoming Events" value={upcomingEvents.length} color="#3b82f6" onClick={() => navigate('/events')} />
        <StatCard icon="📢" label="Announcements" value={announcements.length} color="#f59e0b" />
        <StatCard icon="📖" label="Bible Studies" value={recentBible.length} color="#8b5cf6" onClick={() => navigate('/bible-studies')} />
      </div>

      <div style={styles.twoCol}>
        {/* Upcoming Events */}
        <Panel title="📅 Upcoming Events" onViewAll={() => navigate('/events')}>
          {upcomingEvents.length === 0 ? <Empty text="No upcoming events." /> : upcomingEvents.map(e => (
            <div key={e.id} style={styles.eventItem}>
              <div style={styles.eventItemLeft}>
                <span style={styles.eventItemTitle}>{e.title}</span>
                <span style={styles.eventItemType}>{e.event_type}</span>
              </div>
              <div style={styles.eventItemRight}>
                <span style={styles.eventItemDate}>{fmtEvent(e.event_date)}</span>
                {e.location && <span style={styles.eventItemLoc}>📍 {e.location}</span>}
              </div>
            </div>
          ))}
        </Panel>

        {/* Latest Announcements */}
        <Panel title="📢 Latest Announcements">
          {announcements.length === 0 ? <Empty text="No announcements yet." /> : announcements.map(a => (
            <div key={a.id} style={styles.announcementItem}>
              <div style={styles.announcementTitle}>{a.title}</div>
              <div style={styles.announcementMessage}>{a.message}</div>
              <div style={styles.announcementDate}>{fmt(a.created_at)}</div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Recent Bible Studies */}
      <Panel title="📖 Recent Bible Studies" onViewAll={() => navigate('/bible-studies')}>
        {recentBible.length === 0 ? <Empty text="No bible studies yet." /> : (
          <div style={styles.bibleGrid}>
            {recentBible.map(b => (
              <div key={b.id} style={styles.bibleCard} onClick={() => navigate(`/bible-study/${b.id}`)}>
                <div style={styles.bibleCardIcon}>📖</div>
                <div style={styles.bibleCardTitle}>{b.title}</div>
                <div style={styles.bibleCardDate}>{fmt(b.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Panel({ title, onViewAll, children }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>{title}</h2>
        {onViewAll && <button onClick={onViewAll} style={styles.viewAll}>View All</button>}
      </div>
      {children}
    </div>
  )
}

function ListItem({ title, date, children }) {
  return (
    <div style={styles.listItem}>
      <div style={styles.listItemMain}>
        <span style={styles.listItemTitle}>{title}</span>
        {children}
      </div>
      <span style={styles.listItemDate}>{date}</span>
    </div>
  )
}

function Badge({ text, color, textColor }) {
  return <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', backgroundColor: color, color: textColor, flexShrink: 0 }}>{text}</span>
}

function Empty({ text }) {
  return <p style={styles.empty}>{text}</p>
}

// ── Root export — picks view by role ─────────────────────────────────────────
function Dashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <MemberDashboard />
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px' },
  loading: { color: '#6b7280' },
  title: { fontSize: '28px', color: '#1f2937', margin: '0 0 24px 0', fontWeight: '700' },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: '12px',
    padding: '24px 28px',
    marginBottom: '28px',
    color: '#fff'
  },
  welcomeText: {},
  welcomeTitle: { margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700' },
  welcomeSub: { margin: 0, fontSize: '14px', opacity: 0.85 },
  welcomeIcon: { fontSize: '48px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '28px'
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  panelTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' },
  viewAll: { background: 'none', border: 'none', color: '#8b5cf6', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: '8px' },
  listItemMain: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 },
  listItemTitle: { fontSize: '14px', color: '#374151', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listItemDate: { fontSize: '12px', color: '#9ca3af', flexShrink: 0 },
  empty: { fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '20px 0', margin: 0 },
  // Event items
  eventItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f3f4f6', gap: '12px' },
  eventItemLeft: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 },
  eventItemTitle: { fontSize: '14px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  eventItemType: { fontSize: '12px', color: '#8b5cf6', fontWeight: '500' },
  eventItemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 },
  eventItemDate: { fontSize: '12px', color: '#6b7280' },
  eventItemLoc: { fontSize: '12px', color: '#9ca3af' },
  // Announcement items
  announcementItem: { padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
  announcementTitle: { fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' },
  announcementMessage: { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  announcementDate: { fontSize: '12px', color: '#9ca3af' },
  // Bible grid
  bibleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' },
  bibleCard: { backgroundColor: '#faf5ff', borderRadius: '8px', padding: '16px', cursor: 'pointer', textAlign: 'center', border: '1px solid #ede9fe' },
  bibleCardIcon: { fontSize: '24px', marginBottom: '8px' },
  bibleCardTitle: { fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '6px', lineHeight: '1.4' },
  bibleCardDate: { fontSize: '11px', color: '#9ca3af' }
}

export default Dashboard
