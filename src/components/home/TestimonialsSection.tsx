import { AnimatedSection } from '@/components/ui/AnimatedSection'

const TESTIMONIALS = [
  {
    quote: 'Ilot handled our entire PMA setup while we focused on building the business. Seamless.',
    name: 'James T.',
    role: 'CEO, Singapore-based startup',
    stars: 5,
  },
  {
    quote: 'Got my Investor KITAS in 8 weeks with zero stress. The team knew exactly what to do at every step.',
    name: 'Marie L.',
    role: 'French Investor, Bali',
    stars: 5,
  },
  {
    quote: 'The land due diligence report they provided saved me from a very costly mistake. Worth every cent.',
    name: 'David K.',
    role: 'Property Buyer, Jakarta',
    stars: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-surface">
      <div className="container-site">
        <AnimatedSection className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            What our clients say.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, stars }, i) => (
            <AnimatedSection
              key={name}
              delay={i * 0.1}
              className="bg-background rounded-card p-8 shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <span key={j} className="text-accent text-lg">★</span>
                ))}
              </div>
              <p className="text-foreground text-base leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
              <div>
                <div className="font-bold text-foreground text-sm">{name}</div>
                <div className="text-muted text-xs">{role}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
