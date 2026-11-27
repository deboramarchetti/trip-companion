import { useEffect, useState } from 'react';
import '@fontsource/press-start-2p/latin-400.css';
import { tripData } from '../data/trip';

/** Pure silliness: an overloaded 8-bit scooter on arrival day in Vietnam (23/11, Vietnam time), for everyone. */
// Shown on "day 1" in Vietnam (trip.dayOneDate), Vietnam time.
const arrivalDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()) === (tripData.trip.dayOneDate ?? tripData.trip.startDate);
const forced = () => { try { return new URLSearchParams(location.search).has('vietnam'); } catch { return false; } };

// 28×20 pixels: duck on a crate on a tower of boxes, rider in a nón lá, red scooter.
const TOP = [
  '...YY.......................',
  '..YYYO......................',
  '..YYYY......................',
  '.GGGGGGG....................',
  '.GgGgGgG....................',
  '.GGGGGGG.......HH...........',
  '.BBBBBBBB.....HHHH..........',
  '.BbBBBBbB....HHHHHH.........',
  '.BBBBBBBB...hhhhhhhh........',
  '.BBBBBBBB.....FFFF..........',
  '.BbBBBBbB.....SSSSS.........',
  '.BBBBBBBB.....SSSSSSSS......',
  '..rrrrrrrrrrrPPPPP...RR.....',
  '...RRRRRRRRRRRRRRRRRRRRR....',
  '...RRRRRRRRRRRRRRRRRRRRRRL..',
  '....RRRRRR......RRRRRRRR....',
];
const WHEELS = [
  ['...KKKK..........KKKK.......', '..KKWWKK........KKWWKK......', '..KKWWKK........KKWWKK......', '...KKKK..........KKKK.......'],
  ['...KKKK..........KKKK.......', 'x.KWKKWK........KWKKWK......', 'xxKWKKWK........KWKKWK......', '...KKKK..........KKKK.......'],
];
const COLOR: Record<string, string> = {
  Y: '#ffd23f', O: '#f28c28', G: '#43a047', g: '#2e7d32', B: '#9c7448', b: '#d9b57a', H: '#f0d48a', h: '#b8904a',
  F: '#f1c27d', S: '#1e88e5', P: '#37474f', R: '#e53935', r: '#8e1b1b', L: '#fff59d', K: '#1b1b1b', W: '#bdbdbd', x: '#cfd8dc',
};

function Frame({ wheels, className }: { wheels: string[]; className: string }) {
  const rows = [...TOP, ...wheels];
  return (
    <svg viewBox="0 0 28 20" className={className} shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) => [...row].map((c, x) => (COLOR[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLOR[c]} /> : null)))}
    </svg>
  );
}

const STAR = '50,4 61,38 97,38 68,59 79,94 50,73 21,94 32,59 3,38 39,38';

export function VietnamWelcome() {
  // Never in automated tests (unless ?vietnam); never blocks the app: closes by itself after 10 s.
  const [show, setShow] = useState(() => forced() || (!navigator.webdriver && arrivalDay()));
  useEffect(() => { if (!show) return; const t = setTimeout(() => setShow(false), 10_000); return () => clearTimeout(t); }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[80] cursor-pointer overflow-hidden bg-[#da251d]" onClick={() => setShow(false)} onTouchEnd={() => setShow(false)} role="dialog" aria-label="Welcome to Vietnam">
      <button type="button" onClick={() => setShow(false)} className="camel-pixel absolute right-3 top-[calc(12px+env(safe-area-inset-top))] z-10 rounded-md bg-black/30 px-3 py-2 text-[14px] text-white" aria-label="Fechar">✕</button>
      <svg viewBox="0 0 100 100" className="vn-star absolute left-1/2 top-[9%] h-16 w-16 -translate-x-1/2" aria-hidden><polygon points={STAR} fill="#ffcd00" /></svg>
      <div className="absolute inset-x-0 top-[22%] px-4 text-center text-white">
        <div className="camel-title text-[24px] leading-[1.6]">WELCOME<br />TO VIETNAM!</div>
        <div className="mt-4 text-[17px] font-semibold text-[#ffcd00]">Xin chào! 🇻🇳</div>
      </div>
      <div className="camel-pixel camel-blink absolute inset-x-0 bottom-[calc(26%+120px)] text-center text-[12px] text-[#ffcd00]">BEEP BEEP!</div>
      <div className="vn-road" />
      <div className="camel-walk vn-ride">
        <div className="camel-dance vn-scooter">
          <Frame wheels={WHEELS[0]} className="camel-frame camel-a" />
          <Frame wheels={WHEELS[1]} className="camel-frame camel-b" />
        </div>
      </div>
      <div className="camel-pixel camel-blink absolute inset-x-0 bottom-[calc(28px+env(safe-area-inset-bottom))] text-center text-[10px] text-white">TOQUE PARA CONTINUAR</div>
    </div>
  );
}
