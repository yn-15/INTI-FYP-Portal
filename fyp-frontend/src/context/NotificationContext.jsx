import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [user])

  // Fetch on mount and whenever user changes
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(unread.map(n => api.markNotificationRead(n.id)))
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  // Legacy helpers for pages that still use these signatures
  const getUnread = () => unreadCount
  const getMyNotifs = () => notifications

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifications, markRead, markAllRead,
      // Legacy compat
      getUnread, getMyNotifs,
      reads: [], // no longer needed but kept for compat
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
