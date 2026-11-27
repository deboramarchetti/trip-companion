import type { PrivateData } from '../data/types';

/** Encrypted private data envelope (see scripts/encrypt-private.mjs). */
export interface Envelope {
  v: 1;
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  ct: string; // base64 (AES-256-GCM ciphertext + tag)
}

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const toB64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8));

/**
 * Trip passphrases ignore case, spaces, hyphens and punctuation, so
 * "Foo Bar-baz 12" and "foobarbaz12" are the same.
 */
export const normalizePass = (p: string) => p.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number, usage: KeyUsage = 'decrypt') {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalizePass(passphrase)), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

/** Throws if the passphrase is wrong (GCM authentication fails). */
export async function decryptPrivate(env: Envelope, passphrase: string): Promise<PrivateData> {
  const key = await deriveKey(passphrase, b64(env.salt), env.iterations);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(env.iv) as BufferSource }, key, b64(env.ct) as BufferSource);
  return JSON.parse(new TextDecoder().decode(plain)) as PrivateData;
}

/** Generic JSON decryption with the trip passphrase (used for group sync). */
export async function decryptJSON<T>(env: Envelope, passphrase: string): Promise<T> {
  return (await decryptPrivate(env, passphrase)) as unknown as T;
}

/** Encrypts JSON with the trip passphrase (same scheme as private.enc.json). */
export async function encryptJSON(value: unknown, passphrase: string, iterations = 310_000): Promise<Envelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, iterations, 'encrypt');
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(JSON.stringify(value))));
  return { v: 1, iterations, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}
