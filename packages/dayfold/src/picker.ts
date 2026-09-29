import { addMonths, fromParts, getParts, monthLength, monthStart } from './calendar'
import { DAY_MS, type ISODate, isoToEpoch, today, toISO, toISODate, weekday } from './date'
import { defaultLabels, type Labels } from './labels'
import { getDirection, getWeekend, getWeekStart } from './locale'
import { parseDate, placeholderFor } from './parse'
import type {
  CalendarDay,
  CalendarMonth,
  DateMatcher,
  DatePickerOptions,
  DatePickerState,
  DateRange,
  Props,
  SelectionMode,
  SelectOption,
  ValueChangeDetails,
  ValueInput,
  ValueOf,
  Weekday,
} from './types'

let uid = 0
const fmtCache = new Map<string, Intl.DateTimeFormat>()

const flag = (on: boolean | undefined) => (on ? '' : undefined)
const bool = (on: boolean) => (on ? 'true' : 'false')
const hasDOM = () => typeof document !== 'undefined'
// A macrotask runs after React / Vue have committed the update (both flush in microtasks),
// and unlike requestAnimationFrame it still fires in background tabs.
const later = (fn: () => void) => setTimeout(fn, 0)

let liveRegion: HTMLElement | undefined

/** Announces a message through a shared, visually hidden `role="status"` region. */
export function announce(message: string): void {
  if (!hasDOM() || !message) return
  if (!liveRegion?.isConnected) {
    liveRegion = document.createElement('div')
    liveRegion.setAttribute('role', 'status')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('data-dayfold-live', '')
    Object.assign(liveRegion.style, visuallyHidden)
    document.body.append(liveRegion)
  }
  const region = liveRegion
  region.textContent = ''
  setTimeout(() => {
    region.textContent = message
  }, 50)
}

/** Styles that hide an element visually while keeping it available to screen readers. */
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: '0',
} as const

const FOCUSABLE =
  'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'

/**
 * Creates a headless date picker. It renders nothing: it gives you calendar data
 * (`getMonths()`, `getWeekdays()`), state, actions, and prop getters that wire up
 * ARIA roles, keyboard navigation and focus management on *your* markup.
 */
