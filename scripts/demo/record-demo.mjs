// Records a real walkthrough of the app (no mockups) for a ~35 s social video.
//
//   npm run build
//   node scripts/demo/record-demo.mjs demo/video.config.json
//   python3 scripts/demo/compose.py scripts/demo/out demo-video.mp4
//
// It serves a built app (config.dist) with a tiny static server, drives it with
// Playwright like a person would (taps, scrolls, typing), and captures frames with
// Chrome's screencast. Backend calls are blocked, so nothing is sent anywhere.
// Optional privacy blur: config.blurWords (+ codes, PINs and monospace fields) are
// covered with a CSS highlight — the page itself is not modified.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const cfgPath = process.argv[2] ?? 'demo/video.config.json';
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const env = (k, d) => process.env[k] ?? d;
const dist = resolve(cfg.dist ?? 'dist');
const out = resolve(cfg.out ?? 'scripts/demo/out');
const passphrase = env('DEMO_PASSPHRASE', cfg.passphrase);
let playwright;
try { playwright = createRequire(import.meta.url)('playwright'); } catch { playwright = createRequire('/opt/node-tools/')('playwright'); }

/* ------------------------------------------------------------ static server */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.pfb': 'application/octet-stream', '.ttf': 'font/ttf' };
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(dist, url);
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
  res.end(readFileSync(file));
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;

/* ------------------------------------------------------------------ browser */
const W = 400, H = 660, DPR = 2;
const browser = await playwright.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale: 'pt-BR', bypassCSP: true });
await ctx.route(/supabase\.co/, (r) => r.abort());
await ctx.addInitScript(({ party, passphrase, expenses }) => {
  try {
    localStorage.setItem('ovt:viewer', party);
    if (passphrase) localStorage.setItem('ovt:pass', passphrase); // unlock without typing it on screen
    if (expenses && !localStorage.getItem('ovt:expenses')) localStorage.setItem('ovt:expenses', JSON.stringify({ rows: Object.fromEntries(expenses.map((r) => [r.id, r])), pending: [], lastPull: new Date().toISOString() }));
  } catch { /* ignore */ }
}, { party: cfg.party, passphrase, expenses: cfg.expensesFile ? JSON.parse(readFileSync(cfg.expensesFile, 'utf8')) : null });
// Privacy blur via the CSS Custom Highlight API (no DOM changes, React-safe).
await ctx.addInitScript(({ words }) => {
  const patterns = [
    ...words.map((w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')),
    /\bPIN\s*\d+/g, /Refer[êe]ncia do cliente[\s\d-]+/g, /Privilege Club:?\s*\d+/g, /Reserva da agência:?\s*\w+/g,
    /\b(?=[A-Z0-9]*\d)(?=[0-9]*[A-Z])[A-Z0-9]{5,10}\b/g, // booking-code-like tokens (letters + digits)
  ];
  const update = () => {
    if (!document.body || !('highlights' in CSS)) return;
    const ranges = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue ?? '';
      if (!t.trim()) continue;
      if (n.parentElement?.closest('.font-mono')) { const r = new Range(); r.selectNodeContents(n); ranges.push(r); continue; }
      for (const re of patterns) { re.lastIndex = 0; for (let m; (m = re.exec(t));) { const r = new Range(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); ranges.push(r); } }
    }
    CSS.highlights.set('pii', new Highlight(...ranges));
  };
  const style = () => { const s = document.createElement('style'); s.textContent = '::highlight(pii){color:transparent;text-shadow:0 0 7px rgba(70,60,50,.95)}'; document.head.append(s); };
  document.addEventListener('DOMContentLoaded', () => { style(); update(); new MutationObserver(update).observe(document.body, { subtree: true, childList: true, characterData: true }); });
}, { words: cfg.blurWords ?? [] });

const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

/* ---------------------------------------------------------- frame capture */
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'frames'), { recursive: true });
const frames = [], marks = [];
let recording = false;
const cdp = await ctx.newCDPSession(page);
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  if (recording) { const f = `${String(frames.length).padStart(5, '0')}.jpg`; writeFileSync(join(out, 'frames', f), Buffer.from(data, 'base64')); frames.push({ f, t: metadata.timestamp }); }
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
const now = () => Date.now() / 1000;
const mark = (caption) => marks.push({ t: now(), caption });
const wait = (ms) => page.waitForTimeout(ms);
const scroll = (px, ms) => page.evaluate(([px, ms]) => new Promise((done) => {
  const y0 = scrollY, t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; scrollTo(0, y0 + px * e); k < 1 ? requestAnimationFrame(step) : done(); };
  requestAnimationFrame(step);
}), [px, ms]);
const tapNav = (name) => page.locator('nav[aria-label="Navegação principal"] a', { hasText: name }).click();

/* ------------------------------------------------------------------ scenes */
// Warm up: install the service worker (offline copy) and decrypt before recording.
await page.goto(BASE + '/');
await page.evaluate(() => navigator.serviceWorker?.ready);
await wait(2500);
await page.goto(BASE + '/?vietnam');
await wait(600);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W * DPR, maxHeight: H * DPR, everyNthFrame: 1 });
recording = true;
const C = cfg.captions;

mark(C.intro); await wait(2700);
await page.getByRole('dialog', { name: 'Welcome to Vietnam' }).tap().catch(() => {});
mark(C.overview); await wait(700); await scroll(380, 1800); await wait(900);

await page.goto(BASE + `/day/${cfg.dayDate}`); await wait(500);
mark(C.day); await scroll(520, 2200); await wait(700); await scroll(700, 2200); await wait(600);
const foodTop = await page.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find((x) => /Onde comer|comer/i.test(x.textContent ?? '')); return h ? h.getBoundingClientRect().top + scrollY - 80 : null; });
if (foodTop) { mark(C.food); await scroll(foodTop - (await page.evaluate(() => scrollY)), 1500); await wait(1000); }

await tapNav('Reservas'); await wait(400);
await page.getByRole('tab', { name: 'Hotéis' }).click().catch(() => {}); await wait(300);
mark(C.reservations); await scroll(260, 1400); await wait(1100);

await page.getByRole('tab', { name: 'Documentos' }).click().catch(() => {}); await wait(500);
await ctx.setOffline(true); await wait(300);
mark(C.documents); await scroll(150, 900); await wait(1800);
await ctx.setOffline(false);

await tapNav('Contas'); await wait(500);
mark(C.expenses);
await page.getByLabel('Valor em dong').click();
await page.getByLabel('Valor em dong').pressSequentially('85000', { delay: 140 }); await wait(900);
await scroll(330, 1400); await wait(900);

await tapNav('Vietnã 101'); await wait(500);
mark(C.guide); await wait(900); await scroll(560, 2000); await wait(900);

await page.goto(BASE + '/?camelo'); await wait(300);
mark(C.outro); await wait(2700);
mark(null);

recording = false;
await cdp.send('Page.stopScreencast');
writeFileSync(join(out, 'timeline.json'), JSON.stringify({ size: [W * DPR, H * DPR], frames, marks }, null, 1));
console.log(`frames: ${frames.length} · scenes: ${marks.length - 1} · duration: ${(marks.at(-1).t - marks[0].t).toFixed(1)} s · page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
await browser.close();
server.close();
