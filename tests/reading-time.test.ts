import { describe, it, expect } from 'vitest'
import { estimateReadingTime } from '../src/lib/reading-time'

describe('estimateReadingTime', () => {
  it('returns 1 min for short content', () => {
    expect(estimateReadingTime('word '.repeat(100))).toBe(1)
  })

  it('calculates minutes from word count at 200 wpm', () => {
    expect(estimateReadingTime('word '.repeat(400))).toBe(2)
    expect(estimateReadingTime('word '.repeat(600))).toBe(3)
  })

  it('handles portable text blocks', () => {
    const blocks = [
      { _type: 'block', children: [{ text: 'word '.repeat(200) }] },
      { _type: 'block', children: [{ text: 'word '.repeat(200) }] },
    ]
    expect(estimateReadingTime(blocks)).toBe(2)
  })

  it('returns 1 for empty input', () => {
    expect(estimateReadingTime('')).toBe(1)
    expect(estimateReadingTime([])).toBe(1)
    expect(estimateReadingTime(null)).toBe(1)
  })
})
