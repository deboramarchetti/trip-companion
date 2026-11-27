import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, fmtDuration, nowTimeIn, periodOf, todayIn, zonedInstant } from '../src/lib/time';
import { mapsDirectionsUrl, mapsSearchUrl } from '../src/lib/maps';
import { validateTrip } from '../src/data/validate';
import { buildModel, tripPhase } from '../src/data/model';
import { tripData } from '../src/data/trip';
import { sampleData } from '../src/data/sample';
import { decryptPrivate } from '../src/lib/crypto';

describe('Vietnam time', () => {
  it('uses UTC+7 for "today" regardless of device zone', () => {
    // 2027-11-22 18:30 UTC = 2027-11-23 01:30 in Vietnam
    const t = new Date('2027-11-22T18:30:00Z');
    expect(todayIn('Asia/Ho_Chi_Minh', t)).toBe('2027-11-23');
    expect(nowTimeIn('Asia/Ho_Chi_Minh', t)).toBe('01:30');
    expect(todayIn('America/Sao_Paulo', t)).toBe('2027-11-22');
  });
  it('date math', () => {
    expect(daysBetween('2027-11-22', '2027-12-05')).toBe(13);
    expect(addDays('2027-11-29', 1)).toBe('2027-11-30');
    expect(periodOf('11:59')).toBe('morning');
    expect(periodOf('12:00')).toBe('afternoon');
    expect(periodOf('18:00')).toBe('evening');
    expect(fmtDuration(90)).toBe('1h30');
  });
  it('zonedInstant resolves local wall-clock times', () => {
    expect(new Date(zonedInstant('2027-11-22', '08:40', 'Asia/Ho_Chi_Minh')).toISOString()).toBe('2027-11-22T01:40:00.000Z');
    expect(new Date(zonedInstant('2027-11-21', '01:10', 'America/Sao_Paulo')).toISOString()).toBe('2027-11-21T04:10:00.000Z');
  });
});

describe('Google Maps URLs', () => {
  it('uses the official api=1 search URL with name + address', () => {
    const u = new URL(mapsSearchUrl({ name: 'Hoan Kiem Lake', address: 'Hà Nội' }));
    expect(u.origin + u.pathname).toBe('https://www.google.com/maps/search/');
    expect(u.searchParams.get('api')).toBe('1');
    expect(u.searchParams.get('query')).toBe('Hoan Kiem Lake, Hà Nội');
  });
  it('prefers place id, then verified coordinates', () => {
    const u = new URL(mapsSearchUrl({ name: 'X', googlePlaceId: 'ChIJ123' }));
    expect(u.searchParams.get('query_place_id')).toBe('ChIJ123');
    const c = new URL(mapsSearchUrl({ name: 'X', coords: { lat: 21.02, lng: 105.85, verified: true } }));
    expect(c.searchParams.get('query')).toBe('21.02,105.85');
    const q = new URL(mapsSearchUrl({ name: 'Jade Lantern', mapsQuery: 'Jade Lantern Hotel, Hanoi' }));
    expect(q.searchParams.get('query')).toBe('Jade Lantern Hotel, Hanoi');
    const d = new URL(mapsDirectionsUrl({ name: 'X', address: 'Y' }, 'walking'));
    expect(d.searchParams.get('destination')).toBe('X, Y');
    expect(d.searchParams.get('travelmode')).toBe('walking');
  });
});

