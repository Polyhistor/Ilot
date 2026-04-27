'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface FilterCategory {
  slug: string
  name: string
  accent: string | null
}

interface Props {
  categories: FilterCategory[]
  active: string | null
}

export function CategoryFilter({ categories, active }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (slug) {
        params.set('category', slug)
      } else {
        params.delete('category')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setFilter(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !active
            ? 'bg-foreground text-background'
            : 'bg-surface text-muted hover:bg-foreground/10'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => setFilter(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat.slug
              ? 'text-white'
              : 'bg-surface text-muted hover:bg-foreground/10'
          }`}
          style={active === cat.slug ? { backgroundColor: cat.accent ?? '#0B0B1A' } : {}}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
