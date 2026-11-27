// Adds the random keys the app needs to private/private.json (only those missing):
//   __app.expensesKey        → shared expenses (one per trip)
//   __docs@<party>.docsKey   → encrypted travel documents (one per group)
//
//   node scripts/new-keys.mjs couple sam      (group ids from trip.parties)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const file = new URL('../private/private.json', import.meta.url);
mkdirSync(new URL('../private/', import.meta.url), { recursive: true });
const data = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
const hex = () => randomBytes(32).toString('hex');
data.__app ??= {};
data.__app.expensesKey ??= hex();
for (const party of process.argv.slice(2)) {
  data[`__docs@${party}`] ??= {};
  data[`__docs@${party}`].docsKey ??= hex();
  data[`__docs@${party}`].seed ??= [];
}
writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log('Keys ready in private/private.json (git-ignored). Now run: TRIP_PASSPHRASE="..." npm run private:encrypt');
