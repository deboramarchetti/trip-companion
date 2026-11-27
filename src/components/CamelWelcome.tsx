import { useEffect, useState } from 'react';
import '@fontsource/press-start-2p/latin-400.css';
import { VIEWER, partyMembers } from '../lib/viewer';
import { tripData } from '../data/trip';

/** Pure silliness: a dancing pixel camel on arrival day in Doha (until midnight, Doha time). */
// Shown on the first day in Doha (the stopover), to the groups that take part in it.
const dohaDay = tripData.days.find((d) => d.cityIds.includes('doha'));
const arrivalDay = () => !!dohaDay && new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Qatar' }).format(new Date()) === dohaDay.date;
const inStopover = () => !dohaDay?.parties || (!!VIEWER && dohaDay.parties.includes(VIEWER));
/** Pixel font has no accents: "José" → "JOSE". */
const players = () => partyMembers().map((id) => (tripData.trip.travelers?.find((t) => t.id === id)?.name ?? id).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase());
const forced = () => { try { return new URLSearchParams(location.search).has('camelo'); } catch { return false; } };

// 22×16 pixel camel (one hump, sunglasses). B body · S shade · K glasses · D hooves/tail · R fez
const TOP = [
  '..................RR..',
  '.................BBBB.',
  '................KKKKBB',
  '.................BBBBB',
  '................BB....',
  '......BBB.......BB....',
  '.....BSBBB......BB....',
  '....BSSBBBB....BB.....',
  '...BBBBBBBBBBBBBB.....',
  '..BBBBBBBBBBBBBBB.....',
  '.DBBBBBBBBBBBBBB......',
  '.D.SSSSSSSSSSSSS......',
];
const LEGS = [
  ['...SS..SS...SS..SS....', '...SS..SS...SS..SS....', '...SS...SS.SS...SS....', '...DD...DD.DD...DD....'],
  ['...SS..SS...SS..SS....', '....SS.SS...SS.SS.....', '....SS..SS.SS..SS.....', '....DD..DD.DD..DD.....'],
];
const COLOR: Record<string, string> = { B: '#d9a35b', S: '#b07a35', K: '#1b1b1b', D: '#5a3612', R: '#c8102e' };

function Frame({ legs, className }: { legs: string[]; className: string }) {
  const rows = [...TOP, ...legs];
  return (
    <svg viewBox="0 0 22 16" className={className} shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) => [...row].map((c, x) => (COLOR[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLOR[c]} /> : null)))}
    </svg>
  );
}

export function CamelWelcome() {
  // Never in automated tests (unless ?camelo); never blocks the app: closes by itself after 10 s.
  const [show, setShow] = useState(() => forced() || (!navigator.webdriver && inStopover() && arrivalDay()));
  useEffect(() => { if (!show) return; const t = setTimeout(() => setShow(false), 10_000); return () => clearTimeout(t); }, [show]);
  if (!show) return null;
  return (
    <div className="camel-stage fixed inset-0 z-[80] cursor-pointer overflow-hidden bg-[#8a1538]" onClick={() => setShow(false)} onTouchEnd={() => setShow(false)} role="dialog" aria-label="Welcome to Qatar">
      <button type="button" onClick={() => setShow(false)} className="camel-pixel absolute right-3 top-[calc(12px+env(safe-area-inset-top))] z-10 rounded-md bg-black/40 px-3 py-2 text-[14px] text-white" aria-label="Fechar">✕</button>
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className="camel-star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, animationDelay: `${(i % 5) * 0.2}s` }} />
      ))}
      <div className="absolute inset-x-0 top-[18%] px-4 text-center text-white">
        <div className="camel-title text-[26px] leading-[1.5]">WELCOME<br />TO QATAR!</div>
        <div className="camel-pixel mt-5 text-[10px] leading-[1.8] text-[#ffd166]">{players().map((n, i) => <div key={n}>PLAYER {i + 1}: {n}</div>)}</div>
      </div>
      <div className="camel-dunes" />
      <div className="camel-walk">
        <div className="camel-dance">
          <Frame legs={LEGS[0]} className="camel-frame camel-a" />
          <Frame legs={LEGS[1]} className="camel-frame camel-b" />
        </div>
      </div>
      <div className="camel-pixel camel-blink absolute inset-x-0 bottom-[calc(28px+env(safe-area-inset-bottom))] text-center text-[10px] text-white">TOQUE PARA CONTINUAR</div>
    </div>
  );
}
