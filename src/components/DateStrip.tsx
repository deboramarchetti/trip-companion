import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data';
import { fmtDayNum, fmtMonthShort, fmtWeekdayShort } from '../lib/time';

/** Horizontal, scrollable strip with every day of the trip. */
export function DateStrip({ selected, today }: { selected: string; today: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-date="${selected}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <div ref={ref} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5" role="tablist" aria-label="Dias da viagem">
      {model.days.map((d, i) => {
        const active = d.date === selected;
        const isToday = d.date === today;
        const newMonth = i === 0 || d.date.slice(5, 7) !== model.days[i - 1].date.slice(5, 7);
        const city = model.city(d.cityIds[d.cityIds.length - 1]);
        return (
          <Link
            key={d.date}
            to={`/day/${d.date}`}
            replace
            data-date={d.date}
            role="tab"
            aria-selected={active}
            aria-label={`${d.date}${isToday ? ' (hoje)' : ''}`}
            className={`tap relative flex w-[52px] shrink-0 flex-col items-center rounded-2xl pb-2 pt-1.5 ${active ? 'bg-ink text-paper shadow-md' : 'text-ink'}`}
          >
            <span className={`text-[10px] font-medium uppercase tracking-wide ${active ? 'text-paper/70' : 'text-ink-3'}`}>
              {newMonth ? fmtMonthShort(d.date) : fmtWeekdayShort(d.date)}
            </span>
            <span className="font-display text-[21px] leading-tight">{fmtDayNum(d.date)}</span>
            <span
              className="mt-0.5 h-1.5 w-1.5 rounded-full"
              style={{ background: isToday ? '#9e2f26' : city ? `hsl(${city.artHue ?? 20} 35% ${active ? 70 : 55}%)` : 'transparent' }}
            />
            {isToday && <span className={`absolute -top-1 rounded-full px-1.5 text-[8.5px] font-bold uppercase tracking-wider ${active ? 'bg-lacquer text-white' : 'bg-lacquer text-white'}`}>Hoje</span>}
          </Link>
        );
      })}
    </div>
  );
}
