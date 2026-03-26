'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Users, UserCheck, UserX, Search, RefreshCw, Shield } from 'lucide-react'

const mockUsers = [
  { id: '1', user_id: 'SUC-2024-100001', full_name: 'James Brown', email: 'james@example.com', phone: '+1 (555) 111-2222', status: 'active', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '2', user_id: 'SUC-2024-100002', full_name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 (555) 333-4444', status: 'active', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: '3', user_id: 'SUC-2024-100003', full_name: 'Michael Johnson', email: 'michael@example.com', phone: '+1 (555) 555-6666', status: 'suspended', created_at: new Date(Date.now() - 345600000).toISOString() },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) setUsers(data)
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  async function updateUserStatus(id: string, status: string) {
    try {
      await supabase.from('user_profiles').update({ status }).eq('id', id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      setToast(`User status updated to ${status}`)
      setTimeout(() => setToast(''), 3000)
    } catch { setToast('Failed to update status') }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6" data-testid="admin-users">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage active customer accounts</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: UserX, color: 'bg-yellow-50 text-yellow-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl text-[#0B2447]">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or User ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
            data-testid="user-search-input" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0B2447] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="users-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0B2447]/10 rounded-full flex items-center justify-center text-[#0B2447] text-xs font-bold">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.full_name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{u.user_id}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(u.status)}`}>
                        {getStatusLabel(u.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.status !== 'active' && (
                          <button onClick={() => updateUserStatus(u.id, 'active')} className="text-green-600 hover:text-green-700 text-xs font-semibold transition-colors" data-testid="activate-user-btn">
                            Activate
                          </button>
                        )}
                        {u.status === 'active' && (
                          <button onClick={() => updateUserStatus(u.id, 'suspended')} className="text-yellow-600 hover:text-yellow-700 text-xs font-semibold transition-colors" data-testid="suspend-user-btn">
                            Suspend
                          </button>
                        )}
                        {u.status !== 'deactivated' && (
                          <button onClick={() => updateUserStatus(u.id, 'deactivated')} className="text-red-500 hover:text-red-600 text-xs font-semibold transition-colors">
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
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