describe('itinerary data', () => {
  it('demo trip has no errors and one page per day', () => {
    expect(tripData.trip.dataStatus).toBe('imported');
    expect(validateTrip(tripData).filter((i) => i.level === 'error')).toEqual([]);
    expect(tripData.days.length).toBe(17); // 20–21/11 São Paulo + Doha (casal) + 14 days in Vietnam
    expect(tripData.days[0].date).toBe('2027-11-19');
    expect(tripData.trip.dayOneDate).toBe('2027-11-22');
    expect(tripData.days.at(-1)!.date).toBe('2027-12-05');
  });
  it('demo data keeps the shape of a real trip', () => {
    const m = buildModel(tripData);
    // Route order (doc "Rota")
    expect(m.route.map((r) => r.cityId)).toEqual(['hanoi', 'ninh-binh', 'ha-long', 'hoi-an', 'hue', 'ho-chi-minh']);
    // Nights (doc "Resumo de noites"; HCMC hotel not booked yet → 0 booked nights)
    expect(Object.fromEntries(m.route.map((r) => [r.cityId, r.nights]))).toEqual({ hanoi: 2, 'ninh-binh': 2, 'ha-long': 1, 'hoi-an': 3, hue: 1, 'ho-chi-minh': 4 });
    // Flights (sheet "Calendar" + doc)
    const f = (id: string) => m.flight(id)!;
    expect([f('gru-doh').departTime, f('gru-doh').arriveDate, f('gru-doh').arriveTime]).toEqual(['20:25', '2027-11-20', '16:00']);
    expect([f('doh-han').departTime, f('doh-han').arriveTime]).toEqual(['01:50', '12:20']);
    expect([f('hph-dad').departDate, f('hph-dad').departTime, f('hph-dad').arriveTime]).toEqual(['2027-11-27', '16:30', '17:45']);
    expect([f('sgn-doh').departTime, f('sgn-doh').arriveTime]).toEqual(['19:40', '23:40']);
    expect([f('doh-gru').departDate, f('doh-gru').departTime, f('doh-gru').arriveTime]).toEqual(['2027-12-06', '00:25', '09:30']);
    // International legs (fictional airline)
    expect(['gru-doh', 'doh-han', 'sgn-doh', 'doh-gru'].map((id) => f(id).flightNumber)).toEqual(['DF 210', 'DF 476', 'DF 471', 'DF 215']);
    expect([f('doh-han').arriveTerminal, f('sgn-doh').departTerminal]).toEqual(['2', '2']);
    // Demo data: fictional hotels never carry a real address or phone number
    expect(m.hotels.every((h) => !m.place(h.placeId)!.address && !m.place(h.placeId)!.phone)).toBe(true);
    expect([f('hph-dad').flightNumber, f('hph-dad').seats, f('hph-dad').perParty]).toEqual(['LA 725', '12A, 12B, 12C', undefined]);
    expect([f('hui-sgn').flightNumber, f('hui-sgn').departTime, f('hui-sgn').arriveTime, f('hui-sgn').status]).toEqual(['LA 1311', '17:50', '19:15', 'confirmed']);
    // Doha stopover is not part of the Vietnam route
    expect(m.route.some((r) => r.cityId === 'doha')).toBe(false);
    // Fictional hotels, one per stop
    expect(m.hotels.map((h) => h.placeId)).toEqual(['hotel-doha', 'hotel-hanoi', 'hotel-ninh-binh', 'cruise-ha-long', 'hotel-hoi-an', 'hotel-hue', 'hotel-saigon']);
    expect(m.hotels.every((h) => h.status === 'confirmed')).toBe(true);
    expect(m.bookings.filter((b) => b.status !== 'pending').map((b) => b.id).sort()).toEqual(['b-civp', 'b-food-tour', 'b-seguro', 'b-transfer-han-nb', 'b-visa']); // documents done; food tour optional; Hanoi → Ninh Binh transfer booked (15:00)
    // No passport-like number in the public data
    expect(JSON.stringify(tripData)).not.toMatch(/\b[A-Z]{2}\d{6,7}\b/);
    expect(m.hotel('h-ha-long')!.notes).toMatch(/Reserva fictícia/);
    expect(m.day('2027-11-26')!.activities.find((a) => a.id === 'd5-boarding')!.time).toBe('11:30');
  });
  it('day 6 schedule keeps transfer before the 16:30 flight', () => {
    const m = buildModel(tripData);
    const afternoon = m.schedule(m.day('2027-11-27')!).find((g) => g.period === 'afternoon')!.items.map((a) => a.id);
    // Hue → SGN day: transfer to airport before the 17:50 flight
    expect(m.schedule(m.day('2027-12-01')!).find((g) => g.period === 'afternoon')!.items.map((a) => a.id)).toEqual(['d10-lunch', 'd10-to-airport', 'd10-flight']);
    expect(afternoon).toEqual(['d6-transfer-hph', 'd6-flight']);
  });
  it('sample validates', () => {
    expect(validateTrip(sampleData).filter((i) => i.level === 'error')).toEqual([]);
  });
  it('validator catches broken references and time-zone impossible flights', () => {
    const bad = structuredClone(sampleData);
    bad.days[0].activities[0].placeId = 'nope';
    bad.flights.find((f) => f.id === 'hph-dad')!.departTime = '18:30'; // would land (17:45) before taking off
    const errs = validateTrip(bad).filter((i) => i.level === 'error').map((i) => i.message).join('\n');
    expect(errs).toMatch(/unknown placeId "nope"/);
    expect(errs).toMatch(/arrival is before departure/);
  });
  it('model derives route, schedule order and trip phase', () => {
    const m = buildModel(sampleData);
    expect(m.route.map((r) => [r.cityId, r.nights])).toEqual([['hanoi', 2], ['ninh-binh', 2], ['ha-long', 1], ['hoi-an', 3], ['hue', 1], ['ho-chi-minh', 4]]);
    const order = m.schedule(m.day('2027-11-22')!).flatMap((g) => g.items.map((a) => a.time)).filter(Boolean);
    expect(order).toEqual(['12:20']); // landing first, then the untimed afternoon
    expect(tripPhase(m, '2027-11-15')).toEqual({ kind: 'before', daysToGo: 4 });
    expect(tripPhase(m, '2027-11-24')).toEqual({ kind: 'during', date: '2027-11-24', dayNumber: 3 });
    expect(buildModel(tripData).routeProvisional).toBe(false);
  });
});

