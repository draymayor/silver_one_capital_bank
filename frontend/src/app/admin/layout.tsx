'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  LayoutDashboard, FileText, Users, Settings, LogOut,
  Bell, Menu, X, Shield, ChevronRight, LifeBuoy, Activity
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Support Inbox', href: '/admin/support', icon: LifeBuoy },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Verify admin session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user?.email !== 'admin@silverunioncapital.com') {
        router.push('/admin/login')
      }
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0B2447] flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} data-testid="admin-sidebar">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" rx="10" fill="white" fillOpacity="0.15"/>
                <path d="M100 30L140 80H120V130H80V80H60L100 30Z" fill="#C8C8C8"/>
                <path d="M60 140H140V155H60V140Z" fill="#00763d"/>
              </svg>
              <div>
                <p className="font-heading font-bold text-white text-sm">Silver Union</p>
                <p className="text-[#C8C8C8] text-xs">Admin Portal</p>
              </div>
            </div>
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(href, exact)
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:text-white hover:bg-white/10'
                }`}
              data-testid={`admin-nav-${label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
              {isActive(href, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div>
              <p className="text-white text-xs font-semibold">Admin</p>
              <p className="text-white/50 text-xs">System Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/65 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-all"
            data-testid="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#0B2447]" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Shield className="w-3.5 h-3.5 text-[#0B2447]" />
              <span className="font-medium text-[#0B2447]">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 hover:text-[#0B2447] transition-colors p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/" className="text-sm text-[#1565C0] hover:text-[#0B2447] font-medium transition-colors">View Site</Link>
          </div>
        </header>

        <main className="flex-1 p-6" data-testid="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
