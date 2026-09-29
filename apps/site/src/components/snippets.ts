export const snippets = {
  react: `import { useDatePicker } from 'dayfold/react'

export function HijriCalendar() {
  const dp = useDatePicker({ locale: 'ar-SA', calendar: 'islamic-umalqura' })

  return (
    <div {...dp.getRootProps()}>
      <button {...dp.getPrevButtonProps()}>‹</button>
      <button {...dp.getNextButtonProps()}>›</button>
      {dp.months.map((month) => (
        <table key={month.start} {...dp.getGridProps(month)}>
          <caption {...dp.getMonthLabelProps(month)}>{month.label}</caption>
          <tbody>
            {month.weeks.map((week) => (
              <tr key={week[0].date} {...dp.getWeekProps()}>
                {week.map((day) => (
                  <td key={day.date} {...dp.getCellProps(day)}>
                    <button className="day" {...dp.getDayProps(day)}>{day.label}</button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}`,
  vue: `<script setup>
import { useDatePicker } from 'dayfold/vue'

const dp = useDatePicker({ locale: 'en-GB', mode: 'range', numberOfMonths: 2 })
</script>

<template>
  <div v-bind="dp.getRootProps()">
    <table v-for="month in dp.months.value" :key="month.start" v-bind="dp.getGridProps(month)">
      <caption v-bind="dp.getMonthLabelProps(month)">{{ month.label }}</caption>
      <tr v-for="week in month.weeks" :key="week[0].date" v-bind="dp.getWeekProps()">
        <td v-for="day in week" :key="day.date" v-bind="dp.getCellProps(day)">
          <button class="day" v-bind="dp.getDayProps(day)">{{ day.label }}</button>
        </td>
      </tr>
    </table>
  </div>
</template>`,
  vanilla: `import { createDatePicker } from 'dayfold'
import { h } from 'dayfold/dom'

const dp = createDatePicker({ locale: 'fa-IR', calendar: 'persian' })
const root = document.querySelector('#calendar')

function render() {
  root.replaceChildren(
    ...dp.getMonths().map((month) =>
      h('table', dp.getGridProps(month),
        h('caption', dp.getMonthLabelProps(month), month.label),
        ...month.weeks.map((week) =>
          h('tr', dp.getWeekProps(),
            ...week.map((day) =>
              h('td', dp.getCellProps(day),
                h('button', dp.getDayProps(day), day.label)))))),
    ),
  )
}

dp.subscribe(render)
render()`,
}
