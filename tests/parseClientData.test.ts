import { describe, it, expect } from 'vitest'
import { parseClientData } from '@scripts/lib/parseClientData'
import type { ClientDataRow } from '@scripts/lib/types'

function row(overrides: Partial<ClientDataRow>): ClientDataRow {
  return {
    category_name: '',
    category_slug: '',
    category_tagline: '',
    category_sort_order: '',
    sub_category_name: '',
    sub_category_slug: '',
    sub_category_sort_order: '',
    service_name: '',
    service_slug: '',
    service_sort_order: '',
    description: '',
    target_client: '',
    key_deliverables: '',
    estimated_timeline: '',
    real_time_work: '',
    note: '',
    ...overrides,
  }
}

const sample: ClientDataRow[] = [
  row({
    category_name: 'Visa',
    category_slug: 'visa',
    sub_category_name: 'Investor KITAS',
    sub_category_slug: 'investor-kitas',
    service_name: 'Investor KITAS 2 Years',
    service_slug: 'investor-kitas-2-years',
    description: 'Full processing for a 2-year Investor Stay Permit.',
    target_client: 'Foreign Investors',
    key_deliverables: '2-Year Investor KITAS, MERP',
    estimated_timeline: '6-10 Weeks',
    price: 'Rp22,000,000',
    required_docs_url: 'https://docs.google.com/document/d/abc/edit',
  }),
  row({
    category_name: 'Visa',
    category_slug: 'visa',
    sub_category_name: 'Investor KITAS',
    sub_category_slug: 'investor-kitas',
    service_name: 'Investor KITAS 1 Year',
    service_slug: 'investor-kitas-1-year',
    description: '1-year version.',
    target_client: 'Foreign Investors',
    key_deliverables: '1-Year Investor KITAS',
    estimated_timeline: '4-6 Weeks',
  }),
  row({
    category_name: 'Visa',
    category_slug: 'visa',
    sub_category_name: 'Working Remote KITAS',
    sub_category_slug: 'working-remote-kitas',
    service_name: 'E33G Remote Worker',
    service_slug: 'e33g-remote-worker',
    description: 'Remote worker visa.',
    target_client: 'Remote Workers',
    key_deliverables: 'E33G',
    estimated_timeline: '3-5 Weeks',
  }),
  row({
    category_name: 'Accounting & Tax',
    category_slug: 'accounting-tax',
    sub_category_name: 'Bookkeeping',
    sub_category_slug: 'bookkeeping',
    service_name: 'Monthly Bookkeeping',
    service_slug: 'monthly-bookkeeping',
    description: 'Monthly book closing.',
    target_client: 'SMEs',
    key_deliverables: 'Monthly Reports',
    estimated_timeline: 'Ongoing',
    real_time_work: '2 days/month',
  }),
]

describe('parseClientData', () => {
  it('groups rows into category → sub-category → service', () => {
    const result = parseClientData(sample)
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe('visa')
    expect(result[1].slug).toBe('accounting-tax')
  })

  it('groups sub-categories within a category', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    expect(visa.subCategories).toHaveLength(2)
    expect(visa.subCategories.map((s) => s.slug)).toEqual([
      'investor-kitas',
      'working-remote-kitas',
    ])
  })

  it('groups services within a sub-category', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    const investorKitas = visa.subCategories.find((s) => s.slug === 'investor-kitas')!
    expect(investorKitas.services).toHaveLength(2)
    expect(investorKitas.services[0].slug).toBe('investor-kitas-2-years')
    expect(investorKitas.services[1].slug).toBe('investor-kitas-1-year')
  })

  it('maps service fields including optional realTimeWork', () => {
    const accounting = parseClientData(sample).find((c) => c.slug === 'accounting-tax')!
    const svc = accounting.subCategories[0].services[0]
    expect(svc.name.en).toBe('Monthly Bookkeeping')
    expect(svc.description?.en).toBe('Monthly book closing.')
    expect(svc.targetClient?.en).toBe('SMEs')
    expect(svc.keyDeliverables?.en).toBe('Monthly Reports')
    expect(svc.estimatedTimeline?.en).toBe('Ongoing')
    expect(svc.realTimeWork?.en).toBe('2 days/month')
  })

  it('omits realTimeWork when absent on the row', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    const svc = visa.subCategories[0].services[0]
    expect(svc.realTimeWork).toBeNull()
  })

  it('reads price and required_docs_url onto the service', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    const svc = visa.subCategories[0].services[0]
    expect(svc.price).toBe('Rp22,000,000')
    expect(svc.requiredDocsUrl).toBe('https://docs.google.com/document/d/abc/edit')
  })

  it('returns null for price and docs URL when absent', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    const svc = visa.subCategories[0].services[1] // second service has no price/url
    expect(svc.price).toBeNull()
    expect(svc.requiredDocsUrl).toBeNull()
  })

  it('assigns deterministic sortOrder by appearance', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    expect(visa.sortOrder).toBe(0)
    expect(visa.subCategories[0].sortOrder).toBe(0)
    expect(visa.subCategories[1].sortOrder).toBe(1)
    expect(visa.subCategories[0].services[0].sortOrder).toBe(0)
    expect(visa.subCategories[0].services[1].sortOrder).toBe(1)
  })

  it('returns empty array for empty input', () => {
    expect(parseClientData([])).toEqual([])
  })

  it('creates a coming-soon category with no sub-categories from a placeholder row', () => {
    const result = parseClientData([
      row({
        category_name: 'Property Advisory',
        category_slug: 'property-advisory',
        category_tagline: 'Launching soon.',
        category_coming_soon: true,
      }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('property-advisory')
    expect(result[0].comingSoon).toBe(true)
    expect(result[0].subCategories).toEqual([])
    expect(result[0].tagline?.en).toBe('Launching soon.')
  })

  it('non-coming-soon categories default comingSoon to false', () => {
    const visa = parseClientData(sample).find((c) => c.slug === 'visa')!
    expect(visa.comingSoon).toBe(false)
  })
})
