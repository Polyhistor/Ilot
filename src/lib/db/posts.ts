import { sanityClient } from '@/sanity/lib/client'
import {
  postsQuery,
  featuredPostQuery,
  postBySlugQuery,
  allPostSlugsQuery,
  latestPostsByCategoryQuery,
} from '@/sanity/lib/queries'
import type { Post, PostWithDetails } from './types'

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await sanityClient.fetch<Post[]>(
      postsQuery,
      {},
      { next: { revalidate: 60, tags: ['post'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getFeaturedPost(): Promise<Post | null> {
  try {
    const data = await sanityClient.fetch<Post | null>(
      featuredPostQuery,
      {},
      { next: { revalidate: 60, tags: ['post'] } }
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function getPostBySlug(slug: string): Promise<PostWithDetails | null> {
  try {
    const data = await sanityClient.fetch<PostWithDetails | null>(
      postBySlugQuery,
      { slug },
      { next: { revalidate: 60, tags: ['post', `post:${slug}`] } }
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch<string[]>(
      allPostSlugsQuery,
      {},
      { next: { revalidate: 60, tags: ['post'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getLatestPostsByCategory(
  categorySlug: string,
  limit = 3
): Promise<Post[]> {
  try {
    const data = await sanityClient.fetch<Post[]>(
      latestPostsByCategoryQuery,
      { categorySlug, limit: limit - 1 }, // GROQ [0..$limit] is inclusive, so limit-1
      { next: { revalidate: 60, tags: ['post', `category:${categorySlug}`] } }
    )
    return data ?? []
  } catch {
    return []
  }
}
