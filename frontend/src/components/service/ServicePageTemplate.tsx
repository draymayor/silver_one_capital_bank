import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ServicePageProps {
  badge: string
  title: string
  subtitle: string
  heroImage: string
  intro: string
  benefits: { icon: LucideIcon; title: string; desc: string }[]
  eligibility: string[]
  steps: { step: string; title: string; desc: string }[]
  relatedServices: { label: string; href: string }[]
}

export default function ServicePageTemplate({
  badge, title, subtitle, heroImage, intro,
  benefits, eligibility, steps, relatedServices
}: ServicePageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0B2447] py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image src={heroImage} alt={title} fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2447] via-[#0B2447]/90 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{badge}</span>
          </nav>
          <div className="max-w-2xl">
            <div className="inline-block bg-white/10 border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              {badge}
            </div>
            <h1 className="font-heading font-extrabold text-5xl lg:text-6xl text-white mb-4 tracking-tight">{title}</h1>
            <p className="text-white/75 text-xl mb-8">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/open-account" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg">
                Open an Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200">
                Talk to an Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-700 text-lg leading-relaxed">{intro}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-[#0B2447] mb-3">Key Benefits</h2>
            <p className="text-gray-500 text-base">Designed to give you the best banking experience possible.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 bg-[#0B2447]/8 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#0B2447]" />
                  </div>
                  <h3 className="font-heading font-bold text-[#0B2447] text-base mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="font-heading font-bold text-3xl text-[#0B2447] mb-3">Eligibility & Requirements</h2>
              <p className="text-gray-600 text-sm mb-7">To apply for this service, you should meet the following basic requirements.</p>
              <ul className="space-y-3">
                {eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0B2447] rounded-2xl p-8 text-white">
              <h3 className="font-heading font-bold text-xl mb-4">Ready to Get Started?</h3>
              <p className="text-white/75 text-sm leading-relaxed mb-6">
                Our team is here to guide you through every step of the process. Apply online in minutes.
              </p>
              <Link href="/open-account" className="inline-flex items-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-[#0B2447] mb-3">How to Get Started</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold text-sm">{s.step}</div>
                  {i < steps.length - 1 && <div className="w-px h-full bg-gray-200 ml-5 mt-2 hidden md:block" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-heading font-bold text-[#0B2447] text-base mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-2xl text-[#0B2447] mb-7">Related Services</h2>
          <div className="flex flex-wrap gap-3">
            {relatedServices.map((s) => (
              <Link key={s.href} href={s.href} className="inline-flex items-center gap-1.5 border border-gray-200 rounded-xl px-5 py-2.5 text-sm text-gray-700 font-medium hover:border-[#0B2447] hover:text-[#0B2447] transition-all duration-200">
                {s.label} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B2447] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Take the Next Step</h2>
          <p className="text-white/70 text-base mb-8">Open your account today and experience the Silver Union Capital difference.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/open-account" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200">
              Open an Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
