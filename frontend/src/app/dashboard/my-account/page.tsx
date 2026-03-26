'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CreditCard, PiggyBank, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const demoAccounts = [
  { id: 'demo-1', account_type: 'checking', account_number: '****0000', routing_number: '000000000', balance: 0, status: 'active', created_at: new Date().toISOString() },
]

const icons = { checking: CreditCard, savings: PiggyBank, investment: TrendingUp, business: TrendingUp }
const colors = { checking: 'bg-blue-50 text-blue-700', savings: 'bg-green-50 text-green-700', investment: 'bg-purple-50 text-purple-700', business: 'bg-orange-50 text-orange-700' }

export default function MyAccountPage() {
  const [accounts, setAccounts] = useState(demoAccounts)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!profile?.id) return

        const { data } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_profile_id', profile.id)
          .order('created_at', { ascending: true })

        if (data && data.length > 0) {
          setAccounts(data.map((a) => ({ ...a, routing_number: '021000021' })))
        }
      } catch {
        // keep demo fallback
      }
    }

    fetchAccounts()
  }, [])

  return (
    <div className="space-y-6" data-testid="my-account-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your persisted account records.</p>
      </div>

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
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Account Number</p>
                  <p className="text-gray-700 font-medium">{a.account_number}</p>
                </div>
                <div>
                  <p className="text-gray-400">Routing Number</p>
                  <p className="text-gray-700 font-medium">{a.routing_number}</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
        Transaction history remains demo-only in this prototype.
      </div>
    </div>
  )
}
