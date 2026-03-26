import ServicePageTemplate from '@/components/service/ServicePageTemplate'
import { Smartphone, Shield, Bell, CreditCard, Zap, Lock } from 'lucide-react'

export default function OnlineMobileBankingPage() {
  return (
    <ServicePageTemplate
      badge="Digital Banking"
      title="Online & Mobile Banking"
      subtitle="Your entire bank in your pocket — powerful, secure, and always available."
      heroImage="https://images.pexels.com/photos/7621358/pexels-photo-7621358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      intro="Silver Union Capital's award-winning digital banking platform gives you complete control over your finances from any device. From paying bills to depositing checks, every banking task is just a tap away — 24/7, 365 days a year."
      benefits={[
        { icon: Smartphone, title: 'Intuitive Mobile App', desc: 'Our iOS and Android apps are consistently rated 4.8+ stars by users.' },
        { icon: Bell, title: 'Instant Alerts', desc: 'Real-time notifications for every transaction, login, and account activity.' },
        { icon: CreditCard, title: 'Mobile Check Deposit', desc: 'Deposit checks in seconds using your smartphone camera.' },
        { icon: Zap, title: 'Instant Transfers', desc: 'Move money between accounts or to other people instantly at no cost.' },
        { icon: Lock, title: 'Biometric Security', desc: 'Face ID and fingerprint login keep your account secure and accessible.' },
        { icon: Shield, title: 'Fraud Monitoring', desc: '24/7 AI-powered fraud detection with instant alerts and card controls.' },
      ]}
      eligibility={[
        'Must be an active Silver Union Capital account holder',
        'Valid email address and mobile phone number on file',
        'Compatible device: iOS 14+ or Android 8.0+',
        'Stable internet connection',
      ]}
      steps={[
        { step: '1', title: 'Download the App', desc: 'Get the Silver Union Capital app from the App Store or Google Play.' },
        { step: '2', title: 'Log In Securely', desc: 'Sign in with your User ID and password, then set up biometric login.' },
        { step: '3', title: 'Bank Anywhere', desc: 'Access all your accounts, cards, and banking services from one intuitive interface.' },
      ]}
      relatedServices={[
        { label: 'Checking', href: '/checking' },
        { label: 'Savings', href: '/savings' },
        { label: 'Credit Cards', href: '/credit-cards' },
        { label: 'Security', href: '/privacy-security' },
      ]}
    />
  )
}
