/**
 * Travel documents (visa, insurance, vaccine certificate…), end-to-end encrypted.
 * Files are encrypted ON THE PHONE with a random per-party key that ships inside
 * the passphrase-protected private data; Supabase only ever stores ciphertext.
 * Every document is also kept on the phone (IndexedDB) so it opens offline.
 */
import type { PersonId } from '../expenses/logic';

import { SUPABASE_KEY, SUPABASE_URL, SYNC_ENABLED, SyncDisabledError } from '../lib/backend';

export type DocMime = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
export interface DocMeta {
  id: string;
  owner: PersonId;
  title: string;
  mime: DocMime;
  size: number;
  updated_at?: string;
  /** One reservation for everyone (shown as "Todos"). */
  shared?: boolean;
}
export interface StoredDoc extends DocMeta {
  iv?: string; // base64
  data?: string; // base64 ciphertext; absent until downloaded
  pending?: 'upload' | 'delete';
}

export const MAX_BYTES = 6_000_000;
export const isDocsKey = (k?: string): k is string => !!k && /^[0-9a-f]{64}$/.test(k);

/* ------------------------------------------------------------------ crypto */
const hexBytes = (h: string) => Uint8Array.from(h.match(/../g)!.map((x) => parseInt(x, 16)));
const toB64 = (u8: Uint8Array) => {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function aesKey(docsKey: string) {
  return crypto.subtle.importKey('raw', hexBytes(docsKey) as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
/** Server-side access token: a hash of the key, so the server never learns the key itself. */
export async function accessKey(docsKey: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ovt-docs:' + docsKey)));
  return [...h].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function encryptBytes(docsKey: string, bytes: Uint8Array): Promise<{ iv: string; data: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await aesKey(docsKey), bytes as BufferSource));
  return { iv: toB64(iv), data: toB64(ct) };
}
export async function decryptBytes(docsKey: string, iv: string, data: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) as BufferSource }, await aesKey(docsKey), fromB64(data) as BufferSource));
}

/* ------------------------------------------------------------- local cache */
const DB = 'ovt-docs';
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('docs', { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction('docs', mode);
    const req = fn(t.objectStore('docs'));
    t.oncomplete = () => resolve(req ? (req as IDBRequest<T>).result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
// Booking codes are synced as an encrypted JSON blob (see codes.ts), never shown as a document.
export const localDocs = async () => ((await tx<StoredDoc[]>('readonly', (s) => s.getAll())) ?? []).filter((d) => d.pending !== 'delete' && (d.mime as string) !== 'application/json');
const allLocal = async () => (await tx<StoredDoc[]>('readonly', (s) => s.getAll())) ?? [];
const putLocal = (d: StoredDoc) => tx('readwrite', (s) => s.put(d));
const delLocal = (id: string) => tx('readwrite', (s) => s.delete(id));
export const getLocal = (id: string) => tx<StoredDoc>('readonly', (s) => s.get(id));

/* --------------------------------------------------------------------- api */
export async function rpc<T>(fn: string, body: unknown): Promise<T> {
  if (!SYNC_ENABLED) throw new SyncDisabledError();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/** Encrypts and saves a new document on the phone, then tries to upload it. */
export async function addDocument(docsKey: string, meta: Omit<DocMeta, 'size'>, bytes: Uint8Array) {
  if (bytes.length > MAX_BYTES) throw new Error('Arquivo grande demais (máx. 6 MB).');
  const { iv, data } = await encryptBytes(docsKey, bytes);
  await putLocal({ ...meta, size: bytes.length, iv, data, pending: 'upload' });
}
export async function removeDocument(id: string) {
  const d = await getLocal(id);
  if (!d) return;
  if (d.pending === 'upload' && !d.updated_at) await delLocal(id); // never reached the server
  else await putLocal({ ...d, pending: 'delete', data: undefined });
}

/** Upload pending, apply deletions, then download every document of this party. */
export async function syncDocuments(docsKey: string): Promise<void> {
  const key = await accessKey(docsKey);
  for (const d of await allLocal()) {
    if (d.pending === 'upload' && d.iv && d.data) {
      await rpc('vt_doc_put', { p_key: key, p_id: d.id, p_owner: d.owner, p_title: d.title, p_mime: d.mime, p_size: d.size, p_iv: d.iv, p_data: d.data });
      await putLocal({ ...d, pending: undefined, updated_at: new Date().toISOString() });
    } else if (d.pending === 'delete') {
      await rpc('vt_doc_delete', { p_key: key, p_id: d.id });
      await delLocal(d.id);
    }
  }
  const remote = await rpc<(DocMeta & { deleted: boolean; updated_at: string })[]>('vt_doc_list', { p_key: key });
  const local = new Map((await allLocal()).map((d) => [d.id, d]));
  for (const r of remote) {
    if ((r.mime as string) === 'application/json') continue; // booking codes (codes.ts)
    const l = local.get(r.id);
    if (r.deleted) { if (l && !l.pending) await delLocal(r.id); continue; }
    if (l?.pending) continue;
    if (!l || !l.data || (l.updated_at ?? '') < r.updated_at) {
      const [blob] = await rpc<{ iv: string; data: string }[]>('vt_doc_get', { p_key: key, p_id: r.id });
      if (blob) await putLocal({ id: r.id, owner: r.owner, title: r.title, mime: r.mime, size: r.size, updated_at: r.updated_at, iv: blob.iv, data: blob.data });
    }
  }
}

/* ------------------------------------------- documents included in the app */
const HIDDEN = 'ovt:docs-hidden';
export const hiddenSeeds = (): string[] => { try { return JSON.parse(localStorage.getItem(HIDDEN) ?? '[]'); } catch { return []; } };
export const hideSeed = (id: string) => { try { localStorage.setItem(HIDDEN, JSON.stringify([...new Set([...hiddenSeeds(), id])])); } catch { /* ignore */ } };

/** Opens a document shipped encrypted with the app (precached → works offline). */
export async function openSeedDocument(docsKey: string, seed: { id: string; iv: string; mime: string }): Promise<Blob> {
  const res = await fetch(`/seed-docs/${seed.id}.txt`);
  if (!res.ok) throw new Error('Documento não encontrado neste celular — abra o app com internet uma vez.');
  return new Blob([await decryptBytes(docsKey, seed.iv, (await res.text()).trim()) as BlobPart], { type: seed.mime });
}

/** Decrypts a cached document into a Blob for viewing/sharing (works offline). */
export async function openDocument(docsKey: string, id: string): Promise<Blob> {
  const d = await getLocal(id);
  if (!d?.iv || !d.data) throw new Error('Documento ainda não baixado neste celular.');
  return new Blob([await decryptBytes(docsKey, d.iv, d.data) as BlobPart], { type: d.mime });
}

/** Photos are shrunk (max 2000 px, JPEG) so they upload fast and stay readable. */
export async function prepareFile(file: File): Promise<{ bytes: Uint8Array; mime: DocMime }> {
  if (file.type === 'application/pdf') return { bytes: new Uint8Array(await file.arrayBuffer()), mime: 'application/pdf' };
  if (!file.type.startsWith('image/')) throw new Error('Use uma foto ou um PDF.');
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.85));
    if (blob) return { bytes: new Uint8Array(await blob.arrayBuffer()), mime: 'image/jpeg' };
  } catch { /* fall through: keep the original */ }
  const mime = (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? file.type : 'image/jpeg') as DocMime;
  return { bytes: new Uint8Array(await file.arrayBuffer()), mime };
}
