#!/usr/bin/env node
// One-off: read all 6 Google-Sheets HTML exports in docs/client-tables-2026-05/,
// normalize to the seed-data-raw.json row format, and emit:
//   - docs/seed-data-raw.json  (the unified seed)
//   - docs/_parser-report.json (cleanup log + warnings)
//
// Run:   node scripts/parseClientHtml.mjs [--dry]
// --dry: print summary to stdout, don't write files.

import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = path.resolve('docs/client-tables-2026-05')
const OUT_SEED = path.resolve('docs/seed-data-raw.json')
const OUT_REPORT = path.resolve('docs/_parser-report.json')

// Canonical category slugs — keep existing slugs to avoid breaking URLs.
const CATEGORY_SLUG_OVERRIDES = {
  'visa & immigration': 'visa',
  'visa': 'visa',
  'legal & contract advisory': 'legal',
  'legal': 'legal',
  'company set up': 'company-setup',
  'company set-up': 'company-setup',
  'company setup': 'company-setup',
  'human resource (hr)': 'hr-payroll',
  'human resource': 'hr-payroll',
  'hr': 'hr-payroll',
  'accounting & tax': 'accounting-tax',
  'accounting & TAX': 'accounting-tax',
  'insurance': 'insurance',
  'property advisory': 'property-advisory',
}

// File ordering -> determines category sort_order
const FILE_ORDER = [
  'Visa.html',
  'Legal.html',
  'Company setup.html',
  'HR.html',
  'Accounting & Tax.html',
  'Insurance.html',
]

// ---------- helpers ----------
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '')
}

function clean(s) {
  return decodeEntities(stripTags(s)).replace(/\s+/g, ' ').trim()
}

function toSlug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Pull the href out of the first <a ... href="..."> in a cell, if any.
function extractHref(cellHtml) {
  const m = cellHtml.match(/<a[^>]+href=["']([^"']+)["']/i)
  return m ? m[1].trim() : ''
}

// Header normalization → canonical field key
function normalizeHeader(h) {
  const k = clean(h).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  // Map several variants to canonical fields
  const map = {
    'category_name': 'category_name',
    'category_slug': 'category_slug',
    'category_tagline': 'category_tagline',
    'category_sort_order': 'category_sort_order',
    'sub_category_name': 'sub_category_name',
    'sub_category_slug': 'sub_category_slug',
    'sub_category_sort_order': 'sub_category_sort_order',
    'service_name': 'service_name',
    'service_slug': 'service_slug',
    'service_sort_order': 'service_sort_order',
    'description': 'description',
    'target_client': 'target_client',
    'key_deliverables': 'key_deliverables',
    'key_deliverables_outcome': 'key_deliverables',
    'estimated_timeline': 'estimated_timeline',
    'time': 'estimated_timeline',
    'real_time_work': 'real_time_work',
    'real_time_wok': 'real_time_work',  // typo in Insurance.html
    'note': 'note',
    'price': 'price',
    'link': 'link',
  }
  return map[k] || (k ? `__unknown_${k}` : '__blank')
}

// Silent typo + whitespace cleanup. Track each correction.
const corrections = []
function cleanupText(value, context) {
  if (!value) return value
  const orig = value
  let v = value
  // Normalize whitespace
  v = v.replace(/\s+/g, ' ').trim()
  // Common typos
  const fixes = [
    [/\bBussiness\b/g, 'Business'],
    [/\bBussines\b/g, 'Business'],
    [/\bPemanent\b/g, 'Permanent'],
    [/\bAppostile\b/g, 'Apostille'],
    [/\bPra-Invenstments\b/gi, 'Pre-Investment'],
    [/\bPra-Investments\b/gi, 'Pre-Investment'],
    [/\bInvenstments\b/gi, 'Investments'],
    [/\bExtesion\b/g, 'Extension'],
    [/\bWok\b/g, 'Work'],  // for "Real Time Wok"
  ]
  for (const [pat, repl] of fixes) v = v.replace(pat, repl)
  if (v !== orig) corrections.push({ context, from: orig, to: v })
  return v
}

// ---------- restructure decisions ----------
// Merge two near-identical Company Setup sub-categories into one canonical name.
const SUB_CATEGORY_MERGES = {
  // category_slug -> { sourceSubName: canonicalSubName }
  'company-setup': {
    'Company Set-Up- establishment': 'Company Set-Up Establishment',
    'Company Set-Up-establishment': 'Company Set-Up Establishment',
    'Company Set-Up-Licensing': 'Company Set-Up Licensing',
    'Company Set-Up': 'Company Set-Up Account Management',  // bare "Company Set-Up" is OSS-credentials services
    'Closing & Dissolution': 'Closing & Dissolution Local',
    'Closing & Dissolution PMA': 'Closing & Dissolution PMA',
  },
  // Visa: collapse 9 single-service sub-categories into one umbrella
  'visa': {
    'Address Mutations In Itas': 'Documents & Mutations',
    'Affidavit': 'Documents & Mutations',
    'Apostille Documents': 'Documents & Mutations',
    'Brand Registration': 'Documents & Mutations',
    'Domicile Letter': 'Documents & Mutations',
    'E Passport 5 years': 'Documents & Mutations',
    'E Passport 10 years': 'Documents & Mutations',
    'ERP': 'Documents & Mutations',
    'Passport Mutation from the old to New one': 'Documents & Mutations',
  },
  // Insurance: fix broken concatenation
  'insurance': {
    'Vehicle ProtectionComprehensive and Total Loss Only (TLO).': 'Vehicle Protection',
  },
}

