import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cookies Policy' }

export default function CookiesPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Cookies Policy</h1>
        <p className="text-muted mb-6">Last updated: March 2026</p>
        <p className="text-muted italic">Full cookies policy content to be provided by client.</p>
      </div>
    </div>
  )
}
