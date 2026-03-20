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
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return windowSize
}

function ServiceCard({
  index,
  total,
  card,
  progress,
  color,
  imageId,
  containerWidth,
  windowHeight,
}: {
  index: number
  total: number
  card: HeroCard
  progress: MotionValue<number>
  color: string
  imageId: string
  containerWidth: number
  windowHeight: number
}) {
  // Responsive card sizing based on viewport width
  const isXL = containerWidth > 1200
  const is2XL = containerWidth > 1400
  const gap = is2XL ? 28 : isXL ? 24 : 20
  const maxCardWidth = is2XL ? 300 : isXL ? 260 : 220
  const cardWidth = Math.min((containerWidth - (total - 1) * gap) / total, maxCardWidth)
  const cardSpacing = cardWidth + gap

  const xInitial = (index - (total - 1) / 2) * cardSpacing
  // Push cards closer to the bottom of the viewport
  const yOffsetRatio = is2XL ? 0.36 : isXL ? 0.38 : 0.40
  const yInitial = windowHeight * yOffsetRatio - cardWidth / 2

  // Scale circle radius for larger viewports
  const radiusWidthRatio = is2XL ? 0.32 : isXL ? 0.3 : 0.3
  const radiusHeightRatio = is2XL ? 0.42 : isXL ? 0.4 : 0.38
  const radiusFinal = Math.min(containerWidth * radiusWidthRatio, windowHeight * radiusHeightRatio)
  const angleFinal = index * (360 / total) - 90
  const xFinal = radiusFinal * Math.cos((angleFinal * Math.PI) / 180)
  const yFinal = radiusFinal * Math.sin((angleFinal * Math.PI) / 180)
  const x = useTransform(progress, [0.05, 0.6], [xInitial, xFinal])
  const y = useTransform(progress, [0.05, 0.6], [yInitial, yFinal])

  const imageSrc = card.imageUrl ?? `https://images.unsplash.com/photo-${imageId}?q=80&w=800&auto=format&fit=crop`

  return (
    <motion.div
      style={{
        x,
        y,
        width: cardWidth,
        height: cardWidth,
        marginLeft: -cardWidth / 2,
        marginTop: -cardWidth / 2,
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

export function HeroCircle({ cards }: HeroCircleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowSize()

  // Responsive max-width matching site-wide container pattern (max-w-[1500px])
  const MAX_CARD_ROW_WIDTH = width >= 1920 ? 1600 : width >= 1440 ? 1400 : 1200
  let containerWidth = Math.min(width, MAX_CARD_ROW_WIDTH) - 32

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const textOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.05], [0, -80])
  const textVisibility = useTransform(scrollYProgress, (v) => v > 0.1 ? 'hidden' as const : 'visible' as const)

  const centerProgress = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const centerTextOpacity = useTransform(centerProgress, [0, 1], [0, 1])
  const centerTextScale = useTransform(centerProgress, [0, 1], [0.85, 1])

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#F4F4F0]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Initial Title */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, visibility: textVisibility }}
          className="absolute top-[8%] left-1/2 -translate-x-1/2 text-center w-full max-w-4xl px-4 z-10"
        >
          <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-5 shadow-sm">
            <span>Trusted legal services, Nationwide</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0B0B1A] tracking-tight leading-[1.1] mb-4">
            Clear Legal Support.<br />
            Confident Decisions.
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl leading-relaxed mx-auto">
            Elite legal, visa, and business solutions for global investors and expatriates. Secure your residency and protect your assets with one-touch efficiency.
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
        </motion.div>

        {/* Center Title (Circle) */}
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

        {/* Cards — only rendered client-side after window is measured */}
        {width > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full container mx-auto px-4 h-full pointer-events-none">
            {cards.slice(0, TOTAL).map((card, i) => (
              <ServiceCard
                key={card.slug}
                index={i}
                total={TOTAL}
                card={card}
                progress={scrollYProgress}
                color={SERVICE_COLORS[i] ?? SERVICE_COLORS[0]}
                imageId={SERVICE_IMAGES[i] ?? SERVICE_IMAGES[0]}
                containerWidth={containerWidth}
                windowHeight={height}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
