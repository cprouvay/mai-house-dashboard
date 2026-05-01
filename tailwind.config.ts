// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mai-blue': {
          50:  '#EBF4FA',
          100: '#D2E9F5',
          200: '#B8D6E8',
          300: '#7EB8D4',
          400: '#4A9BC0',
        },
        'mai-lav': {
          50:  '#F0EDF8',
          200: '#D4C5E2',
          300: '#B8A0D0',
          400: '#9B7BBD',
        },
        'mai-pink': {
          50:  '#FDF0F5',
          200: '#EDAAC7',
          300: '#D4879E',
        },
        'mai-cream': '#FDF8F4',
        'mai-green': '#52A882',
        'mai-amber': '#C9955A',
        'mai-red':   '#C97070',
      },
      fontFamily: {
        sans:  ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        noto:  ['var(--font-noto)',   'Noto Sans JP', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'mai':    '0 2px 12px rgba(126,184,212,0.15)',
        'mai-lg': '0 8px 32px rgba(126,184,212,0.20)',
      },
    },
  },
  plugins: [],
}

export default config
