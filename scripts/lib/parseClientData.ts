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

export function parseClientData(rows: ClientDataRow[]): ParsedCategory[] {
  const categories = new Map<string, ParsedCategory>()

  for (const row of rows) {
    const categoryName = row.category_name?.trim()
    const categorySlug = row.category_slug?.trim()
    const subCategoryName = row.sub_category_name?.trim()
    const subCategorySlug = row.sub_category_slug?.trim()
    const serviceName = row.service_name?.trim()
    const serviceSlug = row.service_slug?.trim()

    // Skip rows missing required fields
    if (!categoryName || !categorySlug || !subCategoryName || !subCategorySlug || !serviceName || !serviceSlug) continue

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
        subCategories: [],
      }
      categories.set(categorySlug, category)
    }

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

    const service: ParsedService = {
      slug: serviceSlug,
      name: { en: serviceName },
      description: maybeLocalized(row.description),
      targetClient: maybeLocalized(row.target_client),
      keyDeliverables: maybeLocalized(row.key_deliverables),
      estimatedTimeline: maybeLocalized(row.estimated_timeline),
      realTimeWork: maybeLocalized(row.real_time_work),
      note: maybeLocalized(row.note),
      sortOrder: typeof row.service_sort_order === 'number'
        ? row.service_sort_order
        : parseInt(String(row.service_sort_order), 10) || subCategory.services.length,
    }
    subCategory.services.push(service)
  }

  return Array.from(categories.values())
}
