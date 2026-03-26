import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Shield, Lock, Eye, AlertTriangle, FileText, HelpCircle, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: Lock,
    title: 'Protecting Your Information',
    content: 'Silver Union Capital uses bank-grade 256-bit SSL encryption to protect all data in transit between your devices and our servers. Your personal and financial data is stored in SOC 2 Type II certified data centers with multiple layers of physical and digital security controls.',
  },
  {
    icon: Shield,
    title: 'Account Protection',
    content: 'Your account is protected with multi-factor authentication (MFA), which requires a second form of verification when signing in from a new device or location. We also monitor all login attempts and flag suspicious activity in real time.',
  },
  {
    icon: Eye,
    title: 'Password & Login Guidance',
    content: 'We recommend using a unique password of at least 12 characters that combines uppercase letters, numbers, and special characters. Never share your password or User ID with anyone — Silver Union Capital employees will never ask for your password.',
  },
  {
    icon: FileText,
    title: 'Document Protection',
    content: 'All uploaded identity documents are stored in encrypted, access-controlled vaults. Documents are only accessible by authorized Silver Union Capital compliance staff for verification purposes. Files are never shared with third parties without your explicit consent.',
  },
  {
    icon: AlertTriangle,
    title: 'Fraud Awareness',
    content: 'Be aware of phishing emails, fraudulent calls, and fake websites impersonating Silver Union Capital. We will never ask for your password, SSN, or full account number via email or phone. If you suspect fraud, contact us immediately at support@silverunioncapital.com.',
  },
  {
    icon: Shield,
    title: 'Data Handling',
    content: 'We collect only the data necessary to provide our services and comply with federal banking regulations. We do not sell your personal data to third parties. You may request a copy of your data or ask us to delete your account by contacting our data privacy team.',
  },
]

export default function PrivacySecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#0B2447] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Shield className="w-3.5 h-3.5" /> Your Security Is Our Priority
          </div>
          <h1 className="font-heading font-bold text-4xl text-white mb-3">Privacy & Security</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">We take extraordinary measures to protect your information and keep your account secure at all times.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {sections.map(({ icon: Icon, title, content }) => (
              <div key={title} className="flex gap-5">
                <div className="w-12 h-12 bg-[#0B2447]/8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon className="w-5.5 h-5.5 text-[#0B2447]" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-[#0B2447] text-xl mb-3">{title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#F8F9FA] border border-gray-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-[#1565C0] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-bold text-[#0B2447] text-lg mb-2">Need Help or Have a Security Concern?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  If you believe your account has been compromised or you&apos;ve noticed suspicious activity, please contact our security team immediately. We&apos;re available 24/7.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:support@silverunioncapital.com" className="inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Email Security Team <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-[#0B2447] text-[#0B2447] hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
