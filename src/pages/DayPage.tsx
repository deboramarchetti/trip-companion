import { useEffect } from 'react';
import { Decisions } from '../components/Decisions';
import { ArrowLeft, ArrowRight, Bed, Moon, UtensilsCrossed, CalendarClock, ChevronLeft, ChevronRight, MapPin, MoveRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { model } from '../data';
import { dayNumber, numberedDays } from '../data/model';
import { defaultDay, useToday } from '../hooks';
import { fmtDayMonth, fmtFull, fmtWeekday, PERIOD_LABEL } from '../lib/time';
import { ActivityCard } from '../components/ActivityCard';
import { Cover } from '../components/Cover';
import { DateStrip } from '../components/DateStrip';
import { FoodList } from '../components/FoodList';
import { WeatherCard } from '../components/WeatherCard';
import { PrivateInfo } from '../components/Reservations';
import { EmptyState, MapsButton, PlaceholderBadge } from '../components/ui';

export function DayRedirect() {
  const today = useToday();
  return <Navigate to={`/day/${defaultDay(today)}`} replace />;
}

export function DayPage() {
  const { date = '' } = useParams();
  const today = useToday();
  const day = model.day(date);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [date]);
  if (!day) return <Navigate to="/day" replace />;

  const idx = model.dayIndex(date);
  const prev = model.days[idx - 1];
  const next = model.days[idx + 1];
  const cities = day.cityIds.map((id) => model.city(id)!).filter(Boolean);
  const mainCity = cities.at(-1);
  const hotel = model.hotel(day.hotelId);
  const hotelPlace = model.place(hotel?.placeId);
  const groups = model.schedule(day);
  const moving = cities.length > 1;
  // Confirmed items with a set time: flights, bookings and timed hotel/cruise check-in/out.
  const fixed = model.schedule(day).flatMap((g) => g.items).filter((a) => a.status === 'confirmed' && a.time && (a.flightId || a.bookingId || a.hotelId));

  return (
    <div className="pb-8">
      {/* Sticky date strip */}
      <div className="pt-safe sticky top-0 z-30 border-b border-line/60 bg-paper/90 backdrop-blur-xl">
        <DateStrip selected={date} today={today} />
      </div>

      {/* Header */}
      <Cover photo={day.photo ?? mainCity?.photo} hue={mainCity?.artHue ?? 30} seed={date} className="mx-4 mt-3 h-64 rounded-[1.6rem] shadow-[var(--shadow-lift)]">
        <div className="flex h-full flex-col justify-between p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
              {dayNumber(model, date) ? `Dia ${dayNumber(model, date)} de ${numberedDays(model)}` : date === model.trip.startDate ? 'Embarque' : 'Stopover em Doha'}
            </span>
            {date === today && <span className="rounded-full bg-lacquer px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Hoje</span>}
          </div>
          <div>
            <div className="text-[13px] text-white/85">{fmtWeekday(date)}, {fmtDayMonth(date)}</div>
            <h1 className="mt-1 text-[32px] font-normal leading-[1.05]">
              {cities.length ? (
                cities.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && <MoveRight className="mx-1.5 inline -translate-y-0.5" size={22} aria-label="para" />}
                    {c.name}
                  </span>
                ))
              ) : (
                <span className="italic text-white/90">Cidade a definir</span>
              )}
            </h1>
            {day.title && day.title !== cities.map((c) => c.name).join(' → ') && <div className="mt-1 text-[14px] text-white/90">{day.title}</div>}
          </div>
        </div>
      </Cover>

      <div className="mt-4 space-y-3 px-4">
        {day.summary && <p className="px-1 text-[15px] leading-relaxed text-ink-2">{day.summary}</p>}

        {day.weather && <WeatherCard w={day.weather} />}

        {/* Shortcut to the food list at the bottom of the page */}
        {model.foodFor(date).length > 0 && (
          <button
            onClick={() => document.getElementById('onde-comer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="tap flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-gold-soft/60 px-4 py-3 text-left"
          >
            <UtensilsCrossed size={18} className="shrink-0 text-[#7a5518]" aria-hidden />
            <span className="flex-1 text-[14px]"><b>Onde comer</b> <span className="text-ink-2">· {model.foodFor(date).length} sugestões para hoje</span></span>
            <ArrowRight size={16} className="rotate-90 text-ink-3" aria-hidden />
          </button>
        )}

        {/* Travel day */}
        {moving && (
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-jade px-4 py-3 text-white">
            <MoveRight size={20} aria-hidden />
            <div className="text-[13.5px]">
              <div className="font-semibold">Dia de deslocamento</div>
              <div className="text-white/80">{cities.map((c) => c.name).join(' → ')} · veja os horários abaixo</div>
            </div>
          </div>
        )}

        {/* Fixed times summary */}
        {fixed.length > 0 && (
          <div className="card flex items-start gap-3 p-4">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-lacquer" aria-hidden />
            <div className="min-w-0 flex-1 text-[13.5px]">
              <div className="mb-1 font-semibold">Horários fixos</div>
              {fixed.map((a) => (
                <div key={a.id} className="flex gap-2"><b className="tabular-nums text-lacquer">{a.time}</b><span className="truncate text-ink-2">{a.title}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Night without a booked hotel */}
        {!hotel && day.stayNote && (
          <div className="card flex gap-3 p-4">
            <Moon size={18} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
            <div className="text-[13.5px] text-ink-2">
              <div className="font-semibold text-ink">Esta noite</div>
              {day.stayNote}
            </div>
          </div>
        )}

        {/* Hotel tonight */}
        {hotel && hotelPlace && (
          <div className="card p-4">
            <div className="eyebrow mb-1 flex items-center gap-1.5"><Bed size={12} aria-hidden /> Hotel desta noite</div>
            <div className="font-display text-[18px] leading-snug">{hotelPlace.name}</div>
            {hotelPlace.address && <div className="mt-0.5 flex gap-1.5 text-[13px] text-ink-3"><MapPin size={13} className="mt-[3px] shrink-0" aria-hidden />{hotelPlace.address}</div>}
            {(hotel.checkInTime || hotel.checkOutTime) && (
              <div className="mt-1 text-[12.5px] text-ink-3">
                {hotel.checkIn === date && hotel.checkInTime && <>Check-in a partir das <b className="text-ink-2">{hotel.checkInTime}</b>{hotel.checkOutTime && ' · '}</>}
                {hotel.checkOut > date && hotel.checkOutTime && <>Check-out {hotel.checkOut.slice(8)}/{hotel.checkOut.slice(5, 7)} até <b className="text-ink-2">{hotel.checkOutTime}</b></>}
              </div>
            )}
            {hotelPlace.phone && <a href={`tel:${hotelPlace.phone.replace(/[^+\d]/g, '')}`} className="mt-1 block text-[12.5px] text-ink-2 underline decoration-line underline-offset-2">{hotelPlace.phone}</a>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <MapsButton place={hotelPlace} />
              <MapsButton place={hotelPlace} label="Como chegar" variant="ghost" directions />
            </div>
            {(hotel.checkIn === date || hotel.checkOut === date) && <div className="mt-3"><PrivateInfo id={hotel.id} /></div>}
          </div>
        )}

        {/* Open choices for the day */}
        {day.decisions?.length ? <Decisions decisions={day.decisions} /> : null}
      </div>

      {/* Schedule */}
      <div className="mt-8 px-4">
        {groups.length === 0 ? (
          <div className="-mx-5">
            <EmptyState icon={CalendarClock} title="Programação a importar">
              <span className="mb-2 block">As atividades deste dia virão do roteiro.</span>
              <PlaceholderBadge />
            </EmptyState>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.period} className="mb-2">
              <h2 className="mb-3 flex items-center gap-3 font-display text-[22px] font-normal italic text-ink-2">
                {g.period === 'anytime' ? 'Ao longo do dia' : PERIOD_LABEL[g.period]}
                <span className="h-px flex-1 bg-line" />
              </h2>
              <ol>
                {g.items.map((a, i) => <ActivityCard key={a.id} a={a} isLast={i === g.items.length - 1} />)}
              </ol>
            </section>
          ))
        )}
      </div>

      <FoodList date={date} />

      {/* Prev / next */}
      <div className="mt-6 space-y-3 px-4">
        {next && (
          <Link to={`/day/${next.date}`} className="tap flex items-center justify-between rounded-[var(--radius-card)] bg-ink px-5 py-4 text-paper shadow-[var(--shadow-lift)]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/60">Próximo dia</div>
              <div className="font-display text-[19px]">{fmtFull(next.date)}</div>
              <div className="text-[12.5px] text-paper/70">{next.cityIds.map((id) => model.city(id)?.name).join(' → ') || 'A definir'}</div>
            </div>
            <ArrowRight size={22} aria-hidden />
          </Link>
        )}
        <div className="flex justify-between">
          {prev ? (
            <Link to={`/day/${prev.date}`} className="tap flex items-center gap-1 px-1 py-2 text-[13px] font-medium text-ink-2"><ChevronLeft size={16} aria-hidden /> Dia anterior</Link>
          ) : <span />}
          {!next && <Link to="/" className="tap flex items-center gap-1 px-1 py-2 text-[13px] font-medium text-ink-2">Visão geral <ArrowLeft size={14} className="rotate-180" aria-hidden /></Link>}
          {next && <Link to={`/day/${next.date}`} className="tap flex items-center gap-1 px-1 py-2 text-[13px] font-medium text-ink-2">Dia seguinte <ChevronRight size={16} aria-hidden /></Link>}
        </div>
      </div>
    </div>
  );
}
