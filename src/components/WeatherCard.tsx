import { useState } from 'react';
import { ChevronDown, CloudRain, Umbrella } from 'lucide-react';
import type { DayWeather } from '../data/types';

/** "Leve capa de chuva" + what to do if it pours. */
export function WeatherCard({ w }: { w: DayWeather }) {
  const [open, setOpen] = useState(w.risk === 'high');
  const high = w.risk === 'high';
  return (
    <div className={`overflow-hidden rounded-[var(--radius-card)] ${high ? 'bg-[#dfe9f0] text-[#1f3b4d]' : 'card'}`}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="tap flex w-full items-start gap-3 px-4 py-3 text-left">
        {high ? <CloudRain size={19} className="mt-0.5 shrink-0" aria-hidden /> : <Umbrella size={18} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />}
        <span className="min-w-0 flex-1 text-[13.5px]">
          <span className="block font-semibold">{high ? 'Época de chuvas: leve capa de chuva e calçado que possa molhar' : 'Dia ao ar livre: tenha uma capa leve na mochila'}</span>
          {w.note && <span className={`block ${high ? 'text-[#1f3b4d]/80' : 'text-ink-3'}`}>{w.note}</span>}
        </span>
        <ChevronDown size={16} className={`mt-1 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="px-4 pb-4 pl-[46px] text-[13.5px]">
          <div className="mb-1 font-semibold">Se chover muito</div>
          <ul className="list-disc space-y-1 pl-4">
            {w.rainPlan.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
