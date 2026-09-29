import { describe, expect, it } from 'vitest'
import { addMonths, fromParts, getParts, monthLength, monthStart } from '../src/calendar'
import { isoToEpoch, toISO } from '../src/date'

const CALS = ['gregory', 'islamic-umalqura', 'islamic-civil', 'persian', 'hebrew', 'buddhist']
const base = isoToEpoch('2026-09-29')

describe.each(CALS)('%s calendar', (cal) => {
  it('finds month starts and lengths consistent with Intl', () => {
    let start = monthStart(cal, base)
    for (let i = 0; i < 26; i++) {
      expect(getParts(cal, start).day).toBe(1)
      const len = monthLength(cal, start)
      expect(len).toBeGreaterThanOrEqual(28)
      expect(len).toBeLessThanOrEqual(31)
      expect(getParts(cal, start + len - 1).day).toBe(len)
      start += len
    }
  })

  it('adds months symmetrically', () => {
    const e = monthStart(cal, base) + 10
    expect(addMonths(cal, addMonths(cal, e, 7), -7)).toBe(e)
    expect(getParts(cal, addMonths(cal, e, 1)).day).toBe(11)
  })

  it('converts calendar dates back to epoch days', () => {
    if (cal === 'hebrew') return // month is a name, not a number
    for (let e = base - 400; e < base + 400; e += 37) {
      const p = getParts(cal, e)
      expect(fromParts(cal, p.year, p.month, p.day)).toBe(e)
    }
  })
})

describe('Hijri specifics', () => {
  it('matches Umm al-Qura for a known date', () => {
    expect(getParts('islamic-umalqura', base)).toMatchObject({ year: 1448, month: 4, day: 18 })
  })

  it('rejects non-existent dates', () => {
    const start = monthStart('islamic-umalqura', base)
    const len = monthLength('islamic-umalqura', start)
    const { year, month } = getParts('islamic-umalqura', start)
    expect(fromParts('islamic-umalqura', year, month, len + 1)).toBeNull()
    expect(fromParts('gregory', 2026, 2, 29)).toBeNull()
    expect(toISO(fromParts('gregory', 2024, 2, 29)!)).toBe('2024-02-29')
  })

  it('clamps day-of-month when adding Gregorian months', () => {
    expect(toISO(addMonths('gregory', isoToEpoch('2026-01-31'), 1))).toBe('2026-02-28')
    expect(toISO(addMonths('gregory', isoToEpoch('2024-03-31'), -1))).toBe('2024-02-29')
  })
})
