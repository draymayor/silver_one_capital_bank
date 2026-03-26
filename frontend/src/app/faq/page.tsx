import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'

const faqs = [
  { cat: 'Account Opening', q: 'How do I open an account with Silver Union Capital?', a: 'You can open an account entirely online through our secure application portal. The process takes about 10–15 minutes and requires a valid government-issued ID and basic personal information.' },
  { cat: 'Account Opening', q: 'What documents do I need to apply?', a: 'You\'ll need a government-issued photo ID (driver\'s license or passport), your Social Security Number, and a valid email address and phone number. For business accounts, additional business documentation is required.' },
  { cat: 'Account Opening', q: 'How long does account approval take?', a: 'Most accounts are reviewed within 1–3 business days. You\'ll receive an email notification with your application status and next steps upon decision.' },
  { cat: 'Signing In', q: 'How do I sign in to my account?', a: 'You sign in using your unique User ID and the password you created during your account application. Your User ID is provided in your approval email.' },
  { cat: 'Signing In', q: 'I forgot my password. How do I reset it?', a: 'Click "Forgot Password?" on the sign-in page and follow the prompts. Alternatively, contact support at support@silverunioncapital.com for assisted recovery.' },
  { cat: 'Security', q: 'Is Silver Union Capital FDIC insured?', a: 'Yes. Silver Union Capital is a Member FDIC institution. Deposits are insured up to $250,000 per depositor, per account category, as provided by federal law.' },
  { cat: 'Security', q: 'How does Silver Union Capital protect my information?', a: 'We use 256-bit SSL encryption for all data in transit, multi-factor authentication, and real-time fraud monitoring to keep your account secure.' },
  { cat: 'Services', q: 'What account types are available?', a: 'We offer Checking, Savings, Investment, and Business accounts, as well as Loans, Credit Cards, Insurance, and Online/Mobile Banking services.' },
  { cat: 'Services', q: 'Can I have multiple accounts?', a: 'Yes. You can hold multiple account types under a single Silver Union Capital membership. Contact support or visit your dashboard to open additional accounts.' },
  { cat: 'Mobile Banking', q: 'Is there a mobile app?', a: 'Yes. Our mobile app is available on iOS and Android and provides full account management, mobile check deposit, transfers, and 24/7 support chat.' },
  { cat: 'Fees', q: 'What are the fees for a checking account?', a: 'Our standard checking account has no monthly maintenance fee, no minimum balance requirement, and no overdraft fees when you link a savings account.' },
  { cat: 'Fees', q: 'Are there wire transfer fees?', a: 'Domestic wire transfers are free for Silver Union Capital members. International wires carry a nominal fee based on the destination country and transfer amount.' },
]

const cats = [...new Set(faqs.map(f => f.cat))]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#0B2447] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-white/70 text-base">Find answers to common questions about Silver Union Capital.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {cats.map(cat => (
            <div key={cat} className="mb-10">
              <h2 className="font-heading font-bold text-lg text-[#0B2447] mb-4 pb-2 border-b border-gray-200">{cat}</h2>
              <div className="space-y-3">
                {faqs.filter(f => f.cat === cat).map((faq, i) => (
                  <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#0B2447]/30 transition-colors">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-heading font-semibold text-[#0B2447] text-sm select-none list-none">
                      {faq.q}
                      <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                    </summary>
                    <div className="px-5 pb-4"><p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p></div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-12 bg-[#0B2447] rounded-2xl p-8 text-center">
            <p className="font-heading font-bold text-white text-lg mb-2">Still have questions?</p>
            <p className="text-white/70 text-sm mb-5">Our support team is available 24/7 to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B2447] hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold text-sm transition-all">
                Contact Us
              </Link>
              <a href="mailto:support@silverunioncapital.com" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-6 py-3 rounded-xl font-semibold text-sm transition-all">
                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
