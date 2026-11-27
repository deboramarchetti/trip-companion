/**
 * Optional sync backend (Supabase). Configure it in `.env` (see `.env.example`).
 * Without these variables the app runs in local mode: expenses, documents and
 * booking codes stay on each phone and nothing is sent anywhere.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') || undefined;
export const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || undefined;
export const SYNC_ENABLED = !!SUPABASE_URL && !!SUPABASE_KEY && /^https:\/\//.test(SUPABASE_URL);

export class SyncDisabledError extends Error {
  constructor() { super('Sync is not configured (local mode).'); }
}
