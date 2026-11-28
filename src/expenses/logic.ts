/**
 * Shared trip expenses ("Splitwise" inside the app) — pure logic.
 * Balances are in Vietnamese dong (₫). Amounts in other currencies are
 * converted with the rate stored on each expense when it was entered.
 */
import { tripData } from '../data/trip';

/** Traveller ids come from the trip data (`trip.travelers`). */
export type PersonId = string;
export type Currency = 'VND' | 'BRL' | 'USD';

export const PEOPLE: { id: PersonId; name: string }[] = (tripData.trip.travelers ?? []).map((t) => ({ id: t.id, name: t.name }));
export const personName = (id: PersonId) => PEOPLE.find((p) => p.id === id)?.name ?? id;

export const CATEGORIES = ['Comida', 'Transporte', 'Hospedagem', 'Passeios', 'Compras', 'Outros'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface ExpenseData {
  description: string;
  amount: number; // in `currency`
  currency: Currency;
  rateToVnd: number; // 1 unit of currency = X ₫ (1 for VND)
  paidBy: PersonId;
  /** Share of each participant, in ₫. Sums to the total in ₫. */
  shares: Partial<Record<PersonId, number>>;
  splitMode: 'equal' | 'exact';
  category: Category;
  date: string; // YYYY-MM-DD
  createdBy?: PersonId;
}
export interface SettlementData {
  from: PersonId; // who paid back
  to: PersonId;
  amount: number;
  currency: Currency;
  rateToVnd: number;
  date: string;
}
export interface SettingsData {
  rates: Record<Exclude<Currency, 'VND'>, number>;
}

export type Row =
  | { id: string; kind: 'expense'; data: ExpenseData; deleted: boolean; client_updated_at: string }
  | { id: string; kind: 'settlement'; data: SettlementData; deleted: boolean; client_updated_at: string }
  | { id: string; kind: 'settings'; data: SettingsData; deleted: boolean; client_updated_at: string };

const PERSON_IDS = new Set(PEOPLE.map((p) => p.id));
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
/** True if a row has everything the app needs (protects against bad data). */
export function isValidRow(r: unknown): r is Row {
  const x = r as Row;
  if (!x || typeof x.id !== 'string' || typeof x.client_updated_at !== 'string' || !x.data || typeof x.data !== 'object') return false;
  if (x.kind === 'settings') return !!x.data.rates && num(x.data.rates.BRL) && num(x.data.rates.USD);
  if (x.kind === 'settlement') return PERSON_IDS.has(x.data.from) && PERSON_IDS.has(x.data.to) && num(x.data.amount) && num(x.data.rateToVnd) && typeof x.data.date === 'string';
  if (x.kind === 'expense') {
    const d = x.data;
    return typeof d.description === 'string' && num(d.amount) && num(d.rateToVnd) && PERSON_IDS.has(d.paidBy) && !!d.shares && typeof d.shares === 'object'
      && Object.entries(d.shares).every(([p, v]) => PERSON_IDS.has(p) && num(v)) && typeof d.date === 'string';
  }
  return false;
}

export const SETTINGS_ID = '00000000-0000-4000-8000-0000000000a1';
export const DEFAULT_RATES: SettingsData['rates'] = { BRL: 4700, USD: 26000 };

export const toVnd = (amount: number, rate: number) => Math.round(amount * rate);

/** Equal split in ₫ among participants; rounding remainder goes to the first ones. */
export function equalShares(totalVnd: number, people: PersonId[]): Partial<Record<PersonId, number>> {
  if (!people.length) return {};
  const base = Math.floor(totalVnd / people.length);
  let rest = totalVnd - base * people.length;
  const out: Partial<Record<PersonId, number>> = {};
  for (const p of people) {
    out[p] = base + (rest > 0 ? 1 : 0);
    if (rest > 0) rest--;
  }
  return out;
}

export interface Balance {
  /** + receives, − owes (₫). */
  net: Record<PersonId, number>;
  paid: Record<PersonId, number>; // paid for the group (expenses)
  consumed: Record<PersonId, number>; // own share of expenses
  total: number; // total trip spending (₫)
}

export function balances(rows: Row[]): Balance {
  const zero = () => Object.fromEntries(PEOPLE.map((p) => [p.id, 0])) as Record<PersonId, number>;
  const net = zero(), paid = zero(), consumed = zero();
  let total = 0;
  for (const r of rows) {
    if (!isValidRow(r) || r.deleted) continue;
    if (r.kind === 'expense') {
      const t = toVnd(r.data.amount, r.data.rateToVnd);
      total += t;
      net[r.data.paidBy] += t;
      paid[r.data.paidBy] += t;
      for (const [p, s] of Object.entries(r.data.shares) as [PersonId, number][]) {
        net[p] -= s;
        consumed[p] += s;
      }
    } else if (r.kind === 'settlement') {
      const t = toVnd(r.data.amount, r.data.rateToVnd);
      net[r.data.from] += t; // paying back reduces what you owe
      net[r.data.to] -= t;
    }
  }
  return { net, paid, consumed, total };
}

/** Fewest transfers to settle everything: who pays whom how much (₫). */
export function settleUp(net: Record<PersonId, number>, tolerance = 500): { from: PersonId; to: PersonId; amount: number }[] {
  const debtors = (Object.entries(net) as [PersonId, number][]).filter(([, v]) => v < -tolerance).map(([p, v]) => ({ p, v: -v })).sort((a, b) => b.v - a.v);
  const creditors = (Object.entries(net) as [PersonId, number][]).filter(([, v]) => v > tolerance).map(([p, v]) => ({ p, v })).sort((a, b) => b.v - a.v);
  const out: { from: PersonId; to: PersonId; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const x = Math.min(debtors[i].v, creditors[j].v);
    if (x > tolerance) out.push({ from: debtors[i].p, to: creditors[j].p, amount: Math.round(x) });
    debtors[i].v -= x;
    creditors[j].v -= x;
    if (debtors[i].v <= tolerance) i++;
    if (creditors[j].v <= tolerance) j++;
  }
  return out;
}

export const fmtVnd = (v: number) => `${new Intl.NumberFormat('pt-BR').format(Math.round(v))} ₫`;
export const fmtMoney = (v: number, c: Currency) =>
  c === 'VND' ? fmtVnd(v) : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: c }).format(v);

