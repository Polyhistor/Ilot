'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import { getCategoryColor } from '@/lib/category-colors'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'

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

/* ─── Compact swipeable card for mobile ─── */
function MobileServiceCard({ service, colors }: { service: FeaturedService; colors: { mid: string } }) {
  return (
    <Link
      href={`/${service.categorySlug}/${service.slug}`}
      className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col h-full"
    >
      {service.target_client && (
        <span className="block bg-white border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-500 self-start mb-2 truncate max-w-full">
          {service.target_client}
        </span>
      )}
      <h4 className="text-[14px] font-semibold text-foreground leading-snug mb-1.5 line-clamp-2">
        {service.name}
      </h4>
      {service.estimated_timeline && (
        <div className="text-[11px] mt-auto pt-2">
          <p className="font-semibold text-foreground">Timeline</p>
          <p className="text-muted truncate">{service.estimated_timeline}</p>
        </div>
      )}
      <span className="text-[11px] font-medium mt-2" style={{ color: colors.mid }}>
        Learn more →
      </span>
    </Link>
  )
}

/* ─── Desktop card (same as ServiceCard) ─── */
function DesktopServiceCard({ service }: { service: FeaturedService }) {
  return (
    <div className="bg-background border border-surface rounded-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
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
  )
}

function ServiceGroupSection({ group }: { group: ServiceGroup }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getCategoryColor(group.categorySlug)
  const hasMore = group.services.length > INITIAL_VISIBLE
  const visible = expanded ? group.services : group.services.slice(0, INITIAL_VISIBLE)

  return (
    <div>
      {/* Group header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 md:mb-2">
            <div className="w-1 h-5 md:h-6 rounded-full" style={{ backgroundColor: colors.accent }} />
            <h3 className="text-base md:text-xl font-bold text-foreground tracking-tight">{group.title}</h3>
          </div>
          <p className="text-xs md:text-sm text-muted leading-relaxed max-w-2xl pl-4">{group.description}</p>
        </div>
        <Link
          href={`/${group.categorySlug}`}
          className="text-xs md:text-sm font-medium flex items-center gap-1 shrink-0 transition-colors hover:opacity-80 pl-4 sm:pl-0"
          style={{ color: colors.mid }}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile: 2-column grid */}
      <RevealGroup className="grid grid-cols-2 gap-3 pb-4 md:hidden" stagger={0.07}>
        {group.services.map((service) => (
          <RevealItem key={service.slug} className="h-full">
            <MobileServiceCard service={service} colors={colors} />
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Desktop: grid with show more */}
      <RevealGroup className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
        {visible.map((service) => (
          <RevealItem key={service.slug} className="h-full">
            <DesktopServiceCard service={service} />
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Show more / less — desktop only */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 mx-auto hidden md:flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
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
    <section className="py-12 md:py-20 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-8 md:mb-14">
          <RevealItem>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
              Popular Services
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-muted text-sm md:text-base mt-3 max-w-xl mx-auto hidden md:block">
              Explore the services our clients request most, from visa applications to company setup and compliance.
            </p>
          </RevealItem>
        </RevealGroup>

        <div className="space-y-8 md:space-y-14 divide-y divide-gray-200 md:divide-y-0 [&>*]:pt-8 md:[&>*]:pt-0 [&>*:first-child]:pt-0">
          {groups.map((group) => (
            <ServiceGroupSection key={group.id} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}
