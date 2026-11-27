import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { model } from '../data';
import { minutesOf, nowTimeIn } from '../lib/time';
import { MapsButton } from './ui';

/**
 * "A seguir": the next item with a set time today, how long until it, and how
 * to get there — the question the app exists to answer on the street.
 */
export function NextUp({ today }: { today: string }) {
  const day = model.day(today);
  if (!day) return null;
  const tz = model.city(day.cityIds[day.cityIds.length - 1])?.timeZone ?? model.trip.timeZone;
  const now = minutesOf(nowTimeIn(tz))!;
  const timed = model.schedule(day).flatMap((g) => g.items).filter((a) => a.time);
  const next = timed.find((a) => minutesOf(a.time)! >= now - 10);
  if (!next) return null;
  const mins = minutesOf(next.time)! - now;
  const flight = model.flight(next.flightId);
  const place = model.place(next.placeId) ?? model.place(model.booking(next.bookingId)?.meetingPlaceId) ?? model.place(model.airport(flight?.from)?.placeId);
  const until = mins <= 0 ? 'agora' : mins < 60 ? `em ${mins} min` : `em ${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
  return (
    <div className="mx-5 mt-5 overflow-hidden rounded-[var(--radius-card)] bg-ink text-paper shadow-[var(--shadow-lift)]">
      <Link to={`/day/${today}`} className="block px-4 pb-3 pt-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/60"><Clock size={12} aria-hidden /> A seguir · {until}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-[26px] leading-none tabular-nums">{next.time}</span>
          <span className="min-w-0 truncate text-[16px] font-medium">{next.title}</span>
        </div>
        {place && <div className="mt-1 flex items-center gap-1 truncate text-[12.5px] text-paper/70"><MapPin size={12} aria-hidden />{place.name}</div>}
      </Link>
      {place && <div className="border-t border-paper/10 px-4 py-2.5"><MapsButton place={place} label="Como chegar" directions variant="onDark" /></div>}
    </div>
  );
}
