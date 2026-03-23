import { createServerClient } from '@/lib/supabase/server'
import type { Category, CategoryWithSubCategories } from './types'

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return []
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithSubCategories | null> {
  const supabase = createServerClient()
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !category) return null

  const { data: subCategories } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('sort_order')

  const subCatsWithServices = await Promise.all(
    (subCategories ?? []).map(async (sc) => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('sub_category_id', sc.id)
        .eq('is_active', true)
        .order('sort_order')

      return { ...sc, services: services ?? [] }
    })
  )

  return { ...category, sub_categories: subCatsWithServices }
}

export async function getCategoriesWithNav(): Promise<CategoryWithSubCategories[]> {
  const supabase = createServerClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (!categories?.length) return []

  const { data: subCategories } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const { data: services } = await supabase
    .from('services')
    .select('id, slug, name, sub_category_id, category_id, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order')

  return categories.map((cat) => {
    const catSubs = (subCategories ?? [])
      .filter((sc) => sc.category_id === cat.id)
      .map((sc) => ({
        ...sc,
        services: (services ?? []).filter((s) => s.sub_category_id === sc.id) as any[],
      }))
    return { ...cat, sub_categories: catSubs }
  })
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true)

  return (data ?? []).map((c) => c.slug)
}
