# Project Notes for Claude

## Stack
- Next.js 15 App Router + React 19
- Sanity CMS (private dataset) — all content served via GROQ
- Tailwind CSS v4, Lucide React icons
- No Supabase in active use (Sanity is the source of truth)
- Dev port: **3003** (port 3000 is occupied by another project)

## Data Import Workflow

Whenever the client's service data changes, the full workflow is:

1. Update `docs/seed-data-raw.json` (or re-run `scripts/generate-seed.py`)
2. Dry-run the import to verify:
   ```
   npm run import:sanity:dry
   ```
3. Run the real import:
   ```
   npm run import:sanity
   ```
4. **Always follow with the cleanup script** to remove any orphaned Sanity documents
   (docs whose `_id` is no longer in the expected set — renamed, restructured, or removed services):
   ```
   npm run cleanup:sanity:dry   ← preview what will be removed
   npm run cleanup:sanity       ← actually remove them
   ```

### Why this matters
Sanity's `createOrReplace` only upserts by exact `_id`. If a category/sub-category/service is
renamed (changing its slug), the old document is never touched — it stays in Sanity with
`isActive: true` and shows up in GROQ queries alongside the new one, causing duplicates.
The cleanup script computes expected `_id`s from the current seed data and removes anything
outside that set (hard-delete where possible, `isActive: false` where references exist).

## Sanity Document ID Format
- Categories:     `category-{slug}`
- Sub-categories: `subCategory-{categorySlug}-{subSlug}`
- Services:       `service-{categorySlug}-{subCategorySlug}-{serviceSlug}`

## Seed Data Format (`docs/seed-data-raw.json`)
Snake_case fields: `category_slug`, `sub_category_slug`, `service_slug`, `category_sort_order`,
`sub_category_sort_order`, `service_sort_order`, `description`, `target_client`,
`key_deliverables`, `estimated_timeline`, `real_time_work`, `note`.
Slugs are **pre-computed** in the JSON — `parseClientData.ts` reads them directly,
no auto-generation from names.

## GROQ / Types Notes
- All GROQ projections rename camelCase Sanity fields → snake_case to match TS types in
  `src/lib/db/types.ts`. Do not change field names in queries without updating types.
- Localized fields: `coalesce(field.en, null)` — English only for now.
- Cache tags: `category`, `subCategory`, `service` — used for on-demand revalidation.
