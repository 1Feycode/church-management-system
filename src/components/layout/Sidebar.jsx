import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/members', label: 'Members', icon: '👥', adminOnly: true },
  { to: '/groups', label: 'Groups', icon: '🤝', adminOnly: true },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/announcements', label: 'Announcements', icon: '📢', adminOnly: true },
  { to: '/bible-studies', label: 'Bible Study', icon: '📖' },
  { to: '/prayer-requests', label: 'Prayer Requests', icon: '🙏' },
  { to: '/my-group', label: 'My Group', icon: '👥', memberOnly: true },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

function Sidebar({ open, onClose }) {
  const { isAdmin, profile, signOut } = useAuth()
  const { isSmall } = useResponsive()
  const navigate = useNavigate()
  const location = useLocation()

  // Close drawer on route change (mobile/tablet)
  useEffect(() => {
    if (isSmall && onClose) onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.memberOnly && isAdmin) return false
    return true
  })

  // On desktop: always visible fixed sidebar
  // On mobile/tablet: slide-in drawer controlled by `open` prop
  const sidebarStyle = isSmall
    ? {
        ...styles.sidebar,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        zIndex: 1000,
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'
      }
    : styles.sidebar

  return (
    <>
      {/* Overlay — mobile/tablet only */}
      {isSmall && open && (
        <div onClick={onClose} style={styles.overlay} />
      )}

      <div style={sidebarStyle}>
        {/* Brand + close button */}
        <div style={styles.brand}>
          <div style={styles.brandLeft}>
            <span style={styles.brandIcon}>✝️</span>
            <span style={styles.brandText}>Church</span>
          </div>
          {isSmall && (
            <button onClick={onClose} style={styles.closeBtn} aria-label="Close menu">✕</button>
          )}
        </div>

        {/* User info */}
        {profile && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {(profile.name || profile.first_name || 'A')[0].toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{profile.name || profile.first_name || 'User'}</div>
              <div style={styles.userRole}>{profile.role === 'admin' ? '⭐ Admin' : '👤 Member'}</div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={styles.nav}>
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={{ textDecoration: 'none' }}
              end={item.to === '/dashboard'}
            >
              {({ isActive }) => (
                <div style={isActive ? styles.activeLink : styles.link}>
                  <span style={styles.linkIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <button onClick={handleSignOut} style={styles.signOutBtn}>
          🚪 Sign Out
        </button>
      </div>
    </>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    backgroundColor: '#1e1b4b',
    color: '#fff',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    zIndex: 200
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 16px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0
  },
  brandLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { fontSize: '22px' },
  brandText: { fontSize: '16px', fontWeight: '700', color: '#e0e7ff' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#a5b4fc',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    lineHeight: 1
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexShrink: 0
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0
  },
  userDetails: { minWidth: 0 },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e0e7ff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userRole: { fontSize: '11px', color: '#a5b4fc', marginTop: '2px' },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 8px',
    flex: 1,
    gap: '2px',
    overflowY: 'auto'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#a5b4fc',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  activeLink: {
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
    textAlign: 'left',
    flexShrink: 0
  }
}

export default Sidebar
