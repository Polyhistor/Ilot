import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getCategoryBySlug, getAllCategorySlugs } from '@/lib/db/categories'
import { CategoryServicesProvider, CategoryServices } from '@/components/services/CategoryServices'
import { getCategoryColor } from '@/lib/category-colors'

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs()
  return slugs.map((slug) => ({ category: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  return {
    title: category.name,
    description:
      category.tagline ??
      `Expert ${category.name} services in Indonesia — handled by Ilot.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const visibleSubCategories = category.sub_categories.filter(
    (sc) => sc.services.length > 0
  )

  const serviceCount = visibleSubCategories.reduce(
    (sum, sc) => sum + sc.services.length,
    0
  )

  const subCatCount = visibleSubCategories.length
  const colors = getCategoryColor(category.slug)

  return (
    <CategoryServicesProvider subCategories={visibleSubCategories}>
      {/* Hero with banner image + color overlay */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        {colors.banner && (
          <Image
            src={colors.banner}
            alt={category.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {/* Color overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: colors.accent, opacity: 0.85 }} />

        <div className="relative z-10 pt-14 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-8 flex items-center gap-2">
            <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
            <span className="text-white/30">›</span>
            <span className="font-medium text-white">{category.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
            {category.name}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {category.tagline && (
              <p className="text-lg text-white/70 leading-relaxed">{category.tagline}</p>
            )}
            <div className="flex items-center gap-3 text-sm shrink-0">
              <span className="px-3 py-1.5 rounded-full font-medium bg-white/15 text-white backdrop-blur-sm">
                {serviceCount} services
              </span>
              <span className="px-3 py-1.5 rounded-full font-medium bg-white/15 text-white backdrop-blur-sm">
                {subCatCount} categories
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryServices
            subCategories={visibleSubCategories}
            categorySlug={category.slug}
            accentColor={colors.accent}
            tintColor={colors.tint}
          />
        </div>
      </section>
    </CategoryServicesProvider>
  )
}
