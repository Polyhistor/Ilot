import { ServiceCard } from './ServiceCard'
import type { Service } from '@/lib/db/types'

interface RelatedServicesProps {
  services: Service[]
  categorySlug: string
}

export function RelatedServices({ services, categorySlug }: RelatedServicesProps) {
  if (services.length === 0) return null

  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#0B0B1A] mb-8">Related Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} categorySlug={categorySlug} />
          ))}
        </div>
      </div>
    </section>
  )
}
