import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms & Conditions' }

export default function LegalPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-muted mb-6">Last updated: March 2026</p>
        <p className="text-muted italic">Full terms content to be provided by client.</p>
      </div>
    </div>
  )
}