/**
 * Parses what people type: "120.000", "120000", "12,50", "1.500" (= 1500),
 * "1.234,56", "1,234.56", "12.5". Anything else (letters, "1e3", negatives) is NaN.
 */
export function parseAmount(s: string, c: Currency): number {
  const t = s.replace(/\s/g, '');
  if (!t || !/^[\d.,]+$/.test(t)) return NaN;
  if (c === 'VND') return Number(t.replace(/[.,]/g, ''));
  const lastDot = t.lastIndexOf('.'), lastComma = t.lastIndexOf(',');
  let norm: string;
  if (lastDot >= 0 && lastComma >= 0) {
    // Both present: the last one is the decimal separator.
    norm = lastComma > lastDot ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  } else if (lastComma >= 0) {
    norm = /^\d{1,3}(,\d{3})+$/.test(t) && !/,\d{1,2}$/.test(t) ? t.replace(/,/g, '') : t.replace(/,/g, '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    norm = t.replace(/\./g, ''); // "1.500" = one thousand five hundred
  } else norm = t;
  if ((norm.match(/\./g) ?? []).length > 1) return NaN;
  return Number(norm);
}

/**
 * Dong amounts as people type them at a market: "50000", "50.000", "50k",
 * "1,5tr" / "1.5m" (triệu = million). Returns NaN for anything else.
 */
export function parseDong(s: string): number {
  const t = s.trim().toLowerCase().replace(/\s/g, '').replace(/₫|vnd|đ$/g, '');
  const m = t.match(/^(\d+(?:[.,]\d+)?)(k|tr|m)?$/) ?? t.match(/^(\d{1,3}(?:[.,]\d{3})+)()$/);
  if (!m) return NaN;
  const [, num, unit] = m;
  if (!unit) return Number(num.replace(/[.,]/g, ''));
  const v = Number(num.replace(',', '.'));
  return Math.round(v * (unit === 'k' ? 1_000 : 1_000_000));
}

const group = (digits: string) => digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Formats an amount while it is typed, so zeros are easy to count:
 * dong "58888" → "58.888"; real/dollar "1234,5" → "1.234,5" (comma = cents, up to 2 digits).
 * The result always reads back with parseAmount().
 */
export function formatTyping(s: string, c: Currency): string {
  if (c === 'VND') return group(s.replace(/\D/g, ''));
  const t = s.replace(/[^\d,]/g, '');
  const i = t.indexOf(',');
  if (i < 0) return group(t);
  return `${group(t.slice(0, i)) || '0'},${t.slice(i + 1).replace(/,/g, '').slice(0, 2)}`;
}

/** An existing amount shown in the same format (520.22 BRL → "520,22"; 58888 ₫ → "58.888"). */
export const formatAmount = (v: number, c: Currency) =>
  c === 'VND' ? group(String(Math.round(v))) : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, useGrouping: true }).format(v);
