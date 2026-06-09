'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 0.61, 0.36, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

interface GroupProps {
  children: ReactNode
  className?: string
  /** Seconds between each child's start. */
  stagger?: number
  /** Seconds before the first child starts. */
  delay?: number
  /** Render as a different element (e.g. 'ul'). Defaults to 'div'. */
  as?: 'div' | 'ul' | 'section'
}

/**
 * Orchestrates a staggered reveal: its direct <RevealItem> descendants animate
 * in sequence the first time this block scrolls into view. Respects
 * `prefers-reduced-motion` (renders statically with no transform).
 */
export function RevealGroup({ children, className, stagger = 0.12, delay = 0.05, as = 'div' }: GroupProps) {
  const reduce = useReducedMotion()
  const Tag = as
  if (reduce) return <Tag className={className}>{children}</Tag>

  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </MotionTag>
  )
}

interface ItemProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
}

/** A single element in a {@link RevealGroup} cascade. */
export function RevealItem({ children, className, as = 'div' }: ItemProps) {
  const reduce = useReducedMotion()
  const Tag = as
  if (reduce) return <Tag className={className}>{children}</Tag>

  const MotionTag = motion[as]
  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  )
}
