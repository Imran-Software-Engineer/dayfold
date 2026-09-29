import { describe, expect, it, vi } from 'vitest'
import { createDatePicker } from '../src/picker'

const TODAY = '2026-09-29'
const key = (k: string, extra: Partial<KeyboardEvent> = {}) =>
  ({ key: k, preventDefault: vi.fn(), shiftKey: false, ...extra }) as unknown as KeyboardEvent

const base = { locale: 'en-US', today: TODAY, announce: false as const }

describe('calendar data', () => {
  it('builds a fixed 6-week grid starting on the locale week start', () => {
    const dp = createDatePicker(base)
    const [month] = dp.getMonths()
    expect(month.label).toBe('September 2026')
    expect(month.weeks).toHaveLength(6)
    expect(month.weeks[0][0].date).toBe('2026-08-30')
    expect(month.weeks[0][0].isOutside).toBe(true)
    const today = month.weeks.flat().find((d) => d.isToday)!
    expect(today.date).toBe(TODAY)
    expect(today.isFocused).toBe(true)
    expect(dp.getWeekdays().map((w) => w.short)).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])
  })

  it('respects weekStartsOn and fixedWeeks=false', () => {
    const dp = createDatePicker({ ...base, weekStartsOn: 1, fixedWeeks: false })
    const [month] = dp.getMonths()
    expect(month.weeks[0][0].date).toBe('2026-08-31')
    expect(month.weeks).toHaveLength(5)
  })

  it('renders Hijri months with Arabic digits and a Gregorian secondary calendar', () => {
    const dp = createDatePicker({
      ...base,
      locale: 'ar-SA',
      calendar: 'islamic-umalqura',
      secondaryCalendar: 'gregory',
    })
    const [month] = dp.getMonths()
    expect(month.label).toContain('١٤٤٨')
    const today = month.weeks.flat().find((d) => d.isToday)!
    expect(today.label).toBe('١٨')
    expect(today.secondaryLabel).toBe('٢٩')
    expect(dp.getDirection()).toBe('rtl')
    expect(month.secondaryLabel).toBeTruthy()
  })

  it('shows several months side by side', () => {
    const dp = createDatePicker({ ...base, numberOfMonths: 2 })
    expect(dp.getMonths().map((m) => m.label)).toEqual(['September 2026', 'October 2026'])
  })
})

describe('disabled dates', () => {
  const off = (opts: Record<string, unknown>) => {
    const dp = createDatePicker({ ...base, ...opts })
    return (iso: string) => dp.isDateDisabled(iso)
  }

  it('disables past or future dates', () => {
    const past = off({ disabled: { before: TODAY } })
    expect([past('2026-09-28'), past(TODAY), past('2026-12-01')]).toEqual([true, false, false])
    const future = off({ disabled: { after: TODAY } })
    expect([future('2026-09-28'), future(TODAY), future('2026-09-30')]).toEqual([
      false,
      false,
      true,
    ])
  })

  it('disables specific dates, ranges, weekdays and outside a window', () => {
    const d = off({
      disabled: [
        '2026-12-25',
        new Date(2026, 11, 31),
        { toString: () => '2027-01-01' },
        { from: '2026-10-01', to: '2026-10-07' },
        { dayOfWeek: [5] },
        (iso: string) => iso === '2026-11-11',
      ],
    })
    expect(['2026-12-25', '2026-12-31', '2027-01-01', '2026-10-01', '2026-10-07'].map(d)).toEqual([
      true,
      true,
      true,
      true,
      true,
    ])
    expect(d('2026-10-08')).toBe(false)
    expect(d('2026-10-09')).toBe(true) // a Friday
    expect(d('2026-11-11')).toBe(true)
    const window = off({ disabled: { before: '2026-09-01', after: '2026-09-30' } })
    expect([window('2026-08-31'), window('2026-09-15'), window('2026-10-01')]).toEqual([
      true,
      false,
      true,
    ])
    const open = off({ disabled: { from: '2026-10-01' } })
    expect([open('2026-09-30'), open('2030-01-01')]).toEqual([false, true])
  })

  it('keeps disabled dates focusable but not selectable, and blocks ranges across them', () => {
    const dp = createDatePicker({
      ...base,
      mode: 'range',
      disabled: { from: '2026-09-15', to: '2026-09-16' },
    })
    const day = dp
      .getMonths()[0]
      .weeks.flat()
      .find((x) => x.date === '2026-09-15')!
    expect(day.isDisabled).toBe(true)
    expect(dp.getDayProps(day)['aria-disabled']).toBe('true')
    expect(dp.getDayProps(day)['aria-label']).toContain('unavailable')
    dp.focus('2026-09-15')
    expect(dp.getState().focusedDate).toBe('2026-09-15')
    dp.select('2026-09-10')
    dp.select('2026-09-20')
    expect(dp.getValue()).toEqual({ start: '2026-09-20', end: null })
  })
})

