import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'

function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUserId = 1 // Demo: hardcoded user ID
  const [filter, setFilter] = useState('all') // all, unread, read

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (filter === 'unread') {
        query = query.eq('is_read', false)
      } else if (filter === 'read') {
        query = query.eq('is_read', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        throw error
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
      alert('Error loading notifications: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    ;(async () => { await loadNotifications() })()
  }, [loadNotifications])

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

      await loadNotifications()
      alert('All notifications marked as read!')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  async function deleteNotification(notificationId) {
    if (!window.confirm('Are you sure you want to delete this notification?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Error deleting notification:', error)
        alert('Error deleting notification: ' + error.message)
        return
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  function handleNotificationClick(notification) {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.bible_study_id) {
      navigate(`/bible-study/${notification.bible_study_id}`)
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔔 Notifications</h1>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>Mark All as Read</Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{ ...styles.filterTab, ...(filter === tab ? styles.filterTabActive : {}) }}
          >
            {tab === 'all' && `All (${notifications.length})`}
            {tab === 'unread' && `Unread (${unreadCount})`}
            {tab === 'read' && `Read (${notifications.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={styles.notificationsList}>
        {notifications.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>
              {filter === 'unread'
                ? 'No unread notifications'
                : filter === 'read'
                ? 'No read notifications'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.notificationCard,
                ...(notification.is_read ? {} : styles.notificationCardUnread)
              }}
            >
              <div
                onClick={() => handleNotificationClick(notification)}
                style={styles.notificationContent}
              >
                <div style={styles.notificationHeader}>
                  <div style={styles.notificationIcon}>
                    {notification.is_read ? '📭' : '📬'}
                  </div>
                  <div style={styles.notificationBody}>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                    <span style={styles.notificationTime}>{formatDate(notification.created_at)}</span>
                  </div>
                  {!notification.is_read && <span style={styles.unreadBadge}>New</span>}
                </div>
              </div>

              <div style={styles.notificationActions}>
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    style={styles.actionButton}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  style={styles.actionButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: { fontSize: '28px', color: '#1f2937', margin: 0 },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0'
  },
  filterTab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    marginBottom: '-2px'
  },
  filterTabActive: { color: '#8b5cf6', borderBottomColor: '#8b5cf6' },
  notificationsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  notificationCardUnread: { backgroundColor: '#faf5ff', borderLeft: '4px solid #8b5cf6' },
  notificationContent: { flex: 1, cursor: 'pointer' },
  notificationHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  notificationIcon: { fontSize: '24px', flexShrink: 0 },
  notificationBody: { flex: 1 },
  notificationMessage: { margin: '0 0 6px 0', fontSize: '15px', color: '#1f2937', lineHeight: '1.6', fontWeight: '500' },
  notificationTime: { fontSize: '13px', color: '#6b7280' },
  unreadBadge: {
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  notificationActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  actionButton: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  empty: { textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '12px' },
  emptyText: { margin: 0, fontSize: '16px', color: '#6b7280' }
}

export default Notifications
