/**
 * Optional typed shortcuts for the text input: "today", "tomorrow", "+3d",
 * "-2w", "+1m", "next fri" — plus Arabic "اليوم", "غدا", "أمس", "بعد 3 أيام".
 *
 * ```ts
 * import { withShortcuts } from 'dayfold/shortcuts'
 * createDatePicker({ parse: withShortcuts() })
 * ```
 */
import { addMonths } from './calendar'
import { type ISODate, isoToEpoch, toISO, weekday } from './date'
import { normalizeDigits } from './locale'
import { parseDate } from './parse'
import type { ParseContext } from './types'

const WORDS: Record<string, number> = {
  today: 0,
  now: 0,
  tomorrow: 1,
  yesterday: -1,
  اليوم: 0,
  غدا: 1,
  غداً: 1,
  بكرة: 1,
  أمس: -1,
  امس: -1,
}
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const UNIT: Record<string, 'd' | 'w' | 'm' | 'y'> = {
  d: 'd',
  day: 'd',
  days: 'd',
  يوم: 'd',
  أيام: 'd',
  ايام: 'd',
  w: 'w',
  week: 'w',
  weeks: 'w',
  أسبوع: 'w',
  اسبوع: 'w',
  أسابيع: 'w',
  m: 'm',
  month: 'm',
  months: 'm',
  شهر: 'm',
  أشهر: 'm',
  شهور: 'm',
  y: 'y',
  year: 'y',
  years: 'y',
  سنة: 'y',
  سنوات: 'y',
}

/** Parses a shortcut relative to `ctx.today`, or returns `null`. */
export function parseShortcut(text: string, ctx: ParseContext): ISODate | null {
  const s = normalizeDigits(text).trim().toLowerCase().replace(/\s+/g, ' ')
  const base = isoToEpoch(ctx.today)
  if (s in WORDS) return toISO(base + WORDS[s])

  const next = /^(next|this|last) ([a-z]{3})[a-z]*$/.exec(s)
  if (next && DAYS.includes(next[2])) {
    const target = DAYS.indexOf(next[2])
    let diff = (target - weekday(base) + 7) % 7
    if (next[1] === 'next' && diff === 0) diff = 7
    if (next[1] === 'last') diff = diff === 0 ? -7 : diff - 7
    return toISO(base + diff)
  }

  const rel = /^(?:in |بعد )?([+-]?)(\d+) ?(\S+?)(?: ago)?$/.exec(s)
  const unit = rel && UNIT[rel[3]]
  if (rel && unit) {
    const n = +rel[2] * (rel[1] === '-' || s.endsWith(' ago') ? -1 : 1)
    if (unit === 'd') return toISO(base + n)
    if (unit === 'w') return toISO(base + n * 7)
    return toISO(addMonths(ctx.calendar, base, unit === 'm' ? n : n * 12))
  }
  return null
}

/** A `parse` option that tries shortcuts first, then `fallback` (the default parser). */
export function withShortcuts(fallback = parseDate) {
  return (text: string, ctx: ParseContext) => parseShortcut(text, ctx) ?? fallback(text, ctx)
}
