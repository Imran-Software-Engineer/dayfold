import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { useDatePicker } from '../src/vue'

describe('useDatePicker (Vue)', () => {
  it('renders reactive grids with native event names', async () => {
    const el = document.createElement('div')
    document.body.append(el)
    let dp!: ReturnType<typeof useDatePicker>
    createApp({
      setup() {
        // biome-ignore lint/correctness/useHookAtTopLevel: Vue composable inside setup()
        dp = useDatePicker({ locale: 'en-US', today: '2026-09-29', announce: false })
        return () =>
          dp.months.value.map((month) =>
            h('table', dp.getGridProps(month), [
              h('caption', dp.getMonthLabelProps(month), month.label),
              ...month.weeks.map((week) =>
                h(
                  'tr',
                  dp.getWeekProps(),
                  week.map((day) =>
                    h('td', dp.getCellProps(day), [h('button', dp.getDayProps(day), day.label)]),
                  ),
                ),
              ),
            ]),
          )
      },
    }).mount(el)

    const today = el.querySelector<HTMLButtonElement>('[data-date="2026-09-29"]')!
    expect(today.tabIndex).toBe(0)
    today.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    expect(el.querySelector<HTMLButtonElement>('[data-date="2026-09-30"]')!.tabIndex).toBe(0)
    el.querySelector<HTMLButtonElement>('[data-date="2026-09-30"]:not([data-outside])')!.click()
    await nextTick()
    expect(dp.value.value).toBe('2026-09-30')
    expect(
      el.querySelector('[data-date="2026-09-30"]')!.closest('td')!.getAttribute('aria-selected'),
    ).toBe('true')
  })
})
