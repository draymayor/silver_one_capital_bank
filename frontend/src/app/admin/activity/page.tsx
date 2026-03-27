'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Activity, Search, RefreshCw } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  admin_email: string
  details: Record<string, string>
  created_at: string
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/audit', { credentials: 'include' })
        const payload = await res.json()
        if (res.ok && payload?.ok && Array.isArray(payload.logs)) {
          setLogs(payload.logs)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return logs
    const query = search.toLowerCase()
    return logs.filter((log) => `${log.action} ${log.entity_type} ${log.admin_email}`.toLowerCase().includes(query))
  }, [logs, search])

  return (
    <div className="space-y-6" data-testid="admin-activity">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Admin Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Audit trail of admin actions and system events</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity by action, entity, or admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0B2447] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#1565C0]" />
                        <span className="font-medium text-gray-900">{log.action.replaceAll('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {log.entity_type} <span className="text-gray-400">{log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{log.admin_email || 'system'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
