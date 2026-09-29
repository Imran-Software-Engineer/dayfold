# dayfold

**The headless, accessible, tiny date picker.** Every `Intl` calendar — Hijri (Umm al-Qura), Persian, Hebrew and more — in about 7 kB, with zero dependencies. You bring the markup and styles; dayfold handles the calendar math, keyboard navigation, ARIA and focus.

```bash
npm i dayfold
```

- **Headless** — prop getters for your own elements. Works with Tailwind, CSS modules, plain CSS, any design system.
- **Accessible by default** — W3C APG grid pattern with real buttons in every cell, roving focus, live announcements, dialog focus trap, RTL-aware arrow keys. Verified with axe-core.
- **Every calendar, no tables** — Hijri, Persian, Hebrew, Buddhist… computed from the browser's built-in `Intl` data, so they add no weight. Show a second calendar under each day.
- **Every string is yours** — override any `aria-label` or announcement per instance. Arabic ships built in.
- **Forms & SEO** — hidden inputs for native forms, `<time datetime>` props, SSR-safe ids, fixed 6-week grid (no layout shift).
- **Tiny & typed** — ~7.4 kB min+gzip for the full picker (single / range / multiple, month & year dropdowns, popup, text input), strict TypeScript. Accepts `Date`, ISO strings and `Temporal.PlainDate`.

## Quick start (React)

```tsx
import { useDatePicker } from 'dayfold/react'

export function Calendar() {
  const dp = useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura', secondaryCalendar: 'gregory' })

  return (
    <div {...dp.getRootProps()}>
      <button {...dp.getPrevButtonProps()}>‹</button>
      <button {...dp.getNextButtonProps()}>›</button>
      {dp.months.map((month) => (
        <table key={month.start} {...dp.getGridProps(month)}>
          <caption {...dp.getMonthLabelProps(month)}>{month.label}</caption>
          <thead>
            <tr>
              {dp.weekdays.map((w) => (
                <th key={w.weekday} {...dp.getWeekdayProps(w)}>{w.narrow}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {month.weeks.map((week) => (
              <tr key={week[0].date} {...dp.getWeekProps()}>
                {week.map((day) => (
                  <td key={day.date} {...dp.getCellProps(day)}>
                    <button {...dp.getDayProps(day)}>
                      {day.label}
                      <small aria-hidden="true">{day.secondaryLabel}</small>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}
```

Style states with data attributes:

```css
[data-selected] { background: black; color: white; }
[data-today] { font-weight: 700; }
[data-outside] { color: gray; }
[data-disabled] { text-decoration: line-through; }
[data-in-range], [data-preview] { background: #eee; }
```

## Vue

```vue
<script setup>
import { useDatePicker } from 'dayfold/vue'
const dp = useDatePicker({ locale: 'en-GB', mode: 'range', numberOfMonths: 2 })
</script>

<template>
  <table v-for="month in dp.months.value" :key="month.start" v-bind="dp.getGridProps(month)">
    <caption v-bind="dp.getMonthLabelProps(month)">{{ month.label }}</caption>
    <tr v-for="week in month.weeks" :key="week[0].date" v-bind="dp.getWeekProps()">
      <td v-for="day in week" :key="day.date" v-bind="dp.getCellProps(day)">
        <button v-bind="dp.getDayProps(day)">{{ day.label }}</button>
      </td>
    </tr>
  </table>
</template>
```

## Vanilla JS

```js
import { createDatePicker } from 'dayfold'
import { h } from 'dayfold/dom'

const dp = createDatePicker({ locale: 'fa-IR', calendar: 'persian' })
const root = document.querySelector('#calendar')

function render() {
  const [month] = dp.getMonths()
  root.replaceChildren(
    h('table', dp.getGridProps(month),
      h('caption', dp.getMonthLabelProps(month), month.label),
      ...month.weeks.map((week) =>
        h('tr', dp.getWeekProps(),
          ...week.map((day) =>
            h('td', dp.getCellProps(day), h('button', dp.getDayProps(day), day.label)))))),
  )
}
dp.subscribe(render)
render()
```

## Disabling dates

```ts
import { today } from 'dayfold'

useDatePicker({
  disabled: [
    { before: today() },                      // no past dates
    { after: '2027-06-30' },                  // nothing after a date
    { from: '2026-12-24', to: '2026-12-26' }, // an inclusive range
    '2026-11-11',                             // a specific date (string, Date or Temporal)
    { dayOfWeek: [5, 6] },                    // Fridays and Saturdays
    (iso) => holidays.has(iso),               // anything else
  ],
})
```

