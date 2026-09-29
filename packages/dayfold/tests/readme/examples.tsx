// Type-checks README examples against the real API (not run).
import { useState } from 'react'
import { h } from '../../src/dom'
import { createDatePicker, today } from '../../src/index'
import { ar } from '../../src/locales/ar'
import { useDatePicker } from '../../src/react'
import { DateField } from '../../src/react-field'
import { withShortcuts } from '../../src/shortcuts'

export function BookingForm() {
  const [date, setDate] = useState<string | null>(null)
  return (
    <DateField
      label="Appointment date"
      value={date}
      onValueChange={setDate}
      disabled={{ before: new Date() }}
      iconPosition="start"
      name="appointment"
    />
  )
}

export function Fields() {
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  return (
    <>
      <DateField
        label="Start date"
        value={start}
        onValueChange={setStart}
        disabled={end ? { after: end } : undefined}
      />
      <DateField
        label="End date"
        value={end}
        onValueChange={setEnd}
        disabled={start ? { before: start } : undefined}
      />
      <DateField label="Check-in" icon={<span aria-hidden="true">📅</span>} />
      <DateField label="Date of birth" icon={false} placeholder="dd/mm/yyyy" />
      <DateField
        label="Date"
        classNames={{ input: 'input input-bordered', day: 'btn btn-ghost' }}
      />
    </>
  )
}

export function Hooks() {
  const holidays = new Set<string>()
  useDatePicker({
    disabled: [
      { before: today() },
      { after: '2027-06-30' },
      { from: '2026-12-24', to: '2026-12-26' },
      { before: '2026-01-01', after: '2026-12-31' },
      '2026-11-11',
      { dayOfWeek: [5, 6] },
      (iso) => holidays.has(iso),
    ],
  })
  const range = useDatePicker({ mode: 'range', numberOfMonths: 2 })
  const multi = useDatePicker({ mode: 'multiple', maxSelections: 5 })
  const dp = useDatePicker({ locale: 'en-GB', parse: withShortcuts() })
  useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura', secondaryCalendar: 'gregory' })
  useDatePicker({ locale: 'en-SA', secondaryCalendar: 'islamic-umalqura', numberingSystem: 'latn' })
  useDatePicker({ locale: 'ar-SA', labels: ar })
  useDatePicker({
    labels: {
      dialog: 'Choose your check-in date',
      day: (d) => [d.fullLabel, d.isDisabled && 'fully booked'].filter(Boolean).join(', '),
    },
  })
  return (
    <div {...dp.getRootProps()}>
      {String(range.value?.start)} {multi.value.length} {dp.hasInvalidValue()}
      <select {...dp.getMonthSelectProps()}>
        {dp.monthOptions.map((m) => (
          <option key={m.value} value={m.value} disabled={m.disabled}>
            {m.label}
          </option>
        ))}
      </select>
      <select {...dp.getYearSelectProps()}>
        {dp.yearOptions.map((y) => (
          <option key={y.value} value={y.value} disabled={y.disabled}>
            {y.label}
          </option>
        ))}
      </select>
      <input {...dp.getHiddenInputProps({ name: 'date' })} />
      <time {...dp.getTimeProps()} />
    </div>
  )
}

const vanilla = createDatePicker({ locale: 'fa-IR', calendar: 'persian' })
const [month] = vanilla.getMonths()
h(
  'table',
  vanilla.getGridProps(month),
  h('caption', vanilla.getMonthLabelProps(month), month.label),
)
vanilla.update({ locale: 'fa-IR', calendar: 'persian', disabled: { before: today() } })