// Services literally named just "Extension" — rename to "{Parent Sub-Category} Extension"
function expandExtensionServiceName(serviceName, subCategoryName) {
  if (serviceName.trim().toLowerCase() === 'extension') {
    return `${subCategoryName} Extension`
  }
  return serviceName
}

// ---------- parser ----------
function parseHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8')
  // Strip <thead> (column letter row A B C ...) so we only look at <tbody>
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
  if (!tbodyMatch) throw new Error('No <tbody> in ' + filePath)
  const body = tbodyMatch[1]
  // Split into <tr>...</tr> blocks
  const trBlocks = body.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []

  // Helper: extract <td> cells from a row (preserve order, ignore <th> row-headers)
  const cellsOf = (tr) => {
    // Drop the leading <th class="row-headers-background">
    const trBody = tr.replace(/<th[^>]*class="row-headers-background"[\s\S]*?<\/th>/, '')
    return Array.from(trBody.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map(m => m[1])
  }

  // Row 0 = header
  if (trBlocks.length < 2) return { headers: [], rows: [] }
  const headerCells = cellsOf(trBlocks[0])
  const headers = headerCells.map(c => normalizeHeader(c))

  // Rows 1..N — extract object {header: value-or-href}
  const rows = []
  for (let i = 1; i < trBlocks.length; i++) {
    const cells = cellsOf(trBlocks[i])
    const row = {}
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c]
      const raw = cells[c] ?? ''
      if (h === 'link') {
        row[h] = extractHref(raw) // empty if no <a href>
        row[h + '_text'] = clean(raw) // for diagnostics
      } else {
        row[h] = clean(raw)
      }
    }
    rows.push(row)
  }
  return { headers, rows }
}

// ---------- normalize one row to seed format ----------
const warnings = []

function buildSeedRow({ row, categoryOverride, categorySortOrder, fileName }) {
  // Category
  let categoryName = cleanupText(row.category_name || categoryOverride, 'category_name')
  if (!categoryName) categoryName = categoryOverride
  const catKey = categoryName.toLowerCase()
  const categorySlug = CATEGORY_SLUG_OVERRIDES[catKey] || toSlug(categoryName)

  // Sub-category — apply merges per category
  const rawSubName = cleanupText(row.sub_category_name, 'sub_category_name')
  if (!rawSubName) return null // skip rows with no sub-category
  const merges = SUB_CATEGORY_MERGES[categorySlug] || {}
  const subCategoryName = merges[rawSubName] || rawSubName
  if (subCategoryName !== rawSubName) {
    corrections.push({ context: 'sub_category_merge', from: rawSubName, to: subCategoryName })
  }
  const subCategorySlug = toSlug(subCategoryName)

  // Service — expand bare "Extension" using sub-category context
  let serviceName = cleanupText(row.service_name, 'service_name')
  if (!serviceName) return null
  const renamed = expandExtensionServiceName(serviceName, subCategoryName)
  if (renamed !== serviceName) {
    corrections.push({ context: 'service_rename', from: serviceName, to: renamed })
    serviceName = renamed
  }
  const serviceSlug = toSlug(serviceName)

  // Link / required docs
  let link = (row.link || '').trim()
  const linkText = (row.link_text || '').trim()
  if (!link && linkText && !/^https?:\/\//i.test(linkText)) {
    // Plain-text link cell with no href — flag it
    warnings.push({
      file: fileName,
      issue: 'link_missing_href',
      service: serviceName,
      sub_category: subCategoryName,
      cell_text: linkText,
    })
  } else if (link && !/^https?:\/\//i.test(link)) {
    warnings.push({
      file: fileName,
      issue: 'link_not_url',
      service: serviceName,
      sub_category: subCategoryName,
      value: link,
    })
    link = ''
  }

  return {
    category_name: categoryName,
    category_slug: categorySlug,
    category_tagline: cleanupText(row.category_tagline, 'category_tagline') || '',
    category_sort_order: categorySortOrder,
    sub_category_name: subCategoryName,
    sub_category_slug: subCategorySlug,
    sub_category_sort_order: 0, // assigned later
    service_name: serviceName,
    service_slug: serviceSlug,
    service_sort_order: 0,  // assigned later
    description: cleanupText(row.description, 'description') || '',
    target_client: cleanupText(row.target_client, 'target_client') || '',
    key_deliverables: cleanupText(row.key_deliverables, 'key_deliverables') || '',
    estimated_timeline: cleanupText(row.estimated_timeline, 'estimated_timeline') || '',
    real_time_work: cleanupText(row.real_time_work, 'real_time_work') || '',
    note: cleanupText(row.note, 'note') || '',
    price: cleanupText(row.price, 'price') || '',
    required_docs_url: link || '',
  }
}

