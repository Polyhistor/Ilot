'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface NavService {
  slug: string
  name: string
}

interface NavSubCategory {
  slug: string
  name: string
  services: NavService[]
}

interface NavCategory {
  slug: string
  name: string
  sub_categories: NavSubCategory[]
}

interface ServicesDropdownProps {
  categories: NavCategory[]
}

export function ServicesDropdown({ categories }: ServicesDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  function close() {
    setOpen(false)
    setActiveCat(null)
    setActiveSub(null)
  }

  function handleRootEnter() {
    clearTimer()
    setOpen(true)
  }

  function handleRootLeave() {
    clearTimer()
    timeoutRef.current = setTimeout(close, 150)
  }

  function handleCatEnter(slug: string) {
    clearTimer()
    setActiveCat(slug)
    setActiveSub(null)
  }

  function handleSubEnter(slug: string) {
    clearTimer()
    setActiveSub(slug)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const activeCategory = categories.find((c) => c.slug === activeCat)
  const activeSubCategory = activeCategory?.sub_categories.find((sc) => sc.slug === activeSub)

  const showLevel2 = activeCategory && activeCategory.sub_categories.length > 0
  const showLevel3 = showLevel2 && activeSubCategory && activeSubCategory.services.length > 0

  return (
    <div
      className="relative"
      onMouseEnter={handleRootEnter}
      onMouseLeave={handleRootLeave}
    >
      {/* Trigger */}
      <span className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground transition-colors cursor-default select-none">
        Services
        <ChevronDown className="w-3.5 h-3.5" />
      </span>

      {/* Unified dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 pt-3">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xl flex overflow-hidden">

            {/* Column 1 — Categories */}
            <div className="p-2 w-56 shrink-0">
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  onMouseEnter={() => handleCatEnter(cat.slug)}
                >
                  <Link
                    href={`/${cat.slug}`}
                    onClick={close}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors ${
                      activeCat === cat.slug
                        ? 'bg-[#F4F4F0] text-foreground font-medium'
                        : 'text-muted hover:text-foreground hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.sub_categories.length > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </Link>
                </div>
              ))}
            </div>

            {/* Column 2 — Sub-categories */}
            {showLevel2 && (
              <div className="border-l border-gray-100 p-2 w-60 shrink-0 max-h-[70vh] overflow-y-auto scrollbar-thin">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {activeCategory.name}
                </p>
                {activeCategory.sub_categories.map((sc) => (
                  <div
                    key={sc.slug}
                    onMouseEnter={() => handleSubEnter(sc.slug)}
                  >
                    <Link
                      href={`/${activeCategory.slug}#${sc.slug}`}
                      onClick={close}
                      className={`flex items-center justify-between px-4 py-2 text-sm rounded-xl transition-colors ${
                        activeSub === sc.slug
                          ? 'bg-[#F4F4F0] text-foreground font-medium'
                          : 'text-muted hover:text-foreground hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{sc.name}</span>
                      {sc.services.length > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Column 3 — Services */}
            {showLevel3 && activeCategory && (
              <div className="border-l border-gray-100 p-2 w-64 shrink-0 max-h-[70vh] overflow-y-auto scrollbar-thin">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {activeSubCategory.name}
                </p>
                {activeSubCategory.services.map((svc) => (
                  <Link
                    key={svc.slug}
                    href={`/${activeCategory.slug}/${svc.slug}`}
                    onClick={close}
                    className="block px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    {svc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