export function createDatePicker<M extends SelectionMode = 'single'>(
  initial: DatePickerOptions<M> = {},
) {
  let o = initial
  const id = o.id ?? `dayfold-${++uid}`
  const ids = {
    trigger: `${id}-trigger`,
    dialog: `${id}-dialog`,
    input: `${id}-input`,
    label: `${id}-label`,
    live: `${id}-live`,
  }
  const listeners = new Set<() => void>()

  // ---------- configuration (read lazily so setOptions() takes effect) ----------
  const mode = (): SelectionMode => o.mode ?? 'single'
  const cal = () => o.calendar ?? 'gregory'
  const loc = () => o.locale ?? new Intl.DateTimeFormat().resolvedOptions().locale
  const dir = () => o.dir ?? getDirection(loc())
  const weekStart = () => o.weekStartsOn ?? getWeekStart(loc())
  const labels = (): Labels => ({ ...defaultLabels, ...o.labels })
  const todayISO = () => toISODate(o.today) ?? today()
  const minE = () => {
    const d = toISODate(o.min)
    return d ? isoToEpoch(d) : Number.NEGATIVE_INFINITY
  }
  const maxE = () => {
    const d = toISODate(o.max)
    return d ? isoToEpoch(d) : Number.POSITIVE_INFINITY
  }
  const monthsShown = () => Math.max(1, o.numberOfMonths ?? 1)

  const fmt = (opts: Intl.DateTimeFormatOptions, calendar = cal()) => {
    const key = `${loc()}|${calendar}|${o.numberingSystem}|${JSON.stringify(opts)}`
    let f = fmtCache.get(key)
    if (!f) {
      f = new Intl.DateTimeFormat(loc(), {
        calendar,
        numberingSystem: o.numberingSystem,
        timeZone: 'UTC',
        ...opts,
      })
      fmtCache.set(key, f)
    }
    return f
  }
  const format = (iso: ISODate, opts: Intl.DateTimeFormatOptions, calendar?: string) =>
    fmt(opts, calendar).format(isoToEpoch(iso) * DAY_MS)
  const inputFormat = (): Intl.DateTimeFormatOptions =>
    o.inputFormat ?? { year: 'numeric', month: '2-digit', day: '2-digit' }

  // ---------- value ----------
  const normalize = (v: ValueInput<M> | undefined): ValueOf<M> => {
    const m = mode()
    if (m === 'multiple') {
      const list = ((v as unknown[]) ?? []).map((d) => toISODate(d as string)).filter(Boolean)
      return [...new Set(list)].sort() as ValueOf<M>
    }
    if (m === 'range') {
      const r = v as { start?: string; end?: string } | null | undefined
      if (!r) return null as ValueOf<M>
      const start = toISODate(r.start)
      const end = toISODate(r.end)
      return (start || end ? { start: start ?? end, end: start ? end : null } : null) as ValueOf<M>
    }
    return toISODate(v as string) as ValueOf<M>
  }

  const isControlled = () => o.value !== undefined
  const getValue = (): ValueOf<M> => (isControlled() ? normalize(o.value) : state.value)

  const selectedDates = (): ISODate[] => {
    const v = getValue() as ISODate | ISODate[] | DateRange | null
    if (!v) return []
    if (Array.isArray(v)) return v
    if (typeof v === 'string') return [v]
    return [v.start, v.end].filter(Boolean) as ISODate[]
  }

  // `disabled` matchers compiled once per option value into epoch-day predicates.
  let compiledFor: unknown
  let compiled: Array<(e: number) => boolean> = []
  const epochOr = (d: unknown, fallback: number) => {
    const iso = toISODate(d as string)
    return iso ? isoToEpoch(iso) : fallback
  }
  const compile = (m: DateMatcher): ((e: number) => boolean) => {
    if (typeof m === 'function') return (e) => m(toISO(e))
    if (m && typeof m === 'object' && !(m instanceof Date)) {
      const r = m as Record<string, unknown>
      if (Array.isArray(r.dayOfWeek)) {
        const days = r.dayOfWeek as number[]
        return (e) => days.includes(weekday(e))
      }
      if ('from' in r || 'to' in r) {
        const a = epochOr(r.from, Number.NEGATIVE_INFINITY)
        const b = epochOr(r.to, Number.POSITIVE_INFINITY)
        return (e) => e >= a && e <= b
      }
      if ('before' in r || 'after' in r) {
        const a = epochOr(r.before, Number.NEGATIVE_INFINITY)
        const b = epochOr(r.after, Number.POSITIVE_INFINITY)
        return (e) => e < a || e > b
      }
    }
    const day = epochOr(m, Number.NaN)
    return (e) => e === day
  }
  /** Disabled by `disabled` / `isDateDisabled` (not by min / max). */
  const blocked = (e: number) => {
    if (compiledFor !== o.disabled) {
      compiledFor = o.disabled
      const list = o.disabled == null ? [] : Array.isArray(o.disabled) ? o.disabled : [o.disabled]
      compiled = list.map(compile)
    }
    return compiled.some((test) => test(e)) || !!o.isDateDisabled?.(toISO(e))
  }
  const isDisabledE = (e: number) => e < minE() || e > maxE() || blocked(e)
  const clamp = (e: number) => Math.min(maxE(), Math.max(minE(), e))

  const formatValue = (opts: Intl.DateTimeFormatOptions): string | null => {
    const v = getValue() as ISODate | ISODate[] | DateRange | null
    if (!v) return null
    if (typeof v === 'string') return format(v, opts)
    if (Array.isArray(v)) return v.length ? v.map((d) => format(d, opts)).join(', ') : null
    if (v.start && v.end) {
      return fmt(opts).formatRange(isoToEpoch(v.start) * DAY_MS, isoToEpoch(v.end) * DAY_MS)
    }
    return v.start ? `${format(v.start, opts)} –` : null
  }
  /** Human readable value, e.g. "Sep 29, 2026" or "Sep 29 – Oct 3, 2026". */
  const getValueText = () => formatValue({ dateStyle: 'medium' })

  // ---------- state ----------
  /** Nearest selectable day to `e` (within a year either side), else `e` clamped. */
  const nearestEnabled = (e: number) => {
    const c = clamp(e)
    for (let i = 0; i <= 366; i++) {
      if (!isDisabledE(c + i)) return c + i
      if (!isDisabledE(c - i)) return c - i
    }
    return c
  }

  const initialFocus = () => {
    const v = selectedDates()
    const d = toISODate(o.defaultFocusedDate) ?? v[0] ?? todayISO()
    return toISO(nearestEnabled(isoToEpoch(d)))
  }

  /** The value contains a date that is now disabled (e.g. options changed at runtime). */
  const hasInvalidValue = () => selectedDates().some((d) => isDisabledE(isoToEpoch(d)))

  let state: DatePickerState<M> = {
    value: normalize(o.defaultValue),
    focusedDate: '',
    visibleDate: '',
    open: !!o.defaultOpen,
    hoveredDate: null,
    inputText: null,
    inputInvalid: false,
    announcement: '',
  }
  state.focusedDate = state.visibleDate = initialFocus()

  const emit = () => {
    for (const l of listeners) l()
  }
  const set = (patch: Partial<DatePickerState<M>>) => {
    state = { ...state, ...patch }
    emit()
  }
  const say = (message: string) => {
    if (o.announce === false) return
    state = { ...state, announcement: message }
    if ((o.announce ?? 'auto') === 'auto') announce(message)
  }

  // ---------- visible window ----------
  /** First-visible-month start, adjusted so the focused date is always on screen. */
  const firstMonth = (): number => {
    const c = cal()
    const n = monthsShown()
    const focus = isoToEpoch(state.focusedDate)
    let first = monthStart(c, isoToEpoch(state.visibleDate))
    const last = monthStart(c, addMonths(c, first, n - 1))
    if (focus < first) first = monthStart(c, focus)
    else if (focus >= last + monthLength(c, last)) first = monthStart(c, addMonths(c, focus, 1 - n))
    return first
  }

  const monthLabel = (start: number) => format(toISO(start), { month: 'long', year: 'numeric' })

  const visibleLabel = () => {
    const c = cal()
    const first = firstMonth()
    const n = monthsShown()
    const label = monthLabel(first)
    return n > 1 ? `${label} – ${monthLabel(monthStart(c, addMonths(c, first, n - 1)))}` : label
  }

  const scheduleFocus = (date: ISODate) => {
    if (o.focusDay) return later(() => o.focusDay?.(date))
    if (!hasDOM()) return
    later(() => {
      document
        .querySelector<HTMLElement>(
          `[data-dayfold-day="${id}"][data-date="${date}"]:not([data-outside])`,
        )
        ?.focus()
    })
  }

  /** Moves keyboard focus (and the visible month, if needed) to a date. */
  const focus = (date: ISODate | number, opts: { moveFocus?: boolean } = {}) => {
    const e = clamp(typeof date === 'number' ? date : isoToEpoch(date))
    const iso = toISO(e)
    const before = firstMonth()
    state = { ...state, focusedDate: iso }
    const after = firstMonth()
    state = { ...state, visibleDate: toISO(after) }
    if (after !== before) say(labels().monthChanged(visibleLabel()))
    emit()
    if (opts.moveFocus) scheduleFocus(iso)
  }

  /** Shifts the visible months by `n` (negative = back), keeping focus in view. */
  const goToMonth = (n: number) => {
    const c = cal()
    const first = addMonths(c, firstMonth(), n)
    const focusTarget = clamp(addMonths(c, isoToEpoch(state.focusedDate), n))
    state = { ...state, visibleDate: toISO(first), focusedDate: toISO(focusTarget) }
    say(labels().monthChanged(visibleLabel()))
    emit()
  }

  /** Jumps the view (and focus) to the month containing epoch day `e`, keeping the day of month. */
  const jumpTo = (e: number) => {
    const c = cal()
    const start = monthStart(c, e)
    const day = getParts(c, isoToEpoch(state.focusedDate)).day
    const target = clamp(start + Math.min(day, monthLength(c, start)) - 1)
    state = { ...state, focusedDate: toISO(target), visibleDate: toISO(target) }
    say(labels().monthChanged(visibleLabel()))
    emit()
  }

  /** Month starts of the calendar year shown first (12 or 13 of them). */
  const yearMonths = (): number[] => {
    const c = cal()
    let s = firstMonth()
    const year = getParts(c, s).year
    while (getParts(c, s - 1).year === year) s = monthStart(c, s - 1)
    const list: number[] = []
    for (; getParts(c, s).year === year; s += monthLength(c, s)) list.push(s)
    return list
  }

  const getMonthOptions = (): SelectOption[] =>
    yearMonths().map((start, value) => ({
      value,
      label: format(toISO(start), { month: 'long' }),
      disabled: start + monthLength(cal(), start) - 1 < minE() || start > maxE(),
    }))

  const yearOf = (e: number) => getParts(cal(), e).year

  const getYearOptions = (): SelectOption[] => {
    const now = yearOf(isoToEpoch(todayISO()))
    const shown = yearOf(firstMonth())
    const lo = Number.isFinite(minE()) ? yearOf(minE()) : undefined
    const hi = Number.isFinite(maxE()) ? yearOf(maxE()) : undefined
    const from = Math.min(o.years?.from ?? lo ?? now - 100, shown)
    const to = Math.max(o.years?.to ?? hi ?? now + 50, shown)
    const num = new Intl.NumberFormat(loc(), {
      numberingSystem: o.numberingSystem,
      useGrouping: false,
    })
    const options: SelectOption[] = []
    for (let y = from; y <= to; y++) {
      options.push({
        value: y,
        label: num.format(y),
        disabled: (lo != null && y < lo) || (hi != null && y > hi),
      })
    }
    return options
  }

  /** Shows the given year (calendar numbering), keeping the current month and day where possible. */
  const goToYear = (year: number) => {
    const c = cal()
    const cur = firstMonth()
    const p = getParts(c, cur)
    if (p.year === year) return
    let target = Number.isFinite(p.month) ? fromParts(c, year, p.month, 1) : null
    // Month names only (Hebrew) or a month missing that year: step by 12 months.
    target ??= addMonths(c, cur, (year - p.year) * 12)
    jumpTo(target)
  }

  /** Shows the `index`-th month (0-based) of the year currently in view. */
  const goToMonthIndex = (index: number) => {
    const start = yearMonths()[index]
    if (start != null) jumpTo(start)
  }

  const canGoBack = () => firstMonth() - 1 >= minE()
  const canGoForward = () => {
    const c = cal()
    const last = monthStart(c, addMonths(c, firstMonth(), monthsShown() - 1))
    return last + monthLength(c, last) <= maxE()
  }

  // ---------- selection ----------
  const commit = (next: ValueOf<M>, details: ValueChangeDetails) => {
    if (!isControlled()) state = { ...state, value: next }
    state = { ...state, inputText: null, inputInvalid: false }
    // In controlled mode the parent has not applied `next` yet, so describe it directly.
    say(labels().selectionChanged(isControlled() ? proposedText(next) : getValueText()))
    emit()
    o.onValueChange?.(next, details)
  }

  const proposedText = (next: ValueOf<M>) => {
    const saved = o
    o = { ...o, value: next as ValueInput<M> }
    const text = getValueText()
    o = saved
    return text
  }

  const rangeHasDisabled = (a: number, b: number) => {
    if ((!o.isDateDisabled && o.disabled == null) || o.allowDisabledInRange) return false
    for (let e = a; e <= b && e - a < 3700; e++) if (blocked(e)) return true
    return false
  }

  /** Selects (or toggles, in multiple mode) a date, as if the user picked it. */
  const select = (date: ISODate, source: ValueChangeDetails['source'] = 'api') => {
    const iso = toISODate(date)
    if (!iso) return
    const e = isoToEpoch(iso)
    if (isDisabledE(e)) return
    const m = mode()
    const current = getValue() as ISODate | ISODate[] | DateRange | null
    let next: unknown = iso
    let done = true
    if (m === 'multiple') {
      const list = (current as ISODate[]) ?? []
      if (list.includes(iso)) next = list.filter((d) => d !== iso)
      else if (o.maxSelections && list.length >= o.maxSelections) return
      else next = [...list, iso].sort()
      done = false
    } else if (m === 'range') {
      const r = current as DateRange | null
      if (!r?.start || r.end) {
        next = { start: iso, end: null }
        done = false
      } else {
        const s = isoToEpoch(r.start)
        const [a, b] = s <= e ? [s, e] : [e, s]
        if (rangeHasDisabled(a, b)) {
          next = { start: iso, end: null }
          done = false
        } else next = { start: toISO(a), end: toISO(b) }
      }
    }
    state = { ...state, focusedDate: iso, hoveredDate: null }
    // Keep focus on the picked day even if the host re-renders its button.
    const hadFocus = hasDOM() && document.activeElement?.getAttribute('data-dayfold-day') === id
    commit(next as ValueOf<M>, { date: iso, source })
    if (done && (o.closeOnSelect ?? true) && isOpen()) setOpen(false, { restoreFocus: true })
    else if (hadFocus) scheduleFocus(iso)
  }

  const clear = () => {
    const m = mode()
    commit((m === 'multiple' ? [] : null) as ValueOf<M>, { date: null, source: 'clear' })
  }

  // ---------- popup ----------
  const isOpen = () => o.open ?? state.open

  const onOutside = (event: Event) => {
    const path = event.composedPath()
    const inside = [ids.dialog, ids.trigger, ids.input].some((key) => {
      const el = document.getElementById(key)
      return el && path.includes(el)
    })
    if (!inside) setOpen(false)
  }

  const setOpen = (open: boolean, opts: { restoreFocus?: boolean } = {}) => {
    if (open === isOpen()) return
    if (o.open === undefined) state = { ...state, open }
    if (open) {
      // Open on the selection, otherwise on the nearest selectable day — options such as
      // `disabled: { before: start }` may have changed since the picker was created.
      const selected = selectedDates()[0]
      const target =
        selected && !isDisabledE(isoToEpoch(selected))
          ? selected
          : toISO(nearestEnabled(isoToEpoch(toISODate(o.defaultFocusedDate) ?? state.focusedDate)))
      state = { ...state, focusedDate: target, visibleDate: target }
      scheduleFocus(state.focusedDate)
      if (hasDOM() && (o.closeOnOutsideClick ?? true)) {
        document.addEventListener('pointerdown', onOutside, true)
      }
    } else {
      if (hasDOM()) document.removeEventListener('pointerdown', onOutside, true)
      if (opts.restoreFocus && hasDOM()) later(() => document.getElementById(ids.trigger)?.focus())
    }
    emit()
    o.onOpenChange?.(open)
  }

  // ---------- input ----------
  const inputText = () => state.inputText ?? formatValue(inputFormat()) ?? ''

  const parseOne = (text: string): ISODate | null => {
    const ctx = { locale: loc(), calendar: cal(), today: todayISO() }
    const iso = (o.parse ?? parseDate)(text, ctx)
    return iso && !isDisabledE(isoToEpoch(iso)) ? iso : null
  }

  const commitInput = () => {
    const text = state.inputText
    if (text == null) return
    if (!text.trim()) return clear()
    const m = mode()
    let next: unknown
    let focusTo: ISODate | null = null
    if (m === 'single') {
      next = focusTo = parseOne(text)
    } else {
      const parts = text.split(m === 'range' ? /\s+[-–—~]\s+|\s*[–—~]\s*|\s+to\s+/ : /\s*[,،;]\s*/)
      const dates = parts.filter((p) => p.trim()).map(parseOne)
      if (dates.length && dates.every(Boolean)) {
        const list = [...new Set(dates as ISODate[])].sort()
        focusTo = list[0]
        next =
          m === 'range'
            ? list.length <= 2
              ? { start: list[0], end: list[1] ?? null }
              : null
            : list
        if (
          m === 'range' &&
          next &&
          rangeHasDisabled(isoToEpoch(list[0]), isoToEpoch(list.at(-1)!))
        )
          next = null
      }
    }
    if (!next || !focusTo) return set({ inputInvalid: true })
    state = { ...state, focusedDate: focusTo, visibleDate: focusTo }
    commit(next as ValueOf<M>, { date: focusTo, source: 'input' })
  }

  // ---------- calendar data ----------
  const buildDay = (e: number, isOutside: boolean, ctx: DayContext): CalendarDay => {
    const date = toISO(e)
    const c = cal()
    const parts = getParts(c, e)
    const sec = o.secondaryCalendar
    const day: CalendarDay = {
      date,
      day: parts.day,
      label: ctx.num.format(parts.day),
      fullLabel: ctx.full.format(e * DAY_MS),
      weekday: weekday(e),
      isToday: e === ctx.today,
      isSelected: ctx.selected.has(e),
      isDisabled: isDisabledE(e),
      isOutside,
      isFocused: e === ctx.focus && !isOutside,
      isWeekend: ctx.weekend.includes(weekday(e)),
      isRangeStart: e === ctx.rangeStart,
      isRangeEnd: e === ctx.rangeEnd,
      isInRange: e >= ctx.rangeStart && e <= ctx.rangeEnd,
      isInPreview: e >= ctx.previewA && e <= ctx.previewB,
    }
    if (sec) {
      day.secondaryLabel = ctx.num.format(getParts(sec, e).day)
      day.secondaryFullLabel = format(date, { day: 'numeric', month: 'long', year: 'numeric' }, sec)
    }
    return day
  }

  interface DayContext {
    num: Intl.NumberFormat
    full: Intl.DateTimeFormat
    today: number
    focus: number
    selected: Set<number>
    weekend: number[]
    rangeStart: number
    rangeEnd: number
    previewA: number
    previewB: number
  }

  const dayContext = (): DayContext => {
    const v = getValue() as DateRange | null
    const range = mode() === 'range' && v ? v : null
    const rs = range?.start ? isoToEpoch(range.start) : Number.NaN
    const re = range?.end ? isoToEpoch(range.end) : range?.start ? rs : Number.NaN
    const hover = state.hoveredDate ?? state.focusedDate
    let previewA = Number.NaN
    let previewB = Number.NaN
    if (range?.start && !range.end && hover) {
      const h = isoToEpoch(hover)
      ;[previewA, previewB] = h < rs ? [h, rs] : [rs, h]
    }
    return {
      num: new Intl.NumberFormat(loc(), { numberingSystem: o.numberingSystem, useGrouping: false }),
      full: fmt({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      today: isoToEpoch(todayISO()),
      focus: isoToEpoch(state.focusedDate),
      selected: new Set(selectedDates().map(isoToEpoch)),
      weekend: getWeekend(loc()),
      rangeStart: rs,
      rangeEnd: re,
      previewA,
      previewB,
    }
  }

  /** The visible months with their weeks and days, ready to render. */
  const getMonths = (): CalendarMonth[] => {
    const c = cal()
    const ctx = dayContext()
    const ws = weekStart()
    const months: CalendarMonth[] = []
    let start = firstMonth()
    for (let i = 0; i < monthsShown(); i++) {
      const len = monthLength(c, start)
      const end = start + len - 1
      const lead = (weekday(start) - ws + 7) % 7
      const rows = (o.fixedWeeks ?? true) ? 6 : Math.ceil((lead + len) / 7)
      const weeks: CalendarDay[][] = []
      for (let r = 0; r < rows; r++) {
        const week: CalendarDay[] = []
        for (let d = 0; d < 7; d++) {
          const e = start - lead + r * 7 + d
          week.push(buildDay(e, e < start || e > end, ctx))
        }
        weeks.push(week)
      }
      const month: CalendarMonth = {
        start: toISO(start),
        end: toISO(end),
        label: monthLabel(start),
        labelId: `${id}-month-${i}`,
        weeks,
      }
      const sec = o.secondaryCalendar
      if (sec) {
        // Built by hand: formatRange separators differ between ICU builds (SSR hydration).
        const a = getParts(sec, start)
        const b = getParts(sec, end)
        const long = { month: 'long', year: 'numeric' } as const
        month.secondaryLabel =
          a.month === b.month && a.year === b.year
            ? format(month.start, long, sec)
            : `${format(month.start, a.year === b.year ? { month: 'long' } : long, sec)} – ${format(month.end, long, sec)}`
      }
      months.push(month)
      start = end + 1
    }
    return months
  }

  /** Weekday headers in display order. */
  const getWeekdays = (): Weekday[] => {
    const ws = weekStart()
    return Array.from({ length: 7 }, (_, i) => {
      const wd = (ws + i) % 7
      const time = (3 + wd) * DAY_MS // 1970-01-04 was a Sunday
      return {
        weekday: wd,
        narrow: fmt({ weekday: 'narrow' }).format(time),
        short: fmt({ weekday: 'short' }).format(time),
        long: fmt({ weekday: 'long' }).format(time),
      }
    })
  }

  // ---------- keyboard ----------
  const onDayKeyDown = (event: KeyboardEvent) => {
    const c = cal()
    const cur = isoToEpoch(state.focusedDate)
    const back = dir() === 'rtl' ? 1 : -1
    const fromWeekStart = (weekday(cur) - weekStart() + 7) % 7
    let target: number
    switch (event.key) {
      case 'ArrowLeft':
        target = cur + back
        break
      case 'ArrowRight':
        target = cur - back
        break
      case 'ArrowUp':
        target = cur - 7
        break
      case 'ArrowDown':
        target = cur + 7
        break
      case 'Home':
        target = cur - fromWeekStart
        break
      case 'End':
        target = cur + 6 - fromWeekStart
        break
      case 'PageUp':
        target = addMonths(c, cur, event.shiftKey ? -12 : -1)
        break
      case 'PageDown':
        target = addMonths(c, cur, event.shiftKey ? 12 : 1)
        break
      default:
        return
    }
    event.preventDefault()
    if (state.hoveredDate) state = { ...state, hoveredDate: null }
    focus(target, { moveFocus: true })
  }

  const onDialogKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false, { restoreFocus: true })
      return
    }
    if (event.key !== 'Tab' || o.modal === false) return
    const root = event.currentTarget as HTMLElement
    const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.tabIndex >= 0 && !el.hasAttribute('disabled'),
    )
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !root.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // ---------- prop getters ----------
  const dayFlags = (d: CalendarDay) => ({
    'data-selected': flag(d.isSelected),
    'data-today': flag(d.isToday),
    'data-disabled': flag(d.isDisabled),
    'data-outside': flag(d.isOutside),
    'data-weekend': flag(d.isWeekend),
    'data-focused': flag(d.isFocused),
    'data-range-start': flag(d.isRangeStart),
    'data-range-end': flag(d.isRangeEnd),
    'data-in-range': flag(d.isInRange),
    'data-preview': flag(d.isInPreview),
  })

  const api = {
    id,
    /** Current state snapshot (immutable; replaced on every change). */
    getState: () => state,
    /** Subscribe to state changes. Returns an unsubscribe function. */
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    /** Replaces the options without notifying (adapters call this during render). */
    setOptions(next: DatePickerOptions<M>) {
      o = next
    },
    /** Replaces the options and notifies subscribers. */
    update(next: DatePickerOptions<M>) {
      o = next
      emit()
    },
    getValue,
    getValueText,
    getMonths,
    getWeekdays,
    select: (date: ISODate) => select(date),
    clear,
    focus,
    goToMonth,
    goToYear,
    goToMonthIndex,
    getMonthOptions,
    getYearOptions,
    nextMonth: () => goToMonth(1),
    prevMonth: () => goToMonth(-1),
    setOpen: (open: boolean) => setOpen(open, { restoreFocus: !open }),
    toggle: () => setOpen(!isOpen(), { restoreFocus: isOpen() }),
    isOpen,
    isDateDisabled: (date: ISODate) => isDisabledE(isoToEpoch(date)),
    /** True when the current value includes a date that is disabled under the current options. */
    hasInvalidValue,
    /** Resolved writing direction. */
    getDirection: dir,

    /** Spread on the outermost element. */
    getRootProps: (): Props => ({ dir: dir(), 'data-dayfold': id }),

    /** For a visible `<label>` associated with the text input. */
    getLabelProps: (): Props => ({ id: ids.label, htmlFor: ids.input }),

    getInputProps: (): Props => ({
      id: ids.input,
      type: 'text',
      value: inputText(),
      autoComplete: 'off',
      placeholder: o.placeholder ?? placeholderFor(loc(), cal(), inputFormat()),
      'aria-invalid': state.inputInvalid || hasInvalidValue() ? 'true' : undefined,
      onInput: (event: Event) =>
        set({ inputText: (event.currentTarget as HTMLInputElement).value, inputInvalid: false }),
      onBlur: commitInput,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commitInput()
        } else if (event.key === 'ArrowDown' && event.altKey) {
          event.preventDefault()
          setOpen(true)
        }
      },
    }),

    /** The button that opens the popup dialog. */
    getTriggerProps: (): Props => {
      const text = getValueText()
      return {
        id: ids.trigger,
        type: 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': bool(isOpen()),
        // Only reference the dialog while it is rendered.
        'aria-controls': isOpen() ? ids.dialog : undefined,
        'aria-label': labels().trigger(text),
        'data-state': isOpen() ? 'open' : 'closed',
        onClick: () => setOpen(!isOpen(), { restoreFocus: isOpen() }),
      }
    },

    /** The popup container. Visibility and positioning are up to you (e.g. the `popover` attribute). */
    getDialogProps: (): Props => ({
      id: ids.dialog,
      role: 'dialog',
      'aria-modal': o.modal === false ? undefined : 'true',
      'aria-label': labels().dialog,
      'data-state': isOpen() ? 'open' : 'closed',
      onKeyDown: onDialogKeyDown,
    }),

    getPrevButtonProps: (): Props => {
      const disabled = !canGoBack()
      return {
        type: 'button',
        'aria-label': labels().prevMonth,
        'aria-disabled': disabled ? 'true' : undefined,
        'data-disabled': flag(disabled),
        onClick: () => !disabled && goToMonth(-1),
      }
    },

    getNextButtonProps: (): Props => {
      const disabled = !canGoForward()
      return {
        type: 'button',
        'aria-label': labels().nextMonth,
        'aria-disabled': disabled ? 'true' : undefined,
        'data-disabled': flag(disabled),
        onClick: () => !disabled && goToMonth(1),
      }
    },

    /** For a native `<select>` of the months in the visible year. Render `getMonthOptions()` inside. */
    getMonthSelectProps: (): Props => ({
      'aria-label': labels().monthSelect,
      value: String(yearMonths().indexOf(firstMonth())),
      onChange: (event: Event) => goToMonthIndex(+(event.currentTarget as HTMLSelectElement).value),
    }),

    /** For a native `<select>` of years. Render `getYearOptions()` inside. */
    getYearSelectProps: (): Props => ({
      'aria-label': labels().yearSelect,
      value: String(yearOf(firstMonth())),
      onChange: (event: Event) => goToYear(+(event.currentTarget as HTMLSelectElement).value),
    }),

    getClearButtonProps: (): Props => ({
      type: 'button',
      'aria-label': labels().clear,
      onClick: clear,
    }),

    /** The month heading; the grid is labelled by it. */
    getMonthLabelProps: (month: CalendarMonth): Props => ({ id: month.labelId }),

    getGridProps: (month: CalendarMonth): Props => ({
      role: 'grid',
      'aria-labelledby': month.labelId,
      'aria-multiselectable': mode() === 'single' ? undefined : 'true',
      onMouseLeave: () => state.hoveredDate && set({ hoveredDate: null }),
    }),

    getWeekdayProps: (day: Weekday): Props => ({
      role: 'columnheader',
      abbr: day.long,
      'aria-label': day.long,
    }),

    getWeekProps: (): Props => ({ role: 'row' }),

    getCellProps: (day: CalendarDay): Props => ({
      role: 'gridcell',
      'aria-selected': day.isOutside ? undefined : bool(day.isSelected),
      ...dayFlags(day),
    }),

    /** The interactive element inside each cell — render a `<button>`. */
    getDayProps: (day: CalendarDay): Props => ({
      type: 'button',
      tabIndex: day.isFocused ? 0 : -1,
      'aria-label': labels().day(day, labels()),
      'aria-disabled': day.isDisabled ? 'true' : undefined,
      'aria-current': day.isToday ? 'date' : undefined,
      'data-dayfold-day': id,
      'data-date': day.date,
      ...dayFlags(day),
      onClick: () => {
        if (day.isDisabled) focus(day.date)
        else select(day.date, 'click')
      },
      onKeyDown: onDayKeyDown,
      onFocus: () => {
        if (!day.isOutside && state.focusedDate !== day.date) focus(day.date)
      },
      onMouseEnter: () => {
        if (mode() === 'range' && !day.isDisabled) set({ hoveredDate: day.date })
      },
    }),

    /** For a live region you render yourself (with `announce: 'manual'`). Put `state.announcement` inside. */
    getLiveRegionProps: (): Props => ({
      id: ids.live,
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),

    /**
     * A hidden input so the value submits with a native `<form>`. In range mode pass
     * `part: 'start' | 'end'` to get one input per end; otherwise the range is sent as `start/end`.
     */
    getHiddenInputProps: (opts: { name?: string; part?: 'start' | 'end' } = {}): Props => {
      const v = getValue() as ISODate | ISODate[] | DateRange | null
      let value = ''
      if (typeof v === 'string') value = v
      else if (Array.isArray(v)) value = v.join(',')
      else if (v)
        value = opts.part ? (v[opts.part] ?? '') : v.start && v.end ? `${v.start}/${v.end}` : ''
      return { type: 'hidden', name: opts.name ?? o.name, value }
    },

    /** Machine-readable date for a `<time>` element — good for SEO and structured data. */
    getTimeProps: (date?: ISODate): Props => ({ dateTime: date ?? selectedDates()[0] }),

    /** Removes document listeners. Safe to call more than once. */
    destroy() {
      if (hasDOM()) document.removeEventListener('pointerdown', onOutside, true)
    },
  }
  return api
}

export type DatePicker<M extends SelectionMode = 'single'> = ReturnType<typeof createDatePicker<M>>
