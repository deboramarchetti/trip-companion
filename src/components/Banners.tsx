import { RefreshCw, WifiOff } from 'lucide-react';
import { IS_SAMPLE } from '../data';
import { useOffline } from '../state/offline';

export function Banners() {
  const { online, updateReady, applyUpdate } = useOffline();
  return (
    <>
    {IS_SAMPLE && (
      <a href="/?sample=0" className="fixed left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-white shadow-md" style={{ bottom: 'calc(70px + env(safe-area-inset-bottom))' }}>
        Modo exemplo · dados fictícios — sair
      </a>
    )}
    <div className="pt-safe fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {!online && (
        <div className="pointer-events-auto mt-2 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-medium text-paper backdrop-blur">
          <WifiOff size={12} aria-hidden /> Sem conexão · usando versão salva
        </div>
      )}
      {updateReady && (
        <div className="pointer-events-auto mt-2 flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-paper shadow-lg">
          <div className="flex-1 text-[13px]">
            <div className="font-semibold">Roteiro atualizado</div>
            <div className="text-paper/70">A nova versão já foi baixada.</div>
          </div>
          <button onClick={applyUpdate} className="tap flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink">
            <RefreshCw size={13} aria-hidden /> Atualizar
          </button>
        </div>
      )}
    </div>
    </>
  );
}
