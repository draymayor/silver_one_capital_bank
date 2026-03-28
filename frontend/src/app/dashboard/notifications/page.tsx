'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  notification_type: 'success' | 'warning' | 'info'
  created_at: string
}

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setNotifications([])
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!profile?.id) {
          setNotifications([])
          return
        }

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_profile_id', profile.id)
          .order('created_at', { ascending: false })

        setNotifications((data ?? []) as Notification[])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }

  async function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 max-w-2xl" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium transition-colors" data-testid="mark-all-read-btn">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">New account activity and alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const cfg = typeConfig[n.notification_type as keyof typeof typeConfig] ?? typeConfig.info
            const Icon = cfg.icon
            return (
              <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${!n.is_read ? 'border-[#0B2447]/20 shadow-md' : 'border-gray-100'}`} data-testid="notification-item">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-heading font-semibold text-sm ${!n.is_read ? 'text-[#0B2447]' : 'text-gray-700'}`}>{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 bg-[#0B2447] rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-gray-400 text-xs">{formatDate(n.created_at)}</p>
                    <div className="flex items-center gap-3">
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} className="text-[#1565C0] text-xs font-medium hover:text-[#0B2447] transition-colors">
                          Mark read
                        </button>
                      )}
                      <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
