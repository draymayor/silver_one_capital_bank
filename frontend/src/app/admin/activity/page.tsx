'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Activity, Bell, MessageSquare, RefreshCw } from 'lucide-react'

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [openSupport, setOpenSupport] = useState(0)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/activity', { credentials: 'include' })
      const payload = await res.json()
      if (res.ok && payload?.ok) {
        setLogs(payload.logs ?? [])
        setNotifications(payload.notifications ?? [])
        setOpenSupport(payload.open_support_count ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="space-y-6" data-testid="admin-activity">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Admin Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Audit logs, notifications, and support visibility.</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500">Open Support Threads</p>
          <p className="font-heading font-bold text-3xl text-[#0B2447] mt-1">{openSupport}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500">Recent Audit Events</p>
          <p className="font-heading font-bold text-3xl text-[#0B2447] mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500">Recent Notifications</p>
          <p className="font-heading font-bold text-3xl text-[#0B2447] mt-1">{notifications.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"><Activity className="w-4 h-4 text-[#0B2447]" /><p className="font-semibold text-[#0B2447] text-sm">Audit Log</p></div>
          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {loading ? <p className="p-5 text-sm text-gray-400">Loading...</p> : logs.length === 0 ? <p className="p-5 text-sm text-gray-400">No audit entries.</p> : logs.map((log) => (
              <div key={log.id} className="p-4">
                <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">{log.entity_type} · {log.admin_email || 'admin'}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatDate(log.created_at)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"><Bell className="w-4 h-4 text-[#0B2447]" /><p className="font-semibold text-[#0B2447] text-sm">System Notifications</p></div>
          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {loading ? <p className="p-5 text-sm text-gray-400">Loading...</p> : notifications.length === 0 ? <p className="p-5 text-sm text-gray-400">No notifications.</p> : notifications.map((n) => (
              <div key={n.id} className="p-4">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Includes approval + system notifications</div>
        </div>
      </div>
    </div>
  )
}
