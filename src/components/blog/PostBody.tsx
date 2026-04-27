'use client'

import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import type { PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${value.asset._ref
                .replace('image-', '')
                .replace('-jpg', '.jpg')
                .replace('-png', '.png')
                .replace('-webp', '.webp')}`}
              alt={value.alt ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 860px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-muted mt-3">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-accent underline underline-offset-2 hover:text-accent/80"
      >
        {children}
      </a>
    ),
  },
}

interface Props {
  blocks: unknown[]
}

export function PostBody({ blocks }: Props) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/80 prose-p:leading-relaxed prose-strong:text-foreground prose-blockquote:border-accent prose-blockquote:text-muted prose-a:text-accent">
      <PortableText value={blocks as any} components={components} />
    </div>
  )
}
