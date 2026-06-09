import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Hourglass } from 'lucide-react'
import { getCategoryBySlug, getAllCategorySlugs } from '@/lib/db/categories'
import { CategoryServicesProvider, CategoryServices } from '@/components/services/CategoryServices'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import { getCategoryColor } from '@/lib/category-colors'
import { getLatestPostsByCategory } from '@/lib/db/posts'
import { PostCard } from '@/components/blog/PostCard'

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
      `Expert ${category.name} services in Indonesia, handled by Ilot.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const colors = getCategoryColor(category.slug)

  // Coming-soon categories skip the service grid entirely — render a placeholder
  // that still keeps the category visible in nav/URL but signals "not yet launched".
  if (category.coming_soon) {
    return (
      <>
        <section className="relative overflow-hidden">
          {/* Sanity coverImage when uploaded, else brand gradient */}
          {category.image_url ? (
            <>
              <Image src={category.image_url} alt={category.name} fill className="object-cover" sizes="100vw" priority />
              <div className="absolute inset-0" style={{ backgroundColor: colors.accent, opacity: 0.8 }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(135deg, ${colors.accent}, ${colors.mid})` }} />
          )}
          <div className="relative z-10 pt-14 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm mb-8 flex items-center gap-2">
              <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
              <span className="text-white/30">›</span>
              <span className="font-medium text-white">{category.name}</span>
            </nav>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white backdrop-blur-sm mb-5">
              <Hourglass className="w-3.5 h-3.5" strokeWidth={2} />
              Launching Soon
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              {category.name}
            </h1>
            {category.tagline && (
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">{category.tagline}</p>
            )}
          </div>
        </section>

        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Hourglass
              className="w-12 h-12 mx-auto mb-6"
              style={{ color: colors.mid }}
              strokeWidth={1.5}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              We&apos;re putting the finishing touches on this service
            </h2>
            <p className="text-base text-muted leading-relaxed mb-8">
              Our {category.name.toLowerCase()} offering is launching soon. If you&apos;d like to
              be first in line, or have an enquiry we can help with today, get in touch and
              the Ilot team will follow up directly.
            </p>
            <WhatsAppCTA
              serviceName={category.name}
              customMessage={`Hi Ilot 👋 I'd like to be notified when your *${category.name}* services launch. Can you keep me posted?`}
              size="lg"
              label={`Contact us about ${category.name}`}
              className="justify-center"
            />
          </div>
        </section>
      </>
    )
  }

  const visibleSubCategories = category.sub_categories.filter(
    (sc) => sc.services.length > 0
  )

  const serviceCount = visibleSubCategories.reduce(
    (sum, sc) => sum + sc.services.length,
    0
  )

  const subCatCount = visibleSubCategories.length
  const latestPosts = await getLatestPostsByCategory(slug, 3)

  return (
    <CategoryServicesProvider subCategories={visibleSubCategories}>
      {/* Hero with banner image + color overlay */}
      <section className="relative overflow-hidden">
        {/* Sanity coverImage when uploaded, else brand gradient */}
        {category.image_url ? (
          <>
            <Image src={category.image_url} alt={category.name} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0" style={{ backgroundColor: colors.accent, opacity: 0.8 }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(135deg, ${colors.accent}, ${colors.mid})` }} />
        )}

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

      {/* Latest articles section */}
      {latestPosts.length > 0 && (
        <section className="section-padding bg-surface">
          <div className="container-site">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Latest articles about {category.name}
                </h2>
                <p className="text-sm text-muted mt-1">
                  Guides and insights from the Ilot team
                </p>
              </div>
              <Link
                href={`/blog?category=${category.slug}`}
                className="text-sm font-medium text-foreground hover:text-accent transition-colors hidden md:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </CategoryServicesProvider>
  )
}
