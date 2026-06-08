import Link from 'next/link'
import Image from 'next/image'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import { getCategoriesWithNav } from '@/lib/db/categories'
import { ServicesDropdown } from './ServicesDropdown'

export async function Navbar() {
  const categories = await getCategoriesWithNav()

  // Shape data for the dropdown (only pass what it needs)
  const navCategories = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    sub_categories: cat.sub_categories.map((sc) => ({
      slug: sc.slug,
      name: sc.name,
      services: sc.services.map((s) => ({
        slug: s.slug,
        name: s.name,
      })),
    })),
  }))

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface">
      <nav className="container-site flex items-center justify-between h-16 px-6 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Ilot — home">
          <Image
            src="/logos/Ilot-Logo.svg"
            alt="Ilot"
            width={120}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <ServicesDropdown categories={navCategories} />
          </li>

          <li>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* CTA */}
        <WhatsAppCTA variant="ghost" size="sm" label="Get in touch" />
      </nav>
    </header>
  )
}
