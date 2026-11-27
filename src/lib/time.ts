import type { ISODate, LocalTime, Period } from '../data/types';

export const VIETNAM_TZ = 'Asia/Ho_Chi_Minh';

/** Today's calendar date in a given time zone (default: Vietnam, UTC+7). */
export function todayIn(timeZone = VIETNAM_TZ, now: Date = new Date()): ISODate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Current local time HH:mm in a time zone. */
export function nowTimeIn(timeZone = VIETNAM_TZ, now: Date = new Date()): LocalTime {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
}

const toUTC = (d: ISODate) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));

/** Whole days from a to b (b - a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

export function addDays(d: ISODate, n: number): ISODate {
  return new Date(toUTC(d) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Pure calendar formatting — no time-zone shifting (UTC noon trick). */
function fmt(d: ISODate, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', { ...opts, timeZone: 'UTC' }).format(new Date(toUTC(d) + 12 * 3_600_000));
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtWeekday = (d: ISODate) => cap(fmt(d, { weekday: 'long' }).replace('-feira', ''));
export const fmtWeekdayShort = (d: ISODate) => cap(fmt(d, { weekday: 'short' }).replace('.', ''));
export const fmtDayMonth = (d: ISODate) => fmt(d, { day: 'numeric', month: 'long' });
export const fmtDayMonthShort = (d: ISODate) => fmt(d, { day: '2-digit', month: 'short' }).replace('.', '').replace(' de ', ' ');
export const fmtMonthShort = (d: ISODate) => cap(fmt(d, { month: 'short' }).replace('.', ''));
export const fmtDayNum = (d: ISODate) => String(+d.slice(8, 10));
export const fmtFull = (d: ISODate) => `${fmtWeekday(d)}, ${fmtDayMonth(d)}`;

export function fmtRange(a: ISODate, b: ISODate): string {
  const sameMonth = a.slice(0, 7) === b.slice(0, 7);
  if (sameMonth) return `${fmtDayNum(a)}–${fmt(b, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  return `${fmt(a, { day: 'numeric', month: 'short' }).replace('.', '')} – ${fmt(b, { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')}`;
}

export function periodOf(time?: LocalTime, fallback?: Period): Period | undefined {
  if (!time) return fallback;
  const h = +time.slice(0, 2);
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export const PERIOD_LABEL: Record<Period, string> = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };

export function fmtDuration(min?: number): string | undefined {
  if (!min) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/** Minutes since midnight, for sorting. */
export const minutesOf = (t?: LocalTime) => (t ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : undefined);

/** Absolute instant of a local wall-clock time in an IANA zone (for flight sanity checks). */
export function zonedInstant(date: ISODate, time: LocalTime, timeZone: string): number {
  const guess = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), +time.slice(0, 2), +time.slice(3, 5));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(guess));
  const get = (t: string) => +parts.find((p) => p.type === t)!.value;
  const asLocal = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return guess - (asLocal - guess);
}
