import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { CreditCard, DollarSign, Smartphone, Shield, Zap, Globe } from 'lucide-react'

export default function CheckingPage() {
  return (
    <ServicePageTemplate
      badge="Everyday Banking"
      title="Checking"
      subtitle="Fee-free checking with no minimum balance — banking that works as hard as you do."
      heroImage="https://images.unsplash.com/photo-1758519288905-38b7b00c1023?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      intro="Our checking account is built for modern life — no monthly fees, no minimum balance, and full access to your money whenever you need it. Manage everything from our award-winning mobile app with real-time notifications and instant transfers."
      benefits={[
        { icon: DollarSign, title: 'Zero Monthly Fees', desc: 'Keep more of your money — no monthly maintenance fees, ever.' },
        { icon: Smartphone, title: 'Mobile Check Deposit', desc: 'Deposit checks from anywhere using your phone\'s camera.' },
        { icon: CreditCard, title: 'Free Debit Card', desc: 'Contactless-enabled debit card with instant freeze/unfreeze controls.' },
        { icon: Zap, title: 'Instant Notifications', desc: 'Get real-time alerts for every transaction on your account.' },
        { icon: Globe, title: 'Free ATM Access', desc: 'Access thousands of surcharge-free ATMs nationwide.' },
        { icon: Shield, title: 'FDIC Insured', desc: 'Your deposits are federally insured up to $250,000.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'Valid government-issued photo ID',
        'US Social Security Number or ITIN',
        'US residential address',
        'No minimum opening deposit required',
      ]}
      steps={[
        { step: '1', title: 'Apply Online', desc: 'Complete our 7-step online application in about 10 minutes.' },
        { step: '2', title: 'Verification', desc: 'We\'ll verify your identity securely and review your application.' },
        { step: '3', title: 'Access Your Account', desc: 'Once approved, your debit card ships within 5 business days and you can bank digitally immediately.' },
      ]}
      relatedServices={[
        { label: 'Savings Account', href: '/savings' },
        { label: 'Credit Cards', href: '/credit-cards' },
        { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
        { label: 'Loans', href: '/loans' },
      ]}
    />
  )
}
