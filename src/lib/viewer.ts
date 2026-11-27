import { tripData } from '../data/trip';
import type { Party } from '../data/types';

/**
 * Who is using this phone (a "party": e.g. the couple or the friend).
 * Same itinerary for everyone; booking codes and to-dos follow the party.
 */
export const PARTIES: Party[] = tripData.trip.parties ?? [];
const KEY = 'ovt:viewer';

function read(): string | undefined {
  try {
    const v = localStorage.getItem(KEY) ?? undefined;
    return v && PARTIES.some((p) => p.id === v) ? v : undefined;
  } catch {
    return undefined;
  }
}

export const VIEWER: string | undefined = read();
export const viewerName = (id = VIEWER) => PARTIES.find((p) => p.id === id)?.name;
/** Traveller ids of a group (all travellers when no group is chosen). */
export const partyMembers = (id = VIEWER): string[] =>
  PARTIES.find((p) => p.id === id)?.members ?? (tripData.trip.travelers ?? []).map((t) => t.id);

export function setViewer(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  location.reload();
}

/** Private-data key of an item for a party ("h-hanoi@sam"). */
export const partyKey = (id: string, party = VIEWER) => (party ? `${id}@${party}` : id);

type WithMissing = { missing?: string[]; missingFor?: Record<string, string[]>; perParty?: boolean; confirmations?: string[] };

/** Booked for this party, but its own booking code is not in the app yet. */
export const needsOwnCode = (x: WithMissing, party = VIEWER) => !!party && !!x.perParty && !x.confirmations?.includes(party);

/**
 * What is still missing for this phone's party (or for everyone when no party is chosen).
 * withCodes=false leaves out "this party's booking code", which the to-do list shows apart.
 */
export function missingFor(x: WithMissing, party = VIEWER, withCodes = true): string[] {
  const out = [...(x.missing ?? [])];
  const parties = party ? PARTIES.filter((p) => p.id === party) : PARTIES;
  for (const p of parties) {
    out.push(...(x.missingFor?.[p.id] ?? []));
    if (withCodes && x.perParty && !x.confirmations?.includes(p.id)) out.push(party ? 'sua confirmação (código, PIN)' : `confirmação de ${p.name}`);
  }
  return out;
}

/**
 * The itinerary as one party lives it: drops flights, hotels, bookings and
 * activities that are only for other parties (and places used only by them).
 */
export function forParty<T extends import('../data/types').TripData>(data: T, party = VIEWER): T {
  if (!party) return data;
  const mine = (x: { parties?: string[] }) => !x.parties || x.parties.includes(party);
  const note = <X extends { notes?: string; notesFor?: Record<string, string> }>(x: X): X =>
    x.notesFor && party in x.notesFor ? { ...x, notes: x.notesFor[party] || undefined } : x;
  const flights = data.flights.filter(mine).map(note);
  const hotels = data.hotels.filter(mine).map(note);
  const bookings = data.bookings.filter(mine).map(note);
  const ids = new Set([...flights, ...hotels, ...bookings].map((x) => x.id));
  const dropped = new Set([...data.flights, ...data.hotels, ...data.bookings].filter((x) => !ids.has(x.id)).map((x) => x.id));
  const hotelPlacesGone = new Set(data.hotels.filter((h) => dropped.has(h.id)).map((h) => h.placeId));
  return {
    ...data,
    flights,
    hotels,
    bookings,
    places: data.places.filter((p) => !hotelPlacesGone.has(p.id) || hotels.some((h) => h.placeId === p.id)),
    trip: { ...data.trip, startDate: data.days.find(mine)?.date ?? data.trip.startDate },
    days: data.days.filter(mine).map((d) => ({
      ...d,
      summary: d.summaryFor?.[party] ?? d.summary,
      hotelId: d.hotelId && dropped.has(d.hotelId) ? undefined : d.hotelId,
      activities: d.activities.filter((a) => mine(a) && !(a.flightId && dropped.has(a.flightId)) && !(a.bookingId && dropped.has(a.bookingId)) && !(a.hotelId && dropped.has(a.hotelId))),
    })),
  };
}