describe('private data encryption', () => {
  it('no booking code from private/private.json appears in the public code', () => {
    // private/ is git-ignored; on machines without it there is nothing to compare.
    if (!existsSync('private/private.json')) return;
    const priv = JSON.parse(readFileSync('private/private.json', 'utf8')) as Record<string, Record<string, unknown>>;
    const secrets = Object.values(priv).flatMap((e) => [e.bookingRef, e.expensesKey, e.docsKey, ...((e.ticketNumbers as string[]) ?? [])]).filter((v): v is string => typeof v === 'string' && v.length >= 5);
    const pub = [readFileSync('src/data/trip.ts', 'utf8'), readFileSync('src/data/private.enc.json', 'utf8')].join('\n');
    for (const code of secrets) for (const part of code.split(/[\s:]+/).filter((x) => x.length >= 5 && (/\d/.test(x) || /^[A-Z0-9]+$/.test(x)))) expect(pub.includes(part), part.slice(0, 2) + '…').toBe(false);
  });

  it('encrypt script output decrypts in the app, wrong passphrase fails', async () => {
    const out = 'src/data/private.enc.json';
    const original = readFileSync(out, 'utf8');
    const hadDir = existsSync('private');
    mkdirSync('private', { recursive: true });
    const hadFile = existsSync('private/private.json');
    const backup = hadFile ? readFileSync('private/private.json', 'utf8') : null;
    writeFileSync('private/private.json', JSON.stringify({ 'f-1': { bookingRef: 'ABC123' } }));
    try {
      execFileSync('node', ['scripts/encrypt-private.mjs'], { env: { ...process.env, TRIP_PASSPHRASE: 'correct horse battery' } });
      const env = JSON.parse(readFileSync(out, 'utf8'));
      expect(JSON.stringify(env)).not.toContain('ABC123');
      expect((await decryptPrivate(env, 'correct horse battery'))['f-1'].bookingRef).toBe('ABC123');
      await expect(decryptPrivate(env, 'wrong passphrase!')).rejects.toBeTruthy();
    } finally {
      writeFileSync(out, original);
      if (backup !== null) writeFileSync('private/private.json', backup);
      else rmSync('private/private.json');
      if (!hadDir) rmSync('private', { recursive: true, force: true });
    }
  }, 30000);
});

