import { groq } from 'next-sanity'

/**
 * GROQ projections rename camelCase Sanity fields → snake_case to preserve
 * existing TS types in src/lib/db/types.ts and avoid touching consumers.
 * Localized fields fall back to EN.
 */

const CATEGORY_PROJECTION = groq`
  "id": _id,
  "slug": slug.current,
  "name": coalesce(name.en, ""),
  "tagline": coalesce(tagline.en, null),
  "icon_name": iconName,
  "image_url": coverImage.asset->url,
  "color_accent": accentColor,
  "sort_order": sortOrder,
  "is_active": isActive,
  "created_at": _createdAt
`

const SUB_CATEGORY_PROJECTION = groq`
  "id": _id,
  "category_id": category._ref,
  "slug": slug.current,
  "name": coalesce(name.en, ""),
  "sort_order": sortOrder,
  "is_active": isActive
`

const SERVICE_PROJECTION = groq`
  "id": _id,
  "category_id": category._ref,
  "sub_category_id": subCategory._ref,
  "slug": slug.current,
  "name": coalesce(name.en, ""),
  "description": coalesce(description.en, null),
  "target_client": coalesce(targetClient.en, null),
  "key_deliverables": coalesce(keyDeliverables.en, null),
  "estimated_timeline": coalesce(estimatedTimeline.en, null),
  "real_time_work": coalesce(realTimeWork.en, null),
  "whatsapp_message": coalesce(whatsappMessage.en, null),
  "meta_title": coalesce(seo.metaTitle.en, null),
  "meta_description": coalesce(seo.metaDescription.en, null),
  "sort_order": sortOrder,
  "is_active": isActive,
  "created_at": _createdAt,
  "updated_at": _updatedAt
`

const SERVICE_WITH_CATEGORY_PROJECTION = groq`
  "id": _id,
  "category_id": category._ref,
  "sub_category_id": subCategory._ref,
  "slug": slug.current,
  "name": coalesce(name.en, ""),
  "description": coalesce(description.en, null),
  "target_client": coalesce(targetClient.en, null),
  "key_deliverables": coalesce(keyDeliverables.en, null),
  "estimated_timeline": coalesce(estimatedTimeline.en, null),
  "real_time_work": coalesce(realTimeWork.en, null),
  "whatsapp_message": coalesce(whatsappMessage.en, null),
  "meta_title": coalesce(seo.metaTitle.en, null),
  "meta_description": coalesce(seo.metaDescription.en, null),
  "sort_order": sortOrder,
  "is_active": isActive,
  "created_at": _createdAt,
  "updated_at": _updatedAt,
  "category": {
    "slug": category->slug.current,
    "name": coalesce(category->name.en, ""),
    "color_accent": category->accentColor
  },
  "sub_category": select(
    defined(subCategory) => {
      "slug": subCategory->slug.current,
      "name": coalesce(subCategory->name.en, "")
    },
    null
  )
`

export const categoriesQuery = groq`
  *[_type == "category" && isActive == true] | order(sortOrder asc) {
    ${CATEGORY_PROJECTION}
  }
`

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug && isActive == true][0] {
    ${CATEGORY_PROJECTION},
    "sub_categories": *[_type == "subCategory" && category._ref == ^._id && isActive == true] | order(sortOrder asc) {
      ${SUB_CATEGORY_PROJECTION},
      "services": *[_type == "service" && subCategory._ref == ^._id && isActive == true] | order(sortOrder asc) {
        ${SERVICE_PROJECTION}
      }
    }
  }
`

export const categoriesWithNavQuery = groq`
  *[_type == "category" && isActive == true] | order(sortOrder asc) {
    ${CATEGORY_PROJECTION},
    "sub_categories": *[_type == "subCategory" && category._ref == ^._id && isActive == true] | order(sortOrder asc) {
      ${SUB_CATEGORY_PROJECTION},
      "services": *[_type == "service" && subCategory._ref == ^._id && isActive == true] | order(sortOrder asc) {
        "id": _id,
        "slug": slug.current,
        "name": coalesce(name.en, ""),
        "sub_category_id": subCategory._ref,
        "category_id": category._ref,
        "sort_order": sortOrder,
        "is_active": isActive
      }
    }
  }
`

export const allCategorySlugsQuery = groq`
  *[_type == "category" && isActive == true].slug.current
`

export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug && isActive == true][0] {
    ${SERVICE_WITH_CATEGORY_PROJECTION}
  }
`

export const allServiceSlugsQuery = groq`
  *[_type == "service" && isActive == true] {
    "slug": slug.current,
    "category": category->slug.current
  }
`

export const servicesByCategoryQuery = groq`
  *[_type == "service" && category->slug.current == $categorySlug && isActive == true]
    | order(sortOrder asc) {
      ${SERVICE_WITH_CATEGORY_PROJECTION}
    }
`

export const relatedServicesQuery = groq`
  *[_type == "service" && subCategory._ref == $subCategoryId && slug.current != $excludeSlug && isActive == true]
    | order(sortOrder asc) [0...$limit] {
      ${SERVICE_PROJECTION}
    }
`

export const featuredServicesQuery = groq`
  *[_type == "service" && slug.current in $slugs && isActive == true] {
    ${SERVICE_PROJECTION},
    "category": {
      "slug": category->slug.current,
      "name": coalesce(category->name.en, "")
    }
  }
`
