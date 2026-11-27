import { useMemo, useState } from 'react';
import type { Photo } from '../data/types';

/**
 * Large image area. Shows the real photo when one exists (files in
 * /public/photos are precached for offline use); otherwise an illustrated
 * karst-landscape cover generated from the city's hue, so the layout looks
 * finished while photos are not available yet.
 */
export function Cover({ photo, hue = 20, seed = 'x', className = '', children, scrim = true }: {
  photo?: Photo;
  hue?: number;
  seed?: string;
  className?: string;
  children?: React.ReactNode;
  scrim?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-paper-2 ${className}`}>
      {photo && !broken ? (
        <img
          src={photo.src}
          alt={photo.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: photo.focus }}
          onError={() => setBroken(true)}
          decoding="async"
        />
      ) : (
        <Landscape hue={hue} seed={seed} />
      )}
      {scrim && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5" />}
      {photo?.credit && !broken && (
        <span className="absolute right-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur">{photo.credit}</span>
      )}
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}

function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Rounded limestone towers, like Ha Long / Ninh Binh karsts. */
function ridge(rand: () => number, base: number, amp: number, count: number) {
  const W = 400;
  let d = `M0 ${base}`;
  let x = -20;
  while (x < W + 20) {
    const w = W / count * (0.6 + rand() * 0.8);
    const h = amp * (0.45 + rand() * 0.75);
    const top = base - h;
    d += ` C${x + w * 0.05} ${top + h * 0.15}, ${x + w * 0.2} ${top}, ${x + w * 0.5} ${top} S${x + w * 0.95} ${top + h * 0.15}, ${x + w} ${base - h * 0.1 * rand()}`;
    x += w;
  }
  return d + ` L${W + 20} 240 L-20 240 Z`;
}

export function Landscape({ hue, seed }: { hue: number; seed: string }) {
  const art = useMemo(() => {
    const rand = rng(seed);
    return {
      sunX: 90 + rand() * 220,
      sunY: 60 + rand() * 30,
      far: ridge(rand, 150, 70, 5),
      mid: ridge(rand, 175, 75, 4),
      near: ridge(rand, 205, 60, 3),
    };
  }, [seed]);
  const id = `g${seed.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 42% 76%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 30) % 360} 55% 90%)`} />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 30% 62%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 35% 40%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}s)`} />
      <circle cx={art.sunX} cy={art.sunY} r="26" fill="hsl(38 85% 88%)" opacity=".9" />
      <path d={art.far} fill={`hsl(${hue} 22% 62%)`} opacity=".55" />
      <path d={art.mid} fill={`hsl(${hue} 25% 45%)`} opacity=".75" />
      <rect y="196" width="400" height="44" fill={`url(#${id}w)`} />
      <path d={art.near} fill={`hsl(${hue} 30% 26%)`} transform="translate(0 18) scale(1 0.92)" />
      <g stroke="hsl(0 0% 100% / .25)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="40" y1="226" x2="90" y2="226" />
        <line x1="230" y1="232" x2="300" y2="232" />
        <line x1="150" y1="220" x2="180" y2="220" />
      </g>
    </svg>
  );
}
