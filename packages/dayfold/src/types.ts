import type { CalendarId } from './calendar'
import type { DateInput, ISODate } from './date'
import type { Labels } from './labels'

export type SelectionMode = 'single' | 'range' | 'multiple'

export interface DateRange {
  start: ISODate | null
  end: ISODate | null
}

/** The selected value for a given mode. Values are always ISO date strings. */
export type ValueOf<M extends SelectionMode> = M extends 'range'
  ? DateRange | null
  : M extends 'multiple'
    ? ISODate[]
    : ISODate | null

/** What the `value` / `defaultValue` options accept for a given mode. */
export type ValueInput<M extends SelectionMode> = M extends 'range'
  ? { start?: DateInput | null; end?: DateInput | null } | null
  : M extends 'multiple'
    ? DateInput[]
    : DateInput | null

export interface ValueChangeDetails {
  /** The date that was clicked / typed, or `null` for a clear. */
  date: ISODate | null
  /** Where the change came from. */
  source: 'click' | 'keyboard' | 'input' | 'clear' | 'api'
}

export interface DatePickerOptions<M extends SelectionMode = 'single'> {
  /** Stable id prefix. Pass one when rendering on the server to keep ids hydration-safe. */
  id?: string
  mode?: M
  /** Controlled value. Pass `null` (or `[]`) for "nothing selected". */
  value?: ValueInput<M>
  defaultValue?: ValueInput<M>
  onValueChange?: (value: ValueOf<M>, details: ValueChangeDetails) => void

  /** BCP 47 locale for formatting, week start and direction. Defaults to the runtime locale. */
  locale?: string
  /** Calendar system, e.g. `'gregory'` (default), `'islamic-umalqura'`, `'persian'`. */
  calendar?: CalendarId
  /** A second calendar shown alongside each day, e.g. Hijri under Gregorian. */
  secondaryCalendar?: CalendarId
  /** Digits to use, e.g. `'latn'` or `'arab'`. Defaults to the locale's. */
  numberingSystem?: string
  /** Overrides the locale's writing direction (affects arrow keys). */
  dir?: 'ltr' | 'rtl'
  /** 0 = Sunday … 6 = Saturday. Defaults to the locale's. */
  weekStartsOn?: number

  min?: DateInput
  max?: DateInput
  /** Return `true` to make a date unavailable. It stays focusable but cannot be selected. */
  isDateDisabled?: (date: ISODate) => boolean
  /** Range mode: allow a range to span disabled dates. Default `false`. */
  allowDisabledInRange?: boolean
  /** Multiple mode: maximum number of dates. */
  maxSelections?: number

  /** How many months to show side by side. Default 1. */
  numberOfMonths?: number
  /** Always return 6 weeks per month so the grid never changes height (prevents layout shift). Default `true`. */
  fixedWeeks?: boolean
  /** Which date gets keyboard focus / is visible initially. Defaults to the selection, then today. */
  defaultFocusedDate?: DateInput
  /** Overrides "today" — useful for tests and server rendering. */
  today?: DateInput

  /** Controlled open state of the popup. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Close the popup once a date (or a full range) is picked. Default `true`. */
  closeOnSelect?: boolean
  /** Close the popup on pointer down outside of it. Default `true`. */
  closeOnOutsideClick?: boolean
  /** Trap Tab inside the popup dialog. Default `true`. */
  modal?: boolean

  /** Override any accessible string. */
  labels?: Partial<Labels>
  /**
   * `'auto'` (default) announces month and selection changes through a shared,
   * visually-hidden live region. `'manual'` only updates `state.announcement`
   * so you can render it with `getLiveRegionProps()`. `false` disables it.
   */
  announce?: 'auto' | 'manual' | false

  /** Text input formatting. Defaults to numeric year / month / day in the locale's order. */
  inputFormat?: Intl.DateTimeFormatOptions
  /** Custom text parser for the input. Return an ISO date or `null`. */
  parse?: (text: string, context: ParseContext) => ISODate | null
  placeholder?: string
  /** Name for `getHiddenInputProps()` so the value submits with a native `<form>`. */
  name?: string

  /** Custom focus routine, if you do not render `data-dayfold-day` / `data-date` attributes. */
  focusDay?: (date: ISODate) => void
}

export interface ParseContext {
  locale: string
  calendar: CalendarId
  today: ISODate
}

export interface CalendarDay {
  date: ISODate
  /** Day of month in the primary calendar. */
  day: number
  /** Day of month, localised digits. */
  label: string
  /** e.g. "Tuesday, September 29, 2026". */
  fullLabel: string
  /** Day of month in `secondaryCalendar`, localised digits. */
  secondaryLabel?: string
  secondaryFullLabel?: string
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  /** Belongs to the previous / next month (padding days). */
  isOutside: boolean
  isFocused: boolean
  isWeekend: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  /** Inside the tentative range while the user is choosing the end date. */
  isInPreview: boolean
}

export interface CalendarMonth {
  /** First day of the month (ISO). */
  start: ISODate
  /** Last day of the month (ISO). */
  end: ISODate
  /** e.g. "September 2026" or "Rabiʻ II 1448 AH". */
  label: string
  /** The secondary calendar's months spanning this month. */
  secondaryLabel?: string
  labelId: string
  weeks: CalendarDay[][]
}

export interface Weekday {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number
  narrow: string
  short: string
  long: string
}

export interface DatePickerState<M extends SelectionMode = 'single'> {
  /** Uncontrolled value. Use `getValue()` to read the effective value. */
  value: ValueOf<M>
  focusedDate: ISODate
  /** A date inside the first visible month. */
  visibleDate: ISODate
  open: boolean
  hoveredDate: ISODate | null
  /** Text typed into the input, or `null` when it mirrors the value. */
  inputText: string | null
  inputInvalid: boolean
  announcement: string
}

/** Framework-neutral props: spread them in React, `v-bind` them in Vue, or use `spread()` from `dayfold/dom`. */
export type Props = Record<string, any>
