import { sanityClient } from '@/sanity/lib/client'
import {
  categoriesQuery,
  categoryBySlugQuery,
  categoriesWithNavQuery,
  allCategorySlugsQuery,
} from '@/sanity/lib/queries'
import type { Category, CategoryWithSubCategories } from './types'

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await sanityClient.fetch<Category[]>(
      categoriesQuery,
      {},
      { next: { revalidate: 60, tags: ['category'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryWithSubCategories | null> {
  try {
    const data = await sanityClient.fetch<CategoryWithSubCategories | null>(
      categoryBySlugQuery,
      { slug },
      { next: { revalidate: 60, tags: ['category', `category:${slug}`] } }
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function getCategoriesWithNav(): Promise<CategoryWithSubCategories[]> {
  try {
    const data = await sanityClient.fetch<CategoryWithSubCategories[]>(
      categoriesWithNavQuery,
      {},
      { next: { revalidate: 60, tags: ['category', 'subCategory', 'service'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch<string[]>(
      allCategorySlugsQuery,
      {},
      { next: { revalidate: 60, tags: ['category'] } }
    )
    return data ?? []
  } catch {
    return []
  }
}
