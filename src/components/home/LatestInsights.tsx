import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import type { Post } from '@/lib/db/types'

interface Props {
  posts: Post[]
}

export function LatestInsights({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="py-12 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — matches TestimonialsSection rhythm */}
        <RevealGroup className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <RevealItem className="text-left">
            <h2 className="text-2xl md:text-6xl font-medium text-[#0B0B1A] tracking-tight leading-[1.1]">
              Guides &amp; perspectives<br />
              from the Ilot team.
            </h2>
          </RevealItem>

          <RevealItem className="self-start md:self-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B0B1A] hover:text-accent transition-colors group"
            >
              View all articles
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          </RevealItem>
        </RevealGroup>

        {/* Posts grid — reuses PostCard */}
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <RevealItem key={post.slug} className="h-full">
              <PostCard post={post} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
