/**
 * Optional ready-made field built on `useDatePicker`. Everything is still
 * overridable: icon, icon position, class names, day content, labels.
 *
 * ```tsx
 * import { DateField } from 'dayfold/react/field'
 * import 'dayfold/field.css' // optional default look
 *
 * <DateField label="Start date" icon={<CalendarIcon />} iconPosition="start" />
 * ```
 */
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
import { visuallyHidden } from './picker'

const srOnly = visuallyHidden as CSSProperties

import { useDatePicker } from './react'
import type { CalendarDay, DatePickerOptions, SelectionMode } from './types'

type Part =
  | 'root'
  | 'label'
  | 'description'
  | 'error'
  | 'control'
  | 'input'
  | 'trigger'
  | 'popover'
  | 'header'
  | 'selects'
  | 'select'
  | 'nav'
  | 'navButton'
  | 'months'
  | 'grid'
  | 'weekday'
  | 'cell'
  | 'day'

export interface DateFieldProps<M extends SelectionMode = 'single'> extends DatePickerOptions<M> {
  /** Visible label (required for accessibility; use `hideLabel` to hide it visually). */
  label: ReactNode
  hideLabel?: boolean
  /** Hint under the field, linked with `aria-describedby`. */
  description?: ReactNode
  /** Error message; marks the input invalid and links it with `aria-describedby`. */
  error?: ReactNode
  /** Icon inside the trigger button. Any element; `false` removes the trigger. */
  icon?: ReactNode | false
  /** Where the trigger sits in the field. Default `'end'` (mirrors automatically in RTL). */
  iconPosition?: 'start' | 'end'
  /** Month / year dropdowns in the popup header. Default `true`. */
  dropdowns?: boolean
  prevIcon?: ReactNode
  nextIcon?: ReactNode
  /** Custom content for each day button (the accessible name still comes from `labels.day`). */
  renderDay?: (day: CalendarDay) => ReactNode
  /** Extra attributes for the text input, e.g. `required`, `autoFocus`, `className`. */
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  className?: string
  /** Class names per part, added next to the default `dayfold-*` ones. */
  classNames?: Partial<Record<Part, string>>
}

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 10h18M8 3v4M16 3v4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const Chevron = ({ back }: { back?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="dayfold-chevron"
    data-back={back ? '' : undefined}
  >
    <path
      d={back ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function DateField<M extends SelectionMode = 'single'>(props: DateFieldProps<M>) {
  const {
    label,
    hideLabel,
    description,
    error,
    icon = <CalendarIcon />,
    iconPosition = 'end',
    dropdowns = true,
    prevIcon = <Chevron back />,
    nextIcon = <Chevron />,
    renderDay,
    inputProps,
    className,
    classNames: cx = {},
    ...options
  } = props
  const dp = useDatePicker<M>(options as DatePickerOptions<M>)
  const cn = (part: Part, extra?: string) =>
    [`dayfold-${part.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, cx[part], extra]
      .filter(Boolean)
      .join(' ')

  const descId = description ? `${dp.id}-description` : undefined
  const errorId = error ? `${dp.id}-error` : undefined
  const input = dp.getInputProps()
  const invalid = !!error || input['aria-invalid'] === 'true'
  const describedBy = [descId, errorId, inputProps?.['aria-describedby']].filter(Boolean).join(' ')

  const trigger =
    icon === false ? null : (
      <button className={cn('trigger')} {...dp.getTriggerProps()}>
        {icon}
      </button>
    )

  return (
    <div
      className={cn('root', ['dayfold-field', className].filter(Boolean).join(' '))}
      data-icon-position={icon === false ? undefined : iconPosition}
      data-open={dp.state.open ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      {...dp.getRootProps()}
    >
      {/* biome-ignore lint/a11y/noLabelWithoutControl: htmlFor comes from getLabelProps */}
      <label className={cn('label')} {...dp.getLabelProps()} style={hideLabel ? srOnly : undefined}>
        {label}
      </label>
      <div className={cn('control')}>
        {iconPosition === 'start' && trigger}
        <input
          {...input}
          {...inputProps}
          className={cn('input', inputProps?.className)}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
        />
        {iconPosition !== 'start' && trigger}
      </div>
      {description && (
        <p id={descId} className={cn('description')}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={cn('error')}>
          {error}
        </p>
      )}
      {options.name && <input {...dp.getHiddenInputProps()} />}

      {dp.state.open && (
        <div className={cn('popover')} {...dp.getDialogProps()}>
          <div className={cn('header')}>
            {dropdowns ? (
              <div className={cn('selects')}>
                <select className={cn('select')} {...dp.getMonthSelectProps()}>
                  {dp.monthOptions.map((m) => (
                    <option key={m.value} value={m.value} disabled={m.disabled}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select className={cn('select')} {...dp.getYearSelectProps()}>
                  {dp.yearOptions.map((y) => (
                    <option key={y.value} value={y.value} disabled={y.disabled}>
                      {y.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="dayfold-title" aria-hidden="true">
                {dp.months[0].label}
              </span>
            )}
            <div className={cn('nav')}>
              <button className={cn('navButton')} {...dp.getPrevButtonProps()}>
                {prevIcon}
              </button>
              <button className={cn('navButton')} {...dp.getNextButtonProps()}>
                {nextIcon}
              </button>
            </div>
          </div>
          <div className={cn('months')}>
            {dp.months.map((month, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable month slots keep focus
              <div className="dayfold-month" key={i}>
                <h2 {...dp.getMonthLabelProps(month)} style={srOnly}>
                  {month.label}
                </h2>
                <table className={cn('grid')} {...dp.getGridProps(month)}>
                  <thead>
                    <tr>
                      {dp.weekdays.map((w) => (
                        <th key={w.weekday} className={cn('weekday')} {...dp.getWeekdayProps(w)}>
                          {w.narrow}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {month.weeks.map((week) => (
                      <tr key={week[0].date} {...dp.getWeekProps()}>
                        {week.map((day) => (
                          <td key={day.date} className={cn('cell')} {...dp.getCellProps(day)}>
                            <button className={cn('day')} {...dp.getDayProps(day)}>
                              {renderDay ? renderDay(day) : day.label}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
