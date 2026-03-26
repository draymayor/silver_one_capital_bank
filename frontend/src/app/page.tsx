import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield, TrendingUp, Clock, Users, Star, ChevronRight,
  CheckCircle, ArrowRight, CreditCard, PiggyBank, Home,
  Briefcase, GraduationCap, Smartphone, Umbrella, Building2,
  DollarSign, Lock, BarChart3, HeartHandshake, Award,
  PhoneCall, ChevronDown
} from 'lucide-react'

const services = [
  { icon: DollarSign, label: 'Loans', desc: 'Personal, home, and business loans with competitive rates.', href: '/loans', color: 'bg-blue-50 text-blue-700' },
  { icon: CreditCard, label: 'Checking', desc: 'Fee-free checking with no minimum balance requirements.', href: '/checking', color: 'bg-indigo-50 text-indigo-700' },
  { icon: PiggyBank, label: 'Savings', desc: 'High-yield savings accounts to grow your money faster.', href: '/savings', color: 'bg-green-50 text-green-700' },
  { icon: BarChart3, label: 'Investment', desc: 'Diversified investment portfolios managed by experts.', href: '/investment', color: 'bg-purple-50 text-purple-700' },
  { icon: GraduationCap, label: 'Banking for Students', desc: 'Zero-fee accounts and tools designed for student life.', href: '/banking-for-students', color: 'bg-orange-50 text-orange-700' },
  { icon: CreditCard, label: 'Credit Cards', desc: 'Premium rewards cards with exclusive member benefits.', href: '/credit-cards', color: 'bg-pink-50 text-pink-700' },
  { icon: Smartphone, label: 'Online & Mobile Banking', desc: 'Bank anytime, anywhere with our award-winning app.', href: '/online-mobile-banking', color: 'bg-teal-50 text-teal-700' },
  { icon: Umbrella, label: 'Insurance', desc: 'Comprehensive coverage for life, auto, and property.', href: '/insurance', color: 'bg-yellow-50 text-yellow-700' },
  { icon: Building2, label: 'Business Banking', desc: 'Powerful tools and accounts for growing businesses.', href: '/business-banking', color: 'bg-slate-50 text-slate-700' },
]

const stats = [
  { value: '250,000+', label: 'Trusted Customers', icon: Users },
  { value: '24/7', label: 'Customer Support', icon: Clock },
  { value: '$1B+', label: 'Assets Managed', icon: TrendingUp },
  { value: '100%', label: 'Secure & FDIC Insured', icon: Shield },
]

const howItWorks = [
  { step: '01', title: 'Open Your Account', desc: 'Complete our streamlined online application in minutes. No branch visit required.', icon: Home },
  { step: '02', title: 'Verify Your Identity', desc: 'Secure KYC verification ensures your account and funds are always protected.', icon: Shield },
  { step: '03', title: 'Start Banking', desc: 'Access your full suite of banking services from day one — anywhere, anytime.', icon: Smartphone },
]

const whyUs = [
  { icon: Lock, title: 'Bank-Level Security', desc: 'Your accounts are protected with 256-bit encryption and multi-factor authentication.' },
  { icon: Award, title: 'Zero Hidden Fees', desc: 'Transparent pricing with no surprises. What you see is exactly what you pay.' },
  { icon: HeartHandshake, title: 'Personalized Service', desc: 'Dedicated relationship managers for every account tier.' },
  { icon: TrendingUp, title: 'Competitive Rates', desc: 'Industry-leading APYs and the lowest loan rates in the market.' },
  { icon: Smartphone, title: 'Digital-First Experience', desc: 'Manage everything from a powerful, intuitive mobile app and web platform.' },
  { icon: Shield, title: 'FDIC Insured', desc: 'Deposits insured up to $250,000 per depositor, per account category.' },
]

const testimonials = [
  { name: 'Sarah Mitchell', location: 'New York, NY', text: 'Silver Union Capital made buying my first home a reality. The mortgage process was seamless and the team was incredibly supportive throughout.', rating: 5, initials: 'SM' },
  { name: 'James Rodriguez', location: 'Austin, TX', text: 'The business banking suite helped me scale my startup. The tools are powerful, the rates are fair, and the support team is always available.', rating: 5, initials: 'JR' },
  { name: 'Priya Patel', location: 'Chicago, IL', text: 'I switched from a big bank and the difference is night and day. The savings rates are fantastic and the mobile app is beautiful.', rating: 5, initials: 'PP' },
  { name: 'David Chen', location: 'San Francisco, CA', text: 'As a student, having zero fees and real support made all the difference. Silver Union Capital genuinely cares about their customers.', rating: 5, initials: 'DC' },
]

