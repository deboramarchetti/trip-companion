import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { saveTripOffline, verifyOffline, type OfflineStatus } from '../lib/offline';

interface Ctx {
  status: OfflineStatus;
  save: () => Promise<void>;
  online: boolean;
  updateReady: boolean;
  applyUpdate: () => void;
}
const OfflineCtx = createContext<Ctx>(null!);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OfflineStatus>({ state: 'pending' });
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  const {
    needRefresh: [updateReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      // Look for a new deploy when the app comes back to the foreground and hourly.
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
      setInterval(check, 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV || __PREVIEW__) { setStatus({ state: 'unsupported', message: __PREVIEW__ ? 'Prévia no computador: o modo offline funciona no app instalado no celular.' : 'Modo offline só funciona na versão publicada (npm run build).' }); return; }
    verifyOffline().then(setStatus);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);

  /**
   * "Atualizar": activate the downloaded version and reload. Done by hand because the
   * plugin only reloads for updates it found itself, and ours are found by reg.update()
   * when the app returns to the foreground (Workbox calls those "external": no reload).
   */
  const applyUpdate = useCallback(async () => {
    const reload = () => location.reload();
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      const waiting = reg?.waiting;
      if (!waiting) { reload(); return; }
      navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
      waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(reload, 4000); // safety net if the system is slow to switch
    } catch {
      updateServiceWorker(true).finally(() => setTimeout(reload, 1500));
    }
  }, [updateServiceWorker]);

  const save = useCallback(async () => {
    setStatus({ state: 'downloading', progress: 0 });
    const result = await saveTripOffline((p) => setStatus({ state: 'downloading', progress: p }));
    setStatus(result);
  }, []);

  return (
    <OfflineCtx.Provider value={{ status, save, online, updateReady, applyUpdate }}>
      {children}
    </OfflineCtx.Provider>
  );
}

export const useOffline = () => useContext(OfflineCtx);
