import Link from 'next/link'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

const NAV_LINKS = [
  { href: '/visa', label: 'Visa' },
  { href: '/legal', label: 'Legal' },
  { href: '/company-setup', label: 'Company Setup' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface">
      <nav className="container-site flex items-center justify-between h-16 px-6 md:px-12">
        {/* Wordmark */}
        <Link href="/" className="font-bold text-2xl tracking-tight text-foreground">
          Ilot
        </Link>

        {/* Links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <WhatsAppCTA variant="ghost" size="sm" label="Get in touch" />
      </nav>
    </header>
  )
}