const faqs = [
  { q: 'How do I open an account with Silver Union Capital?', a: 'You can open an account entirely online through our secure application portal. The process takes about 10–15 minutes and requires a valid government-issued ID and basic personal information.' },
  { q: 'Is Silver Union Capital FDIC insured?', a: 'Yes. Silver Union Capital is a Member FDIC institution. Deposits are insured up to $250,000 per depositor, per account category, as provided by federal law.' },
  { q: 'What documents do I need to open an account?', a: 'You\'ll need a government-issued photo ID (driver\'s license or passport), your Social Security Number, and a valid email address and phone number.' },
  { q: 'How long does account approval take?', a: 'Most accounts are reviewed within 1–3 business days. You\'ll receive an email notification with your application status and next steps.' },
  { q: 'Can I manage my account on mobile?', a: 'Absolutely. Our mobile app is available on iOS and Android and offers full account management, mobile check deposit, transfers, and 24/7 support chat.' },
  { q: 'What are the fees for a checking account?', a: 'Our standard checking account has no monthly maintenance fee, no minimum balance requirement, and no overdraft fees when you link a savings account.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#0B2447] overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1774108464512-57610547a9f5?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
            alt="Premium banking"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2447] via-[#0B2447]/95 to-[#0B2447]/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5" /> FDIC Insured Member Bank
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Banking Built<br />
              <span className="text-[#C8C8C8]">For Your Future.</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Experience premium financial services with industry-leading rates, zero hidden fees, and personalized support — all at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/open-account" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl" data-testid="hero-open-account-btn">
                Open an Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/our-services" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 backdrop-blur-sm">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-100" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0B2447]/8 rounded-xl mb-3 mx-auto">
                    <Icon className="w-6 h-6 text-[#0B2447]" />
                  </div>
                  <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0B2447] mb-1">{stat.value}</p>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F8F9FA] py-20" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#1565C0] font-semibold text-sm uppercase tracking-wider mb-2">Simple & Fast</p>
            <h2 className="font-heading font-bold text-4xl text-[#0B2447] mb-3">How It Works</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">Getting started with Silver Union Capital takes just a few minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="relative">
                  {i < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gray-200 -translate-x-4 z-0" />}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative z-10 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="font-heading font-extrabold text-4xl text-[#0B2447]/10">{step.step}</span>
                      <div className="w-12 h-12 bg-[#0B2447] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-[#0B2447] mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/open-account" className="inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md">
              Get Started Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-white py-20" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#1565C0] font-semibold text-sm uppercase tracking-wider mb-2">Everything You Need</p>
            <h2 className="font-heading font-bold text-4xl text-[#0B2447] mb-3">Our Products & Services</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">From everyday banking to long-term investments, we have the financial tools to support every stage of your life.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Link key={service.href} href={service.href} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-[#0B2447]/20 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-[#0B2447] text-lg mb-2">{service.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <div className="flex items-center gap-1 text-[#1565C0] text-sm font-semibold group-hover:gap-2 transition-all duration-200">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/our-services" className="inline-flex items-center gap-2 border-2 border-[#0B2447] text-[#0B2447] hover:bg-[#0B2447] hover:text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#0B2447] py-20" data-testid="why-choose-us-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#C8C8C8] font-semibold text-sm uppercase tracking-wider mb-2">Our Commitment</p>
            <h2 className="font-heading font-bold text-4xl text-white mb-3">Why Choose Silver Union Capital</h2>
            <p className="text-white/70 text-base max-w-xl mx-auto">We are built on trust, technology, and a genuine commitment to your financial success.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white/8 border border-white/10 rounded-2xl p-6 hover:bg-white/12 transition-colors duration-300">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#C8C8C8]" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mobile Banking Highlight */}
      <section className="bg-white py-20" data-testid="mobile-banking-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#1565C0] font-semibold text-sm uppercase tracking-wider mb-3">Digital Banking</p>
              <h2 className="font-heading font-bold text-4xl text-[#0B2447] mb-5">Your Bank. Your Terms. Anywhere.</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our mobile and online banking platform puts the full power of Silver Union Capital in your pocket. Check balances, make transfers, deposit checks, and contact support — all from one seamless interface.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Instant balance checks and transaction alerts',
                  'Mobile check deposit',
                  'Peer-to-peer transfers with zero fees',
                  '24/7 in-app customer support',
                  'Biometric login for maximum security',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/online-mobile-banking" className="inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-premium aspect-[4/3]">
                <Image
                  src="https://images.pexels.com/photos/7621358/pexels-photo-7621358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Mobile banking"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-premium p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B2447] text-sm">256-bit Encrypted</p>
                    <p className="text-gray-500 text-xs">Bank-level security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8F9FA] py-20" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#1565C0] font-semibold text-sm uppercase tracking-wider mb-2">Customer Stories</p>
            <h2 className="font-heading font-bold text-4xl text-[#0B2447] mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0B2447] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B2447] text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#1565C0] font-semibold text-sm uppercase tracking-wider mb-2">Common Questions</p>
            <h2 className="font-heading font-bold text-4xl text-[#0B2447] mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#0B2447]/30 transition-colors">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-heading font-semibold text-[#0B2447] text-sm select-none list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-3" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="inline-flex items-center gap-2 text-[#1565C0] font-semibold text-sm hover:text-[#0B2447] transition-colors">
              View all FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#0B2447] to-[#1a3a6b] py-20" data-testid="final-cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <PhoneCall className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-white mb-5">
            Ready to Experience<br />Premium Banking?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
            Join over 250,000 satisfied customers who trust Silver Union Capital with their financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/open-account" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl" data-testid="cta-open-account-btn">
              Open an Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