describe('month and year dropdowns', () => {
  const change = (props: Record<string, any>, value: number) =>
    props.onChange({ currentTarget: { value: String(value) } })

  it('jumps straight to a month or year, keeping the day of month', () => {
    const dp = createDatePicker(base)
    expect(dp.getMonthOptions().map((m) => m.label)[0]).toBe('January')
    expect(dp.getMonthSelectProps()).toMatchObject({ 'aria-label': 'Month', value: '8' })
    expect(dp.getYearSelectProps().value).toBe('2026')
    change(dp.getYearSelectProps(), 1990)
    expect(dp.getState().focusedDate).toBe('1990-09-29')
    change(dp.getMonthSelectProps(), 1)
    expect(dp.getState().focusedDate).toBe('1990-02-28')
    expect(dp.getMonths()[0].label).toBe('February 1990')
  })

  it('offers a sensible year range, clamped by min / max and the years option', () => {
    const years = createDatePicker(base).getYearOptions()
    expect(years[0].value).toBe(1926)
    expect(years.at(-1)!.value).toBe(2076)
    const bounded = createDatePicker({ ...base, min: '2026-03-10', max: '2028-01-01' })
    expect(bounded.getYearOptions().map((y) => y.value)).toEqual([2026, 2027, 2028])
    expect(
      bounded
        .getMonthOptions()
        .filter((m) => m.disabled)
        .map((m) => m.value),
    ).toEqual([0, 1])
    const custom = createDatePicker({ ...base, years: { from: 2020, to: 2030 } })
    expect(custom.getYearOptions()).toHaveLength(11)
  })

  it('works in the Hijri calendar with localised labels', () => {
    const dp = createDatePicker({ ...base, locale: 'ar-SA', calendar: 'islamic-umalqura' })
    expect(dp.getYearSelectProps()).toMatchObject({ 'aria-label': 'Year', value: '1448' })
    expect(dp.getMonthOptions()).toHaveLength(12)
    expect(dp.getYearOptions().find((y) => y.value === 1448)!.label).toBe('١٤٤٨')
    change(dp.getMonthSelectProps(), 8) // Ramadan
    expect(dp.getMonths()[0].label).toContain('رمضان')
    change(dp.getYearSelectProps(), 1450)
    expect(dp.getMonths()[0].label).toContain('١٤٥٠')
  })

  it('handles the 13-month Hebrew leap year', () => {
    const dp = createDatePicker({ ...base, calendar: 'hebrew', today: '2024-01-15' })
    expect(dp.getMonthOptions()).toHaveLength(13) // 5784 is a leap year
    dp.goToYear(5785)
    expect(dp.getMonthOptions()).toHaveLength(12)
  })
})

