import Link from 'next/link'
import type { Service } from '@/lib/db/types'

interface RelatedServicesProps {
  services: Service[]
  categorySlug: string
}

export function RelatedServices({ services, categorySlug }: RelatedServicesProps) {
  if (services.length === 0) return null

  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <h2 className="text-2xl font-bold mb-6">Related Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/${categorySlug}/${s.slug}`}
              className="block bg-surface rounded-card p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-foreground text-sm leading-snug mb-2">{s.name}</p>
              {s.estimated_timeline && (
                <p className="text-xs text-muted">{s.estimated_timeline}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
