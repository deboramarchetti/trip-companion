/**
 * Booking codes typed on a phone ("Adicionar seu código") are kept like the
 * documents: encrypted ON THE PHONE with the party's documents key and stored
 * in Supabase as one ciphertext blob per party. So they survive a reinstall or
 * a new phone, and they also stay on the phone for offline use.
 */
import { localStore } from '../data';
import { sanitize, saveLocal } from '../lib/localStore';
import type { LocalEdit } from '../data/types';
import { VIEWER, partyMembers } from '../lib/viewer';
import { accessKey, decryptBytes, encryptBytes, rpc } from './docs';

/** A fixed id per key, derived from it (the server can't link it to anything). */
async function codesId(docsKey: string) {
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ovt-codes:' + docsKey)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const isMine = (k: string, e: LocalEdit) => !!VIEWER && k.endsWith('@' + VIEWER) && !!(e.bookingRef || e.phone || e.contact);
const onlyCodes = (e: LocalEdit): LocalEdit => {
  const o: LocalEdit = { updatedAt: e.updatedAt };
  if (e.bookingRef) o.bookingRef = e.bookingRef;
  if (e.phone) o.phone = e.phone;
  if (e.contact) o.contact = e.contact;
  return o;
};

/** Pull, merge (newest wins) and push. Returns true when new codes arrived on this phone (reload to show them). */
export async function syncCodes(docsKey: string): Promise<boolean> {
  if (!VIEWER) return false;
  const key = await accessKey(docsKey);
  const id = await codesId(docsKey);
  const [blob] = await rpc<{ iv: string; data: string }[]>('vt_doc_get', { p_key: key, p_id: id });
  let remote: Record<string, LocalEdit> = {};
  if (blob?.data) {
    const json = JSON.parse(new TextDecoder().decode(await decryptBytes(docsKey, blob.iv, blob.data)));
    remote = Object.fromEntries(Object.entries(sanitize({ edits: json, items: [] }).edits).filter(([k, e]) => isMine(k, e)));
  }
  const merged: Record<string, LocalEdit> = Object.fromEntries(Object.entries(localStore.edits).filter(([k, e]) => isMine(k, e)).map(([k, e]) => [k, onlyCodes(e)]));
  let arrived = false;
  for (const [k, e] of Object.entries(remote)) {
    if (!merged[k] || merged[k].updatedAt < e.updatedAt) { merged[k] = e; localStore.edits[k] = e; arrived = true; }
  }
  if (Object.entries(merged).some(([k, e]) => !remote[k] || remote[k].updatedAt < e.updatedAt)) {
    const bytes = new TextEncoder().encode(JSON.stringify(merged));
    const { iv, data } = await encryptBytes(docsKey, bytes);
    await rpc('vt_doc_put', { p_key: key, p_id: id, p_owner: partyMembers()[0] ?? 'traveler', p_title: 'Códigos de reserva', p_mime: 'application/json', p_size: bytes.length, p_iv: iv, p_data: data });
  }
  // Only ask for a reload if the phone really kept them (avoids a reload loop when storage is blocked).
  return arrived && saveLocal(localStore);
}
