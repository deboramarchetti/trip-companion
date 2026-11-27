import { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { model } from '../data';
import type { Decision } from '../data/types';
import { MapsButton } from './ui';

const KEY = 'ovt:decisions';
const load = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {}; } catch { return {}; } };

/** "Decisões": open choices for the day. The pick is remembered on this phone. */
export function Decisions({ decisions }: { decisions: Decision[] }) {
  const [picked, setPicked] = useState(load);
  const pick = (d: string, o: string) => {
    const next = { ...picked, [d]: picked[d] === o ? '' : o };
    setPicked(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const open = decisions.filter((d) => !picked[d.id]).length;
  return (
    <section className="card p-4" aria-label="Decisões do dia">
      <div className="mb-1 flex items-center gap-2">
        <HelpCircle size={18} className="shrink-0 text-gold" aria-hidden />
        <div className="font-semibold">Decisões</div>
        <span className="ml-auto text-[12px] text-ink-3">{open ? `${open} em aberto` : 'tudo decidido'}</span>
      </div>
      <p className="mb-3 text-[12.5px] text-ink-3">Toque na opção escolhida (fica marcada neste celular).</p>
      <div className="space-y-4">
        {decisions.map((d) => (
          <div key={d.id}>
            <div className="text-[14.5px] font-semibold leading-snug">{d.question}</div>
            {d.context && <p className="mt-0.5 text-[12.5px] text-ink-3">{d.context}</p>}
            <ul className="mt-2 space-y-1.5">
              {d.options.map((o) => {
                const on = picked[d.id] === o.id;
                const place = model.place(o.placeId);
                return (
                  <li key={o.id} className={`rounded-xl border px-3 py-2 ${on ? 'border-jade bg-jade-soft' : 'border-line bg-paper'}`}>
                    <button type="button" onClick={() => pick(d.id, o.id)} className="tap flex w-full items-start gap-2.5 text-left" aria-pressed={on}>
                      {on ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-jade" aria-hidden /> : <Circle size={17} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />}
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium">{o.label}</span>
                        {o.detail && <span className="block text-[12.5px] leading-snug text-ink-2">{o.detail}</span>}
                      </span>
                    </button>
                    {place && <div className="ml-7 mt-1"><MapsButton place={place} label="Maps" variant="ghost" /></div>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
