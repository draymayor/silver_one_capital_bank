import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { GraduationCap, DollarSign, Smartphone, Shield, CreditCard, TrendingUp } from 'lucide-react'

export default function BankingForStudentsPage() {
  return (
    <ServicePageTemplate
      badge="Student Banking"
      title="Banking for Students"
      subtitle="Zero fees, smart tools, and financial education — built for student life."
      heroImage="https://images.unsplash.com/photo-1763645440106-b235d3df37e5?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      intro="Silver Union Capital's student banking account is designed to remove barriers and help students focus on what matters — their education. From zero fees to financial literacy tools, we're invested in your success both now and after graduation."
      benefits={[
        { icon: DollarSign, title: 'Zero Fees', desc: 'No monthly fees, no overdraft fees, and no minimum balance requirements.' },
        { icon: GraduationCap, title: 'Financial Education', desc: 'In-app budgeting tools and financial literacy courses designed for students.' },
        { icon: Smartphone, title: 'Mobile-First Banking', desc: 'Manage your entire financial life from our intuitive mobile app.' },
        { icon: CreditCard, title: 'Student Debit Card', desc: 'Contactless debit card with spending controls and instant notifications.' },
        { icon: TrendingUp, title: 'Savings Goals', desc: 'Set and track savings goals for tuition, textbooks, and travel.' },
        { icon: Shield, title: 'FDIC Insured', desc: 'Your money is protected by federal insurance up to $250,000.' },
      ]}
      eligibility={[
        'Must be between 16 and 26 years of age',
        'Enrolled in or accepted to a qualifying academic institution',
        'Valid student ID or enrollment confirmation',
        'Government-issued photo ID',
        'US Social Security Number or ITIN',
      ]}
      steps={[
        { step: '1', title: 'Apply Online', desc: 'Complete our streamlined online application — takes about 10 minutes.' },
        { step: '2', title: 'Verify Enrollment', desc: 'Upload your student ID or enrollment letter for quick verification.' },
        { step: '3', title: 'Start Banking', desc: 'Access your account instantly and receive your debit card within days.' },
      ]}
      relatedServices={[
        { label: 'Checking', href: '/checking' },
        { label: 'Savings', href: '/savings' },
        { label: 'Credit Cards', href: '/credit-cards' },
        { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
      ]}
    />
  )
}
