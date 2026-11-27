import { Users } from 'lucide-react';
import { IS_SAMPLE } from '../data';
import { PARTIES, VIEWER, setViewer, viewerName } from '../lib/viewer';

/** First open: "Quem está usando este celular?" — decides which booking codes and to-dos show. */
export function ViewerGate() {
  if (IS_SAMPLE || VIEWER || PARTIES.length < 2) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 sm:items-center">
      <div className="pb-safe w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-1 grid h-11 w-11 place-items-center rounded-full bg-paper text-lacquer"><Users size={20} aria-hidden /></div>
        <h2 className="mt-3 text-[24px] leading-tight">Quem está usando este celular?</h2>
        <p className="mt-1 text-[14px] text-ink-2">O roteiro é o mesmo para todos. A escolha define quais códigos de reserva e pendências aparecem — cada um tem as suas reservas nos mesmos hotéis.</p>
        <div className="mt-5 space-y-2">
          {PARTIES.map((p) => (
            <button key={p.id} onClick={() => setViewer(p.id)} className="tap w-full rounded-2xl bg-ink px-5 py-4 text-left text-[17px] font-semibold text-paper">
              {p.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] text-ink-3">Dá para trocar depois em Reservas.</p>
      </div>
    </div>
  );
}

/** Small "Reservas de: X · trocar" switch. */
export function ViewerSwitch() {
  if (PARTIES.length < 2) return null;
  const others = PARTIES.filter((p) => p.id !== VIEWER);
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
      <Users size={13} aria-hidden />
      <span>Reservas de <b className="text-ink">{viewerName() ?? '—'}</b></span>
      {others.map((p) => (
        <button key={p.id} onClick={() => setViewer(p.id)} className="tap rounded-full bg-paper-2 px-2.5 py-0.5 font-medium text-ink-2">Trocar para {p.name}</button>
      ))}
    </div>
  );
}
