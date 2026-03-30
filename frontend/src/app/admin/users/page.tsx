'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Users, UserCheck, UserX, Search, RefreshCw, KeyRound } from 'lucide-react'

interface AccountRecord {
  id: string
  account_type: string
  status: string
  balance?: number
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

interface WithdrawalRequest {
  id: string
  amount: number
  bank_name: string
  account_number: string
  status: 'pending' | 'verification_required' | 'completed' | 'rejected'
  created_at: string
  vat_code?: string
  tax_code?: string
  user_profiles?: {
    full_name?: string
    email?: string
    user_id?: string
  }
}

const transactionTypes = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'interest', label: 'Interest' },
  { value: 'refund', label: 'Refund' },
  { value: 'credit_adjustment', label: 'Credit Adjustment' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'fee', label: 'Fee' },
  { value: 'debit_adjustment', label: 'Debit Adjustment' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('deposit')
  const [description, setDescription] = useState('')
  const [addingTransaction, setAddingTransaction] = useState(false)
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' })
      const payload = await res.json().catch(() => null)
      if (res.ok && payload?.ok && Array.isArray(payload.users)) {
        setUsers(payload.users)
        setSelectedUser((current) => current || payload.users[0]?.id || '')
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchWithdrawals() {
    const res = await fetch('/api/admin/withdrawals', { credentials: 'include', cache: 'no-store' })
    const payload = await res.json().catch(() => null)
    if (res.ok && payload?.ok) setWithdrawalRequests(payload.requests ?? [])
  }

  useEffect(() => {
    void fetchUsers()
    void fetchWithdrawals()
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
    const payload = await res.json().catch(() => null)

    if (!res.ok || !payload?.ok) {
      showToast(payload?.error || 'Failed to reset password')
      return
    }

    showToast(`Temporary password: ${payload.temporaryPassword}`)
  }

  async function handleAddTransaction(event: FormEvent) {
    event.preventDefault()
    if (!selectedUser || !amount) return

    setAddingTransaction(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount, type, description }),
      })
      const payload = await res.json().catch(() => null)

      if (!res.ok || !payload?.ok) {
        showToast(payload?.error || 'Failed to add transaction')
        return
      }

      setAmount('')
      setDescription('')
      showToast('Transaction added successfully')
      await fetchUsers()
    } finally {
      setAddingTransaction(false)
    }
  }

  async function handleWithdrawalDecision(requestId: string, status: 'rejected') {
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestId, status }),
    })
    const payload = await res.json().catch(() => null)

    if (!res.ok || !payload?.ok) {
      showToast(payload?.error || `Failed to ${status} request`)
      return
    }

    showToast(`Withdrawal request ${status}`)
    await Promise.all([fetchWithdrawals(), fetchUsers()])
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
          <p className="text-gray-500 text-sm mt-1">Manage customer accounts, transactions, and withdrawal requests</p>
        </div>
        <button onClick={() => { void fetchUsers(); void fetchWithdrawals() }} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
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

      <form onSubmit={handleAddTransaction} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-heading font-bold text-[#0B2447] text-sm">Add Transaction to User Account</h2>
        <div className="grid lg:grid-cols-4 gap-3">
          <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none">
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name} • {user.user_id}</option>
            ))}
          </select>
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" required />
          <select value={type} onChange={(event) => setType(event.target.value)} className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none">
            {transactionTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" />
        </div>
        <button type="submit" disabled={addingTransaction || users.length === 0} className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50">
          {addingTransaction ? 'ADDING...' : '+ ADD TRANSACTION'}
        </button>
      </form>

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
                    <td className="px-6 py-4 text-gray-600 text-xs">{user.accounts?.length ?? 0} {typeof user.accounts?.[0]?.balance === 'number' ? `• ${formatCurrency(user.accounts[0].balance || 0)}` : ''}</td>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-[#0B2447]">Withdrawal Requests</h2>
          <p className="text-xs text-gray-500">Verification Required: {withdrawalRequests.filter((request) => request.status === 'verification_required').length}</p>
        </div>

        {withdrawalRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No withdrawal requests found.</p>
        ) : (
          <div className="space-y-3">
            {withdrawalRequests.map((request) => (
              <div key={request.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0B2447]">{request.user_profiles?.full_name || request.user_profiles?.email || request.user_profiles?.user_id || 'Customer'} requested {formatCurrency(Number(request.amount))}</p>
                    <p className="text-xs text-gray-500 mt-1">{request.bank_name} • acct ending {request.account_number.slice(-4)} • {formatDate(request.created_at)}</p>
                    <div className="mt-3 rounded-xl border border-[#0B2447]/15 bg-[#0B2447]/5 p-3">
                      <p className="text-xs font-semibold text-[#0B2447] mb-2">Verification Codes</p>
                      <p className="text-xs text-gray-700"><span className="font-semibold">VAT_code:</span> {request.vat_code || '—'}</p>
                      <p className="text-xs text-gray-700"><span className="font-semibold">TAX_code:</span> {request.tax_code || '—'}</p>
                      <p className="text-xs text-gray-500 mt-2">Customer: {request.user_profiles?.full_name || request.user_profiles?.email || request.user_profiles?.user_id || 'Customer'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${request.status === 'completed' ? 'bg-green-100 text-green-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status.replace('_', ' ')}</span>
                </div>
                {['pending', 'verification_required'].includes(request.status) && (
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => handleWithdrawalDecision(request.id, 'rejected')} className="text-xs font-semibold text-red-600 hover:text-red-700">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
