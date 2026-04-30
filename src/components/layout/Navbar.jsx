import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import NotificationBell from '../common/NotificationBell'

function Navbar({ onMenuToggle }) {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { isSmall, isMobile } = useResponsive()
  const [showDropdown, setShowDropdown] = useState(false)

  async function handleSignOut() {
    const { error } = await signOut()
    if (!error) navigate('/login')
  }

  const displayName = profile?.name?.split(' ')[0] || profile?.first_name || 'User'

  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        {/* Hamburger — mobile/tablet only */}
        {isSmall && (
          <button
            onClick={onMenuToggle}
            style={styles.hamburger}
            aria-label="Open menu"
          >
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
          </button>
        )}
        <span style={styles.title}>
          {isMobile ? '✝️' : '✝️ Church System'}
        </span>
      </div>

      <div style={styles.right}>
        {profile && <NotificationBell currentUserId={profile.id} />}

        <div style={styles.userSection}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={styles.userBtn}
          >
            <div style={styles.avatarSmall}>
              {displayName[0].toUpperCase()}
            </div>
            {!isMobile && (
              <>
                <span style={styles.userName}>{displayName}</span>
                {profile?.role === 'admin' && <span style={styles.adminBadge}>Admin</span>}
              </>
            )}
            <span style={styles.chevron}>▾</span>
          </button>

          {showDropdown && (
            <>
              <div style={styles.dropdownOverlay} onClick={() => setShowDropdown(false)} />
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownName}>{profile?.name || displayName}</div>
                  <div style={styles.dropdownEmail}>{profile?.email}</div>
                  {profile?.role === 'admin' && <span style={styles.adminBadge}>Admin</span>}
                </div>
                <div style={styles.divider} />
                <button onClick={() => { navigate('/profile'); setShowDropdown(false) }} style={styles.dropdownItem}>
                  👤 My Profile
                </button>
                <button onClick={handleSignOut} style={{ ...styles.dropdownItem, color: '#ef4444' }}>
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#16213e',
    color: '#fff',
    height: '56px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexShrink: 0
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '16px', fontWeight: '700', color: '#e0e7ff' },
  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px'
  },
  hamburgerLine: {
    display: 'block',
    width: '22px',
    height: '2px',
    backgroundColor: '#e0e7ff',
    borderRadius: '2px'
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  userSection: { position: 'relative' },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  avatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0
  },
  userName: { fontSize: '14px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  adminBadge: {
    backgroundColor: '#8b5cf6',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    color: '#fff'
  },
  chevron: { fontSize: '11px', opacity: 0.7 },
  dropdownOverlay: { position: 'fixed', inset: 0, zIndex: 998 },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 999,
    overflow: 'hidden'
  },
  dropdownHeader: { padding: '14px 16px', backgroundColor: '#f9fafb' },
  dropdownName: { fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '2px' },
  dropdownEmail: { fontSize: '12px', color: '#6b7280', marginBottom: '6px' },
  divider: { height: '1px', backgroundColor: '#e5e7eb' },
  dropdownItem: {
    width: '100%',
    padding: '11px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'block'
  }
}

export default Navbar
