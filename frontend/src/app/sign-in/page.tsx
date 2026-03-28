'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Shield, Lock, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'

function mapQueryErrorToMessage(code: string | null) {
  switch (code) {
    case 'session_expired':
      return 'Your session expired or is invalid. Please sign in again.'
    case 'customer_required':
      return 'This account cannot access the customer dashboard.'
    case 'profile_not_found':
      return 'We could not load your customer profile. Please contact support.'
    default:
      return ''
  }
}

export default function SignInPage() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authErrorFromQuery, setAuthErrorFromQuery] = useState('')

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get('error')
    setAuthErrorFromQuery(mapQueryErrorToMessage(errorCode))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!userId.trim() || !password) {
      setError('Please enter your User ID and password.')
      return
    }
    setLoading(true)
    try {
      // Map User ID → email format used during account creation
      const email = `${userId.trim().toUpperCase()}@silverunioncapital.com`
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError || !data.session) {
        setError('Invalid User ID or password. Please check your credentials and try again.')
        return
      }

      let hasPersistedSession = false
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          hasPersistedSession = true
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (!hasPersistedSession) {
        setError('Login succeeded, but your session did not persist. Please try again.')
        return
      }

      window.location.assign('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0B2447] px-8 py-8 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mx-auto mb-4">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-white mb-1">Welcome Back</h1>
              <p className="text-white/70 text-sm">Sign in to your Silver Union Capital account</p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              {(error || authErrorFromQuery) && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6" data-testid="signin-error">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error || authErrorFromQuery}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" data-testid="signin-form">
                <div>
                  <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">User ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. SUC-2024-123456"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-charcoal focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all"
                    autoComplete="username"
                    data-testid="userid-input"
                  />
                  <p className="text-gray-400 text-xs mt-1.5">Use the User ID created during your account application and approval process.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-charcoal focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all"
                      autoComplete="current-password"
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#1565C0]" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/contact" className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B2447] text-white hover:bg-[#06162c] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  data-testid="signin-submit-btn"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Security note */}
              <div className="flex items-center gap-2.5 mt-6 p-3.5 bg-[#F8F9FA] rounded-xl">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-gray-500 text-xs">Your connection is secured with 256-bit SSL encryption.</p>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/open-account" className="text-[#1565C0] hover:text-[#0B2447] font-semibold transition-colors">
                  Open an account
                </Link>
              </p>

              <p className="text-center text-xs text-gray-400 mt-3">
                Need help?{' '}
                <a href="mailto:support@silverunioncapital.com" className="text-[#1565C0] hover:text-[#0B2447] transition-colors">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
