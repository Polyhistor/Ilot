const WORDS_PER_MINUTE = 200

type PortableTextBlock = {
  _type: string
  children?: Array<{ text?: string }>
}

/**
 * Estimate reading time in minutes.
 * Accepts either a plain string or an array of Portable Text blocks.
 */
export function estimateReadingTime(
  content: string | PortableTextBlock[] | null | undefined
): number {
  if (!content) return 1

  let text: string

  if (typeof content === 'string') {
    text = content
  } else if (Array.isArray(content)) {
    text = content
      .flatMap((block) => block.children?.map((c) => c.text ?? '') ?? [])
      .join(' ')
  } else {
    return 1
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
