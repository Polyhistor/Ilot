export interface ParsedService {
  slug: string
  name: { en: string }
  description: { en: string } | null
  targetClient: { en: string } | null
  keyDeliverables: { en: string } | null
  estimatedTimeline: { en: string } | null
  realTimeWork: { en: string } | null
  sortOrder: number
}

export interface ParsedSubCategory {
  slug: string
  name: { en: string }
  sortOrder: number
  services: ParsedService[]
}

export interface ParsedCategory {
  slug: string
  name: { en: string }
  tagline: { en: string } | null
  iconName: string | null
  accentColor: string | null
  sortOrder: number
  subCategories: ParsedSubCategory[]
}

export interface ClientDataRow {
  Category: string
  'Sub-Category': string
  'Service Name': string
  Description: string
  'Target Client': string
  'Key Deliverables / Outcome': string
  'Estimated Timeline': string
  'Real time work'?: string
}

export interface SeedSqlSubCategory {
  slug: string
  name: string
  sortOrder: number
}

export interface SeedSqlCategory {
  slug: string
  name: string
  tagline: string | null
  iconName: string | null
  sortOrder: number
  subCategorySlugs: SeedSqlSubCategory[]
}
