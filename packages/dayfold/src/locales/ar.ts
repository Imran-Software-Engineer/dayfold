import type { Labels } from '../labels'
import { defaultLabels } from '../labels'

/** Arabic accessible strings. `import { ar } from 'dayfold/locales/ar'` then `labels: ar`. */
export const ar: Labels = {
  ...defaultLabels,
  dialog: 'اختر التاريخ',
  prevMonth: 'الشهر السابق',
  nextMonth: 'الشهر التالي',
  clear: 'مسح',
  today: 'اليوم',
  selected: 'محدد',
  unavailable: 'غير متاح',
  rangeStart: 'بداية النطاق',
  rangeEnd: 'نهاية النطاق',
  trigger: (text) => (text ? `تغيير التاريخ، ${text}` : 'اختر التاريخ'),
  day: (d, l) =>
    [
      d.isToday && l.today,
      d.fullLabel + (d.secondaryFullLabel ? ` (${d.secondaryFullLabel})` : ''),
      d.isRangeStart && l.rangeStart,
      d.isRangeEnd && l.rangeEnd,
      d.isSelected && l.selected,
      d.isDisabled && l.unavailable,
    ]
      .filter(Boolean)
      .join('، '),
  selectionChanged: (text) => (text ? `تم اختيار ${text}` : 'تم مسح الاختيار'),
}
