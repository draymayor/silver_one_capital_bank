'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Users, UserCheck, UserX, Search, RefreshCw, Wallet } from 'lucide-react'

type Account = { id: string; account_type: string; account_number: string; balance: number; status: string }
type UserRow = { id: string; user_id: string; full_name: string; email: string; phone: string; status: string; created_at: string; accounts: Account[] }

const mockUsers: UserRow[] = [
  { id: '1', user_id: 'SUC-DEMO-001', full_name: 'Demo User', email: 'demo@example.com', phone: '+1 (555) 000-0000', status: 'active', created_at: new Date().toISOString(), accounts: [{ id: 'a1', account_type: 'checking', account_number: '****0000', balance: 0, status: 'active' }] },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(mockUsers)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [adjusting, setAdjusting] = useState<{ accountId: string; amount: string; note: string } | null>(null)

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      const payload = await res.json()
      if (res.ok && payload?.ok && payload.users?.length) setUsers(payload.users)
    } catch {
      // keep mock
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function updateUserStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      setToast(`User status updated to ${status}`)
      setTimeout(() => setToast(''), 3000)
    } catch {
      setToast('Failed to update status')
      setTimeout(() => setToast(''), 3000)
    }
  }

  async function applyBalanceAdjustment() {
    if (!adjusting) return
    try {
      const res = await fetch(`/api/admin/accounts/${adjusting.accountId}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(adjusting.amount), note: adjusting.note }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error)

      setUsers(prev => prev.map(u => ({
        ...u,
        accounts: u.accounts.map(a => a.id === adjusting.accountId ? { ...a, balance: payload.balance } : a),
      })))
      setToast('Balance adjusted and logged')
      setTimeout(() => setToast(''), 3000)
      setAdjusting(null)
    } catch {
      setToast('Failed to adjust balance')
      setTimeout(() => setToast(''), 3000)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6" data-testid="admin-users">
      {toast && <div className="fixed top-5 right-5 z-50 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Users & Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer status and internal demo balances.</p>
        </div>
        <button onClick={fetchUsers} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: UserX, color: 'bg-yellow-50 text-yellow-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <div><p className="font-heading font-bold text-2xl text-[#0B2447]">{value}</p><p className="text-gray-500 text-xs">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or User ID..." className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[#0B2447] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="users-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Accounts</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                      <p className="font-mono text-[11px] text-gray-500 mt-1">{u.user_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 min-w-[260px]">
                        {u.accounts.length === 0 ? <p className="text-xs text-gray-400">No accounts.</p> : u.accounts.map(a => (
                          <div key={a.id} className="border border-gray-200 rounded-lg p-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-700 capitalize">{a.account_type} · {a.account_number}</p>
                              <p className="text-xs font-bold text-[#0B2447]">{formatCurrency(Number(a.balance))}</p>
                            </div>
                            <button onClick={() => setAdjusting({ accountId: a.id, amount: '', note: '' })} className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#1565C0] hover:text-[#0B2447] font-semibold">
                              <Wallet className="w-3 h-3" /> Adjust balance
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.status !== 'active' && <button onClick={() => updateUserStatus(u.id, 'active')} className="text-green-600 text-xs font-semibold">Activate</button>}
                        {u.status === 'active' && <button onClick={() => updateUserStatus(u.id, 'suspended')} className="text-yellow-600 text-xs font-semibold">Suspend</button>}
                        {u.status !== 'deactivated' && <button onClick={() => updateUserStatus(u.id, 'deactivated')} className="text-red-500 text-xs font-semibold">Deactivate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjusting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 className="font-heading font-bold text-[#0B2447]">Adjust Internal Demo Balance</h3>
            <input value={adjusting.amount} onChange={(e) => setAdjusting({ ...adjusting, amount: e.target.value })} placeholder="Amount (+/-)" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" />
            <textarea value={adjusting.note} onChange={(e) => setAdjusting({ ...adjusting, note: e.target.value })} placeholder="Reason / note (optional)" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" rows={3} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdjusting(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
              <button onClick={applyBalanceAdjustment} className="px-4 py-2 text-sm rounded-lg bg-[#0B2447] text-white">Apply & Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
