import { ar } from 'dayfold/locales/ar'
import { DateField } from 'dayfold/react/field'
import 'dayfold/field.css'
import { type ReactNode, useState } from 'react'
import { type Lang, t } from '../i18n'

type IconKey = 'calendar' | 'range' | 'emoji' | 'text' | 'none'

const RangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function FieldDemo({ lang }: { lang: Lang }) {
  const d = t[lang].field
  const [position, setPosition] = useState<'start' | 'end'>('end')
  const [iconKey, setIconKey] = useState<IconKey>('calendar')
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)

  const icons: Record<IconKey, ReactNode | false | undefined> = {
    calendar: undefined, // built-in default
    range: <RangeIcon />,
    emoji: <span aria-hidden="true">📅</span>,
    text: <span className="fd-text-icon">{d.pick}</span>,
    none: false,
  }
  const common = {
    locale: lang === 'ar' ? 'ar-SA' : 'en-US',
    labels: lang === 'ar' ? ar : undefined,
    iconPosition: position,
    icon: icons[iconKey],
    className: 'fd-field',
  }

  const radio = <T extends string>(
    legend: string,
    value: T,
    set: (v: T) => void,
    options: [T, string][],
  ) => (
    <fieldset className="fd-group">
      <legend>{legend}</legend>
      {options.map(([v, text]) => (
        <label key={v} className="fd-radio">
          <input type="radio" checked={value === v} onChange={() => set(v)} name={legend} />
          <span>{text}</span>
        </label>
      ))}
    </fieldset>
  )

  return (
    <div className="fd">
      <div className="fd-controls">
        {radio(d.position, position, setPosition, [
          ['start', d.start],
          ['end', d.end],
        ])}
        {radio(d.icon, iconKey, setIconKey, [
          ['calendar', d.icons.calendar],
          ['range', d.icons.range],
          ['emoji', d.icons.emoji],
          ['text', d.icons.text],
          ['none', d.icons.none],
        ])}
      </div>
      <div className="fd-fields">
        <DateField
          {...common}
          label={d.startLabel}
          name="start_date"
          value={start}
          onValueChange={setStart}
          disabled={end ? { after: end } : undefined}
          description={end ? d.startHint : undefined}
        />
        <DateField
          {...common}
          label={d.endLabel}
          name="end_date"
          value={end}
          onValueChange={setEnd}
          disabled={start ? { before: start } : undefined}
          description={start ? d.endHint : d.endHintEmpty}
        />
      </div>
    </div>
  )
}
