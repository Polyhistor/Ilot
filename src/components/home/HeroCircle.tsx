'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
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

const TOTAL = 7
// Height of the fixed navigation header — the sticky hero panel starts below it,
// so every vertical calculation must subtract this from window.innerHeight.
const NAV_HEIGHT       = 64
// Padding kept above and below the card row (ghost row = cardWidth + 2×this)
const CARD_ROW_PADDING = 20
// Minimum breathing space between the measured text block and the ghost row top
const TEXT_BREATHING   = 48
// Hard floor so cards never shrink into thumbnails
const MIN_CARD_SIZE    = 110

/**
 * Width-based card size: spread TOTAL cards across the available horizontal width.
 * Returns both the card pixel size and the gap so callers can reuse them.
 */
function widthLayout(containerWidth: number, total: number) {
  const isXL  = containerWidth > 1200
  const is2XL = containerWidth > 1400
  const gap          = is2XL ? 28 : isXL ? 24 : 20
  const maxCardWidth = is2XL ? 300 : isXL ? 260 : 220
  const cardWidth    = Math.min(
    (containerWidth - (total - 1) * gap) / total,
    maxCardWidth,
  )
  return { cardWidth, gap, isXL, is2XL }
}

const SERVICE_COLORS = [
  'from-blue-900 via-blue-900/80',
  'from-slate-900 via-slate-900/80',
  'from-teal-900 via-teal-900/80',
  'from-amber-900 via-amber-900/80',
  'from-indigo-900 via-indigo-900/80',
  'from-purple-900 via-purple-900/80',
  'from-emerald-900 via-emerald-900/80',
]

// Solid brand tile colors — used when a category has no CMS image_url.
const SERVICE_BG = [
  'bg-blue-900',
  'bg-slate-900',
  'bg-teal-900',
  'bg-amber-900',
  'bg-indigo-900',
  'bg-purple-900',
  'bg-emerald-900',
]

// On-load stagger for the hero headline → description → CTA.
const HERO_TEXT_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}
const HERO_TEXT_ITEM = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] as const } },
}

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', update)
    update()
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

