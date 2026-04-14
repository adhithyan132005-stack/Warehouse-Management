import { useEffect, useState } from "react"
import axios from "axios"

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get("http://localhost:4444/api/notifications", {
        headers: { authorization: token }
      })
      setNotifications(response.data)
      setUnreadCount(response.data.filter(n => !n.isRead).length)
    } catch (err) {
      console.log("Error fetching notifications:", err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:4444/api/notifications/${notificationId}/read`, {}, {
        headers: { authorization: token }
      })
      // Update local state
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.log("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put("http://localhost:4444/api/notifications/mark-all-read", {}, {
        headers: { authorization: token }
      })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.log("Error marking all notifications as read:", err)
    }
  }

  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <button
        className="notification-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge" style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown" style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '350px',
          maxHeight: '400px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: notification.isRead ? 'var(--bg-card)' : 'rgba(59, 130, 246, 0.05)',
                    cursor: 'pointer'
                  }}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.95rem',
                        fontWeight: notification.isRead ? 'normal' : '600',
                        color: 'var(--text)'
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--text-dim)',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <small style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {!notification.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-dim)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}