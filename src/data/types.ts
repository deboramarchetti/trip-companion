/**
 * Our Vietnam Trip — data model.
 *
 * Conventions
 * - Dates are ISO calendar dates ("2026-11-23") and times are local wall-clock
 *   times ("14:30") at the place where they happen. Nothing is converted:
 *   the app shows exactly what the booking says.
 * - Every entity has a stable `id` (kebab-case). Other entities reference it
 *   instead of repeating data (a hotel used for 3 nights is registered once).
 * - Anything unknown is simply omitted (optional field). The UI never shows
 *   empty fields. Never fill a field with a guess.
 * - Sensitive values (booking codes, ticket numbers, phones) do NOT live here.
 *   They go to private/private.json → encrypted into src/data/private.enc.json
 *   and are keyed by the same entity ids. See README.
 */

export type ISODate = string; // YYYY-MM-DD
export type LocalTime = string; // HH:mm (24h, local time of the place)
export type IanaTimeZone = string; // e.g. "Asia/Ho_Chi_Minh"

/** confirmed = booked / fixed time · suggestion = idea, flexible · pending = waiting for data */
export type Status = 'confirmed' | 'suggestion' | 'pending';

export interface Coordinates {
  lat: number;
  lng: number;
  /** true only when checked against the booking / Google Maps. */
  verified: boolean;
}

export interface Photo {
  /** Local file under /public/photos (precached for offline use). */
  src: string;
  alt: string;
  credit?: string;
  /** CSS object-position, e.g. "50% 30%". */
  focus?: string;
}

export interface Trip {
  id: string;
  title: string;
  subtitle?: string;
  /** First and last day shown in the app (inclusive), including travel days. */
  startDate: ISODate;
  endDate: ISODate;
  /** false while dates are still approximate. */
  datesConfirmed: boolean;
  /** Reference time zone for "today" detection. */
  timeZone: IanaTimeZone;
  coverPhoto?: Photo;
  travelers?: Traveler[];
  /** 'placeholder' until the real itinerary has been imported. */
  dataStatus: 'placeholder' | 'imported';
  /** Free text shown on the overview (optional). */
  intro?: string;
  /** Date that is "Dia 1" (days before it, e.g. a stopover, are not numbered). */
  dayOneDate?: ISODate;
  /**
   * Groups that hold their own reservations (e.g. a couple and a friend).
   * Each phone picks one; it then sees that group's booking codes and to-dos.
   */
  parties?: Party[];
}

export interface Party {
  id: string;
  name: string;
  /** Traveller ids in this group (see `trip.travelers`). */
  members?: string[];
}

export interface Traveler {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  /** Vietnamese spelling, e.g. "Hà Nội". */
  localName?: string;
  region?: string;
  /** City centre — used only for the overview map. */
  coords: Coordinates;
  photo?: Photo;
  tagline?: string;
  /** Hue of the generated cover art when there is no photo (0–360). */
  artHue?: number;
  /** Outside Vietnam (e.g. the Doha stopover): not drawn on the Vietnam map. */
  abroad?: boolean;
  /** IANA time zone when different from the trip's (abroad cities). */
  timeZone?: IanaTimeZone;
  /** Which side of the dot the label goes on in the overview map. */
  mapLabel?: 'left' | 'right';
}

export type PlaceKind =
  | 'attraction'
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'airport'
  | 'station'
  | 'pier'
  | 'market'
  | 'shopping'
  | 'meeting-point'
  | 'other';

export interface Place {
  id: string;
  name: string;
  localName?: string;
  cityId: string;
  kind: PlaceKind;
  address?: string;
  coords?: Coordinates;
  /** Google Maps place id, when known — makes the Maps link exact. */
  googlePlaceId?: string;
  /** Text searched in Google Maps when there is no address (e.g. "Hoan Kiem Lake, Hanoi"). */
  mapsQuery?: string;
  /** A Google Maps share link for the exact spot (used by the "Maps" button). */
  mapsUrl?: string;
  description?: string;
  photo?: Photo;
  /** Public phone of the place (hotel reception etc.). */
  phone?: string;
  notes?: string;
}

/** How urgent it is to book something (from the itinerary's booking table). */
export type Priority = 'high' | 'medium' | 'low';

/** Fields shared by everything that can be booked. */
interface Bookable {
  /** Booked, but these details are still missing (shown in "A fazer"). */
  missing?: string[];
  /** When to book it (itinerary table), for pending items. */
  bookBy?: string;
  priority?: Priority;
  /** Each party has its own reservation for this (same hotel/flight, different codes). */
  perParty?: boolean;
  /** Only these parties take part (e.g. a friend skips the stopover legs). Omit = everyone. */
  parties?: string[];
  /** Parties whose confirmation is already in the app (only for perParty items). */
  confirmations?: string[];
  /** Missing details that concern only one party. */
  missingFor?: Record<string, string[]>;
  /** Notes as one party should read them ('' hides the notes for that party). */
  notesFor?: Record<string, string>;
}

export interface Hotel extends Bookable {
  id: string;
  placeId: string; // name, address, coords live on the Place
  checkIn: ISODate;
  checkOut: ISODate;
  checkInTime?: LocalTime;
  checkOutTime?: LocalTime;
  roomType?: string;
  bookedVia?: string;
  status: Status;
  notes?: string;
}

export interface Airport {
  code: string; // IATA
  name: string;
  city: string;
  timeZone: IanaTimeZone;
  /** Optional Place for the Maps link. */
  placeId?: string;
}

