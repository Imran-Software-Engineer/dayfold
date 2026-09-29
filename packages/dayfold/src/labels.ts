import type { CalendarDay } from './types'

/**
 * Every string dayfold exposes to assistive technology. Override any subset
 * through the `labels` option; functions receive the context they describe.
 */
export interface Labels {
  /** Accessible name of the popup dialog. */
  dialog: string
  prevMonth: string
  nextMonth: string
  clear: string
  today: string
  selected: string
  unavailable: string
  rangeStart: string
  rangeEnd: string
  /** Accessible name of the button that opens the dialog. */
  trigger: (valueText: string | null) => string
  /** Accessible name of a day button. */
  day: (day: CalendarDay, labels: Labels) => string
  /** Announced when the visible month(s) change. */
  monthChanged: (monthLabel: string) => string
  /** Announced when the selection changes. */
  selectionChanged: (valueText: string | null) => string
}

export const defaultLabels: Labels = {
  dialog: 'Choose date',
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  clear: 'Clear',
  today: 'Today',
  selected: 'selected',
  unavailable: 'unavailable',
  rangeStart: 'range start',
  rangeEnd: 'range end',
  trigger: (text) => (text ? `Change date, ${text}` : 'Choose date'),
  day: (d, l) =>
    [
      d.isToday && l.today,
      d.fullLabel + (d.secondaryFullLabel ? ` (${d.secondaryFullLabel})` : ''),
      d.isRangeStart && l.rangeStart,
      d.isRangeEnd && l.rangeEnd,
      d.isSelected && l.selected,
      d.isDisabled && l.unavailable,
    ]
      .filter(Boolean)
      .join(', '),
  monthChanged: (label) => label,
  selectionChanged: (text) => (text ? `Selected ${text}` : 'Selection cleared'),
}
