import { describe, expect, it } from 'vitest'
import {
  addDays,
  fromEpoch,
  isoToEpoch,
  toDate,
  toEpoch,
  toISO,
  toISODate,
  weekday,
} from '../src/date'

describe('date', () => {
  it('round-trips epoch days', () => {
    expect(toEpoch(1970, 1, 1)).toBe(0)
    expect(toISO(0)).toBe('1970-01-01')
    for (const iso of ['2024-02-29', '0033-04-03', '1900-12-31', '2099-01-01']) {
      expect(toISO(isoToEpoch(iso))).toBe(iso)
    }
    expect(fromEpoch(toEpoch(33, 4, 3))).toEqual([33, 4, 3])
  })

  it('normalises inputs', () => {
    expect(toISODate('2026-09-29')).toBe('2026-09-29')
    expect(toISODate('2026-09-29T23:30:00Z')).toBe('2026-09-29')
    expect(toISODate(new Date(2026, 8, 29, 23, 59))).toBe('2026-09-29')
    expect(toISODate({ toString: () => '2026-09-29[u-ca=islamic-umalqura]' })).toBe('2026-09-29')
    expect(toISODate('2026-02-31')).toBeNull()
    expect(toISODate('nope')).toBeNull()
    expect(toISODate(new Date(Number.NaN))).toBeNull()
    expect(toISODate('')).toBeNull()
  })

  it('computes weekdays and arithmetic', () => {
    expect(weekday(isoToEpoch('2026-09-29'))).toBe(2) // Tuesday
    expect(weekday(isoToEpoch('1969-12-28'))).toBe(0) // Sunday, negative epoch
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(toDate('2026-09-29').getDate()).toBe(29)
  })
})