export interface Flight extends Bookable {
  id: string;
  airline?: string;
  flightNumber?: string;
  from: string; // Airport code
  to: string; // Airport code
  departDate: ISODate;
  departTime?: LocalTime; // local at origin
  arriveDate?: ISODate;
  arriveTime?: LocalTime; // local at destination
  departTerminal?: string;
  arriveTerminal?: string;
  baggage?: string;
  seats?: string;
  status: Status;
  notes?: string;
}

export type BookingKind = 'transfer' | 'train' | 'bus' | 'boat' | 'cruise' | 'car' | 'tour' | 'ticket' | 'restaurant' | 'other';

/** Transports, tours, tickets and restaurant reservations. */
export interface Booking extends Bookable {
  id: string;
  kind: BookingKind;
  title: string;
  provider?: string;
  date: ISODate;
  time?: LocalTime;
  endDate?: ISODate;
  endTime?: LocalTime;
  fromPlaceId?: string;
  toPlaceId?: string;
  meetingPlaceId?: string;
  meetingPoint?: string; // free text when there is no Place
  durationMin?: number;
  instructions?: string;
  status: Status;
  notes?: string;
}

export type Period = 'morning' | 'afternoon' | 'evening';

export type ActivityKind =
  | 'activity'
  | 'meal'
  | 'flight'
  | 'transfer'
  | 'check-in'
  | 'check-out'
  | 'free-time'
  | 'note';

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  time?: LocalTime;
  endTime?: LocalTime;
  /** Used when there is no exact time. Derived from `time` otherwise. */
  period?: Period;
  description?: string;
  placeId?: string;
  durationMin?: number;
  photo?: Photo;
  /** How to get there ("Grab ~15 min", "a pé 10 min"...). */
  transport?: string;
  /** How you get there: opens "Como chegar" in Google Maps walking or driving. */
  travelMode?: 'walking' | 'driving';
  notes?: string;
  status: Status;
  /** Marked as a trip highlight (⭐) in the itinerary. */
  highlight?: boolean;
  /** Only for these parties (omit = everyone). */
  parties?: string[];
  /** An idea added on top of the original itinerary (shown as "Ideia extra"). */
  extra?: boolean;
  /** Links to reservations — their details are shown on the card. */
  flightId?: string;
  bookingId?: string;
  hotelId?: string;
}

/** Weather heads-up for a day: what to carry and what to do if it pours. */
export interface DayWeather {
  /** high = rainy/flood season; low = mostly dry season but outdoors. */
  risk: 'high' | 'low';
  note?: string;
  /** Alternatives if it rains a lot. */
  rainPlan: string[];
}

export interface Day {
  date: ISODate;
  /** Cities of the day, in order. Two or more = travel day. */
  cityIds: string[];
  title?: string;
  summary?: string;
  /** Replaces `summary` for one party (e.g. a different flight home). */
  summaryFor?: Record<string, string>;
  photo?: Photo;
  /** Hotel where we sleep that night (omit on overnight flights). */
  hotelId?: string;
  /** Shown instead of the hotel card when the night has no booking yet. */
  stayNote?: string;
  weather?: DayWeather;
  /** Only for these parties (e.g. the Doha stopover). Omit = everyone. */
  parties?: string[];
  /** Open choices for the day ("Decisões"), each with its options. */
  decisions?: Decision[];
  activities: Activity[];
}

export interface DecisionOption {
  id: string;
  label: string;
  detail?: string;
  placeId?: string;
}
export interface Decision {
  id: string;
  question: string;
  context?: string;
  options: DecisionOption[];
}

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'coffee' | 'drinks';

/** A recommended place to eat or drink (researched; not a reservation). */
export interface FoodSpot extends Omit<Place, 'kind'> {
  kind: 'restaurant' | 'cafe';
  meals: Meal[];
  /** What to order. */
  dish?: string;
  price?: '$' | '$$' | '$$$';
  hours?: string;
  /** Where the recommendation comes from (guides, review counts). */
  sources?: string[];
  /** Days it is recommended for. */
  days: ISODate[];
}

export interface TripData {
  trip: Trip;
  cities: City[];
  places: Place[];
  hotels: Hotel[];
  airports: Airport[];
  flights: Flight[];
  bookings: Booking[];
  days: Day[];
  /** Where to eat, by day (optional). */
  food?: FoodSpot[];
}

/** Decrypted private data, keyed by entity id (flight / hotel / booking id). */
export interface PrivateEntry {
  /** Only on the special "__app" entry: random key for the shared expenses. */
  expensesKey?: string;
  /** Only on "__docs@<party>": random key that encrypts that party's documents. */
  docsKey?: string;
  /** Documents shipped encrypted inside the app (public/seed-docs/<id>.txt). */
  seed?: { id: string; owner: string; shared?: boolean; title: string; mime: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'; size: number; iv: string }[];
  bookingRef?: string;
  ticketNumbers?: string[];
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
}
export type PrivateData = Record<string, PrivateEntry>;

/* --------------------------------------------------------------------------
 * Changes made inside the app (saved on the phone, shareable with the group).
 * They are applied on top of trip.ts until they are published permanently.
 * ------------------------------------------------------------------------ */
export interface LocalEdit {
  status?: Status;
  time?: LocalTime;
  provider?: string;
  flightNumber?: string;
  meetingPoint?: string;
  notes?: string;
  bookingRef?: string;
  phone?: string;
  contact?: string;
  updatedAt: string;
}
export interface LocalItem extends Omit<LocalEdit, 'status'> {
  id: string;
  kind: BookingKind;
  title: string;
  date: ISODate;
  status: Status;
  deleted?: boolean;
}
export interface LocalStore {
  edits: Record<string, LocalEdit>;
  items: LocalItem[];
}
