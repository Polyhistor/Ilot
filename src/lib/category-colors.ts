/**
 * Category color system — gives each of the 7 pillars a distinct visual identity.
 *
 * accent:  dark saturated color (overlays, borders, active states)
 * tint:    very light background wash
 * mid:     medium shade for text on light backgrounds
 */

export interface CategoryColor {
  accent: string
  tint: string
  mid: string
}

const COLORS: Record<string, CategoryColor> = {
  visa:            { accent: '#1e3a8a', tint: '#eff6ff', mid: '#3b82f6' },
  legal:           { accent: '#1e293b', tint: '#f1f5f9', mid: '#475569' },
  'company-setup': { accent: '#134e4a', tint: '#f0fdfa', mid: '#14b8a6' },
  insurance:       { accent: '#78350f', tint: '#fffbeb', mid: '#f59e0b' },
  property:        { accent: '#312e81', tint: '#eef2ff', mid: '#6366f1' },
  'hr-payroll':    { accent: '#581c87', tint: '#faf5ff', mid: '#a855f7' },
  'accounting-tax':{ accent: '#064e3b', tint: '#ecfdf5', mid: '#10b981' },
}

const FALLBACK: CategoryColor = { accent: '#0B0B1A', tint: '#F4F4F0', mid: '#64748b' }

export function getCategoryColor(slug: string): CategoryColor {
  return COLORS[slug] ?? FALLBACK
}
