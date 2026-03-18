import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import type { ServiceWithCategory } from '@/lib/db/types'

interface ServiceDetailProps {
  service: ServiceWithCategory
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <article>
      {/* Hero */}
      <div className="bg-foreground text-white section-padding">
        <div className="container-site">
          {/* Breadcrumb — Home > Category > Sub-Category > Service Name */}
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
            <a href="/" className="hover:text-white">Home</a>
            <span>›</span>
            <a href={`/${service.category.slug}`} className="hover:text-white">
              {service.category.name}
            </a>
            {service.sub_category && (
              <>
                <span>›</span>
                <a
                  href={`/${service.category.slug}#${service.sub_category.slug}`}
                  className="hover:text-white"
                >
                  {service.sub_category.name}
                </a>
              </>
            )}
            <span>›</span>
            <span className="text-gray-200">{service.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 max-w-3xl">
            {service.name}
          </h1>

          <WhatsAppCTA
            serviceName={service.name}
            customMessage={service.whatsapp_message ?? undefined}
            size="lg"
            label="Start on WhatsApp"
            className="bg-accent text-foreground hover:bg-yellow-400"
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="section-padding bg-surface">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {service.target_client && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Who it&apos;s for
                </p>
                <p className="font-semibold text-foreground">{service.target_client}</p>
              </div>
            )}
            {service.estimated_timeline && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Estimated timeline
                </p>
                <p className="font-semibold text-foreground">{service.estimated_timeline}</p>
              </div>
            )}
            {service.key_deliverables && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  What you get
                </p>
                <p className="font-semibold text-foreground">{service.key_deliverables}</p>
              </div>
            )}
          </div>

          {service.description && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">About this service</h2>
              <p className="text-muted leading-relaxed">{service.description}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
