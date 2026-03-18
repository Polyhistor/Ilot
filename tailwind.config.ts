import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F4F4F0',
        foreground: '#0B0B1A',
        accent: '#F5B21A',
        muted: '#64748b',
        dark: '#0a0a14',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '2rem',
      },
      maxWidth: {
        site: '1800px',
      },
    },
  },
  plugins: [],
}

export default config
