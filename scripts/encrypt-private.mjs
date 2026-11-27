// Encrypts private/private.json (booking codes, ticket numbers, contacts)
// into src/data/private.enc.json with a shared trip passphrase.
//
//   TRIP_PASSPHRASE="..." npm run private:encrypt
//
// private/ is git-ignored: the plain file never leaves this computer.
// The passphrase is never stored in the repo or the app bundle; each
// traveller types it once in the app (Reservas → Desbloquear).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto, randomBytes } from 'node:crypto';

const src = new URL('../private/private.json', import.meta.url);
const out = new URL('../src/data/private.enc.json', import.meta.url);
// Trimmed and lower-cased, like the app does (phones auto-capitalise the first letter).
// Same normalisation as the app: case, spaces, hyphens and punctuation are ignored.
const pass = process.env.TRIP_PASSPHRASE?.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
if (!pass || pass.length < 6) { console.error('Set TRIP_PASSPHRASE (min. 6 chars).'); process.exit(1); }
if (pass.length < 10) console.warn('Warning: short passphrase — easy to guess if someone gets the app link.');
if (!existsSync(src)) { console.error('private/private.json not found. Copy private.example.json and fill it.'); process.exit(1); }

const data = JSON.parse(readFileSync(src, 'utf8'));
const iterations = 310_000;
const salt = randomBytes(16);
const iv = randomBytes(12);
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))));
const b64 = (u8) => Buffer.from(u8).toString('base64');
writeFileSync(out, JSON.stringify({ v: 1, iterations, salt: b64(salt), iv: b64(iv), ct: b64(ct) }, null, 2) + '\n');
console.log(`Encrypted ${Object.keys(data).length} entries → src/data/private.enc.json`);
