import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { DollarSign, Percent, Clock, CheckCircle, Shield, Users } from 'lucide-react'

export default function LoansPage() {
  return (
    <ServicePageTemplate
      badge="Personal & Business Loans"
      title="Loans"
      subtitle="Flexible financing solutions for every goal — from home ownership to business growth."
      heroImage="https://images.pexels.com/photos/7415020/pexels-photo-7415020.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      intro="At Silver Union Capital, we believe everyone deserves access to fair, transparent credit. Whether you're buying a home, consolidating debt, or investing in your business, our loan products are designed to meet you where you are and take you where you want to go."
      benefits={[
        { icon: Percent, title: 'Competitive Rates', desc: 'Industry-leading APRs starting as low as 3.99% for qualified borrowers.' },
        { icon: Clock, title: 'Fast Approval', desc: 'Get a decision in as little as 24 hours with our streamlined application process.' },
        { icon: DollarSign, title: 'Flexible Terms', desc: 'Loan terms from 12 to 84 months — choose what works for your budget.' },
        { icon: Shield, title: 'No Prepayment Fees', desc: 'Pay off your loan early with no hidden penalties or extra charges.' },
        { icon: CheckCircle, title: 'Transparent Pricing', desc: 'Know exactly what you\'ll pay — no surprise fees, ever.' },
        { icon: Users, title: 'Dedicated Support', desc: 'A personal loan advisor guides you through every step of the process.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'US citizen or permanent resident',
        'Minimum credit score of 620 for personal loans',
        'Verifiable income source (employment, self-employment, or other)',
        'Active Silver Union Capital account (or apply to open one)',
        'Valid government-issued photo ID',
      ]}
      steps={[
        { step: '1', title: 'Check Your Rate', desc: 'Pre-qualify with a soft credit pull that won\'t affect your credit score.' },
        { step: '2', title: 'Submit Application', desc: 'Complete our online application and upload required documents.' },
        { step: '3', title: 'Get Funded', desc: 'Upon approval, funds are deposited directly to your account within 1–2 business days.' },
      ]}
      relatedServices={[
        { label: 'Checking Account', href: '/checking' },
        { label: 'Savings Account', href: '/savings' },
        { label: 'Business Banking', href: '/business-banking' },
        { label: 'Credit Cards', href: '/credit-cards' },
      ]}
    />
  )
}
