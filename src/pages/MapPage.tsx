import { useMemo, useState } from 'react';
import { ArrowLeft, Bed, Building2, Coffee, Landmark, MapPin, Plane, ShoppingBag, Ship, TrainFront, Utensils, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { model } from '../data';
import { dayLabel } from '../data/model';
import type { Place, PlaceKind } from '../data/types';
import { fmtDayMonthShort, fmtWeekdayShort } from '../lib/time';
import { VietnamMap } from '../components/VietnamMap';
import { EmptyState, MapsButton, Segmented } from '../components/ui';

const KIND: Record<PlaceKind, { label: string; Icon: typeof MapPin; color: string }> = {
  attraction: { label: 'Atração', Icon: Landmark, color: '#9e2f26' },
  restaurant: { label: 'Restaurante', Icon: Utensils, color: '#b9852f' },
  cafe: { label: 'Café', Icon: Coffee, color: '#b9852f' },
  hotel: { label: 'Hotel', Icon: Bed, color: '#2e5e4e' },
  airport: { label: 'Aeroporto', Icon: Plane, color: '#574e43' },
  station: { label: 'Estação', Icon: TrainFront, color: '#574e43' },
  pier: { label: 'Píer', Icon: Ship, color: '#3d6f86' },
  market: { label: 'Mercado', Icon: ShoppingBag, color: '#b9852f' },
  shopping: { label: 'Compras', Icon: ShoppingBag, color: '#b9852f' },
  'meeting-point': { label: 'Ponto de encontro', Icon: MapPin, color: '#574e43' },
  other: { label: 'Lugar', Icon: Building2, color: '#574e43' },
};

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('view') as 'route' | 'places') ?? 'route';
  const setTab = (v: string) => setParams((p) => { p.set('view', v); return p; }, { replace: true });

  return (
    <div className="pt-safe pb-8">
      <header className="px-5 pb-4 pt-4">
        <Link to="/" className="tap -ml-1 mb-2 inline-flex items-center gap-1 py-1 text-[13px] font-medium text-ink-2"><ArrowLeft size={15} aria-hidden /> Visão geral</Link>
        <div className="eyebrow mb-1">Mapa da viagem</div>
        <h1 className="text-[32px] font-normal leading-tight">Por onde vamos</h1>
        <div className="mt-4">
          <Segmented value={tab} onChange={setTab} options={[{ value: 'route', label: 'Percurso' }, { value: 'places', label: 'Lugares' }]} />
        </div>
      </header>
      {tab === 'route' ? <RouteView /> : <PlacesView />}
    </div>
  );
}

/* ---------------------------------------------------------------- route */

