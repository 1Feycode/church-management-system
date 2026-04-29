import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../common/NotificationBell'

function Navbar() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  async function handleSignOut() {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <div style={styles.navbar}>
      <h2>Church System</h2>
      <div style={styles.rightSection}>
        {profile && <NotificationBell currentUserId={profile.id} />}
        
        <div style={styles.userSection}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={styles.userButton}
          >
            <span style={styles.userName}>
              {profile?.first_name || profile?.name || 'User'}
            </span>
            {profile?.role === 'admin' && (
              <span style={styles.adminBadge}>Admin</span>
            )}
            <span style={styles.dropdownIcon}>▼</span>
          </button>

          {showDropdown && (
            <>
              <div
                style={styles.dropdownOverlay}
                onClick={() => setShowDropdown(false)}
              />
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownName}>
                    {profile?.first_name} {profile?.last_name}
                  </div>
                  <div style={styles.dropdownEmail}>{profile?.email}</div>
                </div>
                <div style={styles.dropdownDivider} />
                <button onClick={handleSignOut} style={styles.dropdownItem}>
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
    padding: '15px 30px',
    backgroundColor: '#16213e',
    color: '#fff',
    height: '60px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userSection: {
    position: 'relative'
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    border: 'none',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  userName: {
    fontSize: '14px'
  },
  adminBadge: {
    backgroundColor: '#8b5cf6',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dropdownIcon: {
    fontSize: '10px',
    marginLeft: '4px'
  },
  dropdownOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 998
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    zIndex: 999,
    overflow: 'hidden'
  },
  dropdownHeader: {
    padding: '16px',
    backgroundColor: '#f9fafb'
  },
  dropdownName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  dropdownEmail: {
    fontSize: '13px',
    color: '#6b7280'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb'
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: '500'
  }
}

export default Navbar
