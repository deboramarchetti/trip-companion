import type { Activity, LocalEdit, LocalItem, LocalStore, PrivateEntry, TripData } from '../data/types';

/**
 * Changes made in the app ("Já reservei", "+ Adicionar reserva") are saved on
 * this phone and applied on top of the published itinerary. They can be sent
 * to the other travellers (encrypted) and later published for everyone.
 */
const KEY = 'ovt:local';
const empty = (): LocalStore => ({ edits: {}, items: [] });

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = new Set(['confirmed', 'suggestion', 'pending']);
const isEdit = (e: unknown): e is LocalEdit => !!e && typeof e === 'object' && typeof (e as LocalEdit).updatedAt === 'string';
const isItem = (i: unknown): i is LocalItem => {
  const x = i as LocalItem;
  return !!x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.kind === 'string' && DATE.test(x.date) && STATUSES.has(x.status) && typeof x.updatedAt === 'string';
};
/** Keeps only well-formed entries, so bad data (old versions, bad imports) can't break the app. */
export function sanitize(s: unknown): LocalStore {
  const x = s as Partial<LocalStore> | null;
  const edits: Record<string, LocalEdit> = {};
  if (x && x.edits && typeof x.edits === 'object') for (const [k, v] of Object.entries(x.edits)) if (isEdit(v)) edits[k] = v;
  const items = x && Array.isArray(x.items) ? x.items.filter(isItem) : [];
  return { edits, items };
}

export function loadLocal(): LocalStore {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return empty();
  }
}

/** Returns false if the phone refused to save (storage full / private mode). */
export function saveLocal(s: LocalStore): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export const clearLocal = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

export const hasLocalChanges = (s: LocalStore) => Object.keys(s.edits).length > 0 || s.items.some((i) => !i.deleted);

/** Merge another phone's changes: newest `updatedAt` wins per item. */
export function mergeLocal(a: LocalStore, raw: LocalStore): { store: LocalStore; changed: number } {
  const b = sanitize(raw);
  const out: LocalStore = { edits: { ...a.edits }, items: [...a.items] };
  let changed = 0;
  for (const [id, e] of Object.entries(b.edits)) {
    if (!out.edits[id] || out.edits[id].updatedAt < e.updatedAt) { out.edits[id] = e; changed++; }
  }
  for (const it of b.items) {
    const i = out.items.findIndex((x) => x.id === it.id);
    if (i < 0) { out.items.push(it); changed++; }
    else if (out.items[i].updatedAt < it.updatedAt) { out.items[i] = it; changed++; }
  }
  return { store: out, changed };
}

const privateOf = (e: Partial<LocalEdit>): PrivateEntry | undefined => {
  const p: PrivateEntry = {};
  if (e.bookingRef) p.bookingRef = e.bookingRef;
  if (e.phone) p.phone = e.phone;
  if (e.contact) p.contact = e.contact;
  return Object.keys(p).length ? p : undefined;
};

/** Private fields typed on this phone (codes, phones), keyed by entity id. */
export function localPrivate(s: LocalStore): Record<string, PrivateEntry> {
  const out: Record<string, PrivateEntry> = {};
  for (const [id, e] of Object.entries(s.edits)) { const p = privateOf(e); if (p) out[id] = p; }
  for (const it of s.items) { const p = !it.deleted && privateOf(it); if (p) out[it.id] = p; }
  return out;
}

/** Returns a copy of the itinerary with this phone's changes applied. */
export function applyLocal(data: TripData, s: LocalStore): TripData {
  const d: TripData = structuredClone(data);
  const appendNote = (base: string | undefined, add?: string) => (add ? (base ? `${base}\n${add}` : add) : base);

  // Codes typed for one party ("id@party") count as that party's confirmation.
  for (const [key, e] of Object.entries(s.edits)) {
    const [id, party] = key.split('@');
    if (!party || !e.bookingRef) continue;
    const t = d.hotels.find((x) => x.id === id) ?? d.flights.find((x) => x.id === id) ?? d.bookings.find((x) => x.id === id);
    if (t && !t.confirmations?.includes(party)) t.confirmations = [...(t.confirmations ?? []), party];
  }

  for (const [id, e] of Object.entries(s.edits)) {
    if (id.includes('@')) continue;
    const b = d.bookings.find((x) => x.id === id);
    if (b) {
      if (e.status) b.status = e.status;
      if (e.time) b.time = e.time;
      if (e.provider) b.provider = e.provider;
      if (e.meetingPoint) b.meetingPoint = e.meetingPoint;
      b.notes = appendNote(b.notes, e.notes);
    }
    const f = d.flights.find((x) => x.id === id);
    if (f) {
      if (e.status) f.status = e.status;
      if (e.time) f.departTime = e.time;
      if (e.provider) f.airline = e.provider;
      if (e.flightNumber) f.flightNumber = e.flightNumber;
      f.notes = appendNote(f.notes, e.notes);
    }
    const h = d.hotels.find((x) => x.id === id);
    if (h) {
      if (e.status) h.status = e.status;
      if (e.time) h.checkInTime = e.time;
      h.notes = appendNote(h.notes, e.notes);
    }
    if ((b || f || h) && e.status === 'confirmed') {
      // Details typed in the app count as "missing info provided".
      const t = (b ?? f ?? h)!;
      if (e.bookingRef || e.flightNumber || e.notes) t.missing = undefined;
    }
    // Activities linked to it follow the new status / time.
    for (const day of d.days) for (const a of day.activities) {
      if (a.bookingId === id || a.flightId === id) {
        if (e.status) a.status = e.status;
        if (e.time && !a.time && b) a.time = e.time;
        if (e.time && f && a.flightId === id) a.time = e.time; // rescheduled flight

      }
    }
  }

  for (const it of s.items) {
    if (it.deleted) continue;
    d.bookings.push({
      id: it.id, kind: it.kind, title: it.title, date: it.date, time: it.time, provider: it.provider,
      meetingPoint: it.meetingPoint, notes: it.notes, status: it.status,
    });
    const day = d.days.find((x) => x.date === it.date);
    if (day) {
      const kind: Activity['kind'] = it.kind === 'restaurant' ? 'meal' : ['transfer', 'train', 'bus', 'car', 'boat'].includes(it.kind) ? 'transfer' : 'activity';
      day.activities.push({ id: `act-${it.id}`, kind, title: it.title, time: it.time, status: it.status, bookingId: it.id, period: it.time ? undefined : 'afternoon' });
    }
  }
  return d;
}
