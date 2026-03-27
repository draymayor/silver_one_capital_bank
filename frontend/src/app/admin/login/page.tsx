'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

function mapQueryErrorToMessage(code: string | null) {
  switch (code) {
    case 'session_expired':
      return 'Your session expired or is invalid. Please sign in again.'
    case 'admin_required':
      return 'This account does not have admin privileges.'
    case 'server_config_missing':
      return 'Server configuration is missing. Please contact support.'
    default:
      return ''
  }
}

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authErrorFromQuery, setAuthErrorFromQuery] = useState('')

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get('error')
    setAuthErrorFromQuery(mapQueryErrorToMessage(errorCode))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.session) {
        setError(authError?.message || 'Unable to sign in. Please try again.')
        return
      }

      if (data.user?.email !== 'admin@silverunioncapital.com') {
        await supabase.auth.signOut()
        setError('This account does not have admin privileges.')
        return
      }

      router.push('/admin')
    } catch (unexpectedError) {
      if (unexpectedError instanceof Error && unexpectedError.message) {
        setError(unexpectedError.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B2447] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="10" fill="white" fillOpacity="0.15"/>
              <path d="M100 30L140 80H120V130H80V80H60L100 30Z" fill="#C8C8C8"/>
              <path d="M60 140H140V155H60V140Z" fill="#00763d"/>
            </svg>
            <div>
              <p className="font-heading font-bold text-white text-xl">Silver Union Capital</p>
            </div>
          </div>
          <p className="text-white/60 text-sm">Secure Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#06162c] px-8 py-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-lg">Admin Sign In</h1>
              <p className="text-white/60 text-xs">Authorized personnel only</p>
            </div>
          </div>

          <div className="px-8 py-8">
            {(error || authErrorFromQuery) && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6" data-testid="admin-login-error">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error || authErrorFromQuery}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" data-testid="admin-login-form">
              <div>
                <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@silverunioncapital.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all"
                  data-testid="admin-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all"
                    data-testid="admin-password-input"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B2447] text-white hover:bg-[#06162c] disabled:opacity-60 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
                data-testid="admin-login-submit"
              >
                {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              This area is restricted. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
