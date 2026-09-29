import { ar } from 'dayfold/locales/ar'
import { useDatePicker } from 'dayfold/react'
import { useRef, useState } from 'react'
import { type Lang, t } from '../i18n'
import { Calendar } from './Calendar'

type Mode = 'single' | 'range' | 'multiple'

const LOCALES = [
  ['en-US', 'English (US)'],
  ['ar-SA', 'العربية (السعودية)'],
  ['en-GB', 'English (UK)'],
  ['fr-FR', 'Français'],
  ['fa-IR', 'فارسی'],
  ['he-IL', 'עברית'],
  ['ja-JP', '日本語'],
  ['ur-PK', 'اردو'],
]
const CALENDARS = ['gregory', 'islamic-umalqura', 'persian', 'hebrew', 'buddhist']

export default function Hero({ lang }: { lang: Lang }) {
  const d = t[lang]
  const [calendar, setCalendar] = useState(lang === 'ar' ? 'islamic-umalqura' : 'gregory')
  const [locale, setLocale] = useState(lang === 'ar' ? 'ar-SA' : 'en-US')
  const [mode, setMode] = useState<Mode>('single')
  const [second, setSecond] = useState(lang === 'ar' ? 'gregory' : 'islamic-umalqura')

  const select = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: [string, string][],
  ) => (
    <label className="ctl">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="hero-demo">
      <div className="controls">
        {select(
          d.controls.calendar,
          calendar,
          setCalendar,
          CALENDARS.map((c) => [c, d.calendars[c]]),
        )}
        {select(d.controls.second, second, setSecond, [
          ['', d.none],
          ...CALENDARS.filter((c) => c !== calendar).map((c): [string, string] => [
            c,
            d.calendars[c],
          ]),
        ])}
        {select(d.controls.locale, locale, setLocale, LOCALES as [string, string][])}
        {select(d.controls.mode, mode, (v) => setMode(v as Mode), Object.entries(d.modes))}
      </div>
      <HeroCalendar
        key={mode}
        mode={mode}
        calendar={calendar}
        locale={locale}
        second={second && second !== calendar ? second : undefined}
        lang={lang}
      />
      <p className="hint">{d.hint}</p>
    </div>
  )
}

function HeroCalendar(props: {
  mode: Mode
  calendar: string
  locale: string
  second?: string
  lang: Lang
}) {
  const d = t[props.lang]
  const dp = useDatePicker<Mode>({
    mode: props.mode,
    calendar: props.calendar,
    locale: props.locale,
    secondaryCalendar: props.second,
    labels: props.locale.startsWith('ar') ? ar : undefined,
  })

  // Fold forwards or backwards depending on the direction of travel.
  const last = useRef(dp.months[0].start)
  const direction = dp.months[0].start < last.current ? 'back' : 'forward'
  last.current = dp.months[0].start

  const value = dp.value
  const first =
    typeof value === 'string'
      ? value
      : Array.isArray(value)
        ? value[0]
        : (value?.start ?? undefined)

  return (
    <div className="hero-card" data-fold={direction} lang={props.locale} {...dp.getRootProps()}>
      <Calendar dp={dp} prefix="hc" showSecondary={!!props.second} fold headingLevel="h2" />
      <output className="hero-value" aria-live="off">
        <span className="label">{d.selected}</span>
        {dp.valueText && first ? (
          <time {...dp.getTimeProps(first)}>{dp.valueText}</time>
        ) : (
          <span className="muted">{d.nothing}</span>
        )}
      </output>
    </div>
  )
}