Disabled dates stay focusable and are announced as "unavailable", so keyboard and screen-reader users can still explore; ranges can't span them (unless `allowDisabledInRange`). Use `min` / `max` when you also want to stop navigation beyond a date.

## Month & year dropdowns

Jump to any month or year directly instead of paging one month at a time:

```tsx
<select {...dp.getMonthSelectProps()}>
  {dp.monthOptions.map((m) => <option key={m.value} value={m.value} disabled={m.disabled}>{m.label}</option>)}
</select>
<select {...dp.getYearSelectProps()}>
  {dp.yearOptions.map((y) => <option key={y.value} value={y.value} disabled={y.disabled}>{y.label}</option>)}
</select>
```

Options are localised and calendar-aware (Hijri years like 1448, 13 months in a Hebrew leap year). The year range follows `min` / `max`, or `years: { from, to }`, defaulting to 100 years back and 50 ahead. Programmatic: `goToYear(year)`, `goToMonthIndex(i)`.

## Popup with a text input

```tsx
const dp = useDatePicker({ locale: 'en-US', name: 'departure' })

<label {...dp.getLabelProps()}>Departure</label>
<input {...dp.getInputProps()} />
<button {...dp.getTriggerProps()}>📅</button>
<input {...dp.getHiddenInputProps()} />   {/* posts 2026-09-29 with the form */}
{dp.state.open && <div {...dp.getDialogProps()}>{/* calendar */}</div>}
```

dayfold handles open state, focus on open, <kbd>Esc</kbd>, the focus trap, outside clicks and returning focus to the trigger. Positioning is up to you (the native `popover` attribute works well). Typed dates follow the locale's order and calendar; add `parse: withShortcuts()` from `dayfold/shortcuts` for "tomorrow", "+3d", "next fri", "غدا".

## Accessibility labels

```ts
import { ar } from 'dayfold/locales/ar'

useDatePicker({
  locale: 'ar-SA',
  labels: { ...ar, dialog: 'اختر تاريخ الموعد', day: (d, l) => `${d.fullLabel}${d.isDisabled ? '، محجوز' : ''}` },
})
```

| Label | Used for |
| --- | --- |
| `dialog`, `prevMonth`, `nextMonth`, `clear`, `monthSelect`, `yearSelect` | Accessible names |
| `today`, `selected`, `unavailable`, `rangeStart`, `rangeEnd` | Words inside day labels |
| `trigger(valueText)` | Trigger button name |
| `day(day, labels)` | Full day label |
| `monthChanged(label)`, `selectionChanged(valueText)` | Live announcements |

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous / next day (swapped in RTL) |
| <kbd>↑</kbd> <kbd>↓</kbd> | Previous / next week |
| <kbd>Home</kbd> <kbd>End</kbd> | Start / end of week |
| <kbd>PageUp</kbd> <kbd>PageDown</kbd> | Previous / next month (+ <kbd>Shift</kbd> for years) |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Select |
| <kbd>Esc</kbd> | Close popup |

## Options

`mode`, `value` / `defaultValue` / `onValueChange`, `locale`, `calendar`, `secondaryCalendar`, `numberingSystem`, `dir`, `weekStartsOn`, `min`, `max`, `disabled`, `isDateDisabled`, `allowDisabledInRange`, `maxSelections`, `numberOfMonths`, `years`, `fixedWeeks`, `defaultFocusedDate`, `today`, `open` / `defaultOpen` / `onOpenChange`, `closeOnSelect`, `closeOnOutsideClick`, `modal`, `labels`, `announce`, `inputFormat`, `parse`, `placeholder`, `name`, `id`, `focusDay`.

Values are always ISO date strings: `string | null` (single), `string[]` (multiple), `{ start, end } | null` (range).

Full documentation and live demos: **https://dayfold.vercel.app**

## Entry points

| Import | Size (min+gzip) |
| --- | --- |
| `dayfold` | 7.4 kB |
| `dayfold/react` | 7.6 kB (includes core) |
| `dayfold/vue` | 7.9 kB (includes core) |
| `dayfold/dom` | 0.3 kB |
| `dayfold/shortcuts` | 1.8 kB |
| `dayfold/locales/ar` | < 0.5 kB |

## License

MIT
