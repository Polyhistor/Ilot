'use client'

import { useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

interface Props {
  title: string
  url: string
}

export function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Native share sheet on mobile
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // User cancelled or error — fall through to clipboard
      }
    }

    // Desktop fallback: copy link
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last resort: prompt
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share article"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/5 border border-foreground/10"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" strokeWidth={2} />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" strokeWidth={1.75} />
          <span>Share</span>
        </>
      )}
    </button>
  )
}
