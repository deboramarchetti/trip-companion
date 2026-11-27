/**
 * "Save Trip Offline": asks the active service worker to download anything
 * missing and to confirm, file by file, that the whole app is in the cache.
 * The status is only "ready" after that verification succeeds.
 */
export type OfflineState = 'pending' | 'downloading' | 'ready' | 'error' | 'unsupported';

export interface OfflineStatus {
  state: OfflineState;
  progress?: number; // 0..1
  total?: number;
  missing?: number;
  checkedAt?: string;
  persisted?: boolean;
  message?: string;
}

export const BUILD_ID: string = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';
const KEY = 'ovt:offline';

export function loadSavedStatus(): { buildId: string; checkedAt: string } | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}
function saveStatus(checkedAt: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ buildId: BUILD_ID, checkedAt }));
  } catch {
    /* private mode */
  }
}

type Result = { total: number; missing: string[] };

function ask(sw: ServiceWorker, type: 'VERIFY' | 'SAVE_OFFLINE', onProgress?: (p: number) => void, timeoutMs = 120_000): Promise<Result> {
  return new Promise((resolve, reject) => {
    const ch = new MessageChannel();
    const timer = setTimeout(() => reject(new Error('Tempo esgotado ao verificar o cache')), timeoutMs);
    ch.port1.onmessage = (e) => {
      if (e.data?.type === 'progress') onProgress?.(e.data.done / e.data.total);
      if (e.data?.type === 'result') {
        clearTimeout(timer);
        resolve(e.data as Result);
      }
    };
    sw.postMessage({ type }, [ch.port2]);
  });
}

async function activeWorker(waitMs: number): Promise<ServiceWorker | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((r) => setTimeout(() => r(null), waitMs)),
  ]);
  return reg?.active ?? null;
}

/** Quick, read-only check used on app start. */
export async function verifyOffline(): Promise<OfflineStatus> {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return { state: 'unsupported', message: 'Este navegador não suporta modo offline.' };
  const sw = await activeWorker(4000);
  if (!sw) return { state: 'pending' };
  try {
    const r = await ask(sw, 'VERIFY', undefined, 20_000);
    if (r.missing.length === 0 && loadSavedStatus()) {
      const checkedAt = new Date().toISOString();
      saveStatus(checkedAt);
      return { state: 'ready', total: r.total, missing: 0, checkedAt, persisted: await isPersisted() };
    }
    return { state: 'pending', total: r.total, missing: r.missing.length };
  } catch {
    return { state: 'pending' };
  }
}

/** Full download + verification triggered by the button. */
export async function saveTripOffline(onProgress: (p: number) => void): Promise<OfflineStatus> {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return { state: 'unsupported', message: 'Este navegador não suporta modo offline.' };
  // Waits for the first install (which itself downloads every file).
  const sw = await activeWorker(90_000);
  if (!sw) return { state: 'error', message: 'O app ainda não terminou de instalar. Verifique a conexão e tente de novo.' };
  let persisted = false;
  try {
    persisted = (await navigator.storage?.persist?.()) ?? false;
  } catch {
    /* ignore */
  }
  try {
    const repaired = await ask(sw, 'SAVE_OFFLINE', onProgress);
    // Independent second pass: verification without downloading.
    const check = await ask(sw, 'VERIFY', undefined, 30_000);
    if (repaired.missing.length || check.missing.length) {
      return { state: 'error', total: check.total, missing: check.missing.length, persisted, message: `${check.missing.length} arquivo(s) não puderam ser salvos. Conecte-se e tente novamente.` };
    }
    const checkedAt = new Date().toISOString();
    saveStatus(checkedAt);
    return { state: 'ready', total: check.total, missing: 0, checkedAt, persisted };
  } catch (e) {
    return { state: 'error', persisted, message: (e as Error).message };
  }
}

async function isPersisted() {
  try {
    return (await navigator.storage?.persisted?.()) ?? false;
  } catch {
    return false;
  }
}
