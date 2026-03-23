import { createServerClient } from '@/lib/supabase/server'
import type { Service, ServiceWithCategory } from './types'

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(slug, name, color_accent),
      sub_category:sub_categories(slug, name)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as ServiceWithCategory
}

export async function getRelatedServices(
  subCategoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<Service[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('sub_category_id', subCategoryId)
    .eq('is_active', true)
    .neq('slug', excludeSlug)
    .order('sort_order')
    .limit(limit)

  return data ?? []
}

export async function getFeaturedServices(slugs: string[]): Promise<
  (Service & { category: { slug: string; name: string } })[]
> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('services')
    .select('*, category:categories(slug, name)')
    .in('slug', slugs)
    .eq('is_active', true)

  return (data ?? []) as any[]
}

export async function getAllServiceSlugs(): Promise<{ category: string; slug: string }[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('services')
    .select('slug, category:categories(slug)')
    .eq('is_active', true)

  return (data ?? []).map((s: any) => ({
    category: s.category.slug,
    slug: s.slug,
  }))
}
