/**
 * Vanilla DOM helpers for using dayfold without a framework.
 *
 * ```js
 * const cleanup = spread(button, picker.getDayProps(day))
 * ```
 */
import type { Props } from './types'

const ATTRS: Record<string, string> = {
  tabIndex: 'tabindex',
  htmlFor: 'for',
  className: 'class',
  autoComplete: 'autocomplete',
  dateTime: 'datetime',
}

/**
 * Applies dayfold props to an element: `onX` handlers become event listeners,
 * `value` is set as a property, `null` / `undefined` remove the attribute.
 * Returns a function that removes the listeners.
 */
export function spread(el: Element, props: Props): () => void {
  const off: Array<() => void> = []
  for (const [key, value] of Object.entries(props)) {
    if (/^on[A-Z]/.test(key) && typeof value === 'function') {
      const type = key.slice(2).toLowerCase()
      el.addEventListener(type, value)
      off.push(() => el.removeEventListener(type, value))
    } else if (key === 'value' && 'value' in el) {
      if ((el as HTMLInputElement).value !== value) (el as HTMLInputElement).value = value ?? ''
    } else if (value == null || value === false) {
      el.removeAttribute(ATTRS[key] ?? key)
    } else {
      el.setAttribute(ATTRS[key] ?? key, value === true ? '' : String(value))
    }
  }
  return () => {
    for (const fn of off) fn()
  }
}

/** Tiny element factory: `h('button', picker.getDayProps(day), day.label)`. */
export function h(
  tag: string,
  props: Props = {},
  ...children: Array<Node | string | null | undefined | false>
): HTMLElement {
  const el = document.createElement(tag)
  spread(el, props)
  for (const child of children) if (child != null && child !== false) el.append(child)
  return el
}
