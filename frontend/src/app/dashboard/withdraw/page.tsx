'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, X } from 'lucide-react'

interface WithdrawalRequest {
  id: string
  amount: number
  bank_name: string
  account_number: string
  status: 'pending' | 'verification_required' | 'completed' | 'rejected'
  created_at: string
}

export default function WithdrawPage() {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [vatCode, setVatCode] = useState('')
  const [taxCode, setTaxCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  async function fetchRequests() {
    const res = await fetch('/api/withdrawals', { credentials: 'include', cache: 'no-store' })
    const payload = await res.json().catch(() => null)
    if (res.ok && payload?.ok) setRequests(payload.requests ?? [])
  }

  useEffect(() => {
    void fetchRequests()
  }, [])

  const latestVerifiableRequest = useMemo(
    () => requests.find((request) => request.status === 'verification_required')?.id || '',
    [requests],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setNotice('')

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount, bankName, accountNumber, routingNumber, memo }),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.ok) {
        setNotice(payload?.error || 'Unable to submit withdrawal request right now.')
        return
      }

      setAmount('')
      setBankName('')
      setAccountNumber('')
      setRoutingNumber('')
      setMemo('')
      setNotice('Withdrawal request submitted successfully.')
      setRequests((prev) => [payload.request, ...prev])
      setSelectedRequestId(payload.request.id)
      setShowVerificationModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault()
    setVerifying(true)
    setNotice('')

    try {
      const requestId = selectedRequestId || latestVerifiableRequest
      if (!requestId) {
        setNotice('No pending verification withdrawal request found.')
        return
      }

      const res = await fetch('/api/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ requestId, vatCode, taxCode }),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.ok) {
        setNotice(payload?.error || 'Unable to verify withdrawal at this time.')
        return
      }

      setVatCode('')
      setTaxCode('')
      setNotice(payload.message || 'Withdrawal verification successful. Your withdrawal request is now completed.')
      await fetchRequests()
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6" data-testid="withdraw-page">
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setShowVerificationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close verification message">
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-gray-700 leading-7 pr-4">Withdrawal request submitted successfully. Additional verification is required in this demo workflow before the request can be completed. Contact customer support or check your email for the verification details.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/dashboard/support" className="inline-flex items-center justify-center bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c]">Open Support Chat</a>
              <a href="mailto:support@silverunioncapital.com" className="inline-flex items-center justify-center border border-[#0B2447] text-[#0B2447] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0B2447] hover:text-white">Email Support</a>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Withdraw Funds</h1>
        <p className="text-gray-500 text-sm mt-1">Request a withdrawal transfer to another US bank account.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
          <input required type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="1000.00" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Bank Name</label>
          <input required value={bankName} onChange={(event) => setBankName(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="Bank of America" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Account Number</label>
            <input required value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="000123456789" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Routing Number</label>
            <input required value={routingNumber} onChange={(event) => setRoutingNumber(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="021000021" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Memo (Optional)</label>
          <textarea value={memo} onChange={(event) => setMemo(event.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none" placeholder="Additional instructions" />
        </div>

        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50">
          <ArrowRightLeft className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>

        {notice && <p className="text-sm text-gray-600">{notice}</p>}
      </form>

      <form onSubmit={handleVerify} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-heading font-bold text-[#0B2447]">Withdrawal Verification</h2>
        <p className="text-xs text-gray-500">Enter your VAT code and TAX code exactly as provided to complete your withdrawal request.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">VAT code</label>
          <input required value={vatCode} onChange={(event) => setVatCode(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="VAT-123456" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TAX code</label>
          <input required value={taxCode} onChange={(event) => setTaxCode(event.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" placeholder="TAX-123456" />
        </div>
        <button type="submit" disabled={verifying || (!selectedRequestId && !latestVerifiableRequest)} className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50">
          {verifying ? 'Verifying...' : 'Verify & Complete Withdrawal'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-heading font-bold text-[#0B2447] mb-3">Withdrawal Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No withdrawal requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-100 rounded-xl p-3.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[#0B2447]">${Number(request.amount).toFixed(2)} • {request.bank_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${request.status === 'completed' ? 'bg-green-100 text-green-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Account ending {request.account_number.slice(-4)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
