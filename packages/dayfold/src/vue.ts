/**
 * Vue 3 bindings.
 *
 * ```vue
 * <script setup>
 * const dp = useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura' })
 * </script>
 * <table v-for="month in dp.months.value" v-bind="dp.getGridProps(month)">…</table>
 * ```
 */
import {
  computed,
  type MaybeRefOrGetter,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  useId,
  watch,
} from 'vue'
import { createDatePicker } from './picker'
import type { DatePickerOptions, Props, SelectionMode } from './types'

// Vue maps `onKeyDown` to a `key-down` event; dayfold emits React-style names.
const vueProps = (props: Props): Props => {
  const out: Props = {}
  for (const [key, value] of Object.entries(props)) {
    out[/^on[A-Z]/.test(key) ? `on${key[2]}${key.slice(3).toLowerCase()}` : key] = value
  }
  return out
}

export function useDatePicker<M extends SelectionMode = 'single'>(
  options: MaybeRefOrGetter<DatePickerOptions<M>> = {},
) {
  const vueId = useId()
  const initial = { ...toValue(options) }
  const picker = createDatePicker<M>({ ...initial, id: initial.id ?? vueId })
  const state = shallowRef(picker.getState())
  const version = ref(0)
  const unsubscribe = picker.subscribe(() => {
    state.value = picker.getState()
  })
  watch(
    () => ({ ...toValue(options) }),
    (next) => {
      picker.setOptions(next)
      version.value++
    },
    { deep: true },
  )
  onScopeDispose(() => {
    unsubscribe()
    picker.destroy()
  })

  const track = () => [state.value, version.value]
  const derived = <T>(fn: () => T) =>
    computed(() => {
      track()
      return fn()
    })
  const reactive =
    <A extends unknown[]>(fn: (...args: A) => Props) =>
    (...args: A) => {
      track()
      return vueProps(fn(...args))
    }

  return {
    ...picker,
    state,
    value: derived(picker.getValue),
    valueText: derived(picker.getValueText),
    months: derived(picker.getMonths),
    weekdays: derived(picker.getWeekdays),
    getRootProps: reactive(picker.getRootProps),
    getLabelProps: reactive(picker.getLabelProps),
    getInputProps: reactive(picker.getInputProps),
    getTriggerProps: reactive(picker.getTriggerProps),
    getDialogProps: reactive(picker.getDialogProps),
    getPrevButtonProps: reactive(picker.getPrevButtonProps),
    getNextButtonProps: reactive(picker.getNextButtonProps),
    getClearButtonProps: reactive(picker.getClearButtonProps),
    getMonthLabelProps: reactive(picker.getMonthLabelProps),
    getGridProps: reactive(picker.getGridProps),
    getWeekdayProps: reactive(picker.getWeekdayProps),
    getWeekProps: reactive(picker.getWeekProps),
    getCellProps: reactive(picker.getCellProps),
    getDayProps: reactive(picker.getDayProps),
    getLiveRegionProps: reactive(picker.getLiveRegionProps),
    getHiddenInputProps: reactive(picker.getHiddenInputProps),
    getTimeProps: reactive(picker.getTimeProps),
  }
}

export * from './index'
