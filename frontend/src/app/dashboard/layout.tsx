'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LayoutDashboard, User, Shield, Bell, LogOut, Menu, X, ChevronRight, CreditCard, LifeBuoy, ArrowRightLeft } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Account', href: '/dashboard/my-account', icon: CreditCard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Security', href: '/dashboard/security', icon: Shield },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Support Messages', href: '/dashboard/support', icon: LifeBuoy },
  { label: 'Withdraw Funds', href: '/dashboard/withdraw', icon: ArrowRightLeft },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<{ full_name: string; user_id: string } | null>(null)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/sign-in?error=session_expired')
        return
      }

      if (session.user.email === 'admin@silverunioncapital.com') {
        await supabase.auth.signOut()
        router.replace('/sign-in?error=customer_required')
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name,user_id')
        .eq('auth_user_id', session.user.id)
        .single()

      if (error || !data) {
        setAuthError('Unable to load your customer profile. Please sign in again.')
        await supabase.auth.signOut()
        router.replace('/sign-in?error=profile_not_found')
        return
      }

      setAuthError('')
      setUserProfile(data)
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/sign-in')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B2447] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} data-testid="dashboard-sidebar">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" rx="10" fill="white" fillOpacity="0.15"/><path d="M100 30L140 80H120V130H80V80H60L100 30Z" fill="#C8C8C8"/><path d="M60 140H140V155H60V140Z" fill="#00763d"/></svg>
            <div>
              <p className="font-heading font-bold text-white text-sm">Silver Union</p>
              <p className="text-[#C8C8C8] text-xs">My Account</p>
            </div>
          </div>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {userProfile?.full_name?.charAt(0) ?? 'C'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm truncate">{userProfile?.full_name ?? 'Loading...'}</p>
              <p className="text-white/50 text-xs">{userProfile?.user_id || (authError ? 'Session issue' : 'Loading...')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(href, exact) ? 'bg-white/15 text-white' : 'text-white/65 hover:text-white hover:bg-white/10'}`}
              data-testid={`dashboard-nav-${label.toLowerCase().replace(/\s/g, '-')}`}>
              <Icon className="w-4 h-4" />
              {label}
              {isActive(href, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-5 border-t border-white/10 pt-4">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/65 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-all"
            data-testid="dashboard-logout-btn">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden text-gray-500 hover:text-[#0B2447]" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#0B2447]">
            Silver Union Capital — Dashboard
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications" className="p-2 rounded-lg text-gray-400 hover:text-[#0B2447] hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6" data-testid="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}