describe('changes made in the app', () => {
  it('marks a pending booking as booked, adds a new one, and merges by newest', async () => {
    const { applyLocal, mergeLocal, localPrivate } = await import('../src/lib/localStore');
    const store = {
      edits: { 'b-cu-chi': { status: 'confirmed' as const, time: '07:30', provider: 'Les Rives', bookingRef: 'CC-1', updatedAt: '2027-11-16T10:00:00Z' } },
      items: [{ id: 'local-x', kind: 'restaurant' as const, title: 'Jantar Madame Hien', date: '2027-11-23', time: '19:30', status: 'confirmed' as const, updatedAt: '2027-11-16T10:00:00Z' }],
    };
    const m = buildModel(applyLocal(tripData, store));
    expect(m.booking('b-cu-chi')).toMatchObject({ status: 'confirmed', time: '07:30', provider: 'Les Rives' });
    expect(m.day('2027-12-03')!.activities.find((a) => a.id === 'd12-cu-chi')!.status).toBe('confirmed');
    expect(m.day('2027-11-23')!.activities.some((a) => a.bookingId === 'local-x' && a.kind === 'meal')).toBe(true);
    expect(validateTrip(applyLocal(tripData, store)).filter((i) => i.level === 'error')).toEqual([]);
    expect(localPrivate(store)['b-cu-chi'].bookingRef).toBe('CC-1');
    expect(tripData.bookings.find((b) => b.id === 'b-cu-chi')!.status).toBe('pending'); // original untouched
    const newer = { edits: { 'b-cu-chi': { status: 'pending' as const, updatedAt: '2027-11-17T00:00:00Z' } }, items: [] };
    const older = { edits: { 'b-cu-chi': { status: 'pending' as const, updatedAt: '2027-10-31T00:00:00Z' } }, items: [] };
    expect(mergeLocal(store, newer).store.edits['b-cu-chi'].status).toBe('pending');
    expect(mergeLocal(store, older)).toMatchObject({ changed: 0 });
  });
  it('group code round-trips with the trip passphrase', async () => {
    const { encryptJSON, decryptJSON } = await import('../src/lib/crypto');
    const env = await encryptJSON({ edits: {}, items: [{ id: 'a' }] }, 'Senha-De-Teste-1', 1000);
    expect(JSON.stringify(env)).not.toContain('"a"');
    expect(await decryptJSON(env, 'Senha-De-Teste-1')).toEqual({ edits: {}, items: [{ id: 'a' }] });
    await expect(decryptJSON(env, 'outra-senha-xx')).rejects.toBeTruthy();
  });
});

