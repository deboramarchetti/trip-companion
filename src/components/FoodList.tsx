import { useState } from 'react';
import { ChevronDown, Clock, Coffee, Croissant, Info, Moon, Sandwich, Utensils, Wine } from 'lucide-react';
import { model } from '../data';
import type { FoodSpot, ISODate, Meal } from '../data/types';
import { MapsButton, Row } from './ui';

export const MEAL: Record<Meal, { label: string; Icon: typeof Coffee }> = {
  breakfast: { label: 'Café da manhã', Icon: Croissant },
  coffee: { label: 'Café', Icon: Coffee },
  lunch: { label: 'Almoço', Icon: Utensils },
  snack: { label: 'Lanche / rua', Icon: Sandwich },
  dinner: { label: 'Jantar', Icon: Moon },
  drinks: { label: 'Drinks', Icon: Wine },
};
const ORDER: Meal[] = ['breakfast', 'coffee', 'lunch', 'snack', 'dinner', 'drinks'];

/** "Onde comer" — researched recommendations for one day, filterable by meal. */
export function FoodList({ date }: { date: ISODate }) {
  const spots = model.foodFor(date);
  const meals = ORDER.filter((m) => spots.some((s) => s.meals.includes(m)));
  const [meal, setMeal] = useState<Meal | 'all'>('all');
  const [open, setOpen] = useState<string>();
  if (!spots.length) return null;
  const shown = meal === 'all' ? spots : spots.filter((s) => s.meals.includes(meal));

  return (
    <section id="onde-comer" className="mt-8 scroll-mt-24">
      <div className="px-5">
        <h2 className="flex items-baseline gap-2 text-[22px] font-normal">Onde comer <span className="font-sans text-[13px] text-ink-3">{spots.length} sugestões</span></h2>
        <p className="mt-0.5 text-[12.5px] text-ink-3">Pesquisa em guias (Michelin, TripAdvisor) e avaliações do Google. Não são reservas.</p>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {(['all', ...meals] as const).map((m) => (
          <button key={m} onClick={() => setMeal(m)} className={`tap shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${meal === m ? 'bg-ink text-paper' : 'bg-card text-ink-2 shadow-sm'}`}>
            {m === 'all' ? 'Todos' : MEAL[m].label}
          </button>
        ))}
      </div>
      <ul className="card mx-4 mt-2 divide-y divide-line">
        {shown.map((f) => <FoodRow key={f.id} f={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? undefined : f.id)} />)}
      </ul>
    </section>
  );
}

function FoodRow({ f, open, onToggle }: { f: FoodSpot; open: boolean; onToggle: () => void }) {
  const Icon = MEAL[f.meals[0]].Icon;
  return (
    <li>
      <button onClick={onToggle} aria-expanded={open} className="tap flex w-full items-start gap-3 px-4 py-3 text-left">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-soft text-[#7a5518]"><Icon size={15} aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-medium leading-snug">{f.name}</span>
            {f.price && <span className="shrink-0 text-[12px] font-semibold text-ink-3">{f.price}</span>}
          </span>
          {f.dish && <span className="block text-[12.5px] text-ink-2">Peça: {f.dish}</span>}
          {!open && <span className="block truncate text-[12px] text-ink-3">{f.meals.map((m) => MEAL[m].label).join(' · ')}{f.sources?.[0] ? ` · ${f.sources[0]}` : ''}</span>}
        </span>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="space-y-2 px-4 pb-4 pl-[60px]">
          {f.localName && <div className="text-[12.5px] italic text-ink-3">{f.localName}</div>}
          {f.description && <p className="text-[13.5px] leading-relaxed text-ink-2">{f.description}</p>}
          <div className="text-[12px] text-ink-3">{f.meals.map((m) => MEAL[m].label).join(' · ')}</div>
          {f.hours && <Row icon={Clock}>{f.hours}</Row>}
          {f.address && <Row icon={Utensils}>{f.address}</Row>}
          {f.notes && <Row icon={Info}>{f.notes}</Row>}
          {f.sources && f.sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {f.sources.map((s) => <span key={s} className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-ink-2">{s}</span>)}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <MapsButton place={f} />
            <MapsButton place={f} label="Como chegar" variant="ghost" directions />
          </div>
        </div>
      )}
    </li>
  );
}
