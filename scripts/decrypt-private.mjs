// Recreates private/private.json from src/data/private.enc.json (the inverse of
// encrypt-private.mjs), so the plain file never has to be kept anywhere else.
//   TRIP_PASSPHRASE="..." npm run private:decrypt
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const pass = process.env.TRIP_PASSPHRASE?.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
if (!pass) { console.error('Set TRIP_PASSPHRASE.'); process.exit(1); }
const out = new URL('../private/private.json', import.meta.url);
if (existsSync(out) && !process.argv.includes('--force')) { console.error('private/private.json already exists (use --force to overwrite).'); process.exit(1); }
const env = JSON.parse(readFileSync(new URL('../src/data/private.enc.json', import.meta.url), 'utf8'));
const b = (s) => Buffer.from(s, 'base64');
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: b(env.salt), iterations: env.iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(env.iv) }, key, b(env.ct)).catch(() => { console.error('Wrong passphrase.'); process.exit(1); });
mkdirSync(new URL('../private/', import.meta.url), { recursive: true });
writeFileSync(out, JSON.stringify(JSON.parse(new TextDecoder().decode(plain)), null, 1) + '\n');
console.log('Wrote private/private.json');
