import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight, DollarSign, CreditCard, PiggyBank, BarChart3, GraduationCap, Smartphone, Umbrella, Building2 } from 'lucide-react'

const services = [
  { icon: DollarSign, label: 'Loans', href: '/loans', color: 'bg-blue-50 text-blue-700', desc: 'Personal, home, and business loans with competitive rates and flexible terms. Fast approval and transparent pricing.' },
  { icon: CreditCard, label: 'Checking', href: '/checking', color: 'bg-indigo-50 text-indigo-700', desc: 'Fee-free checking with no minimum balance, free debit card, and mobile check deposit.' },
  { icon: PiggyBank, label: 'Savings', href: '/savings', color: 'bg-green-50 text-green-700', desc: 'High-yield savings accounts with daily compounding interest and no fees.' },
  { icon: BarChart3, label: 'Investment', href: '/investment', color: 'bg-purple-50 text-purple-700', desc: 'Expert-managed diversified portfolios tailored to your risk tolerance and goals.' },
  { icon: GraduationCap, label: 'Banking for Students', href: '/banking-for-students', color: 'bg-orange-50 text-orange-700', desc: 'Zero fees, financial education tools, and smart features designed for student life.' },
  { icon: CreditCard, label: 'Credit Cards', href: '/credit-cards', color: 'bg-pink-50 text-pink-700', desc: 'Premium rewards cards with cash back, travel benefits, and purchase protection.' },
  { icon: Smartphone, label: 'Online & Mobile Banking', href: '/online-mobile-banking', color: 'bg-teal-50 text-teal-700', desc: 'Award-winning digital banking platform with biometric security and real-time alerts.' },
  { icon: Umbrella, label: 'Insurance', href: '/insurance', color: 'bg-yellow-50 text-yellow-700', desc: 'Life, auto, homeowners, and health insurance with exclusive member discounts.' },
  { icon: Building2, label: 'Business Banking', href: '/business-banking', color: 'bg-slate-50 text-slate-700', desc: 'Comprehensive business accounts, payroll, loans, and international banking tools.' },
]

export default function OurServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#0B2447] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl text-white mb-3">Our Services</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">From everyday banking to long-term investments, discover the full range of financial services offered by Silver Union Capital.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.href} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-[#0B2447] text-xl mb-3">{s.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
                  <Link href={s.href} className="inline-flex items-center gap-1.5 text-[#1565C0] hover:text-[#0B2447] text-sm font-semibold transition-colors group-hover:gap-2.5 duration-200">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
          <div className="mt-14 bg-[#0B2447] rounded-2xl p-10 text-center">
            <h2 className="font-heading font-bold text-3xl text-white mb-3">Ready to Get Started?</h2>
            <p className="text-white/70 text-base mb-7 max-w-xl mx-auto">Open your account today and experience the Silver Union Capital difference.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/open-account" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-lg">
                Open an Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-sm transition-all">
                Talk to an Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