/* ─── Desktop animated card ─────────────────────────────────────────────── */
function ServiceCard({
  index,
  total,
  card,
  progress,
  color,
  bg,
  containerWidth,
  windowHeight,
  cardWidth,  // resolved by parent after height-constraint
  gap,
}: {
  index: number
  total: number
  card: HeroCard
  progress: MotionValue<number>
  color: string
  bg: string
  containerWidth: number
  windowHeight: number
  cardWidth: number
  gap: number
}) {
  const cardSpacing = cardWidth + gap

  // Horizontal start: spread evenly around centre
  const xInitial = (index - (total - 1) / 2) * cardSpacing

  // Vertical start: card centre sits exactly in the middle of the ghost row.
  //
  // The sticky panel is h-screen (= windowHeight) but starts NAV_HEIGHT px below
  // the viewport top (beneath the fixed navbar). So the panel's visible bottom
  // in viewport coords = windowHeight, and its visible top = NAV_HEIGHT.
  //
  // We want: card bottom in viewport = windowHeight − CARD_ROW_PADDING
  //          card centre in viewport  = windowHeight − CARD_ROW_PADDING − cardWidth/2
  //          card centre in panel     = (windowHeight − CARD_ROW_PADDING − cardWidth/2) − NAV_HEIGHT
  //                                   = windowHeight − NAV_HEIGHT − CARD_ROW_PADDING − cardWidth/2
  //
  // yInitial is the Framer Motion y-transform from the panel's own centre (windowHeight/2):
  //   yInitial = cardCentreInPanel − panelHeight/2
  //            = (windowHeight − NAV_HEIGHT − CARD_ROW_PADDING − cardWidth/2) − windowHeight/2
  //            = windowHeight/2 − NAV_HEIGHT − CARD_ROW_PADDING − cardWidth/2
  const yInitial = windowHeight / 2 - NAV_HEIGHT - CARD_ROW_PADDING - cardWidth / 2

  // Final (circular) position
  const isXL  = containerWidth > 1200
  const is2XL = containerWidth > 1400
  const radiusWidthRatio  = is2XL ? 0.32 : isXL ? 0.30 : 0.30
  const radiusHeightRatio = is2XL ? 0.42 : isXL ? 0.40 : 0.38
  const radiusFinal = Math.min(
    containerWidth * radiusWidthRatio,
    windowHeight  * radiusHeightRatio,
  )
  const angleFinal = index * (360 / total) - 90
  const xFinal = radiusFinal * Math.cos((angleFinal * Math.PI) / 180)
  const yFinal = radiusFinal * Math.sin((angleFinal * Math.PI) / 180)

  const x = useTransform(progress, [0.05, 0.6], [xInitial, xFinal])
  const y = useTransform(progress, [0.05, 0.6], [yInitial, yFinal])

  return (
    <motion.div
      style={{
        x,
        y,
        width:      cardWidth,
        height:     cardWidth,
        marginLeft: -cardWidth / 2,
        marginTop:  -cardWidth / 2,
      }}
      className="absolute top-1/2 left-1/2 pointer-events-auto"
    >
      {/* Inner wrapper handles the on-load fade-in-down so it doesn't collide
          with the scroll-driven x/y transform on the parent. */}
      <motion.div
        className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl group"
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 + index * 0.09, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <Link href={`/${card.slug}`} className="block w-full h-full">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="220px"
            />
          ) : (
            <div className={`absolute inset-0 ${bg}`} />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent opacity-80`} />
          <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
            <h3 className="text-white font-bold text-sm md:text-lg leading-tight">{card.name}</h3>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

/* ─── Mobile 2-column grid ───────────────────────────────────────────────── */
function MobileHero({ cards }: { cards: HeroCard[] }) {
  return (
    <section className="bg-[#F4F4F0] md:hidden">
      <div className="px-5 pt-10 pb-6">
        <h1 className="text-3xl font-bold text-[#0B0B1A] tracking-tight leading-[1.15] mb-3">
          Clear Legal Support.<br />
          Confident Decisions.
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-sm">
          Elite legal, visa, and business solutions for global investors and expatriates in Indonesia.
        </p>
        <div className="flex items-center gap-4">
          <WhatsAppCTA size="sm" label="Free quote" />
          <Link
            href="/visa"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0B0B1A] border-b border-[#0B0B1A] pb-0.5"
          >
            Our services
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="px-5 flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0B0B1A] tracking-tight">Our Services</h2>
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">{TOTAL} Pillars</span>
      </div>

      <div className="px-5 grid grid-cols-2 gap-3 pb-8">
        {cards.slice(0, TOTAL).map((card, i) => {
          const color = SERVICE_COLORS[i] ?? SERVICE_COLORS[0]
          const bg = SERVICE_BG[i] ?? SERVICE_BG[0]
          const isWide = i === cards.slice(0, TOTAL).length - 1 && TOTAL % 2 !== 0
          return (
            <motion.div
              key={card.slug}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
              className={isWide ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}
            >
              <Link
                href={`/${card.slug}`}
                className="block w-full h-full rounded-2xl overflow-hidden relative group"
              >
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover transition-transform duration-500 group-active:scale-105"
                    sizes="45vw"
                  />
                ) : (
                  <div className={`absolute inset-0 ${bg}`} />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent opacity-75`} />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-bold text-[15px] leading-tight">{card.name}</h3>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Desktop hero with scroll animation ────────────────────────────────── */
function DesktopHero({ cards }: { cards: HeroCard[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textContentRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { width, height } = useWindowSize()

  // Track the exact rendered height of the text block via ResizeObserver.
  // Start at 0; cards are not rendered until both width and textHeight are known.
  const [textHeight, setTextHeight] = useState(0)
  useEffect(() => {
    const el = textContentRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setTextHeight(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const MAX_CARD_ROW_WIDTH = width >= 1920 ? 1600 : width >= 1440 ? 1400 : 1200
  const containerWidth    = Math.min(width, MAX_CARD_ROW_WIDTH) - 32

  // Width-based size (horizontal constraint)
  const { cardWidth: widthCardWidth, gap } = widthLayout(containerWidth, TOTAL)

  // Height-based size (vertical constraint):
  //   The usable viewport height below the navbar = height − NAV_HEIGHT.
  //   Everything must fit inside that space:
  //     textHeight + TEXT_BREATHING + cardWidth + 2×CARD_ROW_PADDING ≤ height − NAV_HEIGHT
  //     → cardWidth ≤ height − NAV_HEIGHT − textHeight − TEXT_BREATHING − 2×CARD_ROW_PADDING
  const heightCardWidth = textHeight > 0
    ? Math.max(MIN_CARD_SIZE, height - NAV_HEIGHT - textHeight - TEXT_BREATHING - CARD_ROW_PADDING * 2)
    : widthCardWidth

  // Final card size: whichever axis is the tighter constraint wins
  const cardWidth     = width > 0 ? Math.min(widthCardWidth, heightCardWidth) : 220
  const ghostRowHeight = cardWidth + CARD_ROW_PADDING * 2

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  })

  const textOpacity   = useTransform(scrollYProgress, [0, 0.05], [1, 0])
  const textY         = useTransform(scrollYProgress, [0, 0.05], [0, -80])
  const textVisibility = useTransform(
    scrollYProgress,
    (v) => (v > 0.1 ? 'hidden' as const : 'visible' as const),
  )

  const centerProgress    = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const centerTextOpacity = useTransform(centerProgress, [0, 1], [0, 1])
  const centerTextScale   = useTransform(centerProgress, [0, 1], [0.85, 1])

  // Only render once we have real measurements so there's no layout flash
  const ready = width > 0 && textHeight > 0

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#F4F4F0] hidden md:block">
      {/*
        Sticky panel = exactly 100 vh, flex-col.
          • flex-1 text region   → takes all space not occupied by the ghost row
          • ghost row (flex-shrink-0) → reserves space for cards at the bottom
          • absolute cards          → overlay the ghost row exactly
        Because text is bounded by flex-1, it structurally cannot reach the cards.
        Because cardWidth is clamped by the height constraint, the ghost row (and
        the real cards sitting on it) always fit within the 100 vh panel.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">

        {/* ── Hero text (upper flex region) ─────────────────────────────── */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, visibility: textVisibility }}
          className="flex-1 flex flex-col items-center justify-center z-10 overflow-hidden"
        >
          {/*
            Inner wrapper is what we measure. It has its natural (shrink-wrapped)
            height so ResizeObserver captures the real content size.
          */}
          <motion.div
            ref={textContentRef}
            className="text-center w-full max-w-4xl px-4"
            variants={reduceMotion ? undefined : HERO_TEXT_CONTAINER}
            initial={reduceMotion ? undefined : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
          >
            <motion.h1 variants={reduceMotion ? undefined : HERO_TEXT_ITEM} className="font-bold text-[#0B0B1A] tracking-tight leading-[1.1] mb-4" style={{ fontSize: 'clamp(2.75rem, 4.5vw, 5.5rem)' }}>
              Clear Legal Support.<br />
              Confident Decisions.
            </motion.h1>
            <motion.p variants={reduceMotion ? undefined : HERO_TEXT_ITEM} className="text-gray-600 mb-6 max-w-2xl leading-relaxed mx-auto" style={{ fontSize: 'clamp(1rem, 1.25vw, 1.25rem)' }}>
              Elite legal, visa, and business solutions for global investors and expatriates.
              Secure your residency and protect your assets with one-touch efficiency.
            </motion.p>
            <motion.div variants={reduceMotion ? undefined : HERO_TEXT_ITEM} className="flex items-center justify-center">
              <WhatsAppCTA size="lg" label="Get your free quote" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Ghost row — reserves card space, keeps text bounded above ──── */}
        <div
          aria-hidden
          className="flex-shrink-0 w-full"
          style={{ height: ghostRowHeight }}
        />

        {/* ── Centre title (shown when cards have formed a circle) ────────── */}
        <motion.div
          style={{ opacity: centerTextOpacity, scale: centerTextScale, x: '-50%', y: '-50%' }}
          className="absolute top-1/2 left-1/2 text-center w-full max-w-md px-4 z-20 pointer-events-none"
        >
          <h2 className="font-bold text-[#0B0B1A] leading-tight" style={{ fontSize: 'clamp(2rem, 3.5vw, 4rem)' }}>
            Everything you need to <br />grow in Indonesia
          </h2>
        </motion.div>

        {/* ── Animated cards ─────────────────────────────────────────────── */}
        {ready && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full container mx-auto px-4 h-full pointer-events-none">
            {cards.slice(0, TOTAL).map((card, i) => (
              <ServiceCard
                key={card.slug}
                index={i}
                total={TOTAL}
                card={card}
                progress={scrollYProgress}
                color={SERVICE_COLORS[i] ?? SERVICE_COLORS[0]}
                bg={SERVICE_BG[i]        ?? SERVICE_BG[0]}
                containerWidth={containerWidth}
                windowHeight={height}
                cardWidth={cardWidth}
                gap={gap}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function HeroCircle({ cards }: HeroCircleProps) {
  return (
    <>
      <MobileHero cards={cards} />
      <DesktopHero cards={cards} />
    </>
  )
}
