import { ar } from 'dayfold/locales/ar'
import { isoToEpoch, useDatePicker } from 'dayfold/react'
import { withShortcuts } from 'dayfold/shortcuts'
import { useState } from 'react'
import { type Lang, t } from '../i18n'
import { Calendar } from './Calendar'

const loc = (lang: Lang) => (lang === 'ar' ? 'ar-SA' : 'en-US')

/** Skin 1 — editorial almanac. Same Calendar markup, serif styling. */
export function Almanac({ lang }: { lang: Lang }) {
  const dp = useDatePicker({
    locale: loc(lang),
    labels: lang === 'ar' ? ar : undefined,
    isDateDisabled: (d) => new Date(`${d}T00:00`).getDay() === 5,
  })
  return (
    <div className="skin alm" {...dp.getRootProps()}>
      <Calendar dp={dp} prefix="alm" weekday="short" />
      <p className="alm-foot">
        {dp.valueText ?? '—'}
        <span> · {lang === 'ar' ? 'مغلق أيام الجمعة' : 'Closed on Fridays'}</span>
      </p>
    </div>
  )
}

/** Skin 2 — console. Entirely different markup built on the same prop getters. */
export function Console({ lang }: { lang: Lang }) {
  const dp = useDatePicker({
    locale: 'en-US',
    fixedWeeks: false,
    labels: lang === 'ar' ? ar : undefined,
  })
  const [month] = dp.months
  return (
    <div className="skin con" {...dp.getRootProps()} dir="ltr" lang="en">
      <div className="con-bar">
        <span aria-hidden="true">●●●</span> dayfold --interactive
      </div>
      <div className="con-head">
        <button {...dp.getPrevButtonProps()}>[&lt;]</button>
        <h3 className="sr-only" {...dp.getMonthLabelProps(month)}>
          {month.label}
        </h3>
        <div className="con-jump">
          <select {...dp.getMonthSelectProps()}>
            {dp.monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.slice(0, 3).toLowerCase()}
              </option>
            ))}
          </select>
          <select {...dp.getYearSelectProps()}>
            {dp.yearOptions.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
        <button {...dp.getNextButtonProps()}>[&gt;]</button>
      </div>
      <table {...dp.getGridProps(month)}>
        <thead>
          <tr>
            {dp.weekdays.map((w) => (
              <th key={w.weekday} {...dp.getWeekdayProps(w)}>
                {w.short.slice(0, 2).toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week) => (
            <tr key={week[0].date} {...dp.getWeekProps()}>
              {week.map((day) => (
                <td key={day.date} {...dp.getCellProps(day)}>
                  <button {...dp.getDayProps(day)}>
                    {day.isOutside ? '  ' : String(day.day).padStart(2, '0')}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="con-out">
        <span aria-hidden="true">$ </span>
        {dp.value ? `selected ${dp.value}` : 'waiting for input_'}
      </p>
    </div>
  )
}

/** Skin 3 — Arabic Hijri field with text input, popup dialog and typed shortcuts. */
export function HijriField({ lang }: { lang: Lang }) {
  const dp = useDatePicker({
    locale: 'ar-SA',
    calendar: 'islamic-umalqura',
    secondaryCalendar: 'gregory',
    labels: ar,
    placeholder: 'يوم/شهر/سنة أو «غدا»',
    parse: withShortcuts(),
    name: 'hijri_date',
  })
  return (
    <div className="skin hij" {...dp.getRootProps()} lang="ar">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: htmlFor comes from getLabelProps */}
      <label className="hij-label" {...dp.getLabelProps()}>
        {lang === 'ar' ? 'تاريخ الموعد' : 'تاريخ الموعد (Appointment date)'}
      </label>
      <div className="hij-field">
        <input className="hij-input" {...dp.getInputProps()} />
        <button className="hij-trigger" {...dp.getTriggerProps()}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M3 10h18M8 3v4M16 3v4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <input {...dp.getHiddenInputProps()} />
      {dp.state.open && (
        <div className="hij-pop" {...dp.getDialogProps()}>
          <Calendar dp={dp} prefix="hij" showSecondary />
        </div>
      )}
      <p className="hij-foot" dir="ltr">
        form value → <code>{(dp.getHiddenInputProps().value as string) || '""'}</code>
      </p>
    </div>
  )
}

/** Skin 4 — booking range across two months, with nights and weekend prices. */
export function Stay({ lang }: { lang: Lang }) {
  const [range, setRange] = useState<{ start: string | null; end: string | null } | null>(null)
  const dp = useDatePicker({
    mode: 'range',
    locale: loc(lang),
    labels: lang === 'ar' ? ar : undefined,
    numberOfMonths: 2,
    value: range,
    onValueChange: setRange,
    min: new Date(),
    fixedWeeks: false,
  })
  const nights = range?.start && range.end ? isoToEpoch(range.end) - isoToEpoch(range.start) : 0
  return (
    <div className="skin stay" {...dp.getRootProps()}>
      <Calendar
        dp={dp}
        prefix="st"
        renderExtra={(day) =>
          day.isOutside || day.isDisabled ? null : (
            <span className="st-price" aria-hidden="true">
              {day.isWeekend ? '$240' : '$180'}
            </span>
          )
        }
      />
      <div className="st-foot">
        <span>
          {nights
            ? lang === 'ar'
              ? `${nights} ليالٍ`
              : `${nights} night${nights > 1 ? 's' : ''}`
            : lang === 'ar'
              ? 'اختر تاريخي الوصول والمغادرة'
              : 'Pick check-in and check-out'}
        </span>
        <button type="button" className="st-clear" onClick={() => setRange(null)} disabled={!range}>
          {lang === 'ar' ? 'مسح' : 'Clear'}
        </button>
      </div>
    </div>
  )
}

export default function Gallery({ lang }: { lang: Lang }) {
  const d = t[lang].skins
  const items = [
    ['almanac', <Almanac key="a" lang={lang} />],
    ['console', <Console key="c" lang={lang} />],
    ['hijri', <HijriField key="h" lang={lang} />],
    ['stay', <Stay key="s" lang={lang} />],
  ] as const
  return (
    <div className="gallery">
      {items.map(([k, node]) => (
        <figure className={`tile tile-${k}`} key={k}>
          {node}
          <figcaption>
            <strong>{d[k][0]}</strong> {d[k][1]}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
