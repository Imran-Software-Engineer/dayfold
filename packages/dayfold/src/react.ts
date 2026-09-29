/**
 * React bindings.
 *
 * ```tsx
 * const dp = useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura' })
 * dp.months.map((month) => <table {...dp.getGridProps(month)}>…</table>)
 * ```
 */
import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { createDatePicker } from './picker'
import type { DatePickerOptions, Props, SelectionMode } from './types'

export function useDatePicker<M extends SelectionMode = 'single'>(
  options: DatePickerOptions<M> = {},
) {
  const reactId = useId()
  const [picker] = useState(() =>
    createDatePicker<M>({ ...options, id: options.id ?? `df${reactId.replace(/[^\w-]/g, '')}` }),
  )
  picker.setOptions(options)
  const state = useSyncExternalStore(picker.subscribe, picker.getState, picker.getState)
  useEffect(() => () => picker.destroy(), [picker])

  return {
    ...picker,
    state,
    value: picker.getValue(),
    valueText: picker.getValueText(),
    months: picker.getMonths(),
    weekdays: picker.getWeekdays(),
    /** React expects `onChange` for controlled inputs. */
    getInputProps: (): Props => {
      const { onInput, ...props } = picker.getInputProps()
      return { ...props, onChange: onInput }
    },
  }
}

export type UseDatePickerReturn<M extends SelectionMode = 'single'> = ReturnType<
  typeof useDatePicker<M>
>

export * from './index'
