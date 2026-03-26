import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { BarChart3, TrendingUp, Shield, Users, Globe, Percent } from 'lucide-react'

export default function InvestmentPage() {
  return (
    <ServicePageTemplate
      badge="Investment Services"
      title="Investment"
      subtitle="Build long-term wealth with expert-managed portfolios tailored to your goals."
      heroImage="https://images.unsplash.com/photo-1714098583297-e4fbe448d109?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      intro="Silver Union Capital's investment platform combines expert guidance with cutting-edge technology to help you build a diversified portfolio aligned with your risk tolerance and financial goals. From beginner to seasoned investor, we have the tools and expertise to support your journey."
      benefits={[
        { icon: BarChart3, title: 'Diversified Portfolios', desc: 'Choose from curated investment portfolios across stocks, bonds, ETFs, and more.' },
        { icon: TrendingUp, title: 'Expert Management', desc: 'Our team of certified financial advisors manages your investments actively.' },
        { icon: Shield, title: 'SIPC Protected', desc: 'Your investment accounts are SIPC-insured up to $500,000.' },
        { icon: Users, title: 'Personalized Strategy', desc: 'Risk assessment and goal-based planning tailored specifically to you.' },
        { icon: Globe, title: 'Global Exposure', desc: 'Access to domestic and international markets through a single account.' },
        { icon: Percent, title: 'Low Expense Ratios', desc: 'Industry-low fees ensure more of your returns stay in your pocket.' },
      ]}
      eligibility={[
        'Must be 18 years of age or older',
        'Valid government-issued ID',
        'US citizen, permanent resident, or eligible visa holder',
        'Minimum initial investment of $500',
        'Active Silver Union Capital account',
      ]}
      steps={[
        { step: '1', title: 'Complete Risk Assessment', desc: 'Answer a few questions to help us understand your risk tolerance and investment timeline.' },
        { step: '2', title: 'Choose Your Portfolio', desc: 'Select from conservative, balanced, or growth-oriented portfolio strategies.' },
        { step: '3', title: 'Fund & Monitor', desc: 'Fund your account and track your portfolio performance in real time.' },
      ]}
      relatedServices={[
        { label: 'Savings', href: '/savings' },
        { label: 'Checking', href: '/checking' },
        { label: 'Business Banking', href: '/business-banking' },
        { label: 'Insurance', href: '/insurance' },
      ]}
    />
  )
}
