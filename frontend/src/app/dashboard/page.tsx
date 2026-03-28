'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, PiggyBank, TrendingUp, Bell, ArrowRight, Shield, ArrowRightLeft, LifeBuoy } from 'lucide-react'

interface Profile {
  full_name: string
  user_id: string
  status: string
  created_at: string
  id: string
}

interface Account {
  id: string
  account_type: string
  account_number: string
  balance: number
  status: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: profileData } = await supabase.from('user_profiles').select('*').eq('auth_user_id', session.user.id).single()
        if (!profileData) return

        setProfile(profileData as Profile)
        const { data: accountData } = await supabase.from('accounts').select('*').eq('user_profile_id', profileData.id)
        setAccounts((accountData ?? []) as Account[])
      } catch {
        setProfile(null)
        setAccounts([])
      }
    }

    fetchData()
  }, [])

  const accountIcons = { checking: CreditCard, savings: PiggyBank, investment: TrendingUp, business: TrendingUp }
  const accountColors = { checking: 'bg-blue-50 text-blue-700', savings: 'bg-green-50 text-green-700', investment: 'bg-purple-50 text-purple-700', business: 'bg-orange-50 text-orange-700' }
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      <div className="bg-[#0B2447] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">Good day,</p>
          <h1 className="font-heading font-bold text-2xl mb-1">{profile?.full_name || 'Customer'}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-white/70 text-xs">User ID:</span>
              <span className="text-white font-mono font-semibold text-xs">{profile?.user_id || '--'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 rounded-lg px-3 py-1.5">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-green-300 text-xs font-medium capitalize">{profile?.status || 'active'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p className="text-gray-500 text-sm mb-1">Total Balance (All Accounts)</p>
        <p className="font-heading font-extrabold text-4xl text-[#0B2447]">{formatCurrency(totalBalance)}</p>
        <p className="text-gray-400 text-xs mt-2">Member since {profile?.created_at ? formatDate(profile.created_at) : '--'}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-sm text-gray-500">No account records available yet.</div>
        ) : accounts.map((account) => {
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'My Account', href: '/dashboard/my-account', icon: CreditCard },
          { label: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowRightLeft },
          { label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-[#0B2447] text-base">Recent Activity</h2>
          <Link href="/dashboard/my-account" className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium flex items-center gap-1">
            View accounts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="px-6 py-10 text-sm text-gray-500">Recent activity appears here after transactions are recorded.</div>
      </div>
    </div>
  )
}
