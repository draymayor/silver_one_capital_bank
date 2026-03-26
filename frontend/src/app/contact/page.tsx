import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#0B2447] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl text-white mb-3">Contact Us</h1>
          <p className="text-white/70 text-base">We&apos;re here to help — 24 hours a day, 7 days a week.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-[#1565C0]" />
                </div>
                <h3 className="font-heading font-bold text-[#0B2447] mb-1">Email Support</h3>
                <p className="text-gray-500 text-sm mb-3">For all inquiries and account support</p>
                <a href="mailto:support@silverunioncapital.com" className="text-[#1565C0] text-sm font-medium hover:text-[#0B2447] transition-colors break-all">
                  support@silverunioncapital.com
                </a>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-heading font-bold text-[#0B2447] mb-1">Phone</h3>
                <p className="text-gray-500 text-sm mb-3">Speak with a representative</p>
                <p className="text-[#0B2447] text-sm font-bold">+1 (800) 742-5338</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-heading font-bold text-[#0B2447] mb-1">Office Address</h3>
                <p className="text-gray-500 text-sm">350 Fifth Avenue, Suite 4200<br />New York, NY 10118<br />United States</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-heading font-bold text-[#0B2447] mb-1">Business Hours</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Mon–Fri:</span> 8:00 AM – 8:00 PM EST</p>
                  <p><span className="font-medium">Sat:</span> 9:00 AM – 5:00 PM EST</p>
                  <p><span className="font-medium">Online Support:</span> 24/7</p>
                </div>
              </div>
              <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl p-5">
                <h4 className="font-heading font-bold text-[#0B2447] text-sm mb-3">Quick Links</h4>
                <div className="space-y-2">
                  {[{ label: 'FAQ', href: '/faq' }, { label: 'Open an Account', href: '/open-account' }, { label: 'Sign In', href: '/sign-in' }, { label: 'Privacy & Security', href: '/privacy-security' }].map(l => (
                    <Link key={l.href} href={l.href} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0B2447] transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-[#1565C0]" /> {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
              <h2 className="font-heading font-bold text-2xl text-[#0B2447] mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-7">We typically respond within 1 business day.</p>
              <form className="space-y-5" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">First Name</label>
                    <input type="text" placeholder="John" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" data-testid="contact-first-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" data-testid="contact-last-name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none" data-testid="contact-email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Subject</label>
                  <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none bg-white" data-testid="contact-subject">
                    <option>Account Inquiry</option>
                    <option>Loan Application</option>
                    <option>Technical Support</option>
                    <option>Complaint / Feedback</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">Message</label>
                  <textarea rows={5} placeholder="How can we help you today?" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none" data-testid="contact-message" />
                </div>
                <button type="submit" className="w-full bg-[#0B2447] text-white hover:bg-[#06162c] px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm" data-testid="contact-submit-btn">
                  Send Message
                </button>
                <p className="text-gray-400 text-xs text-center">By submitting this form, you agree to our Privacy Policy and Terms of Service.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
