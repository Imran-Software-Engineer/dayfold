/**
 * Calendar-system math on top of `Intl.DateTimeFormat`.
 *
 * Instead of shipping conversion tables (Hijri Umm al-Qura, Persian, Hebrew…),
 * dayfold asks the browser's built-in ICU data for the day-of-month of a given
 * epoch day and derives month boundaries from that. Gregorian takes a fast
 * path that never touches `Intl`.
 */
import { DAY_MS, fromEpoch, toEpoch } from './date'

/**
 * Any Unicode calendar identifier supported by `Intl`, e.g. `gregory`,
 * `islamic-umalqura`, `islamic-civil`, `persian`, `hebrew`, `buddhist`, `japanese`.
 */
export type CalendarId = string

export interface CalendarParts {
  year: number
  /** 1-based month number, or `NaN` for calendars that only expose month names (Hebrew). */
  month: number
  day: number
}

const isGregorian = (cal: CalendarId) => cal === 'gregory' || cal === 'iso8601'

const partFormatters = new Map<CalendarId, Intl.DateTimeFormat>()
const partsCache = new Map<string, CalendarParts>()

/** The year / month / day of an epoch day in the given calendar. */
export function getParts(cal: CalendarId, epoch: number): CalendarParts {
  if (isGregorian(cal)) {
    const [year, month, day] = fromEpoch(epoch)
    return { year, month, day }
  }
  const key = cal + epoch
  let parts = partsCache.get(key)
  if (parts) return parts
  let fmt = partFormatters.get(cal)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      calendar: cal,
      numberingSystem: 'latn',
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    partFormatters.set(cal, fmt)
  }
  parts = { year: Number.NaN, month: Number.NaN, day: Number.NaN }
  for (const { type, value } of fmt.formatToParts(epoch * DAY_MS)) {
    if (type === 'year' || type === 'month' || type === 'day') parts[type] = +value
    else if ((type as string) === 'relatedYear') parts.year = +value
  }
  if (partsCache.size > 4000) partsCache.clear()
  partsCache.set(key, parts)
  return parts
}

/** Epoch day of the first day of the month containing `epoch`. */
export function monthStart(cal: CalendarId, epoch: number): number {
  return epoch - getParts(cal, epoch).day + 1
}

/** Number of days in the month starting at epoch day `start`. */
export function monthLength(cal: CalendarId, start: number): number {
  if (isGregorian(cal)) {
    const [y, m] = fromEpoch(start)
    return toEpoch(y, m + 1, 1) - start
  }
  for (let n = 28; n <= 32; n++) if (getParts(cal, start + n).day === 1) return n
  return 30
}

/** Moves `epoch` by `months`, clamping the day to the target month's length. */
export function addMonths(cal: CalendarId, epoch: number, months: number): number {
  let start = monthStart(cal, epoch)
  const offset = epoch - start
  for (let i = 0; i < months; i++) start += monthLength(cal, start)
  for (let i = 0; i > months; i--) start = monthStart(cal, start - 1)
  return start + Math.min(offset, monthLength(cal, start) - 1)
}

const cmp = (a: CalendarParts, y: number, m: number, d: number) =>
  a.year - y || a.month - m || a.day - d

/**
 * Epoch day for a date expressed in the given calendar, or `null` when it does
 * not exist (e.g. day 30 of a 29-day Hijri month).
 */
export function fromParts(
  cal: CalendarId,
  year: number,
  month: number,
  day: number,
): number | null {
  if (![year, month, day].every(Number.isFinite) || month < 1 || day < 1) return null
  let epoch: number
  if (isGregorian(cal)) {
    epoch = toEpoch(year, month, day)
  } else {
    // Calendar dates increase monotonically with epoch days: binary search.
    let lo = -800_000
    let hi = 800_000
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (cmp(getParts(cal, mid), year, month, day) < 0) lo = mid + 1
      else hi = mid
    }
    epoch = lo
  }
  return cmp(getParts(cal, epoch), year, month, day) === 0 ? epoch : null
}
