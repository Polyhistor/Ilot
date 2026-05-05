'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
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

const SERVICE_IMAGES = [
  '1589829085413-56de8ae18c73',
  '1556761175-5973dc0f32d7',
  '1454165804606-c3d57bc86b40',
  '1505664194779-8beaceb93744',
  '1600880292203-757bb62b4baf',
  '1521791136064-7986c2920216',
  '1554224155-8d04cb21cd6c',
]

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
  imageId,
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
  imageId: string
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

  const imageSrc =
    card.imageUrl ??
    `https://images.unsplash.com/photo-${imageId}?q=80&w=800&auto=format&fit=crop`

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
      className="absolute top-1/2 left-1/2 rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto group"
    >
      <Link href={`/${card.slug}`} className="block w-full h-full">
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="220px"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent opacity-80`} />
        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
          <h3 className="text-white font-bold text-sm md:text-lg leading-tight">{card.name}</h3>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Mobile 2-column grid ───────────────────────────────────────────────── */
function MobileHero({ cards }: { cards: HeroCard[] }) {
  return (
    <section className="bg-[#F4F4F0] md:hidden">
      <div className="px-5 pt-10 pb-6">
        <div className="inline-flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full text-[11px] font-medium text-gray-600 mb-4 shadow-sm">
          Trusted legal services, Nationwide
        </div>
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
          const imageSrc =
            card.imageUrl ??
            `https://images.unsplash.com/photo-${SERVICE_IMAGES[i]}?q=80&w=600&auto=format&fit=crop`
          const color = SERVICE_COLORS[i] ?? SERVICE_COLORS[0]
          return (
            <Link
              key={card.slug}
              href={`/${card.slug}`}
              className={`rounded-2xl overflow-hidden relative group ${
                i === cards.slice(0, TOTAL).length - 1 && TOTAL % 2 !== 0
                  ? 'col-span-2 aspect-[2/1]'
                  : 'aspect-square'
              }`}
            >
              <Image
                src={imageSrc}
                alt={card.name}
                fill
                className="object-cover transition-transform duration-500 group-active:scale-105"
                sizes="45vw"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent opacity-75`} />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold text-[15px] leading-tight">{card.name}</h3>
              </div>
            </Link>
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
          <div ref={textContentRef} className="text-center w-full max-w-4xl px-4">
            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-5 shadow-sm">
              <span>Trusted legal services, Nationwide</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0B0B1A] tracking-tight leading-[1.1] mb-4">
              Clear Legal Support.<br />
              Confident Decisions.
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl leading-relaxed mx-auto">
              Elite legal, visa, and business solutions for global investors and expatriates.
              Secure your residency and protect your assets with one-touch efficiency.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <WhatsAppCTA size="lg" label="Get your free quote" />
              <Link
                href="/visa"
                className="group flex items-center space-x-2 text-[#0B0B1A] font-bold hover:text-gray-600 transition-colors border-b-2 border-[#0B0B1A] pb-1"
              >
                <span>View our offerings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
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
          <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-6 shadow-sm">
            <span>COMPREHENSIVE SERVICES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B0B1A] leading-tight">
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
                color={SERVICE_COLORS[i]   ?? SERVICE_COLORS[0]}
                imageId={SERVICE_IMAGES[i] ?? SERVICE_IMAGES[0]}
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
