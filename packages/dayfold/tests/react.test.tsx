import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { type DatePickerOptions, useDatePicker } from '../src/react'

afterEach(cleanup)
const flush = () => act(() => new Promise((r) => setTimeout(r, 30)))

function Picker(props: DatePickerOptions & { onValue?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null)
  const dp = useDatePicker({
    locale: 'en-US',
    today: '2026-09-29',
    value,
    onValueChange: (v) => {
      setValue(v)
      props.onValue?.(v)
    },
    ...props,
  })
  return (
    <div {...dp.getRootProps()}>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: htmlFor comes from getLabelProps */}
      <label {...dp.getLabelProps()}>Arrival</label>
      <input {...dp.getInputProps()} />
      <button {...dp.getTriggerProps()}>📅</button>
      {dp.state.open && (
        <div {...dp.getDialogProps()}>
          <button {...dp.getPrevButtonProps()}>‹</button>
          <button {...dp.getNextButtonProps()}>›</button>
          {dp.months.map((month) => (
            <div key={month.start}>
              <h2 {...dp.getMonthLabelProps(month)}>{month.label}</h2>
              <table {...dp.getGridProps(month)}>
                <thead>
                  <tr>
                    {dp.weekdays.map((w) => (
                      <th key={w.weekday} {...dp.getWeekdayProps(w)}>
                        {w.narrow}
                      </th>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

describe('useDatePicker (React)', () => {
  it('opens, focuses the focused day, navigates by keyboard and selects', async () => {
    let picked: string | null = null
    render(<Picker onValue={(v) => (picked = v)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    await flush()
    const today = screen.getByRole('button', { name: /Today/ })
    expect(document.activeElement).toBe(today)

    fireEvent.keyDown(today, { key: 'ArrowDown' })
    await flush()
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-06')
    expect(screen.getByRole('heading').textContent).toBe('October 2026')

    fireEvent.click(document.activeElement!)
    await flush()
    expect(picked).toBe('2026-10-06')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /Change date, Oct 6, 2026/ }),
    )
    expect((screen.getByLabelText('Arrival') as HTMLInputElement).value).toBe('10/06/2026')
  })

  it('accepts typed input', async () => {
    render(<Picker />)
    const input = screen.getByLabelText('Arrival')
    fireEvent.change(input, { target: { value: '12/25/2026' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await flush()
    expect(screen.getByRole('button', { name: /Dec 25, 2026/ })).toBeTruthy()
  })

  it('traps focus in the dialog and closes on Escape', async () => {
    render(<Picker />)
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    await flush()
    const dialog = screen.getByRole('dialog')
    const today = screen.getByRole('button', { name: /Today/ })
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Previous month' }))
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(today)
    fireEvent.keyDown(today, { key: 'Escape' })
    await flush()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has no axe violations (Gregorian and Hijri RTL)', async () => {
    for (const props of [
      {},
      { locale: 'ar-SA', calendar: 'islamic-umalqura', secondaryCalendar: 'gregory' },
    ]) {
      const { container, unmount } = render(<Picker {...props} defaultOpen />)
      const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
      unmount()
    }
  })
})
