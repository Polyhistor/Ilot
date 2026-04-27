/**
 * migrate-supabase-to-sanity.mjs
 *
 * Reads categories, sub-categories, and services from Supabase
 * and upserts them as Sanity documents using createOrReplace.
 * Safe to run multiple times — fully idempotent.
 *
 * Deterministic _id scheme:
 *   category    → category-{slug}
 *   subCategory → subcategory-{categorySlug}-{subSlug}
 *   service     → service-{slug}
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ─── Load .env.local ────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
const env = {}
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
}

// ─── Clients ────────────────────────────────────────────────────────────────
const supabase = createSupabaseClient(
  env['SUPABASE_URL'],
  env['SUPABASE_ANON_KEY']           // anon key — public read policies cover all active rows
)

const sanity = createSanityClient({
  projectId: env['NEXT_PUBLIC_SANITY_PROJECT_ID'],
  dataset: env['NEXT_PUBLIC_SANITY_DATASET'] || 'production',
  apiVersion: '2024-10-01',
  token: env['SANITY_API_WRITE_TOKEN'],
  useCdn: false,
})

// ─── Helpers ────────────────────────────────────────────────────────────────
const catId    = (slug)            => `category-${slug}`
const subcatId = (catSlug, subSlug) => `subcategory-${catSlug}-${subSlug}`
const svcId    = (slug)            => `service-${slug}`

function ls(text) {
  if (!text) return undefined
  return { _type: 'localizedString', en: text }
}
function lt(text) {
  if (!text) return undefined
  return { _type: 'localizedText', en: text }
}

// ─── Fetch from Supabase ─────────────────────────────────────────────────────
console.log('⬇  Fetching data from Supabase…')

const { data: categories, error: catErr } = await supabase
  .from('categories')
  .select('*')
  .order('sort_order')
if (catErr) throw new Error(`categories: ${catErr.message}`)

const { data: subCategories, error: subErr } = await supabase
  .from('sub_categories')
  .select('*, categories(slug)')
  .order('sort_order')
if (subErr) throw new Error(`sub_categories: ${subErr.message}`)

const { data: services, error: svcErr } = await supabase
  .from('services')
  .select('*, categories(slug), sub_categories(slug)')
  .order('sort_order')
if (svcErr) throw new Error(`services: ${svcErr.message}`)

console.log(`   ${categories.length} categories, ${subCategories.length} sub-categories, ${services.length} services`)

// ─── Build Sanity mutations ──────────────────────────────────────────────────
const docs = []

// Categories
for (const cat of categories) {
  docs.push({
    _id: catId(cat.slug),
    _type: 'category',
    slug: { _type: 'slug', current: cat.slug },
    name: ls(cat.name),
    tagline: ls(cat.tagline),
    iconName: cat.icon_name ?? undefined,
    accentColor: cat.color_accent ?? undefined,
    sortOrder: cat.sort_order,
    isActive: cat.is_active,
  })
}

// Sub-categories
for (const sub of subCategories) {
  const catSlug = sub.categories?.slug
  if (!catSlug) {
    console.warn(`  ⚠  skipping sub-category "${sub.slug}" — no parent category`)
    continue
  }
  docs.push({
    _id: subcatId(catSlug, sub.slug),
    _type: 'subCategory',
    slug: { _type: 'slug', current: sub.slug },
    name: ls(sub.name),
    category: { _type: 'reference', _ref: catId(catSlug) },
    sortOrder: sub.sort_order,
    isActive: sub.is_active,
  })
}

// Services
for (const svc of services) {
  const catSlug  = svc.categories?.slug
  const subSlug  = svc.sub_categories?.slug

  if (!catSlug) {
    console.warn(`  ⚠  skipping service "${svc.slug}" — no parent category`)
    continue
  }

  const doc = {
    _id: svcId(svc.slug),
    _type: 'service',
    slug: { _type: 'slug', current: svc.slug },
    name: ls(svc.name),
    category: { _type: 'reference', _ref: catId(catSlug) },
    description: lt(svc.description),
    targetClient: ls(svc.target_client),
    keyDeliverables: lt(svc.key_deliverables),
    estimatedTimeline: ls(svc.estimated_timeline),
    realTimeWork: ls(svc.real_time_work),
    whatsappMessage: lt(svc.whatsapp_message),
    sortOrder: svc.sort_order,
    isActive: svc.is_active,
  }

  if (subSlug) {
    doc.subCategory = { _type: 'reference', _ref: subcatId(catSlug, subSlug) }
  }

  // Strip undefined values (Sanity rejects them)
  for (const key of Object.keys(doc)) {
    if (doc[key] === undefined) delete doc[key]
  }

  docs.push(doc)
}

// ─── Write to Sanity in batches ──────────────────────────────────────────────
console.log(`\n⬆  Writing ${docs.length} documents to Sanity…`)

const BATCH = 50
let created = 0
let updated = 0

for (let i = 0; i < docs.length; i += BATCH) {
  const batch = docs.slice(i, i + BATCH)
  const tx = sanity.transaction()
  for (const doc of batch) {
    tx.createOrReplace(doc)
  }
  const result = await tx.commit({ visibility: 'async' })
  const results = result.results ?? []
  for (const r of results) {
    if (r.operation === 'create') created++
    else updated++
  }
  process.stdout.write(`   batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(docs.length / BATCH)} done\r`)
}

console.log(`\n✅ Done — ${created} created, ${updated} updated`)
console.log('   Open Sanity Studio and search for any service name to confirm.')
