import type { Metadata } from 'next'
import { Inter, Caveat } from 'next/font/google'
import './globals.css'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })

export const metadata: Metadata = {
  title: {
    default: 'Ilot — Clear Legal Support. Confident Decisions.',
    template: '%s — Ilot',
  },
  description:
    'Premium legal, visa, and corporate structuring solutions for global investors and expatriates in Indonesia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'),
  openGraph: {
    siteName: 'Ilot',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}
