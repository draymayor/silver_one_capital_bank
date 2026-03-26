import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { CreditCard, Percent, Shield, Star, Globe, Zap } from 'lucide-react'

export default function CreditCardsPage() {
  return (
    <ServicePageTemplate
      badge="Premium Credit Cards"
      title="Credit Cards"
      subtitle="Earn rewards on every purchase with cards built for your lifestyle."
      heroImage="https://images.pexels.com/photos/210742/pexels-photo-210742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      intro="Our premium credit card lineup delivers exceptional rewards, travel benefits, and purchase protections designed for today's sophisticated consumer. Whether you're a frequent traveler or everyday spender, there's a Silver Union Capital card crafted for your needs."
      benefits={[
        { icon: Star, title: 'Generous Rewards', desc: 'Earn up to 5% cash back on dining, travel, and everyday purchases.' },
        { icon: Percent, title: 'Introductory 0% APR', desc: 'Enjoy 0% APR on purchases for the first 15 months for new cardholders.' },
        { icon: Globe, title: 'Global Acceptance', desc: 'Accepted at over 70 million merchants worldwide with no foreign transaction fees.' },
        { icon: Shield, title: 'Purchase Protection', desc: '180-day purchase protection against theft or accidental damage.' },
        { icon: Zap, title: 'Instant Approval', desc: 'Get a credit decision in seconds with our advanced underwriting system.' },
        { icon: CreditCard, title: 'Virtual Card Numbers', desc: 'Generate virtual card numbers for secure online shopping.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'Minimum credit score of 680 (varies by card tier)',
        'Verifiable annual income of $24,000 or more',
        'US citizenship or legal residency',
        'No recent bankruptcies in the last 7 years',
      ]}
      steps={[
        { step: '1', title: 'Choose Your Card', desc: 'Compare our card offerings and select the one that best matches your spending habits.' },
        { step: '2', title: 'Apply Securely', desc: 'Complete the online application — your rate is determined with a soft credit pull first.' },
        { step: '3', title: 'Start Earning', desc: 'Your card arrives within 7–10 business days. Start earning rewards from day one.' },
      ]}
      relatedServices={[
        { label: 'Checking', href: '/checking' },
        { label: 'Savings', href: '/savings' },
        { label: 'Loans', href: '/loans' },
        { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
      ]}
    />
  )
}
