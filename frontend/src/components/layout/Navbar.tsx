'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const services = [
  { label: 'Loans', href: '/loans' },
  { label: 'Checking', href: '/checking' },
  { label: 'Savings', href: '/savings' },
  { label: 'Investment', href: '/investment' },
  { label: 'Banking for Students', href: '/banking-for-students' },
  { label: 'Credit Cards', href: '/credit-cards' },
  { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
  { label: 'Insurance', href: '/insurance' },
  { label: 'Business Banking', href: '/business-banking' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header className="bg-[#0B2447] sticky top-0 z-50 shadow-md" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" data-testid="navbar-logo">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" rx="10" fill="#0B2447"/>
                <path d="M100 30L140 80H120V130H80V80H60L100 30Z" fill="#C8C8C8"/>
                <path d="M60 140H140V155H60V140Z" fill="#00763d"/>
                <path d="M50 165H150V175H50V165Z" fill="#C8C8C8"/>
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-heading font-bold text-base tracking-wide">Silver Union</span>
                <span className="text-[#C8C8C8] text-xs font-medium tracking-widest uppercase">Capital</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className="flex items-center gap-1 text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10">
                Services <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {services.map((s) => (
                    <Link key={s.href} href={s.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0B2447] font-medium transition-colors">
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/our-services" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10">Our Services</Link>
            <Link href="/faq" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10">FAQ</Link>
            <Link href="/contact" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10">Contact</Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/sign-in" className="text-white/90 hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10" data-testid="signin-link">
              Sign In
            </Link>
            <Link href="/open-account" className="bg-white text-[#0B2447] hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm" data-testid="open-account-link">
              Open an Account
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-testid="mobile-menu-btn"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#06162c] border-t border-white/10 animate-fade-in" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-1">
            <p className="text-[#C8C8C8] text-xs font-semibold uppercase tracking-wider px-3 py-1">Services</p>
            {services.map((s) => (
              <Link key={s.href} href={s.href} className="block px-3 py-2 text-white/80 hover:text-white text-sm font-medium rounded-md hover:bg-white/10 transition-colors" onClick={() => setMobileOpen(false)}>
                {s.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
              <Link href="/our-services" className="block px-3 py-2 text-white/80 hover:text-white text-sm font-medium rounded-md hover:bg-white/10" onClick={() => setMobileOpen(false)}>Our Services</Link>
              <Link href="/faq" className="block px-3 py-2 text-white/80 hover:text-white text-sm font-medium rounded-md hover:bg-white/10" onClick={() => setMobileOpen(false)}>FAQ</Link>
              <Link href="/contact" className="block px-3 py-2 text-white/80 hover:text-white text-sm font-medium rounded-md hover:bg-white/10" onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>
            <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
              <Link href="/sign-in" className="block w-full text-center px-4 py-2.5 text-white border border-white/30 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/open-account" className="block w-full text-center px-4 py-2.5 bg-white text-[#0B2447] rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(false)}>Open an Account</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
