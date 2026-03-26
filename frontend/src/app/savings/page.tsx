import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { PiggyBank, TrendingUp, Shield, Percent, Lock, Clock } from 'lucide-react'

export default function SavingsPage() {
  return (
    <ServicePageTemplate
      badge="High-Yield Savings"
      title="Savings"
      subtitle="Grow your money faster with industry-leading rates and zero fees."
      heroImage="https://images.pexels.com/photos/7621358/pexels-photo-7621358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      intro="Our high-yield savings account offers rates that consistently beat the national average, helping your money work harder while you focus on life. With no fees and easy access, it's the smarter way to save for your goals."
      benefits={[
        { icon: Percent, title: 'High APY', desc: 'Earn significantly more than traditional savings accounts with our competitive rates.' },
        { icon: TrendingUp, title: 'Compound Interest', desc: 'Interest compounds daily and credits monthly, accelerating your growth.' },
        { icon: Shield, title: 'FDIC Insured', desc: 'Your savings are federally insured up to $250,000 per depositor.' },
        { icon: PiggyBank, title: 'No Minimum Balance', desc: 'Start saving with any amount — no minimum balance required to earn interest.' },
        { icon: Lock, title: 'No Lock-in Period', desc: 'Access your funds anytime without penalties.' },
        { icon: Clock, title: 'Automatic Transfers', desc: 'Schedule recurring deposits to reach your savings goals faster.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'Valid government-issued photo ID',
        'US Social Security Number or ITIN',
        'Active Silver Union Capital checking or primary account',
      ]}
      steps={[
        { step: '1', title: 'Open Your Account', desc: 'Apply online in minutes alongside or separately from your checking account.' },
        { step: '2', title: 'Fund Your Account', desc: 'Make your first deposit via transfer, check, or ACH from another bank.' },
        { step: '3', title: 'Watch It Grow', desc: 'Earn daily interest credited monthly and track your progress in the app.' },
      ]}
      relatedServices={[
        { label: 'Checking Account', href: '/checking' },
        { label: 'Investment', href: '/investment' },
        { label: 'Loans', href: '/loans' },
        { label: 'Online & Mobile Banking', href: '/online-mobile-banking' },
      ]}
    />
  )
}
