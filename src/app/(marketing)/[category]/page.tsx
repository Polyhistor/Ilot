import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug, getAllCategorySlugs } from '@/lib/db/categories'
import { ServiceCard } from '@/components/services/ServiceCard'
import { CategorySidebar } from '@/components/services/CategorySidebar'

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

  const sidebarItems = category.sub_categories
    .filter((sc) => sc.services.length > 0)
    .map((sc) => ({ id: sc.slug, slug: sc.slug, name: sc.name }))

  return (
    <>
      {/* Hero */}
      <div className="bg-foreground text-white section-padding">
        <div className="container-site">
          <nav className="text-sm text-gray-400 mb-4">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">›</span>
            <span>{category.name}</span>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            {category.name}
          </h1>
          {category.tagline && (
            <p className="text-gray-300 text-xl max-w-xl">{category.tagline}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="section-padding bg-background">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12">
            {/* Sidebar */}
            <CategorySidebar items={sidebarItems} />

            {/* Services grouped by sub-category */}
            <div className="space-y-16">
              {category.sub_categories
                .filter((sc) => sc.services.length > 0)
                .map((sc) => (
                  <section key={sc.id} id={sc.slug}>
                    <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-surface">
                      {sc.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sc.services.map((service) => (
                        <ServiceCard
                          key={service.slug}
                          service={service}
                          categorySlug={category.slug}
                        />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
