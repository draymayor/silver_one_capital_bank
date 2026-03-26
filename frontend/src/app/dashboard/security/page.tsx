'use client'

import { useState } from 'react'
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' })

  function handleChange(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.newPw.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (form.newPw !== form.confirm) {
      setError('Password confirmation does not match.')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No active session found.')

      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.access_token,
          currentPassword: form.current,
          newPassword: form.newPw,
        }),
      })

      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Password update failed')

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl" data-testid="security-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Security Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your password and security preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-heading font-bold text-[#0B2447] text-base mb-5">Account Security Status</h2>
        <div className="space-y-4">
          {[
            { label: 'SSL Encryption', desc: '256-bit encryption on all connections', ok: true },
            { label: 'Account Active', desc: 'Your account is in good standing', ok: true },
            { label: 'FDIC Insured', desc: 'Deposits insured up to $250,000', ok: true },
          ].map(({ label, desc, ok }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <CheckCircle className={`w-5 h-5 ${ok ? 'text-green-500' : 'text-gray-300'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Lock className="w-4 h-4 text-[#0B2447]" />
          <h3 className="font-heading font-bold text-[#0B2447] text-sm">Change Password</h3>
        </div>
        <div className="p-6">
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-700 text-sm font-medium">Password updated successfully.</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="change-password-form">
            {[
              { key: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { key: 'newPw', label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
              { key: 'confirm', label: 'Confirm New Password', show: false, toggle: () => {} },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form[key as keyof typeof form]}
                    onChange={e => handleChange(key, e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
                    data-testid={`${key}-input`}
                  />
                  {key !== 'confirm' && (
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="bg-[#0B2447] text-white hover:bg-[#06162c] disabled:opacity-60 px-6 py-3 rounded-xl text-sm font-semibold transition-all" data-testid="update-password-btn">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl p-5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#1565C0] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#0B2447] mb-1">Security Tips</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Use a unique password not used on other sites</li>
            <li>• Never share your User ID or password</li>
            <li>• Contact support immediately if you notice suspicious activity</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
