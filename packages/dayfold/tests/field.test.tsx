import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { DateField } from '../src/react-field'

afterEach(cleanup)
const flush = () => act(() => new Promise((r) => setTimeout(r, 30)))
const base = { locale: 'en-US', today: '2026-09-29', announce: false as const }

describe('DateField icon', () => {
  it('puts the trigger after the input by default and before it with iconPosition="start"', () => {
    const { rerender, container } = render(<DateField {...base} label="Date" />)
    const order = () =>
      [...container.querySelector('.dayfold-control')!.children].map((el) => el.tagName)
    expect(order()).toEqual(['INPUT', 'BUTTON'])
    expect(container.querySelector('[data-icon-position="end"]')).toBeTruthy()
    rerender(<DateField {...base} label="Date" iconPosition="start" />)
    expect(order()).toEqual(['BUTTON', 'INPUT'])
    expect(container.querySelector('[data-icon-position="start"]')).toBeTruthy()
  })

  it('accepts any icon element, or none', () => {
    const { rerender } = render(
      <DateField {...base} label="Date" icon={<span data-testid="mine">📆</span>} />,
    )
    const trigger = screen.getByRole('button', { name: 'Choose date' })
    expect(within(trigger).getByTestId('mine')).toBeTruthy()
    rerender(<DateField {...base} label="Date" icon={false} />)
    expect(screen.queryByRole('button', { name: 'Choose date' })).toBeNull()
    expect(screen.getByLabelText('Date')).toBeTruthy()
  })

  it('links description and error to the input', () => {
    render(<DateField {...base} label="Date" description="DD/MM/YYYY" error="Required" />)
    const input = screen.getByLabelText('Date')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const ids = input.getAttribute('aria-describedby')!.split(' ')
    expect(ids.map((id) => document.getElementById(id)!.textContent)).toEqual([
      'DD/MM/YYYY',
      'Required',
    ])
  })
})

function Linked({ twoWay = false }: { twoWay?: boolean }) {
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>('2026-10-02')
  return (
    <>
      <DateField
        {...base}
        label="Start date"
        value={start}
        onValueChange={setStart}
        disabled={twoWay && end ? { after: end } : undefined}
      />
      <DateField
        {...base}
        label="End date"
        value={end}
        onValueChange={setEnd}
        disabled={start ? { before: start } : undefined}
      />
    </>
  )
}

describe('linked start / end fields', () => {
  const typeInto = async (label: string, text: string) => {
    const input = screen.getByLabelText(label)
    fireEvent.change(input, { target: { value: text } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await flush()
  }

  it('two-way: the start field cannot move past the chosen end date', async () => {
    render(<Linked twoWay />)
    await typeInto('Start date', '10/20/2026')
    expect(screen.getByLabelText('Start date').getAttribute('aria-invalid')).toBe('true')
    await typeInto('Start date', '10/01/2026')
    expect((screen.getByLabelText('Start date') as HTMLInputElement).value).toBe('10/01/2026')
    expect(screen.getByLabelText('Start date').getAttribute('aria-invalid')).toBeNull()
  })

  it('updates disabled dates at runtime from the other field', async () => {
    render(<Linked />)
    await typeInto('Start date', '10/20/2026')
    // Start moved past the existing end date: the end field is now flagged invalid.
    expect(screen.getByLabelText('End date').getAttribute('aria-invalid')).toBe('true')

    // Open the end picker: it lands on the first selectable day, not on the disabled "today".
    const endRoot = screen.getByLabelText('End date').closest('.dayfold-field') as HTMLElement
    fireEvent.click(within(endRoot).getByRole('button', { name: /Change date/ }))
    await flush()
    const dialog = within(endRoot).getByRole('dialog')
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-20')
    const before = within(dialog).getByRole('button', { name: /October 19, 2026/ })
    expect(before.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(within(dialog).getByRole('button', { name: /October 24, 2026/ }))
    await flush()
    expect((screen.getByLabelText('End date') as HTMLInputElement).value).toBe('10/24/2026')
    expect(screen.getByLabelText('End date').getAttribute('aria-invalid')).toBeNull()
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <DateField {...base} label="Date" description="Pick a day" defaultOpen />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
