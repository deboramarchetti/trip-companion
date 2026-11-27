// Used only by the single-file preview build (no service worker there).
export function useRegisterSW() {
  return { needRefresh: [false, () => {}], offlineReady: [false, () => {}], updateServiceWorker: async () => {} } as const;
}
