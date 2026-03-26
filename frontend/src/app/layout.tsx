import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Silver Union Capital — Premium Financial Services',
  description: 'Banking built for your future. Premium checking, savings, loans, investments, and more with Silver Union Capital.',
  keywords: 'bank, checking, savings, loans, investment, banking, financial services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-white text-charcoal">
        {children}
      </body>
    </html>
  )
}