// ---------- assemble ----------
const allRows = []
let fileIdx = 0
for (const fileName of FILE_ORDER) {
  const filePath = path.join(SRC_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    warnings.push({ file: fileName, issue: 'file_missing' })
    continue
  }
  // Use file name to infer canonical category (column data is often missing)
  const fileBase = fileName.replace(/\.html$/i, '')
  const inferredCategory =
    fileBase.toLowerCase().startsWith('visa') ? 'Visa & Immigration' :
    fileBase.toLowerCase().startsWith('legal') ? 'Legal & Contract Advisory' :
    fileBase.toLowerCase().startsWith('company') ? 'Company Set Up' :
    fileBase.toLowerCase().startsWith('hr') ? 'Human Resource (HR)' :
    fileBase.toLowerCase().startsWith('accounting') ? 'Accounting & TAX' :
    fileBase.toLowerCase().startsWith('insurance') ? 'Insurance' :
    fileBase

  const { rows } = parseHtmlFile(filePath)
  for (const row of rows) {
    const seedRow = buildSeedRow({
      row,
      categoryOverride: inferredCategory,
      categorySortOrder: fileIdx,
      fileName,
    })
    if (seedRow) allRows.push(seedRow)
  }
  fileIdx++
}

// Add Property Advisory as a coming-soon category placeholder. No services.
// Parser/UI will read `coming_soon: true` to render the "Launching soon" state.
allRows.push({
  category_name: 'Property Advisory',
  category_slug: 'property-advisory',
  category_tagline: 'Comprehensive property advisory services — launching soon.',
  category_sort_order: fileIdx,
  category_coming_soon: true,
  // No sub-category / service — handled specially by the parser
  sub_category_name: '',
  sub_category_slug: '',
  sub_category_sort_order: 0,
  service_name: '',
  service_slug: '',
  service_sort_order: 0,
  description: '',
  target_client: '',
  key_deliverables: '',
  estimated_timeline: '',
  real_time_work: '',
  note: '',
  price: '',
  required_docs_url: '',
})

// Assign sub_category_sort_order and service_sort_order based on first-seen order within category
const subOrderByCat = new Map() // cat_slug -> Map(sub_slug -> order)
const svcOrderBySub = new Map() // (cat_slug + '/' + sub_slug) -> next svc order
for (const r of allRows) {
  if (!subOrderByCat.has(r.category_slug)) subOrderByCat.set(r.category_slug, new Map())
  const subMap = subOrderByCat.get(r.category_slug)
  if (!subMap.has(r.sub_category_slug)) subMap.set(r.sub_category_slug, subMap.size)
  r.sub_category_sort_order = subMap.get(r.sub_category_slug)

  const subKey = r.category_slug + '/' + r.sub_category_slug
  const next = svcOrderBySub.get(subKey) ?? 0
  r.service_sort_order = next
  svcOrderBySub.set(subKey, next + 1)
}

// Stable category sort order from FILE_ORDER (already set above; Property Advisory last)

// ---------- summary ----------
const summary = {
  categories: [...new Set(allRows.map(r => `${r.category_slug} (${r.category_name})`))],
  category_count: new Set(allRows.map(r => r.category_slug)).size,
  sub_category_count: new Set(allRows.map(r => r.category_slug + '/' + r.sub_category_slug)).size,
  service_count: allRows.length,
  services_with_price: allRows.filter(r => r.price).length,
  services_with_docs_url: allRows.filter(r => r.required_docs_url).length,
  corrections_count: corrections.length,
  warnings_count: warnings.length,
}

const dryRun = process.argv.includes('--dry')
console.log('=== Parser summary ===')
console.log(JSON.stringify(summary, null, 2))
console.log('')
console.log('Categories found:')
for (const c of summary.categories) console.log('  - ' + c)
console.log('')
console.log('Sub-categories per category:')
const subByCatList = new Map()
for (const r of allRows) {
  const key = r.category_slug
  if (!subByCatList.has(key)) subByCatList.set(key, new Set())
  subByCatList.get(key).add(r.sub_category_name)
}
for (const [cat, subs] of subByCatList) {
  console.log('  ' + cat + ' (' + subs.size + '):')
  for (const s of subs) console.log('    - ' + s)
}
console.log('')
console.log('Cleanup corrections applied: ' + corrections.length)
if (corrections.length) {
  console.log('  (first 30 shown)')
  for (const c of corrections.slice(0, 30)) {
    console.log(`    [${c.context}] "${c.from}" → "${c.to}"`)
  }
}
console.log('')
console.log('Warnings: ' + warnings.length)
for (const w of warnings) {
  console.log('  - ' + JSON.stringify(w))
}

if (!dryRun) {
  fs.writeFileSync(OUT_SEED, JSON.stringify(allRows, null, 2))
  fs.writeFileSync(OUT_REPORT, JSON.stringify({ summary, corrections, warnings }, null, 2))
  console.log('')
  console.log('Wrote ' + OUT_SEED)
  console.log('Wrote ' + OUT_REPORT)
} else {
  console.log('')
  console.log('[--dry] Did not write files.')
}
