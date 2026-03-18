'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  MotionValue,
} from 'framer-motion'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { Star } from 'lucide-react'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

interface HeroCard {
  slug: string
  name: string
  icon: string
  imageUrl?: string
  colorAccent?: string
}

interface HeroCircleProps {
  cards: HeroCard[]
}

// 7 evenly spaced angles starting at top (-90°) going clockwise
const ANGLES = Array.from({ length: 7 }, (_, i) => -90 + (360 / 7) * i)
const RADIUS_VW = 26 // circle radius in vw units

function getCirclePosition(angleIndex: number) {
  const angleDeg = ANGLES[angleIndex]
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: Math.cos(angleRad) * RADIUS_VW,
    y: Math.sin(angleRad) * RADIUS_VW,
    rotate: angleDeg + 90, // face outward from center
  }
}

const SPRING_CONFIG = { stiffness: 80, damping: 20, mass: 0.8 }

export function HeroCircle({ cards }: HeroCircleProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Text fades out 30%→60% — fully visible until user starts scrolling meaningfully
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0])
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [0, -40])

  // Center label fades in 85%→100%
  const centerOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1])
  const centerScale = useTransform(scrollYProgress, [0.85, 1], [0.8, 1])

  // isAnimating: true when scroll is between 30% and 95% (disables card hover)
  const isAnimating = useTransform(scrollYProgress, (v) => v > 0.28 && v < 0.97)

  return (
    <div ref={containerRef} style={{ height: '300vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-background flex items-center justify-center">

        {/* Initial headline */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-none mb-6">
            Clear Legal Support.<br />Confident Decisions.
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
            Elite visa, legal, and corporate solutions for global investors in Indonesia — handled end-to-end.
          </p>
          <div className="flex items-center gap-4">
            <WhatsAppCTA size="lg" label="Get your free quote" />
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all text-lg"
            >
              Learn more
            </Link>
          </div>
        </motion.div>

        {/* Center reveal */}
        <motion.div
          style={{ opacity: centerOpacity, scale: centerScale }}
          className="absolute z-10 text-center pointer-events-none select-none"
        >
          <p className="text-muted text-sm uppercase tracking-widest mb-2">One platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need<br />to grow
          </h2>
        </motion.div>

        {/* 7 service cards */}
        {cards.map((card, i) => (
          <HeroCard
            key={card.slug}
            card={card}
            index={i}
            scrollYProgress={scrollYProgress}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  )
}

function HeroCard({
  card,
  index,
  scrollYProgress,
  isAnimating,
}: {
  card: HeroCard
  index: number
  scrollYProgress: MotionValue<number>
  isAnimating: MotionValue<boolean>
}) {
  const target = getCirclePosition(index)

  // Scene 1 start: cards in a horizontal strip at the bottom edge of the viewport.
  // All values are plain numbers (vw units) — required by useSpring.
  // startY = 45vw places cards below the center on typical 16:9 screens (~bottom edge).
  const startX = (index - 3) * 13  // vw, numeric
  const startY = 45                 // vw, places cards at bottom edge on 16:9

  const rawX = useTransform(scrollYProgress, [0.3, 0.95], [startX, target.x])
  const rawY = useTransform(scrollYProgress, [0.3, 0.95], [startY, target.y])
  const rawRotate = useTransform(scrollYProgress, [0.3, 0.95], [0, target.rotate])

  // Spring wrapping — only works with numeric MotionValues
  const x = useSpring(rawX, SPRING_CONFIG)
  const y = useSpring(rawY, SPRING_CONFIG)
  const rotate = useSpring(rawRotate, SPRING_CONFIG)

  // Sync isAnimating MotionValue → React state so we can conditionally set whileHover.
  // MotionValue cannot be passed to whileHover directly — it must be a plain object or undefined.
  const [animating, setAnimating] = useState(false)
  useMotionValueEvent(isAnimating, 'change', setAnimating)

  // Resolve icon component from Lucide — fall back to Star
  const IconComponent =
    (LucideIcons as Record<string, any>)[card.icon] ?? Star

  return (
    <motion.div
      style={{ x, y, rotate, position: 'absolute' }}
    >
      <motion.div
        whileHover={animating ? undefined : { scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/${card.slug}`}
          className="block w-[11vw] min-w-[130px] max-w-[180px] aspect-square rounded-card shadow-2xl overflow-hidden relative group"
        >
          {/* Background photo or gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: card.imageUrl
                ? `url(${card.imageUrl}) center/cover`
                : `linear-gradient(135deg, ${card.colorAccent ?? '#1e3a5f'}, #0a1628)`,
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Icon — top-left gold circle */}
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>

          {/* Category name — bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <span className="text-white font-bold text-xs leading-tight block">
              {card.name}
            </span>
          </div>

          {/* Gold border hover glow — only visible when not animating */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent rounded-card transition-colors duration-300" />
        </Link>
      </motion.div>
    </motion.div>
  )
}
