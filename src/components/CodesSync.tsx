import { useEffect } from 'react';
import { usePrivate } from '../state/privateData';
import { isDocsKey } from '../docs/docs';
import { syncCodes } from '../docs/codes';
import { VIEWER } from '../lib/viewer';
import { SYNC_ENABLED } from '../lib/backend';

/** Keeps this party's typed booking codes backed up (encrypted) and in sync, whenever online. */
export function CodesSync() {
  const { state, docsKey } = usePrivate();
  useEffect(() => {
    if (!SYNC_ENABLED || state !== 'unlocked' || !isDocsKey(docsKey) || !VIEWER) return;
    let alive = true;
    const run = () => {
      if (!navigator.onLine) return;
      syncCodes(docsKey).then((arrived) => { if (arrived && alive) location.reload(); }).catch(() => { /* try again next time */ });
    };
    run();
    addEventListener('online', run);
    return () => { alive = false; removeEventListener('online', run); };
  }, [state, docsKey]);
  return null;
}
