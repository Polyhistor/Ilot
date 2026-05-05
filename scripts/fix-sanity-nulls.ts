/**
 * One-time fix for two Sanity data issues introduced during the import:
 *
 * 1. SLUG CONFLICTS — soft-disabled orphan docs share slug values with the
 *    new canonical docs. Rename their slugs to `_deprecated-{slug}` so
 *    Sanity's uniqueness validation no longer complains.
 *
 * 2. NULL OBJECT FIELDS — the importer wrote explicit `null` for every empty
 *    localizedString / localizedText / seoFields field. Sanity schema
 *    validators expect those fields to be *absent* rather than null, and show
 *    "Invalid property value" errors in Studio. Unset them.
 *
 * Run with:  npm run fix:sanity
 */
import 'dotenv/config'
import { createClient } from '@sanity/client'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var ${name}`)
  return v
}

// Object-type fields that must be absent (not null) when empty
const OBJECT_FIELDS = [
  'description',
  'targetClient',
  'keyDeliverables',
  'estimatedTimeline',
  'realTimeWork',
  'whatsappMessage',
  'note',
  'seo',
  'tagline',
  'name',
]

async function main() {
  const client = createClient({
    projectId: requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: requireEnv('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: '2024-10-01',
    token: requireEnv('SANITY_API_WRITE_TOKEN'),
    useCdn: false,
  })

  // ── Fix 1: rename slugs of soft-disabled orphan docs ──────────────────────
  const softDisabled = [
    'service-entertainment-kitas',
    'service-retirement-kitas',
    'subcategory-visa-retirement-kitas',
    'subcategory-visa-visit-visas',
  ]

  console.log('── Fix 1: renaming slugs of soft-disabled orphan docs ──')
  for (const id of softDisabled) {
    const doc = await client.getDocument(id) as any
    if (!doc) { console.log(`  skip (not found): ${id}`); continue }
    const oldSlug = doc.slug?.current ?? '?'
    const newSlug = `_deprecated-${oldSlug}`
    await client.patch(id).set({ slug: { _type: 'slug', current: newSlug } }).commit()
    console.log(`  ${id}: slug ${oldSlug} → ${newSlug}`)
  }

  // ── Fix 2: unset null object-type fields on all services ──────────────────
  console.log('\n── Fix 2: unsetting null object-type fields on services ──')

  const services = await client.fetch<Array<{ _id: string } & Record<string, unknown>>>(
    `*[_type == "service"]{_id, ${OBJECT_FIELDS.join(', ')}}`
  )

  let patched = 0
  for (const svc of services) {
    const nullFields = OBJECT_FIELDS.filter((f) => {
      const v = svc[f]
      // A field is "bad" if it is explicitly null or an empty object {}
      return v === null || (typeof v === 'object' && v !== null && Object.keys(v).length === 0)
    })
    if (nullFields.length === 0) continue

    const unsetPatch = client.patch(svc._id).unset(nullFields)
    await unsetPatch.commit()
    patched++
    console.log(`  ${svc._id}: unset [${nullFields.join(', ')}]`)
  }
  console.log(`  Patched ${patched} service documents.`)

  // ── Fix 2b: same unset pass for subCategory docs ─────────────────────────
  console.log('\n── Fix 2b: unsetting null fields on subCategories ──')

  const subCats = await client.fetch<Array<{ _id: string } & Record<string, unknown>>>(
    `*[_type == "subCategory"]{_id, name}`
  )

  let scPatched = 0
  for (const sc of subCats) {
    const nullFields = ['name'].filter((f) => {
      const v = sc[f]
      return v === null || (typeof v === 'object' && v !== null && Object.keys(v).length === 0)
    })
    if (nullFields.length === 0) continue
    await client.patch(sc._id).unset(nullFields).commit()
    scPatched++
    console.log(`  ${sc._id}: unset [${nullFields.join(', ')}]`)
  }
  console.log(`  Patched ${scPatched} subCategory documents.`)

  console.log('\n✓ Done.')
}

main().catch((err) => { console.error(err); process.exit(1) })
