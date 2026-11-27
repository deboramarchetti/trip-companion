import { useState } from 'react';
import { Bed, Bus, CalendarCheck, Car, Copy, Info, Lock, MapPin, Phone, Plane, Plus, Sailboat, Ship, Ticket, TrainFront, User, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { model } from '../data';
import type { Booking, BookingKind, Flight, Hotel } from '../data/types';
import { daysBetween, fmtDayMonthShort, fmtDuration, fmtWeekdayShort, zonedInstant } from '../lib/time';
import { usePrivate } from '../state/privateData';
import { needsOwnCode } from '../lib/viewer';
import { MapsButton, Row, StatusBadge } from './ui';

/** Booking code etc. — shown only after unlocking; hidden entirely when there is none. */
export function PrivateInfo({ id }: { id: string }) {
  const { state, get } = usePrivate();
  if (state === 'none') return null;
  if (state === 'opening') return <div className="h-5 w-32 animate-pulse rounded-full bg-paper-2" aria-label="Carregando códigos" />;
  if (state === 'locked') {
    return (
      <Link to="/reservations#unlock" className="flex items-center gap-2 text-[12.5px] text-ink-3">
        <Lock size={13} aria-hidden /> Código protegido · desbloquear em Reservas
      </Link>
    );
  }
  const p = get(id);
  const item = model.hotel(id) ?? model.flight(id) ?? model.booking(id);
  const addOwn = item && needsOwnCode(item) && (
    <Link to={`/reservations?tab=todo#codes=${id}`} className="tap inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-2">
      <Plus size={13} aria-hidden /> Adicionar seu código
    </Link>
  );
  if (!p) return addOwn || null;
  return (
    <div className="space-y-1.5">
      {addOwn}
      {p.bookingRef && <CopyField label="Código" value={p.bookingRef} />}
      {p.ticketNumbers?.map((t) => <CopyField key={t} label="Bilhete" value={t} />)}
      {p.contact && <Row icon={User}>{p.contact}</Row>}
      {p.phone && <Row icon={Phone}><a className="underline decoration-line underline-offset-2" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a></Row>}
      {p.email && <Row icon={Info}>{p.email}</Row>}
      {p.notes && <Row icon={Info}>{p.notes}</Row>}
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); })}
      className="tap flex w-full items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-left"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</span>
      <span className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-wide">
        {value}
        <Copy size={13} className={copied ? 'text-jade' : 'text-ink-3'} aria-label={copied ? 'Copiado' : 'Copiar'} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ flights */

function flightDuration(f: Flight) {
  const a = model.airport(f.from), b = model.airport(f.to);
  if (!a || !b || !f.departTime || !f.arriveTime) return undefined;
  const min = (zonedInstant(f.arriveDate ?? f.departDate, f.arriveTime, b.timeZone) - zonedInstant(f.departDate, f.departTime, a.timeZone)) / 60000;
  return min > 0 ? fmtDuration(Math.round(min)) : undefined;
}

