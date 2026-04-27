import Image from 'next/image'
import Link from 'next/link'
import { AuthorByline } from './AuthorByline'
import { estimateReadingTime } from '@/lib/reading-time'
import type { Post } from '@/lib/db/types'

interface Props {
  post: Post
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function PostCard({ post }: Props) {
  const readingTime = estimateReadingTime(post.excerpt ?? '')

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-surface hover:shadow-lg transition-shadow duration-300"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-foreground/5">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: post.category_accent ?? '#0B0B1A' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        {/* Category pill */}
        <span
          className="self-start text-xs font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: post.category_accent ?? '#0B0B1A' }}
        >
          {post.category_name}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-foreground text-lg leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted text-sm line-clamp-2 flex-1">{post.excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/5">
          <AuthorByline author={post.author} size="sm" />
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{formatDate(post.published_at)}</span>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
