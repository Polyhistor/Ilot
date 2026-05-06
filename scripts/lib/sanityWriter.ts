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

/** Only include a field in the document when it has a real value.
 *  Sanity object types (localizedString, localizedText) must be absent
 *  rather than null — an explicit null causes "Invalid property value" in Studio. */
function opt<T>(value: T | null | undefined): { value: T } | Record<string, never> {
  return value != null ? { value } : {}
}

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
      ...(fb?.tagline ? { tagline: { en: fb.tagline } } : {}),
      ...(fb?.iconName ? { iconName: fb.iconName } : {}),
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
      ...(fb.tagline ? { tagline: { en: fb.tagline } } : {}),
      ...(fb.iconName ? { iconName: fb.iconName } : {}),
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

  // Pass 3: services — only write optional fields when they have a value
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
          ...(svc.description        ? { description: svc.description }               : {}),
          ...(svc.targetClient       ? { targetClient: svc.targetClient }             : {}),
          ...(svc.keyDeliverables    ? { keyDeliverables: svc.keyDeliverables }       : {}),
          ...(svc.estimatedTimeline  ? { estimatedTimeline: svc.estimatedTimeline }   : {}),
          ...(svc.realTimeWork       ? { realTimeWork: svc.realTimeWork }             : {}),
          ...(svc.note               ? { note: svc.note }                             : {}),
          whatsappMessage: svc.whatsappMessage,
          sortOrder: svc.sortOrder,
          isActive: true,
        }
        log(`    service: ${cat.slug}/${sub.slug}/${svc.slug}`)
        if (!dryRun) await client.createOrReplace(doc)
      }
    }
  }
}
