import type { SanityClient } from '@sanity/client'
import type { ParsedCategory, SeedSqlCategory } from './types'

export interface WriteOptions {
  client: SanityClient
  dryRun: boolean
  log: (msg: string) => void
}

const categoryId = (slug: string) => `category-${slug}`
const subCategoryId = (categorySlug: string, subSlug: string) =>
  `subCategory-${categorySlug}-${subSlug}`
const serviceId = (categorySlug: string, subCategorySlug: string, slug: string) =>
  `service-${categorySlug}-${subCategorySlug}-${slug}`

export async function upsertCategories(
  parsed: ParsedCategory[],
  fallback: SeedSqlCategory[],
  opts: WriteOptions
): Promise<void> {
  const { client, dryRun, log } = opts

  // Pass 1: categories from parsed (client data)
  for (const cat of parsed) {
    const fb = fallback.find((f) => f.slug === cat.slug)
    const doc = {
      _id: categoryId(cat.slug),
      _type: 'category',
      slug: { _type: 'slug', current: cat.slug },
      name: cat.name,
      tagline: fb?.tagline ? { en: fb.tagline } : null,
      iconName: fb?.iconName ?? null,
      sortOrder: cat.sortOrder,
      isActive: true,
    }
    log(`category: ${cat.slug}`)
    if (!dryRun) await client.createOrReplace(doc)
  }

  // Pass 1b: categories from fallback only (not in parsed)
  for (const fb of fallback) {
    if (parsed.find((p) => p.slug === fb.slug)) continue
    const doc = {
      _id: categoryId(fb.slug),
      _type: 'category',
      slug: { _type: 'slug', current: fb.slug },
      name: { en: fb.name },
      tagline: fb.tagline ? { en: fb.tagline } : null,
      iconName: fb.iconName ?? null,
      sortOrder: fb.sortOrder,
      isActive: true,
    }
    log(`category (fallback): ${fb.slug}`)
    if (!dryRun) await client.createOrReplace(doc)
  }

  // Pass 2: sub-categories from parsed
  for (const cat of parsed) {
    for (const sub of cat.subCategories) {
      const doc = {
        _id: subCategoryId(cat.slug, sub.slug),
        _type: 'subCategory',
        slug: { _type: 'slug', current: sub.slug },
        name: sub.name,
        category: { _type: 'reference', _ref: categoryId(cat.slug) },
        sortOrder: sub.sortOrder,
        isActive: true,
      }
      log(`  subCategory: ${cat.slug}/${sub.slug}`)
      if (!dryRun) await client.createOrReplace(doc)
    }
  }

  // Pass 3: services
  for (const cat of parsed) {
    for (const sub of cat.subCategories) {
      for (const svc of sub.services) {
        const doc = {
          _id: serviceId(cat.slug, sub.slug, svc.slug),
          _type: 'service',
          slug: { _type: 'slug', current: svc.slug },
          name: svc.name,
          category: { _type: 'reference', _ref: categoryId(cat.slug) },
          subCategory: {
            _type: 'reference',
            _ref: subCategoryId(cat.slug, sub.slug),
          },
          description: svc.description,
          targetClient: svc.targetClient,
          keyDeliverables: svc.keyDeliverables,
          estimatedTimeline: svc.estimatedTimeline,
          realTimeWork: svc.realTimeWork,
          sortOrder: svc.sortOrder,
          isActive: true,
        }
        log(`    service: ${cat.slug}/${sub.slug}/${svc.slug}`)
        if (!dryRun) await client.createOrReplace(doc)
      }
    }
  }
}