describe('keyboard navigation', () => {
  it('moves by day, week, month and year', () => {
    const dp = createDatePicker(base)
    const press = (k: string, extra?: Partial<KeyboardEvent>) => {
      const day = dp
        .getMonths()[0]
        .weeks.flat()
        .find((d) => d.isFocused)!
      dp.getDayProps(day).onKeyDown(key(k, extra))
      return dp.getState().focusedDate
    }
    expect(press('ArrowRight')).toBe('2026-09-30')
    expect(press('ArrowRight')).toBe('2026-10-01')
    expect(dp.getMonths()[0].label).toBe('October 2026')
    expect(press('ArrowUp')).toBe('2026-09-24')
    expect(press('Home')).toBe('2026-09-20')
    expect(press('End')).toBe('2026-09-26')
    expect(press('PageDown')).toBe('2026-10-26')
    expect(press('PageUp', { shiftKey: true })).toBe('2025-10-26')
  })

  it('flips horizontal arrows in RTL', () => {
    const dp = createDatePicker({ ...base, locale: 'ar-SA' })
    const day = dp
      .getMonths()[0]
      .weeks.flat()
      .find((d) => d.isFocused)!
    dp.getDayProps(day).onKeyDown(key('ArrowLeft'))
    expect(dp.getState().focusedDate).toBe('2026-09-30')
  })

  it('clamps to min / max and disables month buttons', () => {
    const dp = createDatePicker({ ...base, min: '2026-09-10', max: '2026-09-30' })
    dp.focus('2026-01-01')
    expect(dp.getState().focusedDate).toBe('2026-09-10')
    expect(dp.getPrevButtonProps()['aria-disabled']).toBe('true')
    expect(dp.getNextButtonProps()['aria-disabled']).toBe('true')
  })

  it('announces month changes', () => {
    const dp = createDatePicker({ ...base, announce: 'manual' })
    dp.nextMonth()
    expect(dp.getState().announcement).toBe('October 2026')
  })
})

describe('selection', () => {
  it('single: selects, reports and ignores disabled dates', () => {
    const onValueChange = vi.fn()
    const dp = createDatePicker({
      ...base,
      onValueChange,
      isDateDisabled: (d) => d === '2026-09-15',
    })
    dp.select('2026-09-15')
    expect(dp.getValue()).toBeNull()
    dp.select('2026-09-16')
    expect(dp.getValue()).toBe('2026-09-16')
    expect(onValueChange).toHaveBeenCalledWith('2026-09-16', { date: '2026-09-16', source: 'api' })
    expect(dp.getValueText()).toBe('Sep 16, 2026')
  })

  it('range: orders ends, previews, and restarts across disabled days', () => {
    const dp = createDatePicker({
      ...base,
      mode: 'range',
      isDateDisabled: (d) => d === '2026-09-20',
    })
    dp.select('2026-09-12')
    dp.focus('2026-09-14')
    const days = dp.getMonths()[0].weeks.flat()
    expect(days.filter((d) => d.isInPreview).map((d) => d.date)).toEqual([
      '2026-09-12',
      '2026-09-13',
      '2026-09-14',
    ])
    dp.select('2026-09-10')
    expect(dp.getValue()).toEqual({ start: '2026-09-10', end: '2026-09-12' })
    dp.select('2026-09-18')
    dp.select('2026-09-22')
    expect(dp.getValue()).toEqual({ start: '2026-09-22', end: null })
  })

  it('multiple: toggles and caps', () => {
    const dp = createDatePicker({ ...base, mode: 'multiple', maxSelections: 2 })
    dp.select('2026-09-03')
    dp.select('2026-09-01')
    dp.select('2026-09-05')
    expect(dp.getValue()).toEqual(['2026-09-01', '2026-09-03'])
    dp.select('2026-09-01')
    expect(dp.getValue()).toEqual(['2026-09-03'])
  })

  it('controlled: never mutates its own value', () => {
    const onValueChange = vi.fn()
    const dp = createDatePicker({ ...base, value: '2026-09-01', onValueChange })
    dp.select('2026-09-02')
    expect(dp.getValue()).toBe('2026-09-01')
    expect(onValueChange).toHaveBeenCalledWith('2026-09-02', expect.anything())
  })

  it('accepts Date and Temporal-like values', () => {
    const dp = createDatePicker({
      ...base,
      mode: 'range',
      defaultValue: { start: new Date(2026, 8, 1), end: { toString: () => '2026-09-05' } },
    })
    expect(dp.getValue()).toEqual({ start: '2026-09-01', end: '2026-09-05' })
    expect(dp.getHiddenInputProps({ name: 'stay' })).toEqual({
      type: 'hidden',
      name: 'stay',
      value: '2026-09-01/2026-09-05',
    })
  })
})

