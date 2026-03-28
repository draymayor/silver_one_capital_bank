'use client'

import { FormEvent, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setNotice('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setNotice('Please sign in again to submit a withdrawal request.')
        return
      }

      const message = [
        `Withdrawal Amount: $${amount}`,
        `Destination Bank: ${bankName}`,
        `Destination Account Number: ${accountNumber}`,
        `Destination Routing Number: ${routingNumber}`,
        memo ? `Memo: ${memo}` : null,
      ].filter(Boolean).join('\n')

      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Withdrawal Request',
          message,
        }),
      })

      const payload = await res.json()
      if (!res.ok || !payload?.ok) {
        setNotice(payload?.error || 'Unable to submit withdrawal request right now.')
        return
      }

      setAmount('')
      setBankName('')
      setAccountNumber('')
      setRoutingNumber('')
      setMemo('')
      setNotice('Withdrawal request sent. Support will follow up in your Support Messages inbox.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6" data-testid="withdraw-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Withdraw Funds</h1>
        <p className="text-gray-500 text-sm mt-1">Request a withdrawal transfer to another US bank account.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
            placeholder="1000.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Bank Name</label>
          <input
            required
            value={bankName}
            onChange={(event) => setBankName(event.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
            placeholder="Bank of America"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Account Number</label>
            <input
              required
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
              placeholder="000123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Routing Number</label>
            <input
              required
              value={routingNumber}
              onChange={(event) => setRoutingNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
              placeholder="021000021"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Memo (Optional)</label>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
            placeholder="Additional instructions"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>

        {notice && <p className="text-sm text-gray-600">{notice}</p>}
      </form>
    </div>
  )
}
