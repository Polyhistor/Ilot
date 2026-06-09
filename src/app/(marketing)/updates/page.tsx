import type { Metadata } from 'next'
import { getUpdates } from '@/lib/db/updates'
import { UpdateCard } from '@/components/updates/UpdateCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Regulatory Updates: Indonesia Business & Visa Law',
  description:
    'Stay current with the latest regulatory changes affecting visas, company setup, and business compliance in Indonesia.',
}

export default async function UpdatesPage() {
  const updates = await getUpdates()

  return (
    <main className="min-h-screen bg-background">
      <div className="container-site section-padding">

        {/* Page header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-6">
            <span>Regulatory Updates</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What&apos;s changing in Indonesia
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            The latest regulatory changes affecting visas, company setup, and business
            compliance, tracked and explained by the Ilot team.
          </p>
        </div>

        {/* Updates grid */}
        {updates.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {updates.map((update) => (
              <UpdateCard key={update.slug} update={update} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-muted">
            No regulatory updates yet. Check back soon.
          </div>
        )}
      </div>
    </main>
  )
}
