import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { Zap, Shield, Eye, Clock, Lock } from 'lucide-react'

const ITEMS = [
  {
    icon: Zap,
    title: 'Frictionless Access',
    description: 'One intake, one team, one process. No chasing multiple agencies.',
    wide: true,
  },
  {
    icon: Shield,
    title: 'Regulatory Authority',
    description: 'Deep ties with Indonesian government bodies and notaries.',
    wide: false,
  },
  {
    icon: Eye,
    title: 'Absolute Transparency',
    description: 'You always know where your case stands. No surprises.',
    wide: false,
  },
  {
    icon: Clock,
    title: 'Speed & Precision',
    description: 'Optimised workflows that move at the pace of business.',
    wide: false,
  },
  {
    icon: Lock,
    title: 'Full Confidentiality',
    description: 'Your business information stays within Ilot, always.',
    wide: false,
  },
]

export function WhyUsBento() {
  return (
    <section className="section-padding bg-surface">
      <div className="container-site">
        <AnimatedSection className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Why Ilot</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Built differently, by design.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {/* Wide cell */}
          {(() => { const WideIcon = ITEMS[0].icon; return (
          <AnimatedSection
            delay={0.1}
            className="md:col-span-2 bg-foreground text-white rounded-card p-8 flex flex-col justify-end"
          >
            <WideIcon className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-2">{ITEMS[0].title}</h3>
            <p className="text-gray-400 text-sm">{ITEMS[0].description}</p>
          </AnimatedSection>
          )})()}

          {/* Single cell */}
          {(() => { const SingleIcon = ITEMS[1].icon; return (
          <AnimatedSection
            delay={0.15}
            className="bg-background rounded-card p-8 flex flex-col justify-end border border-surface"
          >
            <SingleIcon className="w-7 h-7 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-1">{ITEMS[1].title}</h3>
            <p className="text-muted text-sm">{ITEMS[1].description}</p>
          </AnimatedSection>
          )})()}

          {/* Row of 3 */}
          {ITEMS.slice(2).map((item, i) => (
            <AnimatedSection
              key={item.title}
              delay={0.2 + i * 0.05}
              className="bg-background rounded-card p-8 flex flex-col justify-end border border-surface"
            >
              <item.icon className="w-7 h-7 text-accent mb-3" />
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-muted text-sm">{item.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
