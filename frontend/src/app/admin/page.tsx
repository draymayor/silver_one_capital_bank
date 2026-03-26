'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import {
  FileText, Users, CheckCircle, Clock, XCircle, TrendingUp,
  ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react'

interface Stats { total: number; submitted: number; under_review: number; approved: number; rejected: number; active_users: number }

const mockApplications = [
  { id: 'app-001', status: 'submitted', created_at: new Date().toISOString(), step_data: { personal: { firstName: 'Michael', lastName: 'Johnson' }, contact: { email: 'michael@example.com' }, accountDetails: { accountType: 'checking' } } },
  { id: 'app-002', status: 'under_review', created_at: new Date(Date.now() - 86400000).toISOString(), step_data: { personal: { firstName: 'Sarah', lastName: 'Williams' }, contact: { email: 'sarah@example.com' }, accountDetails: { accountType: 'savings' } } },
  { id: 'app-003', status: 'approved', created_at: new Date(Date.now() - 172800000).toISOString(), step_data: { personal: { firstName: 'James', lastName: 'Brown' }, contact: { email: 'james@example.com' }, accountDetails: { accountType: 'investment' } } },
  { id: 'app-004', status: 'rejected', created_at: new Date(Date.now() - 259200000).toISOString(), step_data: { personal: { firstName: 'Emily', lastName: 'Davis' }, contact: { email: 'emily@example.com' }, accountDetails: { accountType: 'checking' } } },
  { id: 'app-005', status: 'submitted', created_at: new Date(Date.now() - 345600000).toISOString(), step_data: { personal: { firstName: 'Robert', lastName: 'Wilson' }, contact: { email: 'robert@example.com' }, accountDetails: { accountType: 'business' } } },
]

export default function AdminOverviewPage() {
  const [applications, setApplications] = useState(mockApplications)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 5, submitted: 2, under_review: 1, approved: 1, rejected: 1, active_users: 1 })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false }).limit(10)
        if (!error && data && data.length > 0) {
          setApplications(data)
          const s: Stats = { total: data.length, submitted: 0, under_review: 0, approved: 0, rejected: 0, active_users: 0 }
          data.forEach((a) => {
            switch (a.status) {
              case 'submitted':
                s.submitted += 1
                break
              case 'under_review':
                s.under_review += 1
                break
              case 'approved':
                s.approved += 1
                break
              case 'rejected':
                s.rejected += 1
                break
            }
          })
          const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')
          s.active_users = count ?? 0
          setStats(s)
        }
      } catch { /* use mock data */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-700', change: '+12%' },
    { label: 'Pending Review', value: stats.submitted + stats.under_review, icon: Clock, color: 'bg-yellow-50 text-yellow-700', change: '' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-50 text-green-700', change: '+8%' },
    { label: 'Active Users', value: stats.active_users, icon: Users, color: 'bg-purple-50 text-purple-700', change: '' },
  ]

  return (
    <div className="space-y-6" data-testid="admin-overview">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 hover:border-[#0B2447] transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {change && <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" />{change}</span>}
            </div>
            <p className="font-heading font-extrabold text-3xl text-[#0B2447]">{loading ? '–' : value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/admin/applications?status=submitted" className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-yellow-900 text-sm">New Applications</p>
              <p className="text-yellow-700 text-2xl font-extrabold mt-1">{stats.submitted}</p>
              <p className="text-yellow-600 text-xs mt-1">Awaiting review</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
        <Link href="/admin/applications?status=under_review" className="bg-blue-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-blue-900 text-sm">Under Review</p>
              <p className="text-blue-700 text-2xl font-extrabold mt-1">{stats.under_review}</p>
              <p className="text-blue-600 text-xs mt-1">In progress</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
        <Link href="/admin/users" className="bg-purple-50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-purple-900 text-sm">Active Users</p>
              <p className="text-purple-700 text-2xl font-extrabold mt-1">{stats.active_users}</p>
              <p className="text-purple-600 text-xs mt-1">Customer accounts</p>
            </div>
            <Users className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-[#0B2447] text-base">Recent Applications</h2>
          <Link href="/admin/applications" className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.slice(0, 5).map((app) => {
                const name = `${app.step_data?.personal?.firstName ?? ''} ${app.step_data?.personal?.lastName ?? ''}`.trim() || 'Unknown'
                const accountType = app.step_data?.accountDetails?.accountType ?? '—'
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0B2447]/10 rounded-full flex items-center justify-center text-[#0B2447] text-xs font-bold">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{name}</p>
                          <p className="text-gray-400 text-xs">{app.step_data?.contact?.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{accountType}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(app.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/applications/${app.id}`} className="text-[#1565C0] hover:text-[#0B2447] text-xs font-medium transition-colors">
                        Review
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