describe('per-party view (same hotels, separate reservations)', () => {
  it('shows each party only its own missing confirmations', async () => {
    const { missingFor } = await import('../src/lib/viewer');
    const m = buildModel(tripData);
    const lr = m.hotel('h-hoi-an')!;
    expect(missingFor(lr, 'couple')).toEqual([]);
    expect(missingFor(lr, 'sam')).toEqual(['sua confirmação (código, PIN)']);
    expect(missingFor(lr, undefined)).toEqual(['confirmação de Sam']);
    expect(missingFor(m.flight('hui-sgn')!, 'sam')).toEqual([]); // one Lotus Air booking for all three
    expect(missingFor(m.flight('sgn-doh')!, 'couple')).toEqual([]);
    expect(missingFor(m.flight('sgn-doh')!, 'sam')).toEqual(['sua confirmação (código, PIN)']);
    expect(missingFor(m.hotel('h-ninh-binh')!, 'couple')).toEqual([]);
    expect(missingFor(m.hotel('h-ninh-binh')!, 'sam')).toEqual(['sua confirmação (código, PIN)']);
    // The to-do list keeps own codes apart: Sam's hotels are booked, codes optional.
    const { needsOwnCode } = await import('../src/lib/viewer');
    expect(missingFor(lr, 'sam', false)).toEqual([]);
    expect(needsOwnCode(lr, 'sam')).toBe(true);
    expect(needsOwnCode(lr, 'couple')).toBe(false);
  });
  it('a code typed by Sam in the app counts as his confirmation only', async () => {
    const { applyLocal } = await import('../src/lib/localStore');
    const { missingFor } = await import('../src/lib/viewer');
    const store = { edits: { 'h-hoi-an@sam': { bookingRef: '1234.567.890', updatedAt: '2027-11-16T00:00:00Z' } }, items: [] };
    const m = buildModel(applyLocal(tripData, store));
    expect(m.hotel('h-hoi-an')!.confirmations).toEqual(['couple', 'sam']);
    expect(missingFor(m.hotel('h-hoi-an')!, 'sam')).toEqual([]);
    expect(m.hotel('h-ninh-binh')!.confirmations).toEqual(['couple']);
  });
});

describe('what each party takes part in', () => {
  it('Sam starts in Doha → Hanoi and returns separately', async () => {
    const { forParty } = await import('../src/lib/viewer');
    const a = buildModel(forParty(tripData, 'sam'));
    expect(a.flights.map((f) => f.id)).toEqual(['doh-han', 'hph-dad', 'hui-sgn']);
    expect(a.hotels.some((h) => h.id === 'h-doha')).toBe(false);
    expect(a.places.some((p) => p.id === 'hotel-doha')).toBe(false);
    const d14 = a.day('2027-12-05')!.activities.map((x) => x.id);
    expect(d14).toContain('d14-sam-exit');
    expect(d14).not.toContain('d14-flight');
    expect(d14).not.toContain('d14-to-airport');
    expect(a.booking('b-sam-exit')!.status).toBe('pending');
    expect(validateTrip(forParty(tripData, 'sam')).filter((i) => i.level === 'error')).toEqual([]);
    // Sam doesn't read the couple's personal notes (Ana's visa, CIVP, insurance)
    for (const id of ['b-visa', 'b-civp', 'b-seguro']) expect(a.booking(id)!.notes).toBeUndefined();
    for (const h of a.hotels) expect(h.notes ?? '').toMatch(/^Você tem reserva própria/);
    expect(JSON.stringify([...a.hotels, ...a.bookings].map((x) => x.notes))).not.toMatch(/Ana:/);

    const c = buildModel(forParty(tripData, 'couple'));
    expect(c.booking('b-visa')!.notes).toMatch(/^Ana:/);
    expect(c.flights.map((f) => f.id)).toEqual(['gru-doh', 'doh-han', 'hph-dad', 'hui-sgn', 'sgn-doh', 'doh-gru']);
    expect(c.booking('b-sam-exit')).toBeUndefined();
    expect(c.day('2027-12-05')!.activities.map((x) => x.id)).not.toContain('d14-sam-exit');
    expect(validateTrip(forParty(tripData, 'couple')).filter((i) => i.level === 'error')).toEqual([]);
  });
});

