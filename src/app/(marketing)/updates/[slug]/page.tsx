import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Info, AlertOctagon, ExternalLink, ArrowRight } from 'lucide-react'
import { getUpdateBySlug, getAllUpdateSlugs } from '@/lib/db/updates'
import { PostBody } from '@/components/blog/PostBody'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

const SEVERITY_CONFIG = {
  info: { label: 'Info', icon: Info, pill: 'bg-blue-100 text-blue-700' },
  warning: { label: 'Warning', icon: AlertTriangle, pill: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Critical', icon: AlertOctagon, pill: 'bg-red-100 text-red-700' },
} as const

export async function generateStaticParams() {
  const slugs = await getAllUpdateSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const update = await getUpdateBySlug(slug)
  if (!update) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'

  return {
    title: update.title,
    description: update.summary ?? undefined,
    openGraph: {
      title: update.title,
      description: update.summary ?? undefined,
      url: `${siteUrl}/updates/${update.slug}`,
      type: 'article',
      publishedTime: update.published_at,
    },
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function UpdatePage({ params }: Props) {
  const { slug } = await params
  const update = await getUpdateBySlug(slug)
  if (!update) notFound()

  const cfg = SEVERITY_CONFIG[update.severity]
  const Icon = cfg.icon

  return (
    <main className="min-h-screen bg-background">
      <div className="container-site section-padding">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/updates"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← All regulatory updates
            </Link>
          </div>

          {/* Severity pill */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.pill}`}
            >
              <Icon className="w-3 h-3" strokeWidth={2} />
              {cfg.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {update.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted mb-8 pb-8 border-b border-foreground/10">
            <time dateTime={update.published_at}>{formatDate(update.published_at)}</time>
            {update.effective_date && (
              <>
                <span>·</span>
                <span>Effective {formatDate(update.effective_date)}</span>
              </>
            )}
            {update.source_url && (
              <>
                <span>·</span>
                <a
                  href={update.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Official source <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>

          {/* Body or summary fallback */}
          {update.body_en && update.body_en.length > 0 ? (
            <PostBody blocks={update.body_en} />
          ) : update.summary ? (
            <p className="text-muted text-lg leading-relaxed">{update.summary}</p>
          ) : null}

          {/* Affected services */}
          {update.affected_services.length > 0 && (
            <div className="mt-12 pt-8 border-t border-foreground/10">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Affected Services
              </h2>
              <ul className="flex flex-col gap-3">
                {update.affected_services.map((svc) => (
                  <li key={svc.slug}>
                    <Link
                      href={`/${svc.category_slug}/${svc.slug}`}
                      className="group flex items-center justify-between gap-4 p-4 rounded-xl bg-surface hover:bg-accent/5 transition-colors"
                    >
                      <span className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">
                        {svc.name}
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-muted shrink-0 group-hover:text-accent transition-colors"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Back link — bottom */}
          <div className="mt-16 pt-8 border-t border-foreground/10">
            <Link
              href="/updates"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Back to all regulatory updates
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
