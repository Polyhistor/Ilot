import { getCategories } from '@/lib/db/categories'
import { getFeaturedServices } from '@/lib/db/services'
import { HeroCircle } from '@/components/home/HeroCircle'
import { PartnerBar } from '@/components/home/PartnerBar'
import { AboutSection } from '@/components/home/AboutSection'
import { FeaturedServices } from '@/components/home/FeaturedServices'
import { WhyUsBento } from '@/components/home/WhyUsBento'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTABanner } from '@/components/home/CTABanner'

export const revalidate = false // SSG — static forever

// Featured services config: groups → slugs from the database
const FEATURED_GROUPS = [
  {
    id: 'visa',
    title: 'Visa & Stay Permit Services',
    description:
      'We help foreigners obtain and maintain legal stay permits in Indonesia, including applications, extensions, and supporting documents.',
    categorySlug: 'visa',
    slugs: [
      'investor-kitas-2-years',
      'working-kitas-6-month',
      'digital-nomad-kitas-1-year',
      'retirement-kitas',
      'visit-visa-single-60-days',
      'visit-visa-single-180-days',
      'exit-permit-only',
      'evoa-60-days',
    ],
  },
  {
    id: 'company',
    title: 'Company Setup & Business Licensing',
    description:
      'We provide full support for establishing and licensing businesses in Indonesia.',
    categorySlug: 'company-setup',
    slugs: [
      'pt-pma-set-up',
      'pt-local-set-up',
      'pt-local-hospitality-set-up',
      'nib-oss-process',
      'cv-set-up',
      'pt-perorangan-set-up',
    ],
  },
  {
    id: 'compliance',
    title: 'Business Compliance & Reporting',
    description:
      'We help businesses stay legally compliant after setup — from mandatory investment reports to legal document review.',
    categorySlug: 'legal',
    slugs: [
      'bkpm-reports-lkpm',
      'company-legal-documents-review',
      'document-review-by-lawyer',
      'rups-general-meeting',
    ],
  },
  {
    id: 'admin',
    title: 'Tax, Contracts & Administrative Services',
    description:
      'We assist with tax registration, contracts, notary services, property checks, translations, and other legal administration needs.',
    categorySlug: 'legal',
    slugs: [
      'npwp-company',
      'npwp-personal',
      'draft-employment-contract',
      'shareholder-agreement',
      'prenuptial-postnuptial-agreement',
      'land-due-diligence',
      'sworn-translation',
      'company-valuation',
    ],
  },
]

export default async function HomePage() {
  const [categories, featuredRaw] = await Promise.all([
    getCategories(),
    getFeaturedServices(FEATURED_GROUPS.flatMap((g) => g.slugs)),
  ])

  const cards = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon_name ?? 'Star',
    imageUrl: cat.image_url ?? undefined,
    colorAccent: cat.color_accent ?? undefined,
  }))

  // Build a slug→service map for fast lookup
  const serviceMap = new Map(featuredRaw.map((s) => [s.slug, s]))

  // Assemble groups preserving the defined order
  const groups = FEATURED_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    categorySlug: g.categorySlug,
    services: g.slugs
      .map((slug) => {
        const s = serviceMap.get(slug)
        if (!s) return null
        return {
          slug: s.slug,
          name: s.name,
          description: s.description,
          target_client: s.target_client,
          estimated_timeline: s.estimated_timeline,
          whatsapp_message: s.whatsapp_message,
          categorySlug: s.category.slug,
          categoryName: s.category.name,
        }
      })
      .filter(Boolean) as any[],
  })).filter((g) => g.services.length > 0)

  return (
    <>
      <HeroCircle cards={cards} />
      <PartnerBar />
      <AboutSection />
      <FeaturedServices groups={groups} />
      <WhyUsBento />
      <ProcessSteps />
      <TestimonialsSection />
      <CTABanner />
    </>
  )
}
