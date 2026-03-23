export interface Category {
  id: string
  slug: string
  name: string
  tagline: string | null
  icon_name: string | null
  image_url: string | null
  color_accent: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SubCategory {
  id: string
  category_id: string
  slug: string
  name: string
  sort_order: number
  is_active: boolean
}

export interface Service {
  id: string
  category_id: string
  sub_category_id: string | null
  slug: string
  name: string
  description: string | null
  target_client: string | null
  key_deliverables: string | null
  estimated_timeline: string | null
  real_time_work: string | null
  whatsapp_message: string | null
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Enriched types used in pages
export interface ServiceWithCategory extends Service {
  category: Pick<Category, 'slug' | 'name' | 'color_accent'>
  sub_category: Pick<SubCategory, 'slug' | 'name'> | null
}

export interface SubCategoryWithServices extends SubCategory {
  services: Service[]
}

export interface CategoryWithSubCategories extends Category {
  sub_categories: SubCategoryWithServices[]
}
