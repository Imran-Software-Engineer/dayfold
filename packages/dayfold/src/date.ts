/**
 * Plain calendar dates, time-zone free.
 *
 * Every date inside dayfold is an ISO 8601 calendar date string (`YYYY-MM-DD`)
 * or its "epoch day" — the whole number of days since 1970-01-01. Epoch days
 * make arithmetic trivial and immune to DST / time-zone shifts.
 */

/** An ISO 8601 calendar date, e.g. `"2026-09-29"`. */
export type ISODate = string

/**
 * Anything dayfold accepts as a date: an ISO string (a time part is ignored),
 * a `Date` (its *local* calendar day is used), or any object whose `toString()`
 * starts with an ISO date — which covers `Temporal.PlainDate`,
 * `Temporal.PlainDateTime` and `Temporal.ZonedDateTime`.
 */
export type DateInput = ISODate | Date | { toString(): string }

export const DAY_MS = 864e5

const ISO_RE = /^(-?\d{4,6})-(\d{2})-(\d{2})/

/** Epoch day for a proleptic-Gregorian year / month (1-12) / day. */
export function toEpoch(year: number, month: number, day: number): number {
  const d = new Date(0)
  d.setUTCFullYear(year, month - 1, day)
  return Math.floor(d.getTime() / DAY_MS)
}

/** Gregorian `[year, month, day]` for an epoch day. */
export function fromEpoch(epoch: number): [number, number, number] {
  const d = new Date(epoch * DAY_MS)
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
}

const pad = (n: number, len = 2) => String(Math.abs(n)).padStart(len, '0')

/** Epoch day → ISO date string. */
export function toISO(epoch: number): ISODate {
  const [y, m, d] = fromEpoch(epoch)
  return `${y < 0 ? '-' : ''}${pad(y, 4)}-${pad(m)}-${pad(d)}`
}

/** ISO date string → epoch day. Assumes the input is already valid. */
export function isoToEpoch(iso: ISODate): number {
  const m = ISO_RE.exec(iso)!
  return toEpoch(+m[1], +m[2], +m[3])
}

/** Normalises any {@link DateInput} to an ISO date, or `null` when invalid. */
export function toISODate(input: DateInput | null | undefined): ISODate | null {
  if (input == null || input === '') return null
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null
    return toISO(toEpoch(input.getFullYear(), input.getMonth() + 1, input.getDate()))
  }
  const m = ISO_RE.exec(String(input))
  if (!m) return null
  const epoch = toEpoch(+m[1], +m[2], +m[3])
  const [y, mo, d] = fromEpoch(epoch)
  // Reject overflow such as 2026-02-31.
  return y === +m[1] && mo === +m[2] && d === +m[3] ? toISO(epoch) : null
}

/** Converts an ISO date to a `Date` at local midnight — handy for legacy APIs. */
export function toDate(iso: ISODate): Date {
  const [y, m, d] = fromEpoch(isoToEpoch(iso))
  const date = new Date(0)
  date.setFullYear(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Today's local calendar date. */
export function today(): ISODate {
  return toISODate(new Date())!
}

/** Day of week for an epoch day: 0 = Sunday … 6 = Saturday. */
export function weekday(epoch: number): number {
  return (((epoch + 4) % 7) + 7) % 7
}

/** Adds (or subtracts) days to an ISO date. */
export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(isoToEpoch(iso) + days)
}

/** Compares two ISO dates. ISO strings sort lexically for years 0000–9999. */
export function compare(a: ISODate, b: ISODate): number {
  return isoToEpoch(a) - isoToEpoch(b)
}
