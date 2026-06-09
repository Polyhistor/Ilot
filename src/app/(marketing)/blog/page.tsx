import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPosts, getFeaturedPost } from '@/lib/db/posts'
import { getCategories } from '@/lib/db/categories'
import { PostCard } from '@/components/blog/PostCard'
import { AuthorByline } from '@/components/blog/AuthorByline'
import { CategoryFilter } from '@/components/blog/CategoryFilter'
import { estimateReadingTime } from '@/lib/reading-time'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog: Insights on Business & Legal in Indonesia',
  description:
    'Expert guides, updates, and advice on visa, legal, company setup, and more from the Ilot team.',
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function BlogPage({ searchParams }: Props) {
  const { category: activeCategory } = await searchParams

  const [allPosts, featured, categories] = await Promise.all([
    getPosts(),
    getFeaturedPost(),
    getCategories(),
  ])

  const filteredPosts = activeCategory
    ? allPosts.filter((p) => p.category_slug === activeCategory)
    : allPosts

  // Remove featured from grid to avoid duplication
  const gridPosts = featured
    ? filteredPosts.filter((p) => p.slug !== featured.slug)
    : filteredPosts

  const heroPost = activeCategory ? filteredPosts[0] ?? null : (featured ?? allPosts[0] ?? null)
  const heroGridPosts = activeCategory
    ? filteredPosts.slice(1)
    : gridPosts

  const filterCategories = categories
    .filter((c) => allPosts.some((p) => p.category_slug === c.slug))
    .map((c) => ({ slug: c.slug, name: c.name, accent: c.color_accent }))

  return (
    <main className="min-h-screen bg-background">
      <div className="container-site section-padding">

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Insights
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Guides, updates, and expert advice on doing business in Indonesia.
          </p>
        </div>

        {/* Category filter */}
        {filterCategories.length > 0 && (
          <div className="mb-10">
            <Suspense>
              <CategoryFilter categories={filterCategories} active={activeCategory ?? null} />
            </Suspense>
          </div>
        )}

        {/* Hero post */}
        {heroPost && (
          <div className="mb-12">
            <Link
              href={`/blog/${heroPost.slug}`}
              className="group grid md:grid-cols-2 gap-8 overflow-hidden rounded-card bg-surface hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-foreground/5">
                {heroPost.cover_image_url ? (
                  <Image
                    src={heroPost.cover_image_url}
                    alt={heroPost.cover_image_alt ?? heroPost.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div
                    className="w-full h-full min-h-64"
                    style={{ backgroundColor: heroPost.category_accent ?? '#0B0B1A' }}
                  />
                )}
              </div>
              <div className="flex flex-col justify-center p-8 gap-4">
                <span
                  className="self-start text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: heroPost.category_accent ?? '#0B0B1A' }}
                >
                  {heroPost.category_name}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                  {heroPost.title}
                </h2>
                {heroPost.excerpt && (
                  <p className="text-muted leading-relaxed line-clamp-3">{heroPost.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/5">
                  <AuthorByline author={heroPost.author} size="md" />
                  <div className="text-sm text-muted">
                    {formatDate(heroPost.published_at)} · {estimateReadingTime(heroPost.excerpt ?? '')} min read
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts grid */}
        {heroGridPosts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroGridPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          !heroPost && (
            <div className="py-24 text-center text-muted">
              No articles yet. Check back soon.
            </div>
          )
        )}
      </div>
    </main>
  )
}
