import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function NotificationBell({ currentUserId }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadNotifications = useCallback(async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (currentUserId) {
      ;(async () => { await loadNotifications() })()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUserId, loadNotifications])

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all as read:', error)
        return
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  function handleNotificationClick(notification) {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.bible_study_id) {
      navigate(`/bible-study/${notification.bible_study_id}`)
      setShowDropdown(false)
    }
  }

  function formatNotificationTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!currentUserId) return null

  return (
    <div style={styles.container}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellButton}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div style={styles.overlay} onClick={() => setShowDropdown(false)} />
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <h3 style={styles.dropdownTitle}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={styles.markAllButton}>
                  Mark all read
                </button>
              )}
            </div>

            <div style={styles.notificationsList}>
              {loading ? (
                <div style={styles.emptyState}>Loading...</div>
              ) : notifications.length === 0 ? (
                <div style={styles.emptyState}>No notifications yet</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      ...styles.notificationItem,
                      ...(notification.is_read ? {} : styles.notificationItemUnread)
                    }}
                  >
                    <div style={styles.notificationContent}>
                      <p style={styles.notificationMessage}>{notification.message}</p>
                      <span style={styles.notificationTime}>
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </div>
                    {!notification.is_read && <span style={styles.unreadDot} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: { position: 'relative' },
  bellButton: {
    position: 'relative',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px'
  },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 5px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center'
  },
  overlay: { position: 'fixed', inset: 0, zIndex: 999 },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '360px',
    maxWidth: '90vw',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: '500px',
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  dropdownTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' },
  markAllButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#8b5cf6',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  notificationsList: { overflowY: 'auto', maxHeight: '400px' },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  },
  notificationItemUnread: { backgroundColor: '#faf5ff' },
  notificationContent: { flex: 1 },
  notificationMessage: { margin: '0 0 4px 0', fontSize: '14px', color: '#1f2937', lineHeight: '1.5' },
  notificationTime: { fontSize: '12px', color: '#6b7280' },
  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    marginLeft: '12px',
    flexShrink: 0
  },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }
}

export default NotificationBell
