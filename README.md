# dayfold

[![npm](https://img.shields.io/npm/v/dayfold)](https://www.npmjs.com/package/dayfold)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/dayfold)](https://bundlephobia.com/package/dayfold)
[![types](https://img.shields.io/npm/types/dayfold)](https://www.npmjs.com/package/dayfold)
[![license](https://img.shields.io/npm/l/dayfold)](./LICENSE)

**An accessible, headless date picker for React, Vue and plain JavaScript — with Hijri, Persian and every other `Intl` calendar built in, in about 7.5 kB and zero dependencies.**

dayfold handles the hard parts of a date picker — calendar math, keyboard navigation, ARIA, focus management, screen-reader announcements — and lets you render any markup with any styling. If you'd rather not build the markup, an optional ready-made `<DateField>` is included.

**[Live demos & docs](https://dayfold.vercel.app)** · [API reference](https://dayfold.vercel.app/docs/) · [العربية](https://dayfold.vercel.app/ar/) · [GitHub](https://github.com/Imran-Software-Engineer/dayfold)

---

## Contents

- [Why dayfold](#why-dayfold)
- [Comparison](#comparison)
- [Installation](#installation)
- [Quick start](#quick-start) — [ready-made field](#1-ready-made-field-react) · [React hook](#2-headless-react-hook) · [Vue](#3-vue) · [Vanilla JS](#4-vanilla-javascript)
- [`DateField` props](#datefield-props)
- [Picker options](#picker-options)
- [Returned API](#returned-api)
- [Prop getters](#prop-getters)
- [Calendar data](#calendar-data)
- [Guides](#guides) — [disabled dates](#disabling-dates) · [linked start & end fields](#linked-start--end-fields) · [range & multiple](#range-and-multiple-selection) · [month & year dropdowns](#month--year-dropdowns) · [text input](#text-input--typed-shortcuts) · [Hijri & other calendars](#hijri-and-other-calendars) · [styling](#styling) · [forms, SSR & SEO](#forms-ssr--seo)
- [Accessibility](#accessibility)
- [Keyboard](#keyboard)
- [Browser support](#browser-support)
- [Entry points & sizes](#entry-points--sizes)
- [FAQ](#faq)

---

## Why dayfold

| | |
| --- | --- |
| **Headless** | You get state and *prop getters* for your own elements. Works with Tailwind, CSS Modules, styled-components, any design system — there is nothing to override. |
| **Accessible by default** | Follows the W3C APG date-picker dialog and grid patterns with a real `<button>` in every cell, roving focus, polite live announcements, dialog focus trap and RTL-aware arrow keys. Tested with axe-core. |
| **Every calendar, no extra weight** | Hijri (Umm al-Qura), Persian, Hebrew, Buddhist, Japanese… are computed from the browser's built-in `Intl` data, so they cost **0 extra bytes** and need no add-on package. Show a second calendar under each day (e.g. Hijri under Gregorian). |
| **Every string is yours** | Every `aria-label`, announcement and placeholder can be overridden per instance. Arabic ships built in. |
| **Tiny** | ~7.5 kB min+gzip for the complete picker: single / range / multiple selection, popup, text input, month & year dropdowns. Zero dependencies, tree-shakeable. |
| **Framework-agnostic** | One core with thin adapters: React 18+, Vue 3.5+, or plain DOM. |
| **Forms & SEO ready** | Hidden inputs for native `<form>` posts, `<time datetime>` props, SSR-safe ids, and a fixed 6-week grid that never shifts layout. |
| **Modern dates** | Values are plain ISO strings (`"2026-09-29"`) — no time-zone bugs. Accepts `Date`, ISO strings and `Temporal.PlainDate`. |

## Comparison

Measured in September 2026. Sizes are minified + gzipped JavaScript as a consumer bundles it (esbuild / Bundlephobia); styles for the other libraries are extra.

| | **dayfold** | cally | react-day-picker | flatpickr | react-datepicker |
| --- | --- | --- | --- | --- | --- |
| JS size (min+gzip) | **7.5 kB** | 9.2 kB | 18.9 kB | 14.8 kB | 46.7 kB |
| Dependencies | **0** | 1 | 2 | 0 | 3 |
| Frameworks | React, Vue, vanilla | Web component | React | Vanilla | React |
| Headless (your markup) | **Yes** | Partly (parts / CSS vars) | Partly (class names, components) | No | No |
| Input + popup included | Yes | No | No (grid only) | Yes | Yes |
| Hijri / Persian / Hebrew | **Built in (Intl)** | Not documented | Separate `@daypicker/*` add-ons | Not built in | Not built in |
| Month & year dropdowns | Yes | — | Yes | Month only | Yes |
| Declarative disabled rules | Yes | — | Yes | Yes | Yes |
| Every a11y string overridable | **Yes** | Partly | Yes | Partly | Partly |
| Time picking | **No** (dates only) | No | No | Yes | Yes |

**Where others are stronger:** react-day-picker has a larger ecosystem (it powers the shadcn/ui calendar); flatpickr and react-datepicker include time selection, which dayfold does not (yet). If you need a time picker today, pair dayfold with a time input or use one of those.

---

## Installation

```bash
npm install dayfold
# or
pnpm add dayfold
# or
yarn add dayfold
```

React (18+) and Vue (3.5+) are optional peer dependencies — install whichever you use. Nothing else is installed.

---

## Quick start

### 1. Ready-made field (React)

The fastest way: an accessible, styled field you can still customise.

```tsx
import { useState } from 'react'
import { DateField } from 'dayfold/react/field'
import 'dayfold/field.css' // optional default look

export function BookingForm() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <DateField
      label="Appointment date"
      value={date}
      onValueChange={setDate}
      disabled={{ before: new Date() }} // no past dates
      iconPosition="start"               // 'start' | 'end'
      name="appointment"                 // posts "2026-09-29" with the form
    />
  )
}
```

### 2. Headless React hook

Full control of the markup:

```tsx
import { useDatePicker } from 'dayfold/react'

export function Calendar() {
  const dp = useDatePicker({ locale: 'en-US' })

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
                    <button {...dp.getDayProps(day)}>{day.label}</button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <p>Selected: {dp.valueText ?? 'none'}</p>
    </div>
  )
}
```

### 3. Vue

```vue
<script setup>
import { useDatePicker } from 'dayfold/vue'

// Options can be an object, a ref, or a getter — changes are picked up reactively.
const dp = useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura' })
</script>

<template>
  <div v-bind="dp.getRootProps()">
    <button v-bind="dp.getPrevButtonProps()">‹</button>
    <button v-bind="dp.getNextButtonProps()">›</button>
    <table v-for="month in dp.months.value" :key="month.start" v-bind="dp.getGridProps(month)">
      <caption v-bind="dp.getMonthLabelProps(month)">{{ month.label }}</caption>
      <tr v-for="week in month.weeks" :key="week[0].date" v-bind="dp.getWeekProps()">
        <td v-for="day in week" :key="day.date" v-bind="dp.getCellProps(day)">
          <button v-bind="dp.getDayProps(day)">{{ day.label }}</button>
        </td>
      </tr>
    </table>
  </div>
</template>
```

### 4. Vanilla JavaScript

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

Focus is restored to the right day after every render, so a full re-render like this stays keyboard-friendly. Update options later with `dp.update({ ...options })`.

---

## `DateField` props

`import { DateField } from 'dayfold/react/field'` — accepts **every [picker option](#picker-options)** plus:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — (required) | Visible label, associated with the input. |
| `hideLabel` | `boolean` | `false` | Hide the label visually but keep it for screen readers. |
| `description` | `ReactNode` | — | Hint below the field, linked with `aria-describedby`. |
| `error` | `ReactNode` | — | Error text; sets `aria-invalid` and is linked with `aria-describedby`. |
| `icon` | `ReactNode \| false` | calendar icon | Content of the trigger button — any SVG, icon-library component, emoji or text. `false` removes the trigger. |
| `iconPosition` | `'start' \| 'end'` | `'end'` | Where the trigger sits. Changes DOM order (so Tab order matches) and mirrors automatically in RTL. |
| `dropdowns` | `boolean` | `true` | Month and year `<select>`s in the popup header. |
| `prevIcon` / `nextIcon` | `ReactNode` | chevrons | Icons for the month navigation buttons. |
| `renderDay` | `(day: CalendarDay) => ReactNode` | day number | Custom day content (the accessible name still comes from `labels.day`). |
| `inputProps` | `InputHTMLAttributes` | — | Extra input attributes: `required`, `autoFocus`, `className`, … |
| `className` | `string` | — | Added to the root element. |
| `classNames` | `Partial<Record<Part, string>>` | — | Class per part: `root`, `label`, `description`, `error`, `control`, `input`, `trigger`, `popover`, `header`, `selects`, `select`, `nav`, `navButton`, `months`, `grid`, `weekday`, `cell`, `day`. |

Every part also has a stable `dayfold-*` class (e.g. `.dayfold-trigger`), and the root carries `data-icon-position`, `data-open` and `data-invalid`.

```tsx
<DateField label="Start date" icon={<CalendarDays size={18} />} iconPosition="start" />
<DateField label="Check-in" icon={<span aria-hidden="true">📅</span>} />
<DateField label="Date of birth" icon={false} placeholder="dd/mm/yyyy" />
<DateField label="Date" classNames={{ input: 'input input-bordered', day: 'btn btn-ghost' }} />
```

**Theming `field.css`** — every value is a custom property; light / dark is automatic:

```css
.my-form .dayfold-field {
  --dayfold-accent: #0f766e;
  --dayfold-on-accent: #fff;
  --dayfold-accent-soft: #ccfbf1;
  --dayfold-bg: #fff;
  --dayfold-fg: #111;
  --dayfold-muted: #555;
  --dayfold-border: #ccc;
  --dayfold-danger: #b42318;
  --dayfold-focus: #0f766e;
  --dayfold-radius: 12px;
  --dayfold-day-size: 44px;
}
```

---

## Picker options

Used by `useDatePicker()` (React / Vue), `createDatePicker()` (vanilla) and `<DateField>`.

### Selection

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Selection mode. |
| `value` | see below | — | Controlled value. Pass `null` (or `[]`) for "nothing selected". |
| `defaultValue` | see below | — | Initial value for uncontrolled use. |
| `onValueChange` | `(value, { date, source }) => void` | — | Called on every change. `source`: `'click' \| 'keyboard' \| 'input' \| 'clear' \| 'api'`. |
| `maxSelections` | `number` | — | Multiple mode: maximum number of dates. |
| `allowDisabledInRange` | `boolean` | `false` | Range mode: allow a range to span disabled dates. |

Values are always returned as ISO strings: `string | null` (single), `string[]` (multiple), `{ start, end } | null` (range). Inputs also accept `Date` and `Temporal.PlainDate`.

### Restricting dates

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `min` / `max` | date | — | Earliest / latest selectable date. Also stops navigation and trims the dropdowns. |
| `disabled` | `DateMatcher \| DateMatcher[]` | — | Dates that can't be selected — see [disabling dates](#disabling-dates). |
| `isDateDisabled` | `(iso: string) => boolean` | — | Function form (same as a function inside `disabled`). |

### Calendar & locale

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `locale` | BCP 47 tag | runtime locale | Formatting, week start, weekend and direction, e.g. `'en-US'`, `'ar-SA'`. |
| `calendar` | calendar id | `'gregory'` | `'islamic-umalqura'`, `'islamic-civil'`, `'persian'`, `'hebrew'`, `'buddhist'`, `'japanese'`… |
| `secondaryCalendar` | calendar id | — | Second calendar shown under each day. |
| `numberingSystem` | `'latn' \| 'arab' \| …` | from locale | Digits to display. |
| `dir` | `'ltr' \| 'rtl'` | from locale | Writing direction (also flips arrow keys). |
| `weekStartsOn` | `0`–`6` | from locale | First day of the week (0 = Sunday). |

### Display & navigation

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `numberOfMonths` | `number` | `1` | Months shown side by side. |
| `fixedWeeks` | `boolean` | `true` | Always 6 rows, so the grid never changes height (no layout shift). |
| `years` | `{ from?, to? }` | `min`/`max`, else −100 / +50 | Year range for the year dropdown, in the calendar's own numbering. |
| `defaultFocusedDate` | date | selection, then today | Initially focused / visible date. |
| `today` | date | local today | Override "today" (tests, SSR). |

### Popup

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | `false` | Controlled / initial popup state. |
| `onOpenChange` | `(open) => void` | — | Called when the popup opens or closes. |
| `closeOnSelect` | `boolean` | `true` | Close after picking a date (or a full range). |
| `closeOnOutsideClick` | `boolean` | `true` | Close on pointer-down outside the popup. |
| `modal` | `boolean` | `true` | Trap Tab inside the popup. |

### Text input & forms

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `inputFormat` | `Intl.DateTimeFormatOptions` | numeric y/m/d | How the value is shown in the input. |
| `parse` | `(text, { locale, calendar, today }) => iso \| null` | locale-aware | Custom parser. Use `withShortcuts()` for "tomorrow", "+3d"… |
| `placeholder` | `string` | e.g. `mm/dd/yyyy` | Input placeholder. |
| `name` | `string` | — | Field name for `getHiddenInputProps()` / `DateField`. |

### Accessibility

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `labels` | `Partial<Labels>` | English | Override any accessible string — see [labels](#labels). |
| `announce` | `'auto' \| 'manual' \| false` | `'auto'` | `'auto'` uses a shared live region; `'manual'` exposes `state.announcement` for your own. |
| `id` | `string` | auto | Stable id prefix (pass one for SSR if not using the React / Vue adapters). |
| `focusDay` | `(iso) => void` | built in | Custom focus routine if you don't render `data-date` attributes. |

---

## Returned API

| Member | Description |
| --- | --- |
| `months` / `getMonths()` | Visible months, each with `label`, `weeks` of [`CalendarDay`](#calendar-data) and more. |
| `weekdays` / `getWeekdays()` | Weekday names in display order (`narrow`, `short`, `long`). |
| `value` / `getValue()` | Effective value (controlled or not). |
| `valueText` / `getValueText()` | Localised text, e.g. `"Sep 29 – Oct 3, 2026"`. |
| `state` / `getState()` | `focusedDate`, `visibleDate`, `open`, `inputText`, `inputInvalid`, `announcement`. |
| `monthOptions` / `yearOptions` | Entries `{ value, label, disabled }` for dropdowns. |
| `select(iso)`, `clear()` | Change the selection. |
| `focus(iso)` | Move the focused / visible date. |
| `goToMonth(n)`, `nextMonth()`, `prevMonth()` | Navigate months. |
| `goToYear(year)`, `goToMonthIndex(i)` | Jump to a year (calendar numbering) or a month of the visible year. |
| `setOpen(bool)`, `toggle()`, `isOpen()` | Popup control. |
| `isDateDisabled(iso)`, `hasInvalidValue()` | Checks against the current options. |
| `getDirection()` | Resolved `'ltr'` / `'rtl'`. |
| `subscribe(fn)`, `update(options)`, `destroy()` | Store helpers for vanilla use. |

In React and Vue, `months`, `weekdays`, `value`, `valueText`, `monthOptions` and `yearOptions` are provided directly (in Vue as computed refs).

## Prop getters

Each returns a plain object of attributes and handlers — spread it in React, `v-bind` it in Vue, or apply it with `spread()` / `h()` from `dayfold/dom`.

| Getter | Put it on | Provides |
| --- | --- | --- |
| `getRootProps()` | wrapper | `dir`, `data-dayfold` |
| `getLabelProps()` | `<label>` | `id`, `htmlFor` → input |
| `getInputProps()` | `<input>` | value, placeholder, `aria-invalid`, parse on blur / Enter, Alt+↓ opens |
| `getTriggerProps()` | `<button>` | `aria-haspopup`, `aria-expanded`, `aria-controls`, dynamic `aria-label` |
| `getDialogProps()` | popup | `role="dialog"`, `aria-modal`, `aria-label`, Esc, focus trap |
| `getPrevButtonProps()` / `getNextButtonProps()` | `<button>` | `aria-label`, `aria-disabled` at `min` / `max` |
| `getMonthSelectProps()` / `getYearSelectProps()` | `<select>` | `aria-label`, `value`, `onChange` |
| `getClearButtonProps()` | `<button>` | `aria-label`, clears the value |
| `getMonthLabelProps(month)` | heading / caption | `id` that labels the grid |
| `getGridProps(month)` | `<table>` | `role="grid"`, `aria-labelledby`, `aria-multiselectable` |
| `getWeekdayProps(weekday)` | `<th>` | `role="columnheader"`, full weekday name |
| `getWeekProps()` | `<tr>` | `role="row"` |
| `getCellProps(day)` | `<td>` | `role="gridcell"`, `aria-selected`, `data-*` state |
| `getDayProps(day)` | `<button>` | roving `tabIndex`, `aria-label`, `aria-current`, `aria-disabled`, keyboard |
| `getLiveRegionProps()` | element | `role="status"` (with `announce: 'manual'`) |
| `getHiddenInputProps({ name, part })` | `<input>` | `type="hidden"` ISO value for native forms |
| `getTimeProps(date?)` | `<time>` | `dateTime` |

To add your own handler, call dayfold's too: `onClick={(e) => { track(); dp.getDayProps(day).onClick(e) }}`.

## Calendar data

```ts
interface CalendarDay {
  date: string            // '2026-09-29'
  day: number             // day of month in the primary calendar
  label: string           // localised digits, e.g. '٢٩'
  fullLabel: string       // 'Tuesday, September 29, 2026'
  secondaryLabel?: string // day in secondaryCalendar
  secondaryFullLabel?: string
  weekday: number         // 0 = Sunday
  isToday, isSelected, isDisabled, isOutside, isFocused, isWeekend: boolean
  isRangeStart, isRangeEnd, isInRange, isInPreview: boolean
}
```

---

## Guides

### Disabling dates

```ts
import { today } from 'dayfold'

useDatePicker({
  disabled: [
    { before: today() },                           // all past dates
    { after: '2027-06-30' },                       // everything after a date
    { from: '2026-12-24', to: '2026-12-26' },      // an inclusive range (either end optional)
    { before: '2026-01-01', after: '2026-12-31' }, // everything outside a window
    '2026-11-11',                                  // one date (string, Date or Temporal)
    { dayOfWeek: [5, 6] },                         // weekdays (0 = Sunday) — here Fri & Sat
    (iso) => holidays.has(iso),                    // any custom rule
  ],
})
```

Disabled dates stay focusable and are announced as "unavailable", so keyboard and screen-reader users can still explore; ranges can't span them. Use `min` / `max` when navigation should stop too.

### Linked start & end fields

Options are re-read on every render, so one field can restrict another at runtime:

```tsx
const [start, setStart] = useState<string | null>(null)
const [end, setEnd] = useState<string | null>(null)

<DateField label="Start date" value={start} onValueChange={setStart}
  disabled={end ? { after: end } : undefined} />
<DateField label="End date" value={end} onValueChange={setEnd}
  disabled={start ? { before: start } : undefined} />
```

- A picker opening without a value focuses the **nearest selectable day** — the end picker opens on the start date.
- If a value becomes disabled because the other field changed, its input gets `aria-invalid="true"` and `hasInvalidValue()` returns `true`.
- Vue: `useDatePicker(() => ({ disabled: start.value ? { before: start.value } : undefined }))`. Vanilla: `endPicker.update({ ...options, disabled: { before: start } })`.

### Range and multiple selection

```tsx
const range = useDatePicker({ mode: 'range', numberOfMonths: 2 })
// range.value → { start: '2026-10-01', end: '2026-10-05' }

const multi = useDatePicker({ mode: 'multiple', maxSelections: 5 })
// multi.value → ['2026-10-01', '2026-10-03']
```

Days expose `isRangeStart`, `isRangeEnd`, `isInRange` and `isInPreview` (the tentative range while choosing the end) plus matching `data-*` attributes.

### Month & year dropdowns

```tsx
<select {...dp.getMonthSelectProps()}>
  {dp.monthOptions.map((m) => <option key={m.value} value={m.value} disabled={m.disabled}>{m.label}</option>)}
</select>
<select {...dp.getYearSelectProps()}>
  {dp.yearOptions.map((y) => <option key={y.value} value={y.value} disabled={y.disabled}>{y.label}</option>)}
</select>
```

Options are localised and calendar-aware (Hijri years like 1448, 13 months in a Hebrew leap year). Keep the dropdowns mounted across month changes so they keep focus.

### Text input & typed shortcuts

```tsx
import { withShortcuts } from 'dayfold/shortcuts'

const dp = useDatePicker({ locale: 'en-GB', parse: withShortcuts() })

<label {...dp.getLabelProps()}>Departure</label>
<input {...dp.getInputProps()} />
<button {...dp.getTriggerProps()}>📅</button>
{dp.state.open && <div {...dp.getDialogProps()}>{/* calendar */}</div>}
```

The default parser follows the locale's numeric order (`29/09/2026` in en-GB, `09/29/2026` in en-US) and accepts ISO dates and Arabic-Indic digits. `withShortcuts()` adds `today`, `tomorrow`, `+3d`, `-2w`, `in 1 month`, `next fri`, and Arabic `اليوم`, `غدا`, `أمس`, `بعد 3 أيام`.

dayfold manages the popup's open state, focus on open, Escape, the focus trap, outside clicks and returning focus to the trigger; positioning is yours (the native `popover` attribute or CSS anchor positioning work well).

### Hijri and other calendars

```ts
// Hijri (Umm al-Qura) with Gregorian beneath each day — Arabic digits and RTL come from the locale
useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura', secondaryCalendar: 'gregory' })

// Gregorian with Hijri beneath, Latin digits
useDatePicker({ locale: 'en-SA', secondaryCalendar: 'islamic-umalqura', numberingSystem: 'latn' })

// Persian (Jalali)
useDatePicker({ locale: 'fa-IR', calendar: 'persian' })
```

Arabic accessible labels:

```ts
import { ar } from 'dayfold/locales/ar'
useDatePicker({ locale: 'ar-SA', labels: ar })
```

### Styling

State is exposed as data attributes on both the cell and the day button:

```css
[data-selected] { background: black; color: white; }
[data-today] { font-weight: 700; }
[data-outside] { color: gray; }
[data-disabled] { text-decoration: line-through; }
[data-in-range], [data-preview] { background: #eee; }
[data-range-start] { border-radius: 99px 0 0 99px; }
[data-range-end] { border-radius: 0 99px 99px 0; }
[aria-disabled='true'] { cursor: not-allowed; }
```

Tailwind: `data-[selected]:bg-black data-[outside]:text-gray-400 aria-disabled:cursor-not-allowed`.

### Forms, SSR & SEO

- **Native forms:** `<input {...dp.getHiddenInputProps({ name: 'date' })} />` posts the ISO value. Range mode sends `start/end`, or one input per end with `part: 'start' | 'end'`.
- **Server rendering:** no browser globals are touched at import or render. React and Vue use `useId()` for hydration-safe ids. Pass `locale` (and `today` if needed) so server and client agree. Node and browsers can ship different ICU data, so add `suppressHydrationWarning` to formatted month names or render the calendar client-only.
- **Machine-readable dates:** `<time {...dp.getTimeProps()}>` renders `datetime="2026-09-29"`.
- **No layout shift:** `fixedWeeks` (default) keeps every month at six rows.

---

## Accessibility

- W3C APG date-picker dialog and grid patterns, with a real `<button>` in every cell.
- One Tab stop for the grid (roving `tabindex`); disabled dates remain focusable and are announced as unavailable.
- Month and selection changes are announced in a polite live region.
- Popup: `role="dialog"`, `aria-modal`, focus moves in on open, Tab is trapped, Escape closes and returns focus to the trigger.
- State is never colour-only — it is in the accessible name and in data attributes.
- Arrow keys follow reading direction in RTL.
- Verified with axe-core (WCAG 2.2 AA rules) in the test suite.

### Labels

Every accessible string can be overridden per instance:

| Label | Default | Used for |
| --- | --- | --- |
| `dialog` | "Choose date" | Popup name |
| `prevMonth` / `nextMonth` | "Previous month" / "Next month" | Navigation buttons |
| `monthSelect` / `yearSelect` | "Month" / "Year" | Dropdowns |
| `clear` | "Clear" | Clear button |
| `today`, `selected`, `unavailable`, `rangeStart`, `rangeEnd` | "Today", "selected", … | Words inside day labels |
| `trigger(valueText)` | "Choose date" / "Change date, Sep 29, 2026" | Trigger button name |
| `day(day, labels)` | "Today, Tuesday, September 29, 2026, selected" | Full day label |
| `monthChanged(label)` | the month label | Announcement after navigation |
| `selectionChanged(valueText)` | "Selected Sep 29, 2026" | Announcement after a selection |

```ts
useDatePicker({
  labels: {
    dialog: 'Choose your check-in date',
    day: (d, l) => [d.fullLabel, d.isDisabled && 'fully booked'].filter(Boolean).join(', '),
  },
})
```

You still own the rest of the page: give the input a visible label, keep text contrast at 4.5:1 and day buttons at least 24×24 px (44 px recommended).

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>←</kbd> / <kbd>→</kbd> | Previous / next day (swapped in RTL) |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Same weekday, previous / next week |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last day of the week |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Previous / next month |
| <kbd>Shift</kbd> + <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Previous / next year |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Select the focused day |
| <kbd>Esc</kbd> | Close the popup and return focus |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Move between popup controls (trapped when modal) |
| <kbd>Alt</kbd> + <kbd>↓</kbd> (in input) | Open the popup |
| <kbd>Enter</kbd> (in input) | Parse and commit the typed date |

## Browser support

All evergreen browsers: **Chrome / Edge 92+, Firefox 90+, Safari 15.4+** (iOS 15.4+). The optional `field.css` uses `light-dark()` for automatic dark mode where supported and falls back to the light theme elsewhere. Node 18+ for server rendering and tests.

## Entry points & sizes

| Import | Contents | Size (min+gzip) |
| --- | --- | --- |
| `dayfold` | `createDatePicker()` + date utilities | 7.5 kB |
| `dayfold/react` | `useDatePicker()` (includes core) | 7.7 kB |
| `dayfold/vue` | `useDatePicker()` (includes core) | 7.9 kB |
| `dayfold/react/field` | `<DateField>` (includes core) | 8.8 kB |
| `dayfold/field.css` | Optional styles for `<DateField>` | 1.6 kB |
| `dayfold/dom` | `spread()`, `h()` for vanilla JS | 0.3 kB |
| `dayfold/shortcuts` | Typed shortcuts parser | 1.8 kB |
| `dayfold/locales/ar` | Arabic accessible labels | < 0.5 kB |

Size budgets are enforced in CI — a change that grows a bundle past its budget fails the build.

## FAQ

**Does it include a time picker?** Not yet — dayfold picks dates. Pair it with `<input type="time">` or your own time control.

**What value format do I get?** ISO date strings (`"2026-09-29"`), never `Date` objects, so there are no time-zone shifts. Convert with `toDate(iso)` or `Temporal.PlainDate.from(iso)`.

**Does the Hijri calendar match the official Umm al-Qura calendar?** It uses the browser's ICU `islamic-umalqura` data, which is based on the official Umm al-Qura tables.

**Can I use it with Next.js / Nuxt?** Yes — it is SSR-safe. See [Forms, SSR & SEO](#forms-ssr--seo).

**Angular, Svelte, Solid?** Use the framework-free core (`createDatePicker` + `subscribe`) — the prop getters are plain objects.

---

## Development

This repository is a monorepo:

| Path | What |
| --- | --- |
| [`packages/dayfold`](packages/dayfold) | The npm package |
| [`apps/site`](apps/site) | Demo & docs site (Astro, English + Arabic), deployed on Vercel |

```bash
npm install
npm test              # unit + integration tests, including axe-core accessibility checks
npm run size          # bundle-size budgets (fails if exceeded)
npm run check         # lint + format (Biome)
npm run site:dev      # demo site on http://localhost:4321
npm run site:build    # builds the package, then the static site
```

Publishing: `cd packages/dayfold && npm publish` — `prepublishOnly` checks the metadata, builds, tests and enforces the size budgets.

<!-- Generated from packages/dayfold/README.md by scripts/sync-readme.mjs — edit that file instead. -->

## License

[MIT](./LICENSE)
