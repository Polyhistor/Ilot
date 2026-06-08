import Link from 'next/link'
import Image from 'next/image'

const SERVICES = [
  { href: '/visa', label: 'Visa & Immigration' },
  { href: '/legal', label: 'Legal & Contracts' },
  { href: '/company-setup', label: 'Company Setup' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/property', label: 'Property Advisory' },
  { href: '/hr-payroll', label: 'HR & Payroll' },
  { href: '/accounting-tax', label: 'Accounting & Tax' },
]

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookies Policy' },
]

export function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container-site px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Image
              src="/logos/Ilot-Logo-Light.svg"
              alt="Ilot"
              width={140}
              height={47}
              className="h-11 w-auto mb-3"
            />
            <p className="text-muted text-sm leading-relaxed">
              Clear Legal Support. Confident Decisions.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {SERVICES.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-muted flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Ilot. All rights reserved.</span>
          <span>Indonesia · English</span>
        </div>
      </div>
    </footer>
  )
}
