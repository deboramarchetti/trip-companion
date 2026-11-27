// Renders PWA / Apple touch icons from public/favicon.svg using the
// pre-installed Playwright Chromium. Run: npm run icons:generate
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
// Playwright is pre-installed globally in this environment; resolve it via CJS.
const { chromium } = createRequire(import.meta.url)('playwright');

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const targets = [
  { file: 'public/icons/icon-192.png', size: 192, rounded: true },
  { file: 'public/icons/icon-512.png', size: 512, rounded: true },
  { file: 'public/icons/icon-maskable-512.png', size: 512, rounded: false, inset: 0.12 },
  { file: 'public/apple-touch-icon.png', size: 180, rounded: false },
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  // Full-bleed variants drop the rounded corners (iOS / maskable apply their own).
  let s = t.rounded ? svg : svg.replace('rx="112"', 'rx="0"');
  const inset = t.inset ?? 0;
  const inner = t.size * (1 - inset * 2);
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(`<html><body style="margin:0;background:${t.rounded ? 'transparent' : '#9E2F26'};display:grid;place-items:center;width:${t.size}px;height:${t.size}px">
    <div style="width:${inner}px;height:${inner}px">${s.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`);
  await page.screenshot({ path: t.file, omitBackground: t.rounded });
  console.log('wrote', t.file);
}
await browser.close();
