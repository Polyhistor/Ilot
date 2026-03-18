import { AnimatedSection } from '@/components/ui/AnimatedSection'

const STATS = [
  { value: '10+', label: 'Years of expertise' },
  { value: '110+', label: 'Clients served' },
  { value: '20+', label: 'Countries covered' },
]

export function AboutSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
              We replace the complexity of Indonesia&apos;s legal landscape with clarity.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <p className="text-muted text-lg leading-relaxed mb-10">
              Ilot was founded to give global investors, expatriates, and foreign businesses a single point of truth for navigating Indonesia. No more fragmented agencies, no more uncertainty — just expert guidance, from registration to operation.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-4xl font-bold text-accent mb-1">{value}</div>
                  <div className="text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
