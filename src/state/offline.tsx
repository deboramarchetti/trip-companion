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

  const save = useCallback(async () => {
    setStatus({ state: 'downloading', progress: 0 });
    const result = await saveTripOffline((p) => setStatus({ state: 'downloading', progress: p }));
    setStatus(result);
  }, []);

  return (
    <OfflineCtx.Provider value={{ status, save, online, updateReady, applyUpdate: () => updateServiceWorker(true) }}>
      {children}
    </OfflineCtx.Provider>
  );
}

export const useOffline = () => useContext(OfflineCtx);
