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
  banner: string
}

const COLORS: Record<string, CategoryColor> = {
  visa:            { accent: '#1e3a8a', tint: '#eff6ff', mid: '#3b82f6', banner: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1600&auto=format&fit=crop' },
  legal:           { accent: '#1e293b', tint: '#f1f5f9', mid: '#475569', banner: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1600&auto=format&fit=crop' },
  'company-setup': { accent: '#134e4a', tint: '#f0fdfa', mid: '#14b8a6', banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop' },
  insurance:       { accent: '#78350f', tint: '#fffbeb', mid: '#f59e0b', banner: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1600&auto=format&fit=crop' },
  property:        { accent: '#312e81', tint: '#eef2ff', mid: '#6366f1', banner: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop' },
  'hr-payroll':    { accent: '#581c87', tint: '#faf5ff', mid: '#a855f7', banner: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop' },
  'accounting-tax':{ accent: '#064e3b', tint: '#ecfdf5', mid: '#10b981', banner: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop' },
}

const FALLBACK: CategoryColor = { accent: '#0B0B1A', tint: '#F4F4F0', mid: '#64748b', banner: '' }

export function getCategoryColor(slug: string): CategoryColor {
  return COLORS[slug] ?? FALLBACK
}
