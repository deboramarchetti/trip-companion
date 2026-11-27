import { ArrowRight, Bed, CalendarDays, CloudRain, FileClock, Map as MapIcon, MapPin, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IS_SAMPLE, model } from '../data';
import { dayLabel, numberedDays, tripPhase } from '../data/model';
import { useToday } from '../hooks';
import { addDays, daysBetween, fmtDayMonthShort, fmtFull, fmtRange, fmtWeekdayShort } from '../lib/time';
import { Cover } from '../components/Cover';
import { VietnamMap } from '../components/VietnamMap';
import { OfflineCard } from '../components/OfflineCard';
import { EmptyState, PlaceholderBadge, SectionTitle } from '../components/ui';
import { todoCounts } from '../components/Todo';
import { NextUp } from '../components/NextUp';
import { useOffline } from '../state/offline';

export function Overview() {
  const today = useToday();
  const { trip } = model;
  const phase = tripPhase(model, today);
  const offlineState = useOffline().status.state;
  const totalDays = numberedDays(model);

  const status =
    phase.kind === 'before'
      ? { big: String(phase.daysToGo), small: phase.daysToGo === 1 ? 'dia para a viagem' : 'dias para a viagem' }
      : phase.kind === 'during'
        ? phase.dayNumber
          ? { big: `Dia ${phase.dayNumber}`, small: `de ${totalDays} · ${model.city(model.day(today)?.cityIds.at(-1))?.name ?? 'Vietnã'}` }
          : { big: today === trip.startDate ? 'Embarque' : 'Stopover', small: `${model.city(model.day(today)?.cityIds.at(-1))?.name ?? ''} · a caminho do Vietnã` }
        : { big: 'Até a próxima', small: 'viagem concluída' };

  const primary = phase.kind === 'during' ? today : trip.startDate;
  const secondary = phase.kind === 'during' && today < trip.endDate ? addDays(today, 1) : undefined;

  return (
    <div className="pb-8">
      {/* Hero */}
      <Cover photo={trip.coverPhoto} hue={168} seed="vietnam-hero" className="h-[62vh] max-h-[560px] min-h-[420px]">
        <div className="pt-safe flex h-full flex-col justify-end px-6 pb-8 text-white">
          <div className="rise mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">Việt Nam</span>
            {!trip.datesConfirmed && <span className="rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] text-white/90">Datas provisórias</span>}
          </div>
          <h1 className="rise text-[44px] font-normal leading-[0.95] tracking-tight" style={{ animationDelay: '60ms' }}>
            {trip.title.split(' ').slice(0, -1).join(' ')}{' '}
            <em className="font-light italic">{trip.title.split(' ').at(-1)}</em>
          </h1>
          <div className="rise mt-2 text-[15px] text-white/85" style={{ animationDelay: '120ms' }}>{fmtRange(trip.startDate, trip.endDate)} · {totalDays} dias</div>
          <div className="rise mt-6 flex items-end gap-3" style={{ animationDelay: '180ms' }}>
            <div className="font-display text-[56px] font-light leading-none">{status.big}</div>
            <div className="pb-2 text-[14px] leading-tight text-white/85">{status.small}</div>
          </div>
        </div>
      </Cover>

      {/* Quick access */}
      <div className="relative z-10 -mt-5 grid grid-cols-2 gap-3 px-5">
        <QuickDay date={primary} label={phase.kind === 'during' ? 'Hoje' : 'Primeiro dia'} accent />
        {secondary ? <QuickDay date={secondary} label="Amanhã" /> : <QuickLink to="/reservations" label="Reservas" sub="Voos, hotéis e passeios" />}
      </div>

      {phase.kind === 'during' && <NextUp today={today} />}
      {offlineState !== 'ready' && offlineState !== 'unsupported' && (
        <section className="mt-5"><OfflineCard /></section>
      )}

      {trip.dataStatus === 'placeholder' && !IS_SAMPLE && (
        <div className="mx-5 mt-5 flex gap-3 rounded-[var(--radius-card)] border border-dashed border-gold/60 bg-gold-soft/40 p-4">
          <FileClock size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden />
          <div className="text-[13.5px] text-ink-2">
            <div className="mb-0.5 flex items-center gap-2 font-semibold text-ink">Roteiro aguardando importação <PlaceholderBadge /></div>
            Estrutura pronta. Hotéis, voos, reservas e atividades aparecerão aqui assim que o documento do roteiro for importado.{' '}
            <a href="/?sample=1" className="font-medium text-lacquer underline underline-offset-2">Ver exemplo do design</a>
          </div>
        </div>
      )}
      {trip.intro && <p className="mx-5 mt-5 text-[14px] text-ink-2">{trip.intro}</p>}
      <TodoCard />
      <RainCard />

      {/* Route */}
      <section className="mt-10">
        <SectionTitle eyebrow="O percurso" title={`${model.route.length} destinos`} action={<Link to="/map" className="text-[13px] font-medium text-lacquer">Mapa</Link>} />
        <div className="card mx-5 grid grid-cols-[minmax(0,44%)_1fr] overflow-hidden">
          <Link to="/map" className="block aspect-[400/740] bg-[#e6eeea]" aria-label="Abrir mapa">
            <VietnamMap model={model} crop showDates={false} />
          </Link>
          <ol className="flex flex-col justify-center gap-0.5 py-3 pr-3">
            {model.route.map((s, i) => {
              const c = model.city(s.cityId)!;
              return (
                <li key={c.id + i}>
                  <Link to={s.from ? `/day/${s.from}` : '/map'} className="tap flex items-center gap-2.5 rounded-xl px-2 py-1.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-lacquer/60 text-[11px] font-semibold text-lacquer">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[16px] leading-tight">{c.name}</span>
                      <span className="block text-[11.5px] text-ink-3">
                        {s.from ? `${fmtDayMonthShort(s.from)}${s.to !== s.from ? ` – ${fmtDayMonthShort(s.to!)}` : ''}${s.nights ? ` · ${s.nights} noite${s.nights > 1 ? 's' : ''}` : ''}` : c.localName}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {model.routeProvisional && <li className="px-2 pt-1 text-[11px] italic text-ink-3">Ordem provisória</li>}
          </ol>
        </div>
        <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
          <Link to="/map" className="tap flex items-center gap-2.5 rounded-[var(--radius-card)] bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <MapIcon size={18} className="shrink-0 text-lacquer" aria-hidden />
            <span className="text-[13.5px] font-medium leading-tight">Mapa do percurso</span>
          </Link>
          <Link to="/map?view=places" className="tap flex items-center gap-2.5 rounded-[var(--radius-card)] bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <MapPin size={18} className="shrink-0 text-lacquer" aria-hidden />
            <span className="text-[13.5px] font-medium leading-tight">Lugares e onde comer</span>
          </Link>
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-10">
        <SectionTitle eyebrow="Linha do tempo" title="Dia a dia" />
        <ol className="mx-5">
          {model.days.map((d, i) => {
            const cities = d.cityIds.map((id) => model.city(id)?.name).filter(Boolean);
            const prevCities = model.days[i - 1]?.cityIds ?? [];
            const moving = d.cityIds.length > 1;
            const flights = d.activities.filter((a) => a.flightId).map((a) => model.flight(a.flightId)!).filter(Boolean);
            const isToday = d.date === today;
            const newStop = d.cityIds[0] && d.cityIds[0] !== prevCities.at(-1);
            return (
              <li key={d.date} className="grid grid-cols-[44px_14px_1fr] gap-x-3">
                <div className="pt-3 text-right">
                  <div className={`font-display text-[20px] leading-none ${isToday ? 'text-lacquer' : ''}`}>{+d.date.slice(8)}</div>
                  <div className="text-[10.5px] uppercase tracking-wide text-ink-3">{fmtWeekdayShort(d.date)}</div>
                </div>
                <div className="relative flex justify-center">
                  <div className={`absolute w-px bg-line ${i === 0 ? 'top-5' : 'top-0'} ${i === model.days.length - 1 ? 'h-5' : 'bottom-0'}`} />
                  <div className={`relative mt-[18px] h-3 w-3 rounded-full border-2 ${isToday ? 'border-lacquer bg-lacquer' : moving || newStop ? 'border-lacquer bg-card' : 'border-ink-3/40 bg-paper'}`} />
                </div>
                <Link to={`/day/${d.date}`} className="tap my-1 flex min-w-0 items-center justify-between gap-2 rounded-2xl px-3 py-2.5 hover:bg-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="eyebrow !tracking-[0.1em]">{dayLabel(model, d.date, d.date === model.trip.startDate ? 'Embarque' : 'Stopover')}</span>
                      {isToday && <span className="rounded-full bg-lacquer px-1.5 text-[9px] font-bold uppercase text-white">Hoje</span>}
                    </div>
                    <div className="truncate font-display text-[16.5px]">
                      {cities.length ? cities.join(' → ') : <span className="text-ink-3">A definir</span>}
                    </div>
                    {(d.title || flights.length > 0) && (
                      <div className="flex items-center gap-1.5 truncate text-[12.5px] text-ink-3">
                        {flights.length > 0 && <Plane size={12} className="shrink-0 text-lacquer" aria-hidden />}
                        {flights.length > 0 ? flights.map((f) => `${f.flightNumber ? f.flightNumber + ' ' : ''}${f.from}→${f.to}${f.departTime && f.departDate === d.date ? ' ' + f.departTime : ''}`).join(', ') : d.title}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-ink-3" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Stays & flights */}
      <section className="mt-10">
        <SectionTitle eyebrow="Hospedagem" title="Hotéis" action={model.hotels.length > 0 && <Link to="/reservations?tab=hotels" className="text-[13px] font-medium text-lacquer">Ver todos</Link>} />
        {model.hotels.length ? (
          <ol className="card mx-5 divide-y divide-line">
            {model.hotels.map((h) => {
              const p = model.place(h.placeId);
              return (
                <li key={h.id}>
                  <Link to={`/day/${h.checkIn}`} className="tap flex items-center gap-3 px-4 py-3">
                    <Bed size={16} className="shrink-0 text-jade" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[16px]">{p?.name}</span>
                      <span className="block text-[12px] text-ink-3">{model.city(p?.cityId)?.name} · {fmtDayMonthShort(h.checkIn)} – {fmtDayMonthShort(h.checkOut)} · {daysBetween(h.checkIn, h.checkOut)} noite{daysBetween(h.checkIn, h.checkOut) > 1 ? 's' : ''}</span>
                      <span className="block truncate text-[12px] text-ink-3">{p?.address ?? 'Endereço a confirmar (falta a confirmação da reserva)'}</span>
                    </span>
                    <ArrowRight size={15} className="shrink-0 text-ink-3" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState icon={Bed} title="Hotéis a importar">Os hotéis de cada noite aparecerão aqui.</EmptyState>
        )}
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="Deslocamentos" title="Voos" action={model.flights.length > 0 && <Link to="/reservations?tab=flights" className="text-[13px] font-medium text-lacquer">Detalhes</Link>} />
        {model.flights.length ? (
          <ol className="card mx-5 divide-y divide-line">
            {model.flights.map((f) => (
              <li key={f.id}>
                <Link to="/reservations?tab=flights" className="tap flex items-center gap-3 px-4 py-3">
                  <Plane size={16} className="shrink-0 text-lacquer" aria-hidden />
                  <span className="w-[54px] shrink-0 text-[12px] leading-tight text-ink-3">{fmtWeekdayShort(f.departDate)}<br />{fmtDayMonthShort(f.departDate)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[16px] leading-tight">{f.from} → {f.to}</span>
                    <span className="block truncate text-[12px] text-ink-3">{[f.flightNumber, f.departTime && f.arriveTime ? `${f.departTime}–${f.arriveTime}` : f.departTime].filter(Boolean).join(' · ') || 'horário a confirmar'}</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-ink-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={Plane} title="Voos a importar">Voos internacionais e domésticos aparecerão aqui.</EmptyState>
        )}
      </section>

      {(offlineState === 'ready' || offlineState === 'unsupported') && (
        <section className="mt-10">
          <SectionTitle eyebrow="Sem internet" title="Guardar no celular" />
          <OfflineCard />
        </section>
      )}
    </div>
  );
}

function QuickDay({ date, label, accent }: { date: string; label: string; accent?: boolean }) {
  const d = model.day(date);
  const city = d?.cityIds.map((id) => model.city(id)?.name).join(' → ');
  const next = d && model.schedule(d).flatMap((g) => g.items)[0];
  return (
    <Link to={`/day/${date}`} className={`tap rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-lift)] ${accent ? 'bg-ink text-paper' : 'bg-card'}`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${accent ? 'text-paper/60' : 'text-ink-3'}`}>
        <CalendarDays size={12} aria-hidden /> {label}
      </div>
      <div className="mt-1.5 font-display text-[18px] leading-tight">{fmtFull(date).split(',')[1]}</div>
      <div className={`mt-0.5 truncate text-[12.5px] ${accent ? 'text-paper/70' : 'text-ink-3'}`}>{city || 'Programação a definir'}</div>
      {next && <div className={`mt-1 truncate text-[12px] ${accent ? 'text-paper/90' : 'text-ink-2'}`}>{next.time && <b className="tabular-nums">{next.time} </b>}{next.title}</div>}
    </Link>
  );
}

function QuickLink({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link to={to} className="tap rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-lift)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Central</div>
      <div className="mt-1.5 font-display text-[18px] leading-tight">{label}</div>
      <div className="mt-0.5 text-[12.5px] text-ink-3">{sub}</div>
    </Link>
  );
}

function TodoCard() {
  const c = todoCounts();
  if (!c.toBook && !c.missing) return null;
  return (
    <Link to="/reservations?tab=todo" className="tap mx-5 mt-5 flex items-center gap-3 rounded-[var(--radius-card)] border border-gold/50 bg-gold-soft/40 p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white ${c.urgent ? 'bg-lacquer' : 'bg-gold'}`}>{c.toBook}</span>
      <span className="min-w-0 flex-1 text-[13.5px]">
        <span className="block font-semibold text-ink">Falta reservar</span>
        <span className="block text-ink-2">{c.toBook} item(ns) do roteiro{c.urgent ? `, ${c.urgent} urgente` : ''} · {c.missing} com dados faltando</span>
      </span>
      <ArrowRight size={16} className="shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}

function RainCard() {
  const wet = model.days.filter((d) => d.weather?.risk === 'high');
  if (!wet.length) return null;
  const cities = [...new Set(wet.flatMap((d) => d.cityIds).map((id) => model.city(id)?.name).filter(Boolean))];
  return (
    <Link to={`/day/${wet[0].date}`} className="tap mx-5 mt-3 flex items-center gap-3 rounded-[var(--radius-card)] bg-[#dfe9f0] p-4 text-[#1f3b4d]">
      <CloudRain size={22} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 text-[13.5px]">
        <span className="block font-semibold">Época de chuvas · {fmtDayMonthShort(wet[0].date)} – {fmtDayMonthShort(wet[wet.length - 1].date)}</span>
        <span className="block opacity-80">{cities.join(', ')}: leve capa de chuva e calçado que possa molhar. Cada dia tem um plano B.</span>
      </span>
      <ArrowRight size={16} className="shrink-0 opacity-60" aria-hidden />
    </Link>
  );
}
