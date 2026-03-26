import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2447',
          dark: '#06162c',
          light: '#1a3a6b',
        },
        silver: {
          DEFAULT: '#C8C8C8',
          light: '#F8F9FA',
        },
        accent: {
          DEFAULT: '#1565C0',
          dark: '#11529c',
        },
        charcoal: '#2b2b2b',
      },
      fontFamily: {
        heading: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 24px 0 rgba(11,36,71,0.08)',
        card: '0 2px 12px 0 rgba(11,36,71,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
