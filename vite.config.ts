import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

/** PREVIEW=1 → one self-contained HTML file (no service worker) to preview on claude.ai. */
const PREVIEW = process.env.PREVIEW === '1';

/** `vite preview` sends the same security headers (CSP etc.) as Vercel, so local
 * tests catch anything the production CSP would block. */
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
const PROD_HEADERS: Record<string, string> = Object.fromEntries(
  vercel.headers[0].headers.map((h: { key: string; value: string }) => [h.key, h.value]),
);

const BUILD_ID = new Date().toISOString();

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID), __PREVIEW__: JSON.stringify(PREVIEW) },
  resolve: PREVIEW ? { alias: { 'virtual:pwa-register/react': fileURLToPath(new URL('./src/preview/pwa-stub.ts', import.meta.url)) } } : undefined,
  preview: { headers: Object.fromEntries(Object.entries(PROD_HEADERS).filter(([k]) => k !== 'Strict-Transport-Security')) },
  build: PREVIEW ? { outDir: 'dist-preview', assetsInlineLimit: 100_000_000 } : undefined,
  plugins: PREVIEW ? [react(), tailwindcss(), viteSingleFile()] : [
    react(),
    tailwindcss(),
    VitePWA({
      // Custom service worker (src/sw.ts) so the app can ask it to verify
      // and repair the offline cache ("Save Trip Offline").
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // 'prompt': a new version installs in the background and only takes over
      // when the user taps "Atualizar" — the old offline copy stays intact.
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,avif,woff2,json,webmanifest,txt,pfb,ttf}'],
        // Fonts ship cyrillic/greek subsets we never render.
        globIgnores: ['**/*cyrillic*', '**/*greek*', '**/*-full-*', '**/*-opsz-*', '**/*-soft-*', '**/*-wonk-*', '**/*-standard-*'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        id: '/',
        name: 'Our Vietnam Trip',
        short_name: 'Vietnam Trip',
        description: 'Nosso guia de viagem pelo Vietnã — roteiro, mapa e reservas, também offline.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5EFE4',
        theme_color: '#F5EFE4',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
});
