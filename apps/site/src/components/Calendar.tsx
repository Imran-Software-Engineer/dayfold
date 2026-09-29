import type { UseDatePickerReturn } from 'dayfold/react'
import type { ReactNode } from 'react'

type Picker = UseDatePickerReturn<any>

interface CalendarProps {
  dp: Picker
  /** Class prefix so each skin styles the same markup differently. */
  prefix: string
  weekday?: 'narrow' | 'short'
  showSecondary?: boolean
  /** Optional extra content inside each day button. */
  renderExtra?: (day: Picker['months'][number]['weeks'][number][number]) => ReactNode
  /** Adds a fold-in animation whenever the month changes. */
  fold?: boolean
  headingLevel?: 'h2' | 'h3'
}

/**
 * One way to render dayfold. The library ships no markup — this component is
 * site code, and each skin could just as well render something else entirely.
 */
export function Calendar({
  dp,
  prefix: p,
  weekday = 'narrow',
  showSecondary,
  renderExtra,
  fold,
  headingLevel: Heading = 'h3',
}: CalendarProps) {
  const rtl = dp.getDirection() === 'rtl'
  return (
    <div className={`df-cal ${p}-cal`}>
      <div className={`df-nav ${p}-nav`}>
        <button className={`df-navbtn ${p}-navbtn`} {...dp.getPrevButtonProps()}>
          <Chevron flip={rtl} />
        </button>
        <button className={`df-navbtn ${p}-navbtn`} {...dp.getNextButtonProps()}>
          <Chevron flip={!rtl} />
        </button>
      </div>
      <div className={`df-months ${p}-months`}>
        {dp.months.map((month) => (
          <div className={`df-month ${p}-month`} key={month.start}>
            <div className={`df-head ${p}-head`}>
              <Heading
                className={`df-title ${p}-title`}
                {...dp.getMonthLabelProps(month)}
                suppressHydrationWarning
              >
                {month.label}
              </Heading>
              {showSecondary && month.secondaryLabel && (
                <p className={`df-subtitle ${p}-subtitle`} suppressHydrationWarning>
                  {month.secondaryLabel}
                </p>
              )}
            </div>
            <table
              className={`df-grid ${p}-grid${fold ? ' fold' : ''}`}
              key={fold ? month.start : undefined}
              {...dp.getGridProps(month)}
            >
              <thead>
                <tr>
                  {dp.weekdays.map((w) => (
                    <th className={`df-wd ${p}-wd`} key={w.weekday} {...dp.getWeekdayProps(w)}>
                      {w[weekday]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {month.weeks.map((week) => (
                  <tr key={week[0].date} {...dp.getWeekProps()}>
                    {week.map((day) => (
                      <td className={`df-cell ${p}-cell`} key={day.date} {...dp.getCellProps(day)}>
                        <button className={`df-day ${p}-day`} {...dp.getDayProps(day)}>
                          <span className={`${p}-num`}>{day.label}</span>
                          {showSecondary && day.secondaryLabel && (
                            <span className={`${p}-sec`} aria-hidden="true">
                              {day.secondaryLabel}
                            </span>
                          )}
                          {renderExtra?.(day)}
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
  )
}

export function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