describe('stopover, rain plans and extra ideas', () => {
  it('Doha days are only for the couple and are not numbered', async () => {
    const { forParty } = await import('../src/lib/viewer');
    const { dayNumber, numberedDays, tripPhase } = await import('../src/data/model');
    const c = buildModel(forParty(tripData, 'couple'));
    const a = buildModel(forParty(tripData, 'sam'));
    expect(c.days[0].date).toBe('2027-11-19');
    expect(a.days[0].date).toBe('2027-11-22');
    expect(a.trip.startDate).toBe('2027-11-22');
    expect([dayNumber(c, '2027-11-21'), dayNumber(c, '2027-11-22'), dayNumber(a, '2027-11-22')]).toEqual([undefined, 1, 1]);
    expect([numberedDays(c), numberedDays(a)]).toEqual([14, 14]);
    expect(tripPhase(c, '2027-11-15')).toEqual({ kind: 'before', daysToGo: 4 });
    expect(tripPhase(a, '2027-11-15')).toEqual({ kind: 'before', daysToGo: 7 });
    expect(c.route.map((r) => r.cityId)).not.toContain('doha'); // the Vietnam map stays Vietnam
  });
  it('every day in Vietnam has a rain plan; central days are high risk', () => {
    const vn = tripData.days.filter((d) => d.date >= '2027-11-22');
    expect(vn.every((d) => d.weather && d.weather.rainPlan.length > 0)).toBe(true);
    expect(vn.filter((d) => d.weather!.risk === 'high').map((d) => d.date)).toEqual(['2027-11-27', '2027-11-28', '2027-11-29', '2027-11-30', '2027-12-01']);
  });
  it('extra ideas are suggestions with a described place', () => {
    const m = buildModel(tripData);
    const extras = m.days.flatMap((d) => d.activities).filter((a) => a.extra);
    expect(extras.length).toBeGreaterThanOrEqual(15);
    expect(extras.every((a) => a.status === 'suggestion' && (a.description || m.place(a.placeId)?.description))).toBe(true);
  });
});

describe('itinerary audit regressions', () => {
  it('every extra idea sits on the day its id says', () => {
    const m = buildModel(tripData);
    const want: Record<string, string> = { x23: '2027-11-22', x24: '2027-11-23', x26: '2027-11-25', x29: '2027-11-28', x30: '2027-11-29', x01: '2027-11-30', x03: '2027-12-02', x04: '2027-12-03', x06: '2027-12-05' };
    for (const d of m.days) for (const a of d.activities) if (a.extra && want[a.id.slice(0, 3)]) expect([a.id, d.date]).toEqual([a.id, want[a.id.slice(0, 3)]]);
  });
  it('validation rejects an activity filed under a day in another city', () => {
    const bad = structuredClone(tripData);
    const x = bad.days.find((d) => d.date === '2027-11-29')!.activities.find((a) => a.id === 'x30-basket-boat')!;
    bad.days.find((d) => d.date === '2027-11-22')!.activities.push(x);
    expect(validateTrip(bad).some((i) => i.level === 'error' && /cam-thanh.*hanoi/.test(i.message))).toBe(true);
  });
  it('days follow a workable order', () => {
    const m = buildModel(tripData);
    const order = (d: string) => m.schedule(m.day(d)!).flatMap((g) => g.items.map((a) => a.id));
    const d24 = order('2027-11-23');
    expect(d24[0]).toBe('d2-hcm-area'); // mausoleum opens mornings only
    expect(d24.indexOf('x24-hoa-lo')).toBeGreaterThan(d24.indexOf('d2-literature'));
    const d01 = order('2027-11-30');
    expect(d01.indexOf('d9-checkin')).toBeGreaterThan(d01.indexOf('d9-khai-dinh'));
    expect(d01.indexOf('d9-checkin')).toBeGreaterThan(d01.indexOf('x01-tu-duc'));
    const d03 = order('2027-12-02');
    expect(d03.indexOf('d11-independence')).toBeLessThan(d03.indexOf('d11-war-remnants'));
    expect(m.day('2027-11-26')!.activities.find((a) => a.id === 'd5-transfer')!.time).toBe('07:30');
  });
});

