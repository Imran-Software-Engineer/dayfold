import { describe, expect, it, vi } from 'vitest'
import { h, spread } from '../src/dom'

describe('dom helpers', () => {
  it('maps props to attributes, properties and listeners', () => {
    const onClick = vi.fn()
    const el = h(
      'button',
      { tabIndex: -1, 'aria-label': 'x', 'data-on': '', onClick, hidden: undefined },
      'hi',
    )
    expect(el.getAttribute('tabindex')).toBe('-1')
    expect(el.getAttribute('aria-label')).toBe('x')
    expect(el.hasAttribute('data-on')).toBe(true)
    expect(el.textContent).toBe('hi')
    el.click()
    expect(onClick).toHaveBeenCalledOnce()

    const input = document.createElement('input')
    const off = spread(input, { value: 'abc', htmlFor: 'y', onInput: onClick })
    expect(input.value).toBe('abc')
    off()
    input.dispatchEvent(new Event('input'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
