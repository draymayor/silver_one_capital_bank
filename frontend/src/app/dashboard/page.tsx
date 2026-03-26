'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, PiggyBank, TrendingUp, Bell, ArrowUpRight, ArrowDownLeft, ArrowRight, Shield, Clock } from 'lucide-react'

const mockProfile = { full_name: 'Michael Johnson', user_id: 'SUC-2024-100001', status: 'active', created_at: new Date().toISOString() }
const mockAccounts = [
  { id: '1', account_type: 'checking', account_number: '****4521', balance: 12450.75, status: 'active' },
  { id: '2', account_type: 'savings', account_number: '****8832', balance: 45200.00, status: 'active' },
]
const mockActivity = [
  { id: '1', type: 'debit', desc: 'Online Purchase — Amazon', amount: -149.99, date: new Date().toISOString() },
  { id: '2', type: 'credit', desc: 'Payroll Deposit', amount: 5200.00, date: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', type: 'debit', desc: 'Utility Bill — ConEd', amount: -87.50, date: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', type: 'credit', desc: 'Transfer from Savings', amount: 500.00, date: new Date(Date.now() - 259200000).toISOString() },
  { id: '5', type: 'debit', desc: 'Grocery Store', amount: -63.20, date: new Date(Date.now() - 345600000).toISOString() },
]

export default function DashboardPage() {
  const [profile, setProfile] = useState(mockProfile)
  const [accounts, setAccounts] = useState(mockAccounts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: profileData } = await supabase.from('user_profiles').select('*').eq('auth_user_id', session.user.id).single()
        if (profileData) {
          setProfile(profileData)
          const { data: accountData } = await supabase.from('accounts').select('*').eq('user_profile_id', profileData.id)
          if (accountData && accountData.length > 0) setAccounts(accountData)
        }
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const accountIcons = { checking: CreditCard, savings: PiggyBank, investment: TrendingUp, business: TrendingUp }
  const accountColors = { checking: 'bg-blue-50 text-blue-700', savings: 'bg-green-50 text-green-700', investment: 'bg-purple-50 text-purple-700', business: 'bg-orange-50 text-orange-700' }
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Welcome */}
      <div className="bg-[#0B2447] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">Good day,</p>
          <h1 className="font-heading font-bold text-2xl mb-1">{profile.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-white/70 text-xs">User ID:</span>
              <span className="text-white font-mono font-semibold text-xs">{profile.user_id}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 rounded-lg px-3 py-1.5">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-green-300 text-xs font-medium capitalize">{profile.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total balance */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p className="text-gray-500 text-sm mb-1">Total Balance (All Accounts)</p>
        <p className="font-heading font-extrabold text-4xl text-[#0B2447]">{formatCurrency(totalBalance)}</p>
        <p className="text-gray-400 text-xs mt-2">Member since {formatDate(profile.created_at)}</p>
      </div>

      {/* Account cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {accounts.map((account) => {
          const Icon = accountIcons[account.account_type as keyof typeof accountIcons] ?? CreditCard
          const colorClass = accountColors[account.account_type as keyof typeof accountColors] ?? 'bg-gray-50 text-gray-700'
          return (
            <div key={account.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid="account-card">
              <div className="flex items-center justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Account {account.account_number}</span>
              </div>
              <p className="text-gray-500 text-xs capitalize mb-1">{account.account_type} Account</p>
              <p className="font-heading font-bold text-2xl text-[#0B2447]">{formatCurrency(account.balance)}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-400 capitalize">{account.status}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'My Account', href: '/dashboard/my-account', icon: CreditCard },
          { label: 'Profile', href: '/dashboard/profile', icon: Shield },
          { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0B2447]/20 transition-all group text-center">
            <div className="w-10 h-10 bg-[#0B2447]/8 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0B2447] group-hover:text-white transition-all">
              <Icon className="w-4.5 h-4.5 text-[#0B2447] group-hover:text-white" />
            </div>
            <p className="text-[#0B2447] text-xs font-semibold">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-[#0B2447] text-base">Recent Activity</h2>
          <Link href="/dashboard/my-account" className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {mockActivity.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {item.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.desc}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(item.date)}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
