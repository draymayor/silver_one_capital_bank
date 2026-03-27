'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Users, UserCheck, UserX, Search, RefreshCw, KeyRound } from 'lucide-react'

interface AccountRecord {
  id: string
  account_type: string
  status: string
}

interface UserRecord {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  status: string
  created_at: string
  accounts?: AccountRecord[]
}

const mockUsers: UserRecord[] = [
  { id: '1', user_id: 'SUC-2024-100001', full_name: 'James Brown', email: 'james@example.com', phone: '+1 (555) 111-2222', status: 'active', created_at: new Date(Date.now() - 172800000).toISOString(), accounts: [{ id: 'a1', account_type: 'checking', status: 'active' }] },
  { id: '2', user_id: 'SUC-2024-100002', full_name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 (555) 333-4444', status: 'active', created_at: new Date(Date.now() - 259200000).toISOString(), accounts: [{ id: 'a2', account_type: 'savings', status: 'active' }] },
  { id: '3', user_id: 'SUC-2024-100003', full_name: 'Michael Johnson', email: 'michael@example.com', phone: '+1 (555) 555-6666', status: 'suspended', created_at: new Date(Date.now() - 345600000).toISOString(), accounts: [] },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/users', { credentials: 'include' })
        const payload = await res.json()
        if (res.ok && payload?.ok && Array.isArray(payload.users) && payload.users.length > 0) {
          setUsers(payload.users)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 3500)
  }

  async function updateUserStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    })

    if (!res.ok) {
      showToast('Failed to update status')
      return
    }

    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)))
    showToast(`User status updated to ${status}`)
  }

  async function resetPassword(id: string) {
    const res = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      credentials: 'include',
    })
    const payload = await res.json()

    if (!res.ok || !payload?.ok) {
      showToast(payload?.error || 'Failed to reset password')
      return
    }

    showToast(`Temporary password: ${payload.temporaryPassword}`)
  }

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const query = search.toLowerCase()
    return users.filter((u) =>
      u.full_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.user_id.toLowerCase().includes(query)
    )
  }, [users, search])

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
          <p className="text-gray-500 text-sm mt-1">Manage customer accounts, status, and credentials</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active', value: users.filter((u) => u.status === 'active').length, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length, icon: UserX, color: 'bg-yellow-50 text-yellow-700' },
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or User ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
            data-testid="user-search-input" />
        </div>
      </div>

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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accounts</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0B2447]/10 rounded-full flex items-center justify-center text-[#0B2447] text-xs font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{user.user_id}</span></td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{user.accounts?.length ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.status !== 'active' && <button onClick={() => updateUserStatus(user.id, 'active')} className="text-green-600 hover:text-green-700 text-xs font-semibold">Activate</button>}
                        {user.status === 'active' && <button onClick={() => updateUserStatus(user.id, 'suspended')} className="text-yellow-600 hover:text-yellow-700 text-xs font-semibold">Suspend</button>}
                        {user.status !== 'deactivated' && <button onClick={() => updateUserStatus(user.id, 'deactivated')} className="text-red-500 hover:text-red-600 text-xs font-semibold">Deactivate</button>}
                        <button onClick={() => resetPassword(user.id)} className="inline-flex items-center gap-1 text-[#1565C0] hover:text-[#0B2447] text-xs font-semibold">
                          <KeyRound className="w-3 h-3" /> Reset Password
                        </button>
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
