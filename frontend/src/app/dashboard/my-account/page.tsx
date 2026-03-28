'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ArrowRightLeft, CreditCard, Landmark, PiggyBank, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getRoutingNumber } from '@/lib/banking'

interface Account {
  id: string
  account_type: string
  account_number: string
  balance: number
  status: string
  created_at: string
}

const icons = { checking: CreditCard, savings: PiggyBank, investment: TrendingUp, business: TrendingUp }
const colors = { checking: 'bg-blue-50 text-blue-700', savings: 'bg-green-50 text-green-700', investment: 'bg-purple-50 text-purple-700', business: 'bg-orange-50 text-orange-700' }

export default function MyAccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setAccounts([])
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!profile?.id) {
          setAccounts([])
          return
        }

        const { data } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_profile_id', profile.id)
          .order('created_at', { ascending: true })

        setAccounts((data ?? []) as Account[])
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const routingNumber = getRoutingNumber()

  return (
    <div className="space-y-6" data-testid="my-account-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">Review your account details and balances.</p>
        </div>
        <Link
          href="/dashboard/withdraw"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B2447] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#06162c] transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" /> Withdraw Funds
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">No account records available yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {accounts.map((a) => {
            const Icon = icons[a.account_type as keyof typeof icons] ?? CreditCard
            const colorClass = colors[a.account_type as keyof typeof colors] ?? 'bg-gray-50 text-gray-700'
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-gray-400 text-xs capitalize mb-1">{a.account_type} Account</p>
                <p className="font-heading font-bold text-2xl text-[#0B2447] mb-4">{formatCurrency(a.balance)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Account Number</p>
                    <p className="text-gray-700 font-medium break-all">{a.account_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Routing Number</p>
                    <p className="text-gray-700 font-medium">{routingNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Opened</p>
                    <p className="text-gray-700 font-medium">{formatDate(a.created_at)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Landmark className="w-5 h-5 text-[#0B2447]" />
          <h2 className="font-heading font-bold text-[#0B2447]">Withdraw to Another US Bank</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Start a withdrawal request and our operations team will process your outgoing transfer details.</p>
        <Link href="/dashboard/withdraw" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565C0] hover:text-[#0B2447]">
          Open withdrawal request form <ArrowRightLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
