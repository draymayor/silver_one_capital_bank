'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Search, Filter, ArrowRight, RefreshCw } from 'lucide-react'

const mockApplications = [
  { id: 'app-001', status: 'submitted', created_at: new Date().toISOString(), step_data: { personal: { firstName: 'Michael', lastName: 'Johnson' }, contact: { email: 'michael@example.com' }, accountDetails: { accountType: 'checking' } } },
  { id: 'app-002', status: 'under_review', created_at: new Date(Date.now() - 86400000).toISOString(), step_data: { personal: { firstName: 'Sarah', lastName: 'Williams' }, contact: { email: 'sarah@example.com' }, accountDetails: { accountType: 'savings' } } },
  { id: 'app-003', status: 'approved', created_at: new Date(Date.now() - 172800000).toISOString(), step_data: { personal: { firstName: 'James', lastName: 'Brown' }, contact: { email: 'james@example.com' }, accountDetails: { accountType: 'investment' } } },
  { id: 'app-004', status: 'rejected', created_at: new Date(Date.now() - 259200000).toISOString(), step_data: { personal: { firstName: 'Emily', lastName: 'Davis' }, contact: { email: 'emily@example.com' }, accountDetails: { accountType: 'checking' } } },
  { id: 'app-005', status: 'submitted', created_at: new Date(Date.now() - 345600000).toISOString(), step_data: { personal: { firstName: 'Robert', lastName: 'Wilson' }, contact: { email: 'robert@example.com' }, accountDetails: { accountType: 'business' } } },
  { id: 'app-006', status: 'under_review', created_at: new Date(Date.now() - 432000000).toISOString(), step_data: { personal: { firstName: 'Lisa', lastName: 'Martinez' }, contact: { email: 'lisa@example.com' }, accountDetails: { accountType: 'savings' } } },
]

const statuses = ['all', 'submitted', 'under_review', 'approved', 'rejected']

export default function ApplicationsClient() {
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState(mockApplications)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')

  useEffect(() => {
    async function fetchApps() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) setApplications(data)
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    fetchApps()
  }, [])

  const filtered = applications.filter(app => {
    const name = `${app.step_data?.personal?.firstName ?? ''} ${app.step_data?.personal?.lastName ?? ''}`.toLowerCase()
    const email = (app.step_data?.contact?.email ?? '').toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || app.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6" data-testid="admin-applications">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage account applications</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 hover:border-[#0B2447] transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
              data-testid="app-search-input" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none bg-white"
              data-testid="status-filter-select">
              {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : getStatusLabel(s)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0B2447] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-400 text-sm">No applications found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="applications-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => {
                  const name = `${app.step_data?.personal?.firstName ?? ''} ${app.step_data?.personal?.lastName ?? ''}`.trim() || 'Unknown'
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0B2447]/10 rounded-full flex items-center justify-center text-[#0B2447] text-xs font-bold">{name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-gray-400 text-xs">{app.step_data?.contact?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{app.step_data?.accountDetails?.accountType ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(app.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/applications/${app.id}`} className="inline-flex items-center gap-1 text-[#1565C0] hover:text-[#0B2447] text-xs font-semibold transition-colors" data-testid="review-app-link">
                          Review <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