function RouteView() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | undefined>();
  const city = model.city(selected);
  const dates = selected ? model.datesForCity(selected) : [];
  const stopIndex = model.route.findIndex((s) => s.cityId === selected);

  return (
    <div className="px-4">
      <div className="card relative overflow-hidden">
        <div className="mx-auto aspect-[400/760] max-h-[78vh]">
          <VietnamMap model={model} selected={selected} onSelect={(id) => setSelected(id === selected ? undefined : id)} />
        </div>
        {model.routeProvisional && (
          <div className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] text-ink-2 shadow-sm backdrop-blur">
            Ordem provisória · datas a importar
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-[11px] text-ink-3 shadow-sm backdrop-blur">Toque numa cidade</div>
      </div>

      {city && (
        <div className="card rise mt-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Parada {stopIndex + 1}{city.region && ` · ${city.region}`}</div>
              <div className="font-display text-[24px] leading-tight">{city.name}</div>
              {city.localName && <div className="text-[13px] italic text-ink-3">{city.localName}</div>}
            </div>
            <button onClick={() => setSelected(undefined)} className="tap -m-1 p-1 text-ink-3" aria-label="Fechar"><X size={18} /></button>
          </div>
          {city.tagline && <p className="mt-2 text-[14px] text-ink-2">{city.tagline}</p>}
          {dates.length > 0 ? (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              {dates.map((d) => (
                <Link key={d} to={`/day/${d}`} className="tap shrink-0 rounded-xl bg-paper px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-ink-3">{dayLabel(model, d, 'Stopover')}</div>
                  <div className="text-[13px] font-medium">{fmtWeekdayShort(d)}, {fmtDayMonthShort(d)}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-ink-3">Datas serão definidas com o roteiro.</div>
          )}
          <div className="mt-3 flex gap-2">
            <MapsButton place={{ name: city.name + ', Vietnam' }} />
            <button onClick={() => navigate(`/map?view=places&city=${city.id}`)} className="tap rounded-full px-3.5 py-2 text-[13px] font-medium text-lacquer">Lugares</button>
          </div>
        </div>
      )}

      {/* Legs */}
      <ol className="mt-6 space-y-1">
        {model.route.map((s, i) => {
          const c = model.city(s.cityId)!;
          return (
            <li key={c.id + i} className="flex items-center gap-3 rounded-2xl px-2 py-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lacquer text-[12px] font-semibold text-white">{i + 1}</span>
              <button className="min-w-0 flex-1 text-left" onClick={() => setSelected(c.id)}>
                <div className="font-display text-[17px] leading-tight">{c.name}</div>
                <div className="text-[12px] text-ink-3">
                  {s.from ? `${fmtDayMonthShort(s.from)}${s.to !== s.from ? ` – ${fmtDayMonthShort(s.to!)}` : ''}${s.nights ? ` · ${s.nights} noite${s.nights > 1 ? 's' : ''}` : ''}` : 'Datas a definir'}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------------- places */

function PlacesView() {
  const [params, setParams] = useSearchParams();
  const cityFilter = params.get('city') ?? 'all';
  const dayFilter = params.get('day') ?? 'all';
  const typeFilter = (params.get('type') ?? 'all') as 'all' | 'sights' | 'food';
  const isFood = (p: Place) => p.kind === 'restaurant' || p.kind === 'cafe';
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const set = (k: string, v: string) => setParams((p) => { v === 'all' ? p.delete(k) : p.set(k, v); return p; }, { replace: true });

  const places = useMemo(
    () =>
      model.places.filter(
        (p) =>
          (cityFilter === 'all' || p.cityId === cityFilter) &&
          (dayFilter === 'all' || model.datesForPlace(p.id).includes(dayFilter)) &&
          (typeFilter === 'all' || (typeFilter === 'food') === isFood(p)),
      ),
    [cityFilter, dayFilter, typeFilter], // eslint-disable-line
  );
  const selected = places.find((p) => p.id === selectedId);
  const daysWithPlaces = model.days.filter((d) => cityFilter === 'all' || d.cityIds.includes(cityFilter));

  if (!model.places.length) {
    return <EmptyState icon={MapPin} title="Lugares a importar">Atrações, hotéis e restaurantes do roteiro aparecerão aqui, com filtros por cidade e por dia.</EmptyState>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-2">
        {[{ id: 'all', name: 'Todas' }, ...model.cities.filter((c) => model.places.some((p) => p.cityId === c.id))].map((c) => (
          <button key={c.id} onClick={() => { set('city', c.id); set('day', 'all'); setSelectedId(undefined); }}
            className={`tap shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${cityFilter === c.id ? 'bg-ink text-paper' : 'bg-card text-ink-2 shadow-sm'}`}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="px-5 pb-2">
        <Segmented value={typeFilter} onChange={(v) => { set('type', v); setSelectedId(undefined); }} options={[{ value: 'all', label: 'Tudo' }, { value: 'sights', label: 'Passeios e hotéis' }, { value: 'food', label: 'Onde comer' }]} />
      </div>
      <div className="px-5 pb-3">
        <label className="flex items-center gap-2 text-[13px] text-ink-3">
          Dia
          <select value={dayFilter} onChange={(e) => { set('day', e.target.value); setSelectedId(undefined); }}
            className="flex-1 rounded-full border border-line bg-card px-3 py-1.5 text-[13px] text-ink">
            <option value="all">Todos os dias</option>
            {daysWithPlaces.map((d) => <option key={d.date} value={d.date}>{dayLabel(model, d.date, 'Stopover')} · {fmtWeekdayShort(d.date)}, {fmtDayMonthShort(d.date)}</option>)}
          </select>
        </label>
      </div>

      <div className="px-4"><PlacesPlot places={places} selected={selectedId} onSelect={setSelectedId} /></div>

      {selected && <PlaceDetail place={selected} onClose={() => setSelectedId(undefined)} />}

      <ul className="mt-4 space-y-2 px-4">
        {places.map((p) => {
          const k = KIND[p.kind];
          return (
            <li key={p.id}>
              <button onClick={() => setSelectedId(p.id)} className={`tap flex w-full items-center gap-3 rounded-2xl p-3 text-left ${selectedId === p.id ? 'bg-card shadow-[var(--shadow-card)]' : ''}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" style={{ background: k.color }}><k.Icon size={16} aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-[12px] text-ink-3">{k.label} · {model.city(p.cityId)?.name}</span>
                </span>
              </button>
            </li>
          );
        })}
        {!places.length && <li className="py-6 text-center text-[13px] text-ink-3">Nenhum lugar com esses filtros.</li>}
      </ul>
    </div>
  );
}

function PlaceDetail({ place: p, onClose }: { place: Place; onClose: () => void }) {
  const k = KIND[p.kind];
  const dates = model.datesForPlace(p.id);
  return (
    <div className="card rise mx-4 mt-3 overflow-hidden">
      {p.photo && <img src={p.photo.src} alt={p.photo.alt} className="h-40 w-full object-cover" />}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow" style={{ color: k.color }}>{k.label} · {model.city(p.cityId)?.name}</div>
            <div className="font-display text-[21px] leading-tight">{p.name}</div>
            {p.localName && <div className="text-[13px] italic text-ink-3">{p.localName}</div>}
          </div>
          <button onClick={onClose} className="tap -m-1 p-1 text-ink-3" aria-label="Fechar"><X size={18} /></button>
        </div>
        {p.description && <p className="mt-2 text-[14px] text-ink-2">{p.description}</p>}
        {p.address && <div className="mt-2 flex gap-1.5 text-[13px] text-ink-3"><MapPin size={13} className="mt-[3px] shrink-0" aria-hidden />{p.address}</div>}
        {p.notes && <p className="mt-2 text-[13px] text-ink-2">{p.notes}</p>}
        {dates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dates.map((d) => <Link key={d} to={`/day/${d}`} className="tap rounded-full bg-paper px-2.5 py-1 text-[12px] font-medium">{dayLabel(model, d, 'Stopover')} · {fmtDayMonthShort(d)}</Link>)}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <MapsButton place={p} variant="solid" label="Abrir no Google Maps" />
          <MapsButton place={p} label="Como chegar" variant="ghost" directions />
        </div>
      </div>
    </div>
  );
}

/** Schematic, offline plot of places by their coordinates (no map tiles). */
function PlacesPlot({ places, selected, onSelect }: { places: Place[]; selected?: string; onSelect: (id: string) => void }) {
  const pts = places.filter((p) => p.coords);
  if (pts.length < 1) return null;
  const W = 360, H = 240, P = 28;
  const lats = pts.map((p) => p.coords!.lat), lngs = pts.map((p) => p.coords!.lng);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);
  const minX = Math.min(...lngs) * kx, maxX = Math.max(...lngs) * kx;
  const minY = Math.min(...lats), maxY = Math.max(...lats);
  const span = Math.max(maxX - minX, (maxY - minY) * ((W - 2 * P) / (H - 2 * P)), 0.004);
  const s = (W - 2 * P) / span;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const xy = (p: Place): [number, number] => [W / 2 + (p.coords!.lng * kx - cx) * s, H / 2 - (p.coords!.lat - cy) * s];
  const multiCity = new Set(pts.map((p) => p.cityId)).size > 1;

  return (
    <div className="card overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Posição relativa dos lugares">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ece4d5" strokeWidth="1" /></pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        {pts.map((p) => {
          const [x, y] = xy(p);
          const k = KIND[p.kind];
          const on = p.id === selected;
          return (
            <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="18" fill="transparent" />
              {on && <circle cx={x} cy={y} r="14" fill={k.color} opacity=".18" />}
              <circle cx={x} cy={y} r={on ? 8 : 6} fill={k.color} stroke="#fffcf7" strokeWidth="2" />
              {(on || pts.length <= 6) && (
                <text x={x} y={y - 12} textAnchor="middle" fontSize="10.5" fontWeight={on ? 600 : 400} fill="#1f1b16" paintOrder="stroke" stroke="#fffcf7" strokeWidth="3">{p.name.length > 26 ? p.name.slice(0, 25) + '…' : p.name}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="border-t border-line px-3 py-1.5 text-[10.5px] text-ink-3">
        Posições aproximadas{multiCity ? ' · várias cidades (escala comprimida)' : ''} · use o Google Maps para navegar
      </div>
    </div>
  );
}
