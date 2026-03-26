'use client'

import { CreditCard, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const accounts = [
  { id: '1', account_type: 'checking', account_number: '****4521', routing_number: '021000021', balance: 12450.75, status: 'active', opened: '2024-01-15' },
  { id: '2', account_type: 'savings', account_number: '****8832', routing_number: '021000021', balance: 45200.00, status: 'active', opened: '2024-01-15' },
]
const transactions = [
  { id: '1', type: 'debit', desc: 'Online Purchase — Amazon', amount: -149.99, date: new Date().toISOString(), category: 'Shopping' },
  { id: '2', type: 'credit', desc: 'Payroll Deposit — Tech Corp', amount: 5200.00, date: new Date(Date.now() - 86400000).toISOString(), category: 'Income' },
  { id: '3', type: 'debit', desc: 'Utility Bill — ConEd', amount: -87.50, date: new Date(Date.now() - 172800000).toISOString(), category: 'Utilities' },
  { id: '4', type: 'credit', desc: 'Interest Credit', amount: 18.45, date: new Date(Date.now() - 259200000).toISOString(), category: 'Interest' },
  { id: '5', type: 'debit', desc: 'Grocery Store — Whole Foods', amount: -63.20, date: new Date(Date.now() - 345600000).toISOString(), category: 'Food' },
  { id: '6', type: 'debit', desc: 'Netflix Subscription', amount: -15.99, date: new Date(Date.now() - 432000000).toISOString(), category: 'Entertainment' },
  { id: '7', type: 'debit', desc: 'Gas Station', amount: -54.30, date: new Date(Date.now() - 518400000).toISOString(), category: 'Transport' },
]

const icons = { checking: CreditCard, savings: PiggyBank, investment: TrendingUp }
const colors = { checking: 'bg-blue-50 text-blue-700', savings: 'bg-green-50 text-green-700', investment: 'bg-purple-50 text-purple-700' }

export default function MyAccountPage() {
  return (
    <div className="space-y-6" data-testid="my-account-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your accounts and review transactions.</p>
      </div>

      {/* Account cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {accounts.map(a => {
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
                  <p className="text-gray-700 font-medium">{formatDate(a.opened)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading font-bold text-[#0B2447] text-base">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(t => (
            <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {t.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.desc}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {formatDate(t.date)} · {t.category}
                  </p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
