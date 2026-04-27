import Link from 'next/link'
import { AlertTriangle, Info, AlertOctagon, ArrowRight } from 'lucide-react'
import type { UpdateRef } from '@/lib/db/types'

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    pill: 'bg-blue-50 border-blue-200 text-blue-700',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    pill: 'bg-amber-50 border-amber-200 text-amber-700',
    label: 'Warning',
  },
  critical: {
    icon: AlertOctagon,
    pill: 'bg-red-50 border-red-200 text-red-700',
    label: 'Critical',
  },
} as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  updates: UpdateRef[]
}

export function UpdatesBanner({ updates }: Props) {
  if (updates.length === 0) return null

  return (
    <section className="container-site py-8">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-foreground/10 bg-surface overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-foreground/10 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-foreground">Regulatory Updates</h2>
          </div>

          {/* Update rows */}
          <ul className="divide-y divide-foreground/5">
            {updates.map((u) => {
              const cfg = SEVERITY_CONFIG[u.severity]
              const Icon = cfg.icon
              return (
                <li key={u.slug}>
                  <Link
                    href={`/updates/${u.slug}`}
                    className="group flex items-start justify-between gap-4 px-6 py-4 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`shrink-0 mt-0.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.pill}`}
                      >
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        {cfg.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                          {u.title}
                        </p>
                        {u.summary && (
                          <p className="text-xs text-muted mt-0.5 line-clamp-1">{u.summary}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <time className="text-xs text-muted">{formatDate(u.published_at)}</time>
                      <ArrowRight
                        className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
                        strokeWidth={1.75}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
