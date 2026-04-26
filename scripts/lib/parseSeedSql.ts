import type { SeedSqlCategory, SeedSqlSubCategory } from './types'

/**
 * Minimal SQL VALUES-tuple extractor for the specific format used in seed.sql.
 * Only handles single-quoted string literals (with '' as escaped quote) and
 * unquoted numeric literals. Sufficient for our hand-written seed file —
 * not a general SQL parser.
 */
function extractValuesTuples(insertBlock: string): string[][] {
  const tuples: string[][] = []
  // Match each parenthesised tuple in the VALUES list.
  const tupleRegex = /\(((?:'(?:[^']|'')*'|[^()'])*)\)/g
  let match: RegExpExecArray | null
  while ((match = tupleRegex.exec(insertBlock)) !== null) {
    const inner = match[1]
    const fields: string[] = []
    let i = 0
    while (i < inner.length) {
      // skip whitespace and commas
      while (i < inner.length && /[\s,]/.test(inner[i])) i++
      if (i >= inner.length) break
      if (inner[i] === "'") {
        // string literal
        let s = ''
        i++ // opening quote
        while (i < inner.length) {
          if (inner[i] === "'" && inner[i + 1] === "'") {
            s += "'"
            i += 2
          } else if (inner[i] === "'") {
            i++
            break
          } else {
            s += inner[i]
            i++
          }
        }
        fields.push(s)
      } else {
        // unquoted token (number)
        let s = ''
        while (i < inner.length && !/[\s,]/.test(inner[i])) {
          s += inner[i]
          i++
        }
        fields.push(s)
      }
    }
    tuples.push(fields)
  }
  return tuples
}

function findInsertBlock(sql: string, tableName: string): string | null {
  const re = new RegExp(
    `INSERT\\s+INTO\\s+(?:public\\.)?${tableName}\\s*\\([^)]*\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    'i'
  )
  const m = sql.match(re)
  return m ? m[1] : null
}

export function parseSeedSqlCategories(sql: string): SeedSqlCategory[] {
  const catBlock = findInsertBlock(sql, 'categories')
  if (!catBlock) return []
  const catTuples = extractValuesTuples(catBlock)

  const categories: SeedSqlCategory[] = catTuples.map((t) => ({
    slug: t[0],
    name: t[1],
    tagline: t[2] ?? null,
    iconName: t[3] ?? null,
    sortOrder: Number(t[4] ?? 0),
    subCategorySlugs: [],
  }))

  const subBlock = findInsertBlock(sql, 'sub_categories')
  if (subBlock) {
    // Sub-category rows have the shape:
    //   ((SELECT id FROM categories WHERE slug='X'), 'sub-slug', 'Name', N)
    // The nested SELECT confuses the generic tuple extractor, so we use a
    // targeted regex that captures the parent slug + the four trailing fields.
    const rowRe =
      /WHERE\s+slug\s*=\s*'([^']+)'\s*\)\s*,\s*'([^']+)'\s*,\s*'((?:[^']|'')*)'\s*,\s*(\d+)/g
    let m: RegExpExecArray | null
    while ((m = rowRe.exec(subBlock)) !== null) {
      const parentSlug = m[1]
      const sub: SeedSqlSubCategory = {
        slug: m[2],
        name: m[3].replace(/''/g, "'"),
        sortOrder: Number(m[4]),
      }
      const parent = categories.find((c) => c.slug === parentSlug)
      if (parent) parent.subCategorySlugs.push(sub)
    }
  }

  return categories
}
