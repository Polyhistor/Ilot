import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import type { Post } from '@/lib/db/types'

interface Props {
  posts: Post[]
}

export function LatestInsights({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="py-12 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header — matches TestimonialsSection rhythm */}
        <div className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="text-left">
            <div className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3 md:mb-6">
              <span>Insights</span>
            </div>
            <h2 className="text-2xl md:text-6xl font-medium text-[#0B0B1A] tracking-tight leading-[1.1]">
              Guides &amp; perspectives<br />
              from the Ilot team.
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B0B1A] hover:text-accent transition-colors group self-start md:self-auto"
          >
            View all articles
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </div>

        {/* Posts grid — reuses PostCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