export function FlightCard({ flight: f, compact }: { flight: Flight; compact?: boolean }) {
  const from = model.airport(f.from), to = model.airport(f.to);
  const nextDay = f.arriveDate && f.arriveDate !== f.departDate ? daysBetween(f.departDate, f.arriveDate) : 0;
  const dur = flightDuration(f);
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-[13px]">
          <Plane size={15} className="shrink-0 text-lacquer" aria-hidden />
          <span className="truncate font-medium">{f.airline ?? 'Voo'}</span>
          {f.flightNumber && <span className="shrink-0 whitespace-nowrap text-ink-3">· {f.flightNumber}</span>}
        </div>
        <StatusBadge status={f.status} compact={compact} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4">
        <div>
          <div className="font-display text-[30px] leading-none">{f.from}</div>
          <div className="mt-1 truncate text-[12px] text-ink-3">{from?.city}</div>
          {f.departTime && <div className="mt-2 text-[20px] font-semibold tabular-nums">{f.departTime}</div>}
          <div className="text-[12px] text-ink-3">{fmtWeekdayShort(f.departDate)}, {fmtDayMonthShort(f.departDate)}</div>
          {f.departTerminal && <div className="text-[12px] text-ink-2">Terminal {f.departTerminal}</div>}
        </div>
        <div className="flex flex-col items-center px-1 text-ink-3">
          <div className="flex items-center gap-1">
            <span className="h-px w-5 bg-line" />
            <Plane size={14} aria-hidden />
            <span className="h-px w-5 bg-line" />
          </div>
          {dur && <div className="mt-1 text-[11px]">{dur}</div>}
        </div>
        <div className="text-right">
          <div className="font-display text-[30px] leading-none">{f.to}</div>
          <div className="mt-1 truncate text-[12px] text-ink-3">{to?.city}</div>
          {f.arriveTime && (
            <div className="mt-2 text-[20px] font-semibold tabular-nums">
              {f.arriveTime}
              {nextDay > 0 && <sup className="ml-0.5 text-[11px] text-lacquer">+{nextDay}</sup>}
            </div>
          )}
          {f.arriveDate && <div className="text-[12px] text-ink-3">{fmtWeekdayShort(f.arriveDate)}, {fmtDayMonthShort(f.arriveDate)}</div>}
          {f.arriveTerminal && <div className="text-[12px] text-ink-2">Terminal {f.arriveTerminal}</div>}
        </div>
      </div>
      {!compact && (f.baggage || f.notes || from || to) && (
        <div className="space-y-2 border-t border-line px-4 py-3">
          {f.seats && <Row icon={User}>Assentos {f.seats}</Row>}
          {from && to && <div className="text-[12px] text-ink-3">{from.name} → {to.name} · horários locais</div>}
          {f.baggage && <Row icon={Info}>{f.baggage}</Row>}
          {f.notes && <Row icon={Info}>{f.notes}</Row>}
        </div>
      )}
      <div className="border-t border-line px-4 py-3 empty:hidden">
        <PrivateInfo id={f.id} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- hotels */

export function HotelCard({ hotel: h, compact }: { hotel: Hotel; compact?: boolean }) {
  const p = model.place(h.placeId);
  const city = model.city(p?.cityId);
  const nights = daysBetween(h.checkIn, h.checkOut);
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow mb-1 flex items-center gap-1.5"><Bed size={12} aria-hidden />{city?.name}</div>
          <h3 className="text-[19px] font-medium leading-snug">{p?.name ?? h.placeId}</h3>
        </div>
        <StatusBadge status={h.status} compact={compact} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-paper px-3 py-2.5 text-[12px]">
        <div>
          <div className="text-ink-3">Check-in</div>
          <div className="font-semibold">{fmtDayMonthShort(h.checkIn)}</div>
          {h.checkInTime && <div className="text-ink-2">{h.checkInTime}</div>}
        </div>
        <div>
          <div className="text-ink-3">Check-out</div>
          <div className="font-semibold">{fmtDayMonthShort(h.checkOut)}</div>
          {h.checkOutTime && <div className="text-ink-2">{h.checkOutTime}</div>}
        </div>
        <div>
          <div className="text-ink-3">Noites</div>
          <div className="font-semibold">{nights}</div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 space-y-2">
          {p?.address && <Row icon={MapPin}>{p.address}</Row>}
          {p?.phone && <Row icon={Phone}><a className="underline decoration-line underline-offset-2" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a></Row>}
          {h.roomType && <Row icon={Bed}>{h.roomType}</Row>}
          {h.bookedVia && <Row icon={CalendarCheck}>Reservado via {h.bookedVia}</Row>}
          {h.notes && <Row icon={Info}>{h.notes}</Row>}
          <PrivateInfo id={h.id} />
        </div>
      )}
      {p && <div className="mt-3"><MapsButton place={p} /></div>}
    </article>
  );
}

/* ------------------------------------------------------- transports / tours */

export const BOOKING_ICON: Record<BookingKind, typeof Bus> = {
  transfer: Car, train: TrainFront, bus: Bus, boat: Sailboat, cruise: Ship, car: Car, tour: Ticket, ticket: Ticket, restaurant: Utensils, other: Ticket,
};
export const BOOKING_LABEL: Record<BookingKind, string> = {
  transfer: 'Transfer', train: 'Trem', bus: 'Ônibus', boat: 'Barco', cruise: 'Cruzeiro', car: 'Carro', tour: 'Passeio', ticket: 'Ingresso', restaurant: 'Restaurante', other: 'Reserva',
};

export function BookingCard({ booking: b, compact }: { booking: Booking; compact?: boolean }) {
  const Icon = BOOKING_ICON[b.kind];
  const meet = model.place(b.meetingPlaceId);
  const from = model.place(b.fromPlaceId);
  const to = model.place(b.toPlaceId);
  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lacquer-soft text-lacquer"><Icon size={18} aria-hidden /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="eyebrow">{BOOKING_LABEL[b.kind]}</div>
            <StatusBadge status={b.status} compact={compact} />
          </div>
          <h3 className="mt-0.5 text-[17px] font-medium leading-snug">{b.title}</h3>
          <div className="mt-0.5 text-[13px] text-ink-2">
            {fmtWeekdayShort(b.date)}, {fmtDayMonthShort(b.date)}
            {b.time && <> · <span className="font-semibold tabular-nums text-ink">{b.time}</span></>}
            {b.durationMin && <> · {fmtDuration(b.durationMin)}</>}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 space-y-2">
          {b.provider && <Row icon={User}>{b.provider}</Row>}
          {(from || to) && <Row icon={Car}>{[from?.name, to?.name].filter(Boolean).join(' → ')}</Row>}
          {(meet || b.meetingPoint) && <Row icon={MapPin}>Encontro: {meet?.name ?? b.meetingPoint}{meet?.address && <div className="text-ink-3">{meet.address}</div>}</Row>}
          {b.instructions && <Row icon={Info}>{b.instructions}</Row>}
          {b.notes && <Row icon={Info}>{b.notes}</Row>}
          {b.status !== 'pending' && <PrivateInfo id={b.id} />}
          {meet && <MapsButton place={meet} label="Ponto de encontro" />}
        </div>
      )}
    </article>
  );
}
