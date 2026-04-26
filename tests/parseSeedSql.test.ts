import { describe, it, expect } from 'vitest'
import { parseSeedSqlCategories } from '@scripts/lib/parseSeedSql'

const seedSql = `
-- Comment
INSERT INTO public.categories (slug, name, tagline, icon_name, sort_order) VALUES
  ('visa', 'Visa & Immigration', 'Your gateway to legal residency in Indonesia.', 'Plane', 0),
  ('legal', 'Legal & Contracts', 'Expert legal frameworks for confident business.', 'Scale', 1),
  ('insurance', 'Insurance', 'Protect what you''ve built.', 'Shield', 3);

INSERT INTO public.sub_categories (category_id, slug, name, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug='visa'), 'investor-kitas', 'Investor KITAS', 0),
  ((SELECT id FROM public.categories WHERE slug='visa'), 'visit-visas', 'Visit Visas', 3);
`

describe('parseSeedSqlCategories', () => {
  it('extracts categories with metadata', () => {
    const result = parseSeedSqlCategories(seedSql)
    expect(result).toHaveLength(3)
    const visa = result.find((c) => c.slug === 'visa')!
    expect(visa.name).toBe('Visa & Immigration')
    expect(visa.tagline).toBe('Your gateway to legal residency in Indonesia.')
    expect(visa.iconName).toBe('Plane')
    expect(visa.sortOrder).toBe(0)
  })

  it('handles SQL-escaped single quotes', () => {
    const insurance = parseSeedSqlCategories(seedSql).find((c) => c.slug === 'insurance')!
    expect(insurance.tagline).toBe("Protect what you've built.")
  })

  it('groups sub-categories under their parent', () => {
    const visa = parseSeedSqlCategories(seedSql).find((c) => c.slug === 'visa')!
    expect(visa.subCategorySlugs).toEqual([
      { slug: 'investor-kitas', name: 'Investor KITAS', sortOrder: 0 },
      { slug: 'visit-visas', name: 'Visit Visas', sortOrder: 3 },
    ])
  })

  it('returns empty array when no INSERT found', () => {
    expect(parseSeedSqlCategories('-- empty')).toEqual([])
  })
})
