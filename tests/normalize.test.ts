import { describe, it, expect } from 'vitest'
import { toSlug } from '@scripts/lib/normalize'

describe('toSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(toSlug('Company Set Up')).toBe('company-set-up')
  })

  it('strips ampersands and joins with single hyphen', () => {
    expect(toSlug('Visa & Immigration')).toBe('visa-immigration')
  })

  it('removes special characters', () => {
    expect(toSlug('PT Local - Set Up')).toBe('pt-local-set-up')
  })

  it('collapses repeated whitespace', () => {
    expect(toSlug('  Hello   World  ')).toBe('hello-world')
  })

  it('handles parentheses', () => {
    expect(toSlug('CV (Commanditaire Vennootschap)')).toBe('cv-commanditaire-vennootschap')
  })

  it('handles slashes', () => {
    expect(toSlug('NIB & OSS Process')).toBe('nib-oss-process')
  })

  it('returns empty string for empty input', () => {
    expect(toSlug('')).toBe('')
    expect(toSlug('   ')).toBe('')
  })

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('-foo-bar-')).toBe('foo-bar')
  })

  it('preserves hyphens in already-slugged input', () => {
    expect(toSlug('investor-kitas')).toBe('investor-kitas')
  })
})
