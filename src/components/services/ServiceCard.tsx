import Link from 'next/link'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import type { Service } from '@/lib/db/types'

interface ServiceCardProps {
  service: Service
  categorySlug: string
}

export function ServiceCard({ service, categorySlug }: ServiceCardProps) {
  return (
    <div className="bg-background border border-surface rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <Link
          href={`/${categorySlug}/${service.slug}`}
          className="text-lg font-bold text-foreground hover:text-accent transition-colors leading-snug"
        >
          {service.name}
        </Link>
        {service.target_client && (
          <span className="text-xs bg-surface text-muted px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            {service.target_client}
          </span>
        )}
      </div>

      {/* Timeline */}
      {service.estimated_timeline && (
        <p className="text-sm text-muted mb-4">
          <span className="font-semibold text-foreground">Timeline:</span>{' '}
          {service.estimated_timeline}
        </p>
      )}

      {/* CTA */}
      <WhatsAppCTA
        serviceName={service.name}
        customMessage={service.whatsapp_message ?? undefined}
        variant="ghost"
        size="sm"
        label="Enquire"
      />
    </div>
  )
}
