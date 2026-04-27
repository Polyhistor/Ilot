import Link from 'next/link'
import { AlertTriangle, Info, AlertOctagon, ArrowRight } from 'lucide-react'
import type { Update } from '@/lib/db/types'

const SEVERITY_CONFIG = {
  info: {
    label: 'Info',
    icon: Info,
    pill: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    pill: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
  },
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    pill: 'bg-red-100 text-red-700',
    border: 'border-red-200',
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
  update: Update
}

export function UpdateCard({ update }: Props) {
  const cfg = SEVERITY_CONFIG[update.severity]
  const Icon = cfg.icon

  return (
    <Link
      href={`/updates/${update.slug}`}
      className={`group flex flex-col gap-4 p-6 rounded-card bg-surface border ${cfg.border} hover:shadow-md transition-shadow duration-200`}
    >
      {/* Severity pill + date */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.pill}`}
        >
          <Icon className="w-3 h-3" strokeWidth={2} />
          {cfg.label}
        </span>
        <time className="text-xs text-muted" dateTime={update.published_at}>
          {formatDate(update.published_at)}
        </time>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground text-lg leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {update.title}
      </h3>

      {/* Summary */}
      {update.summary && (
        <p className="text-sm text-muted line-clamp-3 flex-1">{update.summary}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-foreground/5 mt-auto">
        {update.effective_date ? (
          <p className="text-xs text-muted">
            Effective:{' '}
            <span className="font-medium">{formatDate(update.effective_date)}</span>
          </p>
        ) : (
          <span />
        )}
        <ArrowRight
          className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  )
}
