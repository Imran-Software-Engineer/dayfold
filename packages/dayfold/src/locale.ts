/** Locale facts derived from `Intl.Locale`, with tiny fallbacks for engines missing weekInfo. */

type LocaleInfo = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number; weekend: number[] }
  weekInfo?: { firstDay: number; weekend: number[] }
  getTextInfo?: () => { direction: string }
  textInfo?: { direction: string }
}

const locale = (tag: string): LocaleInfo | null => {
  try {
    return new Intl.Locale(tag) as LocaleInfo
  } catch {
    return null
  }
}

const region = (tag: string) => locale(tag)?.maximize().region ?? ''

const inList = (list: string, r: string) => r !== '' && list.includes(r)

// CLDR week data for regions that do not start on Monday / rest on Sat–Sun.
const SUNDAY_START =
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'
const SATURDAY_START = 'AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'
const FRI_SAT_WEEKEND = 'AE BH DZ EG IQ IL JO KW LY OM QA SA SD SY YE'

const weekInfo = (tag: string) => {
  const l = locale(tag)
  return l?.getWeekInfo?.() ?? l?.weekInfo
}

/** First day of the week for a locale: 0 = Sunday … 6 = Saturday. */
export function getWeekStart(tag: string): number {
  const info = weekInfo(tag)
  if (info) return info.firstDay % 7
  const r = region(tag)
  return inList(SUNDAY_START, r) ? 0 : inList(SATURDAY_START, r) ? 6 : 1
}

/** Weekend days for a locale, 0 = Sunday … 6 = Saturday. */
export function getWeekend(tag: string): number[] {
  const info = weekInfo(tag)
  if (info) return info.weekend.map((d) => d % 7)
  const r = region(tag)
  return r === 'IR' ? [5] : inList(FRI_SAT_WEEKEND, r) ? [5, 6] : [6, 0]
}

/** Writing direction for a locale. */
export function getDirection(tag: string): 'ltr' | 'rtl' {
  const l = locale(tag)
  const dir = (l?.getTextInfo?.() ?? l?.textInfo)?.direction
  if (dir) return dir === 'rtl' ? 'rtl' : 'ltr'
  return /^(ar|he|iw|fa|ur|ps|sd|ug|yi|dv|ckb)\b/i.test(tag) ? 'rtl' : 'ltr'
}

/** Converts Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits to ASCII. */
export function normalizeDigits(text: string): string {
  return text.replace(/[٠-٩۰-۹]/g, (c) => String(c.charCodeAt(0) & 0xf))
}
