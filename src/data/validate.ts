import type { TripData } from './types';
import { addDays, zonedInstant } from '../lib/time';

export interface Issue {
  level: 'error' | 'warning' | 'missing';
  where: string;
  message: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Consistency checks for the itinerary. Errors break the build;
 * warnings and "missing" items are reported so gaps can be flagged
 * to the travellers instead of being filled with guesses.
 */
export function validateTrip(data: TripData): Issue[] {
  const issues: Issue[] = [];
  const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
  const warn = (where: string, message: string) => issues.push({ level: 'warning', where, message });
  const missing = (where: string, message: string) => issues.push({ level: 'missing', where, message });

  const { trip } = data;
  if (!DATE.test(trip.startDate) || !DATE.test(trip.endDate)) err('trip', 'startDate/endDate must be YYYY-MM-DD');
  if (trip.startDate > trip.endDate) err('trip', 'startDate is after endDate');
  if (!trip.datesConfirmed) missing('trip', 'Datas da viagem ainda marcadas como provisórias');

  // --- unique ids -----------------------------------------------------------
  const ids = (name: string, xs: { id: string }[]) => {
    const seen = new Set<string>();
    for (const x of xs) {
      if (!/^[a-z0-9-]+$/.test(x.id)) err(`${name}:${x.id}`, 'id must be kebab-case (a-z, 0-9, -)');
      if (seen.has(x.id)) err(`${name}:${x.id}`, 'duplicate id');
      seen.add(x.id);
    }
    return seen;
  };
  const cityIds = ids('city', data.cities);
  const placeIds = ids('place', data.places);
  const hotelIds = ids('hotel', data.hotels);
  const flightIds = ids('flight', data.flights);
  const bookingIds = ids('booking', data.bookings);
  ids('activity', data.days.flatMap((d) => d.activities));
  const airportCodes = new Set(data.airports.map((a) => a.code));

  // --- days cover the whole period exactly once, in order -------------------
  const expected: string[] = [];
  for (let d = trip.startDate; d <= trip.endDate && expected.length < 400; d = addDays(d, 1)) expected.push(d);
  const actual = data.days.map((d) => d.date);
  if (actual.join() !== expected.join()) {
    for (const d of expected) if (!actual.includes(d)) err(`day:${d}`, 'missing day page for this date');
    for (const d of actual) if (!expected.includes(d)) err(`day:${d}`, 'day outside trip period (or duplicated)');
    if (actual.length === expected.length && expected.every((d) => actual.includes(d))) err('days', 'days are not in chronological order');
  }

  // --- places / cities --------------------------------------------------------
  for (const c of data.cities) if (!c.abroad) checkCoords(`city:${c.id}`, c.coords);
  for (const p of data.places) {
    if (!cityIds.has(p.cityId)) err(`place:${p.id}`, `unknown cityId "${p.cityId}"`);
    if (p.coords) checkCoords(`place:${p.id}`, p.coords);
    if (!p.address && !p.coords && !p.googlePlaceId) missing(`place:${p.id}`, 'sem endereço nem coordenadas (link do Maps usará só o nome)');
  }
  function checkCoords(where: string, c: { lat: number; lng: number }) {
    if (c.lat < 8 || c.lat > 24 || c.lng < 102 || c.lng > 110) warn(where, `coordinates ${c.lat},${c.lng} are outside Vietnam`);
  }

  // --- food recommendations -------------------------------------------------
  const foodIds = new Set<string>();
  for (const f of data.food ?? []) {
    const w = `food:${f.id}`;
    if (placeIds.has(f.id) || foodIds.has(f.id)) err(w, 'duplicate id (also used by a place or another food spot)');
    foodIds.add(f.id);
    if (!cityIds.has(f.cityId)) err(w, `unknown cityId "${f.cityId}"`);
    if (!f.days.length) err(w, 'no days');
    for (const d of f.days) if (d < trip.startDate || d > trip.endDate) err(w, `day ${d} outside the trip`);
    if (!f.meals.length) err(w, 'no meals');
    if (f.coords) checkCoords(w, f.coords);
    if (!f.address && !f.coords) missing(w, 'sem endereço');
  }

  // --- hotels ---------------------------------------------------------------
  for (const h of data.hotels) {
    if (!placeIds.has(h.placeId)) err(`hotel:${h.id}`, `unknown placeId "${h.placeId}"`);
    if (h.checkIn >= h.checkOut) err(`hotel:${h.id}`, 'checkOut must be after checkIn');
    for (let n = h.checkIn; n < h.checkOut; n = addDays(n, 1)) {
      const day = data.days.find((d) => d.date === n);
      if (day && day.hotelId !== h.id) warn(`hotel:${h.id}`, `night of ${n} is inside the booking but day.hotelId is "${day.hotelId ?? '—'}"`);
    }
    if (h.status === 'pending') missing(`hotel:${h.id}`, 'reserva ainda pendente');
  }

  // --- flights --------------------------------------------------------------
  for (const f of data.flights) {
    for (const code of [f.from, f.to]) if (!airportCodes.has(code)) err(`flight:${f.id}`, `unknown airport "${code}" (add it to airports)`);
    if (f.departTime && !TIME.test(f.departTime)) err(`flight:${f.id}`, 'departTime must be HH:mm');
    if (f.arriveTime && !TIME.test(f.arriveTime)) err(`flight:${f.id}`, 'arriveTime must be HH:mm');
    if (!f.departTime || !f.arriveTime) missing(`flight:${f.id}`, 'horário de partida/chegada não informado');
    const from = data.airports.find((a) => a.code === f.from);
    const to = data.airports.find((a) => a.code === f.to);
    if (from && to && f.departTime && f.arriveTime) {
      const dep = zonedInstant(f.departDate, f.departTime, from.timeZone);
      const arr = zonedInstant(f.arriveDate ?? f.departDate, f.arriveTime, to.timeZone);
      const hours = (arr - dep) / 3_600_000;
      if (hours <= 0) err(`flight:${f.id}`, 'arrival is before departure (check arriveDate / time zones)');
      else if (hours > 30) warn(`flight:${f.id}`, `flight duration looks too long (${hours.toFixed(1)}h)`);
    }
  }

  // --- bookings -------------------------------------------------------------
  for (const b of data.bookings) {
    for (const pid of [b.fromPlaceId, b.toPlaceId, b.meetingPlaceId]) if (pid && !placeIds.has(pid)) err(`booking:${b.id}`, `unknown place "${pid}"`);
    if (b.time && !TIME.test(b.time)) err(`booking:${b.id}`, 'time must be HH:mm');
    if (b.date < trip.startDate || b.date > trip.endDate) warn(`booking:${b.id}`, 'date outside the trip period');
    if (!b.time) missing(`booking:${b.id}`, 'horário não informado');
  }

  // --- days & activities ----------------------------------------------------
  const referencedFlights = new Set<string>();
  const referencedBookings = new Set<string>();
  for (const day of data.days) {
    const w = `day:${day.date}`;
    for (const c of day.cityIds) if (!cityIds.has(c)) err(w, `unknown cityId "${c}"`);
    if (day.hotelId && !hotelIds.has(day.hotelId)) err(w, `unknown hotelId "${day.hotelId}"`);
    if (day.hotelId) {
      const h = data.hotels.find((x) => x.id === day.hotelId);
      if (h && (day.date < h.checkIn || day.date >= h.checkOut)) err(w, `hotel "${h.id}" is not booked for the night of ${day.date}`);
    }
    if (trip.dataStatus === 'imported') {
      if (!day.cityIds.length) missing(w, 'dia sem cidade definida');
      // A stayNote marks a deliberate night without a hotel (home, overnight flight).
      if (!day.hotelId && !day.stayNote && day.date !== trip.endDate) missing(w, 'sem hotel para esta noite (ok se for voo noturno)');
      if (!day.activities.length) missing(w, 'dia sem atividades');
    }
    for (const a of day.activities) {
      const aw = `${w} › ${a.id}`;
      // A place must be in one of the day's cities (catches items filed under the wrong day).
      const ap = data.places.find((x) => x.id === a.placeId);
      if (ap && day.cityIds.length && !day.cityIds.includes(ap.cityId)) err(aw, `place "${ap.id}" is in ${ap.cityId}, but this day is in ${day.cityIds.join(' → ')}`);
      if (a.time && !TIME.test(a.time)) err(aw, 'time must be HH:mm');
      if (a.endTime && !TIME.test(a.endTime)) err(aw, 'endTime must be HH:mm');
      if (a.time && a.endTime && a.endTime <= a.time) warn(aw, 'endTime is not after time (crosses midnight?)');
      if (a.placeId && !placeIds.has(a.placeId)) err(aw, `unknown placeId "${a.placeId}"`);
      if (a.hotelId && !hotelIds.has(a.hotelId)) err(aw, `unknown hotelId "${a.hotelId}"`);
      if (a.flightId) {
        referencedFlights.add(a.flightId);
        const f = data.flights.find((x) => x.id === a.flightId);
        if (!flightIds.has(a.flightId)) err(aw, `unknown flightId "${a.flightId}"`);
        else if (f && f.departDate !== day.date && (f.arriveDate ?? f.departDate) !== day.date && f.departDate !== addDays(day.date, 1)) warn(aw, `flight ${f.id} is not on this date`);
      }
      if (a.bookingId) {
        referencedBookings.add(a.bookingId);
        const b = data.bookings.find((x) => x.id === a.bookingId);
        if (!bookingIds.has(a.bookingId)) err(aw, `unknown bookingId "${a.bookingId}"`);
        else if (b && b.date !== day.date) warn(aw, `booking "${b.id}" is dated ${b.date}`);
        else if (b && a.time && b.time && a.time !== b.time) warn(aw, `time ${a.time} differs from booking time ${b.time}`);
      }
      if (a.status === 'pending') missing(aw, 'atividade pendente de confirmação');
    }
    // Overlapping fixed-time items
    const timed = day.activities.filter((a) => a.time && a.status === 'confirmed').sort((x, y) => x.time!.localeCompare(y.time!));
    for (let i = 1; i < timed.length; i++) {
      const prev = timed[i - 1];
      if (prev.endTime && prev.endTime > timed[i].time!) warn(w, `"${prev.title}" ends ${prev.endTime}, after "${timed[i].title}" starts ${timed[i].time}`);
    }
  }
  for (const f of data.flights) if (!referencedFlights.has(f.id) && f.departDate >= trip.startDate && f.departDate <= trip.endDate) warn(`flight:${f.id}`, 'not shown on any day (add an activity with flightId)');
  for (const b of data.bookings) if (!referencedBookings.has(b.id)) warn(`booking:${b.id}`, 'not shown on any day (add an activity with bookingId)');

  return issues;
}