describe('text input', () => {
  const type = (dp: ReturnType<typeof createDatePicker<any>>, text: string) => {
    dp.getInputProps().onInput({ currentTarget: { value: text } })
    dp.getInputProps().onKeyDown(key('Enter'))
  }

  it('parses, formats and flags invalid input', () => {
    const dp = createDatePicker(base)
    type(dp, '10/05/2026')
    expect(dp.getValue()).toBe('2026-10-05')
    expect(dp.getInputProps().value).toBe('10/05/2026')
    expect(dp.getMonths()[0].label).toBe('October 2026')
    type(dp, 'garbage')
    expect(dp.getInputProps()['aria-invalid']).toBe('true')
    expect(dp.getValue()).toBe('2026-10-05')
    type(dp, '')
    expect(dp.getValue()).toBeNull()
  })

  it('parses ranges', () => {
    const dp = createDatePicker({ ...base, mode: 'range' })
    type(dp, '10/05/2026 – 10/01/2026')
    expect(dp.getValue()).toEqual({ start: '2026-10-01', end: '2026-10-05' })
  })
})

describe('accessibility props', () => {
  it('wires trigger, dialog and grid', () => {
    const dp = createDatePicker({ ...base, id: 'x', mode: 'multiple' })
    const [month] = dp.getMonths()
    expect(dp.getTriggerProps()).toMatchObject({
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
    })
    expect(dp.getTriggerProps()['aria-controls']).toBeUndefined()
    dp.setOpen(true)
    expect(dp.getTriggerProps()['aria-controls']).toBe('x-dialog')
    dp.setOpen(false)
    expect(dp.getDialogProps()).toMatchObject({
      id: 'x-dialog',
      role: 'dialog',
      'aria-modal': 'true',
    })
    expect(dp.getGridProps(month)).toMatchObject({
      role: 'grid',
      'aria-labelledby': month.labelId,
      'aria-multiselectable': 'true',
    })
    const today = month.weeks.flat().find((d) => d.isToday)!
    expect(dp.getDayProps(today)).toMatchObject({
      tabIndex: 0,
      'aria-current': 'date',
      'aria-label': 'Today, Tuesday, September 29, 2026',
    })
    expect(dp.getCellProps(today)['aria-selected']).toBe('false')
  })

  it('lets every label be overridden', () => {
    const dp = createDatePicker({
      ...base,
      labels: { prevMonth: 'Back', day: (d) => `Pick ${d.date}` },
    })
    const day = dp.getMonths()[0].weeks[1][0]
    expect(dp.getPrevButtonProps()['aria-label']).toBe('Back')
    expect(dp.getDayProps(day)['aria-label']).toBe(`Pick ${day.date}`)
  })

  it('opens, closes on Escape and reports open changes', () => {
    const onOpenChange = vi.fn()
    const dp = createDatePicker({ ...base, onOpenChange })
    dp.getTriggerProps().onClick()
    expect(dp.isOpen()).toBe(true)
    dp.getDialogProps().onKeyDown({ ...key('Escape'), stopPropagation: vi.fn() })
    expect(dp.isOpen()).toBe(false)
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('closes after picking in single mode', () => {
    const dp = createDatePicker({ ...base, defaultOpen: true })
    dp.select('2026-09-10')
    expect(dp.isOpen()).toBe(false)
  })
})
