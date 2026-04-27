import { sanityClient } from '@/sanity/lib/client'
import {
  updatesQuery,
  updateBySlugQuery,
  allUpdateSlugsQuery,
} from '@/sanity/lib/queries'
import type { Update, UpdateWithBody } from './types'

export async function getUpdates(): Promise<Update[]> {
  try {
    const data = await sanityClient.fetch<Update[]>(
      updatesQuery,
      {},
      { next: { revalidate: 60, tags: ['update'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getUpdateBySlug(slug: string): Promise<UpdateWithBody | null> {
  try {
    const data = await sanityClient.fetch<UpdateWithBody | null>(
      updateBySlugQuery,
      { slug },
      { next: { revalidate: 60, tags: ['update', `update:${slug}`] } }
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function getAllUpdateSlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch<string[]>(
      allUpdateSlugsQuery,
      {},
      { next: { revalidate: 60, tags: ['update'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}
