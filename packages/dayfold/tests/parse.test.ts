import { describe, expect, it } from 'vitest'
import { getDirection, getWeekend, getWeekStart, normalizeDigits } from '../src/locale'
import { fieldOrder, parseDate, placeholderFor } from '../src/parse'
import { parseShortcut, withShortcuts } from '../src/shortcuts'

const ctx = (locale: string, calendar = 'gregory') => ({ locale, calendar, today: '2026-09-29' })

describe('parseDate', () => {
  it('parses ISO in any locale', () => {
    expect(parseDate('2026-9-5', ctx('de-DE'))).toBe('2026-09-05')
  })
  it('follows locale field order', () => {
    expect(fieldOrder('en-US', 'gregory')).toEqual(['month', 'day', 'year'])
    expect(parseDate('09/29/2026', ctx('en-US'))).toBe('2026-09-29')
    expect(parseDate('29/09/2026', ctx('en-GB'))).toBe('2026-09-29')
    expect(parseDate('29.9.26', ctx('de-DE'))).toBe('2026-09-29')
  })
  it('parses Hijri dates with Arabic-Indic digits', () => {
    expect(parseDate('١٨/٠٤/١٤٤٨ هـ', ctx('ar-SA', 'islamic-umalqura'))).toBe('2026-09-29')
    expect(parseDate('1448/4/18', ctx('en', 'islamic-umalqura'))).toBe('2026-09-29')
  })
  it('rejects garbage and impossible dates', () => {
    expect(parseDate('hello', ctx('en-US'))).toBeNull()
    expect(parseDate('02/30/2026', ctx('en-US'))).toBeNull()
  })
  it('builds placeholders', () => {
    expect(
      placeholderFor('en-US', 'gregory', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    ).toBe('mm/dd/yyyy')
  })
})

describe('locale', () => {
  it('knows week starts, weekends and direction', () => {
    expect(getWeekStart('en-US')).toBe(0)
    expect(getWeekStart('en-GB')).toBe(1)
    expect(getWeekend('ar-SA')).toEqual([5, 6])
    expect(getDirection('ar-SA')).toBe('rtl')
    expect(getDirection('fa')).toBe('rtl')
    expect(getDirection('en')).toBe('ltr')
    expect(normalizeDigits('١٤٤٨-۰۴')).toBe('1448-04')
  })
})

describe('shortcuts', () => {
  const c = ctx('en-US')
  it.each([
    ['today', '2026-09-29'],
    ['Tomorrow', '2026-09-30'],
    ['+3d', '2026-10-02'],
    ['-2w', '2026-09-15'],
    ['in 1 month', '2026-10-29'],
    ['2 days ago', '2026-09-27'],
    ['next fri', '2026-10-02'],
    ['next tuesday', '2026-10-06'],
    ['last mon', '2026-09-28'],
    ['غدا', '2026-09-30'],
    ['بعد ٣ أيام', '2026-10-02'],
  ])('%s → %s', (text, iso) => {
    expect(parseShortcut(text, c)).toBe(iso)
  })
  it('falls back to the default parser', () => {
    expect(withShortcuts()('09/01/2026', c)).toBe('2026-09-01')
    expect(parseShortcut('whenever', c)).toBeNull()
  })
})
