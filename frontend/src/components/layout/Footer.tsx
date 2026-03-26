import Link from 'next/link'
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

const serviceLinks = [
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

const companyLinks = [
  { label: 'Our Services', href: '/our-services' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy & Security', href: '/privacy-security' },
]

const accountLinks = [
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Open an Account', href: '/open-account' },
  { label: 'Customer Dashboard', href: '/dashboard' },
]

export default function Footer() {
  return (
    <footer className="bg-[#F8F9FA] border-t border-gray-200" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <svg width="36" height="36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" rx="10" fill="#0B2447"/>
                  <path d="M100 30L140 80H120V130H80V80H60L100 30Z" fill="#C8C8C8"/>
                  <path d="M60 140H140V155H60V140Z" fill="#00763d"/>
                  <path d="M50 165H150V175H50V165Z" fill="#C8C8C8"/>
                </svg>
                <div>
                  <p className="font-heading font-bold text-[#0B2447] text-lg leading-tight">Silver Union Capital</p>
                </div>
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-5 max-w-xs">
              Premium banking built for every stage of your financial journey. Trusted by over 250,000 customers across the United States.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-[#0B2447]/10 flex items-center justify-center text-[#0B2447] hover:bg-[#0B2447] hover:text-white transition-all duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-[#0B2447]/10 flex items-center justify-center text-[#0B2447] hover:bg-[#0B2447] hover:text-white transition-all duration-200">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-[#0B2447]/10 flex items-center justify-center text-[#0B2447] hover:bg-[#0B2447] hover:text-white transition-all duration-200">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-[#0B2447]/10 flex items-center justify-center text-[#0B2447] hover:bg-[#0B2447] hover:text-white transition-all duration-200">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-[#0B2447] text-sm uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-600 hover:text-[#0B2447] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-[#0B2447] text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-600 hover:text-[#0B2447] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-heading font-semibold text-[#0B2447] text-sm uppercase tracking-wider mb-4 mt-6">My Account</h4>
            <ul className="space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-600 hover:text-[#0B2447] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-[#0B2447] text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#1565C0] mt-0.5 flex-shrink-0" />
                <a href="mailto:support@silverunioncapital.com" className="text-gray-600 hover:text-[#0B2447] text-sm transition-colors break-all">
                  support@silverunioncapital.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#1565C0] mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-sm">+1 (800) 742-5338</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1565C0] mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-sm">350 Fifth Avenue, Suite 4200<br />New York, NY 10118</span>
              </li>
              <li className="flex items-center gap-2 mt-3 p-2.5 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-xs font-medium">FDIC Insured · Member FDIC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} Silver Union Capital. All rights reserved. Member FDIC. Equal Housing Lender.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-security" className="text-gray-500 hover:text-[#0B2447] text-xs transition-colors">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy-security" className="text-gray-500 hover:text-[#0B2447] text-xs transition-colors">Terms of Use</Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy-security" className="text-gray-500 hover:text-[#0B2447] text-xs transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
