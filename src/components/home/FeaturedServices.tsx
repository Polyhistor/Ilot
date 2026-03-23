'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import { getCategoryColor } from '@/lib/category-colors'

interface FeaturedService {
  slug: string
  name: string
  description: string | null
  target_client: string | null
  estimated_timeline: string | null
  whatsapp_message: string | null
  categorySlug: string
  categoryName: string
}

interface ServiceGroup {
  id: string
  title: string
  description: string
  categorySlug: string
  services: FeaturedService[]
}

interface FeaturedServicesProps {
  groups: ServiceGroup[]
}

const INITIAL_VISIBLE = 4

function ServiceGroupSection({ group }: { group: ServiceGroup }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getCategoryColor(group.categorySlug)
  const hasMore = group.services.length > INITIAL_VISIBLE
  const visible = expanded ? group.services : group.services.slice(0, INITIAL_VISIBLE)

  return (
    <div>
      {/* Group header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: colors.accent }} />
            <h3 className="text-xl font-bold text-[#0B0B1A] tracking-tight">{group.title}</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-2xl pl-4">{group.description}</p>
        </div>
        <Link
          href={`/${group.categorySlug}`}
          className="text-sm font-medium flex items-center gap-1 shrink-0 transition-colors hover:opacity-80 pl-4 sm:pl-0"
          style={{ color: colors.mid }}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Service cards grid — same markup as ServiceCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((service) => (
          <div key={service.slug} className="bg-background border border-surface rounded-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {service.target_client && (
              <span className="inline-flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm self-start mb-4">
                {service.target_client}
              </span>
            )}
            <Link
              href={`/${service.categorySlug}/${service.slug}`}
              className="text-lg font-bold text-foreground hover:text-accent transition-colors leading-snug mb-3"
            >
              {service.name}
            </Link>
            {service.description && (
              <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                {service.description}
              </p>
            )}
            <div className="mt-auto pt-4 border-t border-surface flex items-center justify-between">
              {service.estimated_timeline && (
                <p className="text-xs text-muted">
                  <span className="font-semibold text-foreground">Timeline:</span>{' '}
                  {service.estimated_timeline}
                </p>
              )}
              <WhatsAppCTA
                serviceName={service.name}
                customMessage={service.whatsapp_message ?? undefined}
                variant="ghost"
                size="sm"
                label="Enquire"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 mx-auto flex items-center gap-1.5 text-sm font-medium text-muted hover:text-[#0B0B1A] transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show {group.services.length - INITIAL_VISIBLE} more services <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  )
}

export function FeaturedServices({ groups }: FeaturedServicesProps) {
  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm mb-4">
            Most requested
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B0B1A] tracking-tight">
            Popular Services
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Explore the services our clients request most — from visa applications to company setup and compliance.
          </p>
        </div>

        <div className="space-y-14">
          {groups.map((group) => (
            <ServiceGroupSection key={group.id} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}
