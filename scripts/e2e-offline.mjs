// End-to-end offline check (Chromium, phone viewport):
//   1. open the built app, tap "Save Trip Offline", wait for verified status
//   2. cut the network, close the browser, reopen it (persistent profile)
//   3. every screen must still render with its content
// Run: npm run build && npm run e2e:offline   (uses `vite preview` on :4173)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const BASE = 'http://localhost:4173';
const shots = process.env.SHOTS; // optional dir for screenshots
const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
const profile = mkdtempSync(join(tmpdir(), 'ovt-'));
const phone = { ...devices['Pixel 7'], deviceScaleFactor: 1 };
delete phone.defaultBrowserType;
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✖'} ${msg}`); if (!ok) failures++; };

try {
  await waitForServer();
  // ---- online: install + save
  let ctx = await chromium.launchPersistentContext(profile, { ...phone, serviceWorkers: 'allow' });
  let page = ctx.pages()[0] ?? (await ctx.newPage());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message + ' @ ' + (e.stack ?? '').split('\n').slice(0,3).join(' ')));
  await page.goto(BASE + '/');
  // First open asks who is using the phone.
  const who = page.getByRole('button', { name: 'Ana e Leo' });
  if (await who.isVisible({ timeout: 3000 }).catch(() => false)) { await who.click(); await page.waitForLoadState('load'); }
  await page.waitForFunction(() => navigator.serviceWorker?.ready.then((r) => !!r.active), null, { timeout: 30000 });
  const btn = page.getByRole('button', { name: /Save Trip Offline|Verificar novamente/ });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.getByText('Disponível offline').waitFor({ timeout: 60000 });
  check(true, 'Save Trip Offline → "Disponível offline"');
  check(errors.length === 0, `no page errors online ${errors.join(' | ')}`);
  await ctx.close();

  // ---- offline: reopen the "app" with no network at all
  ctx = await chromium.launchPersistentContext(profile, { ...phone, offline: true });
  page = ctx.pages()[0] ?? (await ctx.newPage());
  page.on('pageerror', (e) => errors.push(e.message + ' @ ' + (e.stack ?? '').split('\n').slice(0,3).join(' ')));
  if (process.env.DEBUG) page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text().slice(0, 600)));
  const routes = [
    ['/', /Our Vietnam/],
    ['/day/2027-11-22', /Dia 1 de/],
    ['/day/2027-12-05', /Dia 14 de/],
    ['/map', /Por onde vamos/],
    ['/map?view=places', /Por onde vamos/],
    ['/reservations', /Reservas/],
    ['/vietna-101', /Tudo que vale a pena saber/],
  ];
  for (const [path, re] of routes) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    const ok = await page.getByText(re).first().isVisible({ timeout: 8000 }).catch(() => false);
    check(ok, `offline ${path}`);
    if (shots) await page.screenshot({ path: `${shots}/offline-${path.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: false });
  }
  // In-app navigation offline
  await page.goto(BASE + '/');
  await page.getByRole('link', { name: 'Dia a dia' }).click();
  await page.waitForURL(/\/day\/\d{4}-\d{2}-\d{2}/, { timeout: 5000 }).catch(() => {});
  check(/\/day\/\d{4}-\d{2}-\d{2}/.test(page.url()), 'offline tab navigation to Dia a dia');
  const opened = page.url().slice(-10);
  await page.getByText('Próximo dia').first().click();
  await page.waitForURL((u) => !u.toString().endsWith(opened));
  const next = new Date(Date.parse(opened + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10);
  check(page.url().endsWith(next), `offline "Próximo dia" button (${opened} → ${next})`);
  const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').length; });
  check(fontsOk > 0, `fonts load offline (${fontsOk})`);
  const status = await page.evaluate(() => localStorage.getItem('ovt:offline'));
  check(!!status, 'offline status persisted on device');
  await page.goto(BASE + '/');
  await page.getByText('Disponível offline').waitFor({ timeout: 15000 }).then(() => check(true, 'status re-verified as "Disponível offline" after reopening offline'), () => check(false, 're-verify offline status'));
  check(errors.length === 0, `no page errors offline ${errors.join(' | ')}`);
  await ctx.close();
} finally {
  server.kill();
  rmSync(profile, { recursive: true, force: true });
}
console.log(failures ? `\n${failures} check(s) failed` : '\nAll offline checks passed');
process.exit(failures ? 1 : 0);

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('preview server did not start');
}
