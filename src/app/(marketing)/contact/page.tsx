import type { Metadata } from 'next'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Ilot for a free consultation.',
}

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Get in touch</h1>
        <p className="text-muted text-lg mb-8">
          Tell us what you need. We&apos;ll respond within one business day and guide you from there.
        </p>
        <WhatsAppCTA size="lg" label="Start on WhatsApp" className="mb-8 block w-fit" />
        <p className="text-muted text-sm">
          Prefer email? Reach us at{' '}
          <a href="mailto:hello@ilotlegal.com" className="text-accent underline">
            hello@ilotlegal.com
          </a>
        </p>
      </div>
    </div>
  )
}
