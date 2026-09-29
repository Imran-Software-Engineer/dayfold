import { type CalendarId, fromParts } from './calendar'
import { type ISODate, toISO, toISODate } from './date'
import { normalizeDigits } from './locale'
import type { ParseContext } from './types'

type Field = 'year' | 'month' | 'day'

const orderCache = new Map<string, Field[]>()

/** The order year / month / day appear in for a locale + calendar, e.g. `['month','day','year']`. */
export function fieldOrder(locale: string, calendar: CalendarId): Field[] {
  const key = `${locale}|${calendar}`
  let order = orderCache.get(key)
  if (!order) {
    order = new Intl.DateTimeFormat(locale, { calendar, timeZone: 'UTC' })
      .formatToParts(0)
      .map((p) => p.type)
      .filter((t): t is Field => t === 'year' || t === 'month' || t === 'day')
    orderCache.set(key, order)
  }
  return order
}

/**
 * Default text parser. Understands ISO dates (`2026-09-29`) and numeric dates
 * in the locale's field order and calendar (`09/29/2026`, `29.09.2026`,
 * `١٨/٤/١٤٤٨`). Two-digit Gregorian years map to 1950–2049.
 */
export function parseDate(text: string, { locale, calendar }: ParseContext): ISODate | null {
  const s = normalizeDigits(text).trim()
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('-')
    return toISODate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
  }
  const nums = s.match(/\d+/g)
  if (nums?.length !== 3) return null
  let order = fieldOrder(locale, calendar)
  if (nums[0].length >= 3) order = ['year', 'month', 'day']
  const f = { year: 0, month: 0, day: 0 }
  order.forEach((field, i) => {
    f[field] = +nums[i]
  })
  const gregorian = calendar === 'gregory' || calendar === 'iso8601'
  if (gregorian && nums[order.indexOf('year')].length <= 2) f.year += f.year < 50 ? 2000 : 1900
  const epoch = fromParts(calendar, f.year, f.month, f.day)
  return epoch == null ? null : toISO(epoch)
}

/** Placeholder such as `mm/dd/yyyy` derived from the locale's numeric pattern. */
export function placeholderFor(
  locale: string,
  calendar: CalendarId,
  format: Intl.DateTimeFormatOptions,
) {
  const names: Record<string, string> = { year: 'yyyy', month: 'mm', day: 'dd' }
  return new Intl.DateTimeFormat(locale, { calendar, timeZone: 'UTC', ...format })
    .formatToParts(0)
    .filter((p) => p.type !== 'era')
    .map((p) => names[p.type] ?? (p.type === 'literal' ? p.value : ''))
    .join('')
    .trim()
}
