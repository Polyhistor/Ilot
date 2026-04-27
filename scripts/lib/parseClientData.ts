import { toSlug } from './normalize'
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
    const categoryName = row.Category?.trim()
    const subCategoryName = row['Sub-Category']?.trim()
    const serviceName = row['Service Name']?.trim()
    if (!categoryName || !subCategoryName || !serviceName) continue

    const categorySlug = toSlug(categoryName)
    let category = categories.get(categorySlug)
    if (!category) {
      category = {
        slug: categorySlug,
        name: { en: categoryName },
        tagline: null,
        iconName: null,
        accentColor: null,
        sortOrder: categories.size,
        subCategories: [],
      }
      categories.set(categorySlug, category)
    }

    const subCategorySlug = toSlug(subCategoryName)
    let subCategory: ParsedSubCategory | undefined = category.subCategories.find(
      (sc) => sc.slug === subCategorySlug
    )
    if (!subCategory) {
      subCategory = {
        slug: subCategorySlug,
        name: { en: subCategoryName },
        sortOrder: category.subCategories.length,
        services: [],
      }
      category.subCategories.push(subCategory)
    }

    const service: ParsedService = {
      slug: toSlug(serviceName),
      name: { en: serviceName },
      description: maybeLocalized(row.Description),
      targetClient: maybeLocalized(row['Target Client']),
      keyDeliverables: maybeLocalized(row['Key Deliverables / Outcome']),
      estimatedTimeline: maybeLocalized(row['Estimated Timeline']),
      realTimeWork: maybeLocalized(row['Real time work']),
      sortOrder: subCategory.services.length,
    }
    subCategory.services.push(service)
  }

  return Array.from(categories.values())
}
