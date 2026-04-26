import { describe, it, expect } from 'vitest'
import { parseClientData } from '@scripts/lib/parseClientData'
import type { ClientDataRow } from '@scripts/lib/types'

const sample: ClientDataRow[] = [
  {
    Category: 'Visa',
    'Sub-Category': 'Investor KITAS',
    'Service Name': 'Investor KITAS 2 Years',
    Description: 'Full processing for a 2-year Investor Stay Permit.',
    'Target Client': 'Foreign Investors',
    'Key Deliverables / Outcome': '2-Year Investor KITAS, MERP',
    'Estimated Timeline': '6-10 Weeks',
  },
  {
    Category: 'Visa',
    'Sub-Category': 'Investor KITAS',
    'Service Name': 'Investor KITAS 1 Year',
    Description: '1-year version.',
    'Target Client': 'Foreign Investors',
    'Key Deliverables / Outcome': '1-Year Investor KITAS',
    'Estimated Timeline': '4-6 Weeks',
  },
  {
    Category: 'Visa',
    'Sub-Category': 'Working Remote KITAS',
    'Service Name': 'E33G Remote Worker',
    Description: 'Remote worker visa.',
    'Target Client': 'Remote Workers',
    'Key Deliverables / Outcome': 'E33G',
    'Estimated Timeline': '3-5 Weeks',
  },
  {
    Category: 'Accounting & Tax',
    'Sub-Category': 'Bookkeeping',
    'Service Name': 'Monthly Bookkeeping',
    Description: 'Monthly book closing.',
    'Target Client': 'SMEs',
    'Key Deliverables / Outcome': 'Monthly Reports',
    'Estimated Timeline': 'Ongoing',
    'Real time work': '2 days/month',
  },
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
})
