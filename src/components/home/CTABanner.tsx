import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="bg-accent py-20 px-6 md:px-12">
      <div className="container-site text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Ready to move forward?
        </h2>
        <p className="text-foreground/70 text-lg mb-10 max-w-xl mx-auto">
          Start with a free consultation. We&apos;ll tell you exactly what you need and how long it takes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WhatsAppCTA
            size="lg"
            label="Get your free quote"
            className="bg-foreground text-white hover:bg-foreground/90 border-none"
          />
          <Link
            href="/contact"
            className="px-8 py-4 rounded-full border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all text-lg"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
