import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { Umbrella, Shield, Heart, Car, Home, Zap } from 'lucide-react'

export default function InsurancePage() {
  return (
    <ServicePageTemplate
      badge="Insurance Solutions"
      title="Insurance"
      subtitle="Comprehensive coverage for life, health, auto, and property — all in one place."
      heroImage="https://images.unsplash.com/photo-1757233451731-9a34e164b208?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      intro="Protect what matters most with Silver Union Capital's integrated insurance solutions. As a member, you get access to exclusive rates and bundled discounts that aren't available elsewhere. Our licensed advisors help you find the right coverage for your unique situation."
      benefits={[
        { icon: Heart, title: 'Life Insurance', desc: 'Term and whole life policies to protect your family\'s financial future.' },
        { icon: Umbrella, title: 'Comprehensive Coverage', desc: 'One provider for life, auto, homeowners, and health insurance.' },
        { icon: Car, title: 'Auto Insurance', desc: 'Competitive auto rates with accident forgiveness and roadside assistance.' },
        { icon: Home, title: 'Homeowners Insurance', desc: 'Full property coverage protecting your home, contents, and liability.' },
        { icon: Shield, title: 'Member Discounts', desc: 'Silver Union Capital members receive exclusive insurance rate discounts.' },
        { icon: Zap, title: 'Quick Claims', desc: 'File and track claims online or through our mobile app — 24/7.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'US citizen or legal resident',
        'Silver Union Capital account membership preferred for member rates',
        'No severe pre-existing conditions for certain life insurance products',
        'Property in an insurable US location',
      ]}
      steps={[
        { step: '1', title: 'Get a Quote', desc: 'Answer a few simple questions to receive personalized insurance quotes.' },
        { step: '2', title: 'Compare Plans', desc: 'Review coverage options, premiums, and deductibles with an advisor.' },
        { step: '3', title: 'Activate Coverage', desc: 'Sign your policy digitally and your coverage begins immediately.' },
      ]}
      relatedServices={[
        { label: 'Investment', href: '/investment' },
        { label: 'Loans', href: '/loans' },
        { label: 'Business Banking', href: '/business-banking' },
        { label: 'Savings', href: '/savings' },
      ]}
    />
  )
}
