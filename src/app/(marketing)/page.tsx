import { getCategories } from '@/lib/db/categories'
import { HeroCircle } from '@/components/home/HeroCircle'
import { PartnerBar } from '@/components/home/PartnerBar'
import { AboutSection } from '@/components/home/AboutSection'
import { WhyUsBento } from '@/components/home/WhyUsBento'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTABanner } from '@/components/home/CTABanner'

export const revalidate = false // SSG — static forever

export default async function HomePage() {
  const categories = await getCategories()

  const cards = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon_name ?? 'Star',
    imageUrl: cat.image_url ?? undefined,
    colorAccent: cat.color_accent ?? undefined,
  }))

  return (
    <>
      <HeroCircle cards={cards} />
      <PartnerBar />
      <AboutSection />
      <WhyUsBento />
      <ProcessSteps />
      <TestimonialsSection />
      <CTABanner />
    </>
  )
}
