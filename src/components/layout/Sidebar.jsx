import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', adminOnly: false },
  { to: '/members', label: 'Members', icon: '👥', adminOnly: true },
  { to: '/groups', label: 'Groups', icon: '🤝', adminOnly: true },
  { to: '/events', label: 'Events', icon: '📅', adminOnly: false },
  { to: '/announcements', label: 'Announcements', icon: '📢', adminOnly: true },
  { to: '/bible-studies', label: 'Bible Study', icon: '📖', adminOnly: false },
  { to: '/prayer-requests', label: 'Prayer Requests', icon: '🙏', adminOnly: false },
  { to: '/my-group', label: 'My Group', icon: '👥', memberOnly: true },
  { to: '/notifications', label: 'Notifications', icon: '🔔', adminOnly: false },
  { to: '/profile', label: 'Profile', icon: '👤', adminOnly: false },
]

function Sidebar() {
  const { isAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.memberOnly && isAdmin) return false
    return true
  })

  return (
    <div style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.brandIcon}>✝️</div>
        <div style={styles.brandText}>Church Admin</div>
      </div>

      {profile && (
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{(profile.name || profile.first_name || 'A')[0].toUpperCase()}</div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{profile.name || profile.first_name || 'Admin'}</div>
            <div style={styles.userRole}>{profile.role === 'admin' ? '⭐ Admin' : 'Member'}</div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        {visibleItems.map(item => (
          <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }} end={item.to === '/dashboard'}>
            {({ isActive }) => (
              <div style={isActive ? styles.activeLinkItem : styles.linkItem}>
                <span style={styles.linkIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleSignOut} style={styles.signOutBtn}>
        🚪 Sign Out
      </button>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    backgroundColor: '#1e1b4b',
    color: '#fff',
    padding: '0',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  brandIcon: { fontSize: '24px' },
  brandText: { fontSize: '16px', fontWeight: '700', color: '#e0e7ff' },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0
  },
  userDetails: { minWidth: 0 },
  userName: { fontSize: '13px', fontWeight: '600', color: '#e0e7ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '11px', color: '#a5b4fc', marginTop: '2px' },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 8px',
    flex: 1,
    gap: '2px'
  },
  linkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#a5b4fc',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.15s',
    cursor: 'pointer'
  },
  activeLinkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4f46e5',
    cursor: 'pointer'
  },
  linkIcon: { fontSize: '16px', flexShrink: 0 },
  signOutBtn: {
    margin: '8px',
    padding: '10px 12px',
    backgroundColor: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left'
  }
}

export default Sidebar
