import { AnimatedSection } from '@/components/ui/AnimatedSection'

const STEPS = [
  { n: '01', title: 'Selection', desc: 'Choose your service or describe your situation.' },
  { n: '02', title: 'One-Touch Initiation', desc: 'A single WhatsApp message connects you with your expert.' },
  { n: '03', title: 'Expert Handling', desc: 'Our team manages every document, deadline, and authority.' },
  { n: '04', title: 'Fulfillment', desc: 'Receive your permit, deed, or outcome. Clear and complete.' },
]

export function ProcessSteps() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <AnimatedSection className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            A clean path in four steps.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc }, i) => (
            <AnimatedSection key={n} delay={i * 0.1} className="relative">
              <div className="text-7xl font-bold text-surface leading-none mb-4">{n}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 text-accent text-2xl">→</div>
              )}
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
