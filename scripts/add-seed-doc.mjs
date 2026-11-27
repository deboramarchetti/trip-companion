// Ships a travel document (PDF or photo) encrypted inside the app, so it opens offline.
// It is encrypted with the group's docsKey (private/private.json) and saved as
// public/seed-docs/<id>.txt; only people with the trip passphrase can open it.
//
//   node scripts/add-seed-doc.mjs --party couple --owner ana --title "E-visa" path/to/file.pdf
//   (--shared marks one document for the whole group)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto, randomUUID, randomBytes } from 'node:crypto';
import { extname } from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const shared = args.includes('--shared') && !!args.splice(args.indexOf('--shared'), 1);
const party = opt('party'), owner = opt('owner'), title = opt('title');
const path = args[0];
if (!party || !owner || !title || !path) { console.error('Usage: --party <id> --owner <traveller id> --title "…" [--shared] <file>'); process.exit(1); }
const MIME = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const mime = MIME[extname(path).toLowerCase()];
if (!mime) { console.error('Use a PDF, JPG, PNG or WebP file.'); process.exit(1); }

const file = new URL('../private/private.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
const docs = data[`__docs@${party}`];
if (!docs?.docsKey) { console.error(`No docsKey for "${party}". Run: node scripts/new-keys.mjs ${party}`); process.exit(1); }
const bytes = readFileSync(path);
const key = await crypto.subtle.importKey('raw', Buffer.from(docs.docsKey, 'hex'), 'AES-GCM', false, ['encrypt']);
const iv = randomBytes(12);
const ct = Buffer.from(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
const id = randomUUID();
mkdirSync(new URL('../public/seed-docs/', import.meta.url), { recursive: true });
writeFileSync(new URL(`../public/seed-docs/${id}.txt`, import.meta.url), ct.toString('base64'));
docs.seed = [...(docs.seed ?? []), { id, owner, ...(shared ? { shared: true } : {}), title, mime, size: bytes.length, iv: iv.toString('base64') }];
writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(`Added "${title}" (${party}/${owner}) → public/seed-docs/${id}.txt. Re-run npm run private:encrypt.`);
