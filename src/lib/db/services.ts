import { sanityClient } from '@/sanity/lib/client'
import {
  serviceBySlugQuery,
  allServiceSlugsQuery,
  servicesByCategoryQuery,
  relatedServicesQuery,
  featuredServicesQuery,
} from '@/sanity/lib/queries'
import type { Service, ServiceWithCategory } from './types'

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  try {
    const data = await sanityClient.fetch<ServiceWithCategory | null>(
      serviceBySlugQuery,
      { slug },
      { next: { revalidate: 60, tags: ['service', `service:${slug}`] } }
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function getRelatedServices(
  subCategoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<Service[]> {
  try {
    const data = await sanityClient.fetch<Service[]>(
      relatedServicesQuery,
      { subCategoryId, excludeSlug, limit },
      { next: { revalidate: 60, tags: ['service'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getFeaturedServices(slugs: string[]): Promise<
  (Service & { category: { slug: string; name: string } })[]
> {
  try {
    const data = await sanityClient.fetch<(Service & { category: { slug: string; name: string } })[]>(
      featuredServicesQuery,
      { slugs },
      { next: { revalidate: 60, tags: ['service'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getAllServiceSlugs(): Promise<{ category: string; slug: string }[]> {
  try {
    const data = await sanityClient.fetch<{ category: string; slug: string }[]>(
      allServiceSlugsQuery,
      {},
      { next: { revalidate: 60, tags: ['service'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}
