import type { Row, SettingsData } from './logic';
import { DEFAULT_RATES, SETTINGS_ID, isValidRow } from './logic';

/**
 * Offline-first sync with Supabase. Every change is saved on the phone first
 * (localStorage) and pushed when there is internet. The table is only
 * reachable through two database functions that require the trip key
 * (SHA-256 of the trip passphrase), so the public API key alone reads nothing.
 */
import { SUPABASE_KEY, SUPABASE_URL, SYNC_ENABLED, SyncDisabledError } from '../lib/backend';
const KEY = 'ovt:expenses';

interface Store {
  rows: Record<string, Row>;
  pending: string[];
  lastPull: string | null;
}

export function load(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Store | null;
    if (s && s.rows && typeof s.rows === 'object' && Array.isArray(s.pending)) {
      // Drop anything malformed so one bad record can't break the screen.
      for (const [id, r] of Object.entries(s.rows)) if (!isValidRow(r)) delete s.rows[id];
      return s;
    }
  } catch { /* ignore */ }
  return { rows: {}, pending: [], lastPull: null };
}
function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

/** The expenses key is a random secret shipped encrypted with the booking codes. */
export const isExpensesKey = (k?: string): k is string => !!k && /^[0-9a-f]{64}$/.test(k);

/** Saves a change locally and queues it for upload. */
export function put(row: Omit<Row, 'client_updated_at'>): Store {
  const s = load();
  s.rows[row.id] = { ...row, client_updated_at: new Date().toISOString() } as Row;
  if (!s.pending.includes(row.id)) s.pending.push(row.id);
  save(s);
  return s;
}

export function settingsOf(s: Store): SettingsData {
  const r = s.rows[SETTINGS_ID];
  return r && r.kind === 'settings' && !r.deleted ? r.data : { rates: DEFAULT_RATES };
}

export class SyncError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function rpc<T>(fn: string, body: unknown): Promise<T> {
  if (!SYNC_ENABLED) throw new SyncDisabledError();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new SyncError(`${fn}: HTTP ${res.status}`, res.status);
  return res.json() as Promise<T>;
}

type ServerRow = Row & { updated_at: string };

/** Rows the server refused (bad data); kept on the phone, no longer retried. */
export function rejected(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY + ':rejected') ?? '[]'); } catch { return []; }
}

async function pushRows(key: string, rows: Row[]): Promise<Row[]> {
  try {
    await rpc<number>('vt_push', { p_key: key, p_rows: rows });
    return rows;
  } catch (e) {
    // A 4xx means some row was refused: send one by one so one bad row can't block the rest.
    if (!(e instanceof SyncError) || e.status < 400 || e.status >= 500 || rows.length === 1) {
      if (e instanceof SyncError && e.status >= 400 && e.status < 500 && rows.length === 1) {
        try { localStorage.setItem(KEY + ':rejected', JSON.stringify([...new Set([...rejected(), rows[0].id])])); } catch { /* ignore */ }
        return rows; // drop it from the queue
      }
      throw e;
    }
    const done: Row[] = [];
    for (const r of rows) done.push(...(await pushRows(key, [r])));
    return done;
  }
}

/** Push pending changes, then pull everything new. Newest edit wins. */
export async function sync(key: string): Promise<Store> {
  let s = load();
  if (s.pending.length) {
    const rows = s.pending.map((id) => s.rows[id]).filter(Boolean);
    const sent: Row[] = [];
    for (let i = 0; i < rows.length; i += 200) sent.push(...(await pushRows(key, rows.slice(i, i + 200))));
    s = load(); // anything saved meanwhile stays pending
    const pushed = new Set(sent.map((r) => r.id + r.client_updated_at));
    s.pending = s.pending.filter((id) => s.rows[id] && !pushed.has(id + s.rows[id].client_updated_at));
    save(s);
  }
  // Re-read the last minute too: server timestamps are not strictly commit-ordered.
  const since = s.lastPull ? new Date(Date.parse(s.lastPull) - 60_000).toISOString() : null;
  const incoming = await rpc<ServerRow[]>('vt_pull', { p_key: key, p_since: since });
  s = load();
  for (const r of incoming) {
    if (!isValidRow(r)) {
      const at = (r as unknown as { updated_at?: string }).updated_at;
      if (at && (!s.lastPull || at > s.lastPull)) s.lastPull = at;
      continue;
    }
    const local = s.rows[r.id];
    if (!local || (!s.pending.includes(r.id) && local.client_updated_at <= r.client_updated_at) || local.client_updated_at < r.client_updated_at) {
      const { updated_at: _u, ...row } = r; // eslint-disable-line @typescript-eslint/no-unused-vars
      s.rows[r.id] = row as Row;
    }
    if (!s.lastPull || r.updated_at > s.lastPull) s.lastPull = r.updated_at;
  }
  save(s);
  return s;
}
