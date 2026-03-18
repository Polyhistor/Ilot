import type { MetadataRoute } from 'next'
import { getCategories } from '@/lib/db/categories'
import { getAllServiceSlugs } from '@/lib/db/services'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'
  const [categories, services] = await Promise.all([
    getCategories(),
    getAllServiceSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const servicePages: MetadataRoute.Sitemap = services.map(({ category, slug }) => ({
    url: `${siteUrl}/${category}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...servicePages]
}
