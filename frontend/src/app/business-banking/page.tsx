import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { Building2, TrendingUp, CreditCard, Briefcase, Globe, Shield } from 'lucide-react'

export default function BusinessBankingPage() {
  return (
    <ServicePageTemplate
      badge="Business Banking"
      title="Business Banking"
      subtitle="Powerful financial tools built to support and scale your business."
      heroImage="https://images.unsplash.com/photo-1758519288905-38b7b00c1023?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      intro="From sole proprietors to growing enterprises, Silver Union Capital provides the banking infrastructure your business needs to thrive. Our business banking suite combines powerful tools, competitive rates, and dedicated relationship managers who understand your industry."
      benefits={[
        { icon: Building2, title: 'Business Checking', desc: 'Dedicated business checking accounts with no transaction limits and competitive cash management tools.' },
        { icon: TrendingUp, title: 'Business Loans', desc: 'SBA loans, lines of credit, and equipment financing with fast approval timelines.' },
        { icon: CreditCard, title: 'Business Cards', desc: 'Premium business credit cards with expense management and employee card controls.' },
        { icon: Briefcase, title: 'Payroll Services', desc: 'Integrated payroll processing and direct deposit management for your team.' },
        { icon: Globe, title: 'International Banking', desc: 'Multi-currency accounts and international wire transfers for global operations.' },
        { icon: Shield, title: 'Enhanced Security', desc: 'Advanced fraud protection, dual authorization, and role-based access controls.' },
      ]}
      eligibility={[
        'Registered US business entity (LLC, Corp, Partnership, or Sole Proprietor)',
        'Valid Employer Identification Number (EIN)',
        'Valid government-issued ID for all authorized signers',
        'Business formation documents (Articles of Incorporation, Operating Agreement, etc.)',
        'Minimum 3 months in business for most loan products',
      ]}
      steps={[
        { step: '1', title: 'Gather Documents', desc: 'Prepare your business formation documents, EIN, and authorized signer IDs.' },
        { step: '2', title: 'Apply Online', desc: 'Complete our business application with your company information and ownership details.' },
        { step: '3', title: 'Meet Your Advisor', desc: 'Your dedicated business relationship manager contacts you within 1 business day.' },
      ]}
      relatedServices={[
        { label: 'Loans', href: '/loans' },
        { label: 'Investment', href: '/investment' },
        { label: 'Insurance', href: '/insurance' },
        { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
      ]}
    />
  )
}
