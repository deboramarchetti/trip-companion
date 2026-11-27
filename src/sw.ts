/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, getCacheKeyForURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { cacheNames, clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

/**
 * Everything the app needs (HTML, JS with the itinerary, CSS, fonts, icons,
 * photos, map) is in this precache manifest, generated at build time.
 * A new deploy installs a *new* service worker that downloads the new files
 * next to the old ones; the old version keeps working offline until the user
 * taps "Atualizar" (SKIP_WAITING). Only then are outdated entries removed.
 */
const MANIFEST = self.__WB_MANIFEST;
precacheAndRoute(MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

// SPA: every in-app route (/day/2026-11-25, /map…) is served by index.html offline.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

const entries = () =>
  MANIFEST.map((e) => new URL(typeof e === 'string' ? e : e.url, self.location.href).href);

type Msg = { type: 'SKIP_WAITING' } | { type: 'VERIFY' } | { type: 'SAVE_OFFLINE' };

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data as Msg | undefined;
  const port = event.ports[0];
  if (!data) return;
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if ((data.type === 'VERIFY' || data.type === 'SAVE_OFFLINE') && port) {
    event.waitUntil(checkCache(data.type === 'SAVE_OFFLINE', port));
  }
});

/**
 * Checks every precached URL is really in Cache Storage. With repair=true,
 * re-downloads anything missing (e.g. evicted by the OS) and checks again.
 */
async function checkCache(repair: boolean, port: MessagePort) {
  const cache = await caches.open(cacheNames.precache);
  const urls = entries();
  const missing: string[] = [];
  let done = 0;
  for (const url of urls) {
    const key = getCacheKeyForURL(url) ?? url;
    let hit = await cache.match(key);
    if (!hit && repair) {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) {
          await cache.put(key, res.clone());
          hit = await cache.match(key);
        }
      } catch {
        /* offline — stays missing */
      }
    }
    if (!hit) missing.push(url);
    done++;
    if (repair && (done % 4 === 0 || done === urls.length)) port.postMessage({ type: 'progress', done, total: urls.length });
  }
  port.postMessage({ type: 'result', total: urls.length, missing });
}