describe('code review regressions', () => {
  it('"today" follows the city the trip is in (São Paulo, Doha, Vietnam)', async () => {
    const { tripToday } = await import('../src/data/model');
    const { forParty } = await import('../src/lib/viewer');
    const c = buildModel(forParty(tripData, 'couple'));
    const a = buildModel(forParty(tripData, 'sam'));
    const at = (iso: string) => new Date(iso);
    expect(tripToday(c, at('2027-11-19T20:00:00Z'))).toBe('2027-11-19'); // 17:00 in São Paulo, before the flight
    expect(tripToday(c, at('2027-11-21T20:00:00Z'))).toBe('2027-11-21'); // 23:00 in Doha, leaving for the airport
    expect(tripToday(c, at('2027-11-22T05:30:00Z'))).toBe('2027-11-22'); // 12:30 landing in Hanoi
    expect(tripToday(c, at('2027-12-05T16:59:00Z'))).toBe('2027-12-05'); // 23:59 in Saigon
    expect(tripToday(c, at('2027-11-17T12:00:00Z'))).toBe('2027-11-17'); // before the trip
    expect(tripToday(a, at('2027-11-21T20:00:00Z'))).toBe('2027-11-22'); // Sam: Vietnam time
  });
  it('a rescheduled flight moves on the day timeline', async () => {
    const { applyLocal } = await import('../src/lib/localStore');
    const m = buildModel(applyLocal(tripData, { edits: { 'hph-dad': { time: '17:05', updatedAt: '2027-11-19T00:00:00Z' } }, items: [] }));
    expect(m.flight('hph-dad')!.departTime).toBe('17:05');
    expect(m.day('2027-11-27')!.activities.find((x) => x.id === 'd6-flight')!.time).toBe('17:05');
  });
  it('malformed local changes are dropped, never crash', async () => {
    const { sanitize, applyLocal, mergeLocal } = await import('../src/lib/localStore');
    const junk = { edits: { a: null, b: 'x', c: { updatedAt: '2027-11-19' } }, items: [{ id: 'no-date', title: 't', kind: 'tour', status: 'confirmed', updatedAt: 'x' }, null, 7] };
    const s = sanitize(junk);
    expect(Object.keys(s.edits)).toEqual(['c']);
    expect(s.items).toEqual([]);
    expect(() => buildModel(applyLocal(tripData, s))).not.toThrow();
    expect(mergeLocal({ edits: {}, items: [] }, junk as never).store.items).toEqual([]);
    expect(sanitize(null)).toEqual({ edits: {}, items: [] });
  });
});

describe('maps share links', () => {
  it('uses a Google Maps share link as-is, and ignores anything else', () => {
    expect(mapsSearchUrl({ name: 'X', mapsUrl: 'https://maps.app.goo.gl/G3mxN9ktd5tqwRTR6' })).toBe('https://maps.app.goo.gl/G3mxN9ktd5tqwRTR6');
    expect(mapsSearchUrl({ name: 'X', mapsUrl: 'https://evil.example/maps/' })).toMatch(/^https:\/\/www\.google\.com\/maps\/search\//);
    expect(mapsDirectionsUrl({ name: 'X', mapsQuery: 'Train street most scenic part, Hanoi', mapsUrl: 'https://maps.app.goo.gl/x' }, 'walking')).toContain('destination=Train+street+most+scenic+part');
  });
});

describe('dong converter input', () => {
  it('reads amounts the way people type them', async () => {
    const { parseDong } = await import('../src/expenses/logic');
    expect(parseDong('50000')).toBe(50000);
    expect(parseDong('50.000')).toBe(50000);
    expect(parseDong('1.250.000')).toBe(1250000);
    expect(parseDong('50k')).toBe(50000);
    expect(parseDong('50 K')).toBe(50000);
    expect(parseDong('1,5tr')).toBe(1500000);
    expect(parseDong('1.5m')).toBe(1500000);
    expect(parseDong('120.000 ₫')).toBe(120000);
    for (const bad of ['', 'abc', '-5', '1e3', '5k5']) expect(parseDong(bad), bad).toBeNaN();
  });
});
