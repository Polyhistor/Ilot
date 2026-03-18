'use client'

import { useEffect, useState } from 'react'

interface SidebarItem {
  id: string
  slug: string
  name: string
}

interface CategorySidebarProps {
  items: SidebarItem[]
}

export function CategorySidebar({ items }: CategorySidebarProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="hidden md:block sticky top-24 self-start">
      <ul className="space-y-1">
        {items.map(({ id, name }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm px-3 py-2 rounded-lg transition-all ${
                activeId === id
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
