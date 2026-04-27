import type { SeedSqlCategory } from './types'

/**
 * Minimal SQL VALUES-tuple extractor for the specific format used in seed.sql.
 * Only handles single-quoted string literals (with '' as escaped quote) and
 * unquoted numeric literals. Sufficient for our hand-written seed file —
 * not a general SQL parser.
 *
 * Categories only. Sub-categories come from the client data file.
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

function findCategoriesBlock(sql: string): string | null {
  // Stop at either `;` or `on conflict` — whichever comes first — so we don't
  // slurp the `(slug)` from the `on conflict (slug) do nothing` clause.
  const re = new RegExp(
    `insert\\s+into\\s+(?:public\\.)?categories\\s*\\([^)]*\\)\\s*values\\s*([\\s\\S]*?)(?:;|on\\s+conflict)`,
    'i'
  )
  const m = sql.match(re)
  return m ? m[1] : null
}

export function parseSeedSqlCategories(sql: string): SeedSqlCategory[] {
  const catBlock = findCategoriesBlock(sql)
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

  return categories
}
