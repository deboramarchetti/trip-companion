import { useMemo } from 'react';
import { MAP_HEIGHT, MAP_WIDTH, NEIGHBOUR_PATHS, VIETNAM_PATH } from '../map/vietnamGeo';
import { project } from '../map/project';
import type { TripModel } from '../data';
import type { RouteStop } from '../data/model';
import { fmtDayMonthShort } from '../lib/time';

const LABELS: { text: string; lat: number; lng: number; sea?: boolean }[] = [
  { text: 'China', lat: 23.05, lng: 107.9 },
  { text: 'Laos', lat: 19.2, lng: 103.15 },
  { text: 'Camboja', lat: 12.7, lng: 104.6 },
  { text: 'Tailândia', lat: 15.3, lng: 102.35 },
  { text: 'Golfo de Tonkin', lat: 19.75, lng: 107.55, sea: true },
  { text: 'Mar do Leste', lat: 17.7, lng: 108.4, sea: true },
];

/** Offline, interactive SVG map of the route through Vietnam. */
export function VietnamMap({ model, selected, onSelect, crop, showDates = true }: {
  model: TripModel;
  selected?: string;
  onSelect?: (cityId: string) => void;
  /** Crop to the northern/central part where the route is, for compact use. */
  crop?: boolean;
  showDates?: boolean;
}) {
  const stops = useMemo(
    () =>
      model.route
        .map((s, i) => {
          const c = model.city(s.cityId);
          return c ? { stop: s, city: c, n: i + 1, xy: project(c.coords.lat, c.coords.lng) } : null;
        })
        .filter(Boolean) as { stop: RouteStop; city: NonNullable<ReturnType<TripModel['city']>>; n: number; xy: [number, number] }[],
    [model],
  );

  const legs = stops.slice(1).map((s, i) => {
    const [x1, y1] = stops[i].xy;
    const [x2, y2] = s.xy;
    // Gentle arc: control point offset perpendicular to the segment, towards the sea.
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(60, len * 0.22);
    const cx = mx + (-dy / len) * bend * (dy > 0 ? -1 : 1);
    const cy = my + (dx / len) * bend * (dy > 0 ? -1 : 1);
    return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
  });

  const vb = crop ? `40 20 ${MAP_WIDTH - 40} ${MAP_HEIGHT - 20}` : `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;

  return (
    <svg viewBox={vb} className="h-full w-full" role="img" aria-label="Mapa do Vietnã com o percurso da viagem">
      <defs>
        <pattern id="sea" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 Q2 2 4 4 T8 4" fill="none" stroke="#c9d7d2" strokeWidth=".6" />
        </pattern>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1f1b16" floodOpacity=".12" />
        </filter>
      </defs>
      <rect x="-50" y="-50" width={MAP_WIDTH + 100} height={MAP_HEIGHT + 100} fill="#e6eeea" />
      <rect x="-50" y="-50" width={MAP_WIDTH + 100} height={MAP_HEIGHT + 100} fill="url(#sea)" opacity=".7" />
      {NEIGHBOUR_PATHS.map((n) => (
        <path key={n.name} d={n.d} fill="#efe8db" stroke="#d8cdb9" strokeWidth=".8" />
      ))}
      <path d={VIETNAM_PATH} fill="#fffcf7" stroke="#b9ab94" strokeWidth="1" filter="url(#soft)" />
      {LABELS.map((l) => {
        const [x, y] = project(l.lat, l.lng);
        return (
          <text key={l.text} x={x} y={y} textAnchor="middle" fontSize={l.sea ? 10 : 11} fontStyle={l.sea ? 'italic' : undefined}
            fill={l.sea ? '#7d9a90' : '#a3967f'} letterSpacing={l.sea ? 0.5 : 2.2} fontFamily="var(--font-display)">
            {l.sea ? l.text : l.text.toUpperCase()}
          </text>
        );
      })}

      {legs.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#9e2f26" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={model.routeProvisional ? '1 6' : '6 5'} opacity={model.routeProvisional ? 0.55 : 0.85} />
      ))}

      {stops.map(({ city, stop, n, xy: [x, y] }) => {
        const active = selected === city.id;
        const left = city.mapLabel === 'left';
        const dates = showDates && stop.from ? (stop.from === stop.to ? fmtDayMonthShort(stop.from) : `${fmtDayMonthShort(stop.from)} – ${fmtDayMonthShort(stop.to!)}`) : undefined;
        return (
          <g key={city.id + n} onClick={() => onSelect?.(city.id)} style={{ cursor: onSelect ? 'pointer' : undefined }} role={onSelect ? 'button' : undefined} aria-label={city.name}>
            <circle cx={x} cy={y} r="22" fill="transparent" />
            {active && <circle cx={x} cy={y} r="16" fill="#9e2f26" opacity=".15" />}
            <circle cx={x} cy={y} r="9.5" fill={active ? '#9e2f26' : '#fffcf7'} stroke="#9e2f26" strokeWidth="2" />
            <text x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="600" fill={active ? '#fff' : '#9e2f26'} fontFamily="var(--font-sans)">{n}</text>
            <text x={x + (left ? -15 : 15)} y={y + (dates ? -1 : 4)} textAnchor={left ? 'end' : 'start'} fontSize="14" fontWeight="500" fill="#1f1b16" fontFamily="var(--font-display)"
              paintOrder="stroke" stroke="#fffcf7" strokeWidth="3.5" strokeLinejoin="round">{city.name}</text>
            {dates && (
              <text x={x + (left ? -15 : 15)} y={y + 12} textAnchor={left ? 'end' : 'start'} fontSize="10" fill="#8a8072" fontFamily="var(--font-sans)"
                paintOrder="stroke" stroke="#fffcf7" strokeWidth="3" strokeLinejoin="round">{dates}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
