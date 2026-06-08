import type {
  ClientDataRow,
  ParsedCategory,
  ParsedSubCategory,
  ParsedService,
} from './types'

function maybeLocalized(value: string | undefined): { en: string } | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return { en: trimmed }
}

/** Returns the manual whatsapp_message if provided, otherwise builds a
 *  consistent, bot-parseable message from the service name. The format
 *  is intentionally stable so the WhatsApp bot can reliably identify
 *  the service from the bold-formatted name. */
function whatsappMessage(serviceName: string, override?: string): { en: string } {
  const custom = override?.trim()
  if (custom) return { en: custom }
  return { en: `Hi Ilot 👋 I'd like to learn more about your *${serviceName}* service. Can you help me?` }
}

export function parseClientData(rows: ClientDataRow[]): ParsedCategory[] {
  const categories = new Map<string, ParsedCategory>()

  for (const row of rows) {
    const categoryName = row.category_name?.trim()
    const categorySlug = row.category_slug?.trim()
    const subCategoryName = row.sub_category_name?.trim()
    const subCategorySlug = row.sub_category_slug?.trim()
    const serviceName = row.service_name?.trim()
    const serviceSlug = row.service_slug?.trim()

    // Every row needs at least a category
    if (!categoryName || !categorySlug) continue

    // Ensure category exists (create on first row referencing it)
    let category = categories.get(categorySlug)
    if (!category) {
      const taglineRaw = row.category_tagline?.trim()
      category = {
        slug: categorySlug,
        name: { en: categoryName },
        tagline: taglineRaw ? { en: taglineRaw } : null,
        iconName: null,
        accentColor: null,
        sortOrder: typeof row.category_sort_order === 'number'
          ? row.category_sort_order
          : parseInt(String(row.category_sort_order), 10) || categories.size,
        comingSoon: row.category_coming_soon === true,
        subCategories: [],
      }
      categories.set(categorySlug, category)
    } else if (row.category_coming_soon === true) {
      // Idempotent: if any row asserts coming-soon, keep it true
      category.comingSoon = true
    }

    // Coming-soon categories don't have sub-categories or services. The
    // placeholder row carries empty sub_category/service fields by design.
    if (category.comingSoon) continue

    // Skip rows that are missing sub-cat or service info (e.g. malformed rows)
    if (!subCategoryName || !subCategorySlug || !serviceName || !serviceSlug) continue

    let subCategory: ParsedSubCategory | undefined = category.subCategories.find(
      (sc) => sc.slug === subCategorySlug
    )
    if (!subCategory) {
      subCategory = {
        slug: subCategorySlug,
        name: { en: subCategoryName },
        sortOrder: typeof row.sub_category_sort_order === 'number'
          ? row.sub_category_sort_order
          : parseInt(String(row.sub_category_sort_order), 10) || category.subCategories.length,
        services: [],
      }
      category.subCategories.push(subCategory)
    }

    const priceRaw = row.price?.trim()
    const docsUrlRaw = row.required_docs_url?.trim()
    const service: ParsedService = {
      slug: serviceSlug,
      name: { en: serviceName },
      description: maybeLocalized(row.description),
      targetClient: maybeLocalized(row.target_client),
      keyDeliverables: maybeLocalized(row.key_deliverables),
      estimatedTimeline: maybeLocalized(row.estimated_timeline),
      realTimeWork: maybeLocalized(row.real_time_work),
      note: maybeLocalized(row.note),
      whatsappMessage: whatsappMessage(serviceName, row.whatsapp_message),
      price: priceRaw || null,
      requiredDocsUrl: docsUrlRaw || null,
      sortOrder: typeof row.service_sort_order === 'number'
        ? row.service_sort_order
        : parseInt(String(row.service_sort_order), 10) || subCategory.services.length,
    }
    subCategory.services.push(service)
  }

  return Array.from(categories.values())
}
