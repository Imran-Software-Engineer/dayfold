import { ar } from 'dayfold/locales/ar'
import { defaultLabels, useDatePicker } from 'dayfold/react'
import { useEffect, useState } from 'react'
import { type Lang, t } from '../i18n'
import { Calendar } from './Calendar'

export default function A11yLab({ lang }: { lang: Lang }) {
  const d = t[lang].lab
  const base = lang === 'ar' ? ar : defaultLabels
  const [labels, setLabels] = useState({
    prevMonth: base.prevMonth,
    nextMonth: base.nextMonth,
    selected: base.selected,
    today: base.today,
  })
  const [log, setLog] = useState<string[]>([])
  const dp = useDatePicker({
    locale: lang === 'ar' ? 'ar-SA' : 'en-US',
    labels: { ...base, ...labels },
    announce: 'manual',
    isDateDisabled: (iso) => iso.endsWith('-13'),
  })

  const announcement = dp.state.announcement
  useEffect(() => {
    if (announcement) setLog((l) => [announcement, ...l].slice(0, 5))
  }, [announcement])

  const focused = dp.months.flatMap((m) => m.weeks.flat()).find((day) => day.isFocused)
  const heard = focused ? dp.getDayProps(focused)['aria-label'] : ''

  const field = (key: keyof typeof labels, label: string) => (
    <label className="lab-field" key={key}>
      <span>{label}</span>
      <input
        value={labels[key]}
        onChange={(e) => setLabels((l) => ({ ...l, [key]: e.target.value }))}
      />
    </label>
  )

  return (
    <div className="lab">
      <div className="lab-fields">
        {field('prevMonth', d.prev)}
        {field('nextMonth', d.next)}
        {field('selected', d.selectedWord)}
        {field('today', d.todayWord)}
      </div>
      <div className="lab-stage" {...dp.getRootProps()}>
        <Calendar dp={dp} prefix="lb" />
      </div>
      <div className="lab-output">
        <p className="lab-heading">{d.hears}</p>
        <p className="lab-speech">
          <span aria-hidden="true">🔊 </span>
          {heard || d.focusHint}
        </p>
        <p className="lab-heading">{d.log}</p>
        <span {...dp.getLiveRegionProps()} className="sr-only">
          {announcement}
        </span>
        <div className="lab-log">
          {log.length ? (
            <ol>
              {log.map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: short rolling log
                <li key={i}>{line}</li>
              ))}
            </ol>
          ) : (
            <span className="muted">—</span>
          )}
        </div>
      </div>
    </div>
  )
}
