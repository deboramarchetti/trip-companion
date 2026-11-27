import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown, Copy, Landmark, Lightbulb } from 'lucide-react';
import { Cover } from '../Cover';
import { model } from '../../data';
import { regions, sources, type GuideCity, type Stat, type TimelineEvent } from '../../data/guide';

/* ------------------------------------------------------------ formatting */
const nf = (decimals = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
/** pt-BR number with its prefix/suffix ("US$ 5.026", "8,02%", "102,3 milhões"). */
export const formatStat = (s: Pick<Stat, 'value' | 'decimals' | 'prefix' | 'suffix' | 'text'>) =>
  s.value === undefined ? s.text ?? '' : `${s.prefix ?? ''}${nf(s.decimals).format(s.value)}${s.suffix ?? ''}`;
export const formatPct = (v: number) => `${nf(2).format(v)}%`;

const sourceOf = (id?: string) => sources.find((x) => x.id === id);

/* -------------------------------------------------------------- building blocks */
export function SectionHeader({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="mb-4 px-5" id={`h-${id}`}>
      <div className="eyebrow mb-1">{eyebrow}</div>
      <h2 className="font-display text-[26px] font-normal leading-[1.12]">{title}</h2>
      {lead && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{lead}</p>}
    </header>
  );
}

/** "Fonte: … · ano" — opens the source in the browser when online. */
export function SourceRef({ id, period }: { id?: string; period?: string }) {
  const s = sourceOf(id);
  if (!s && !period) return null;
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-x-1 text-[11.5px] text-ink-3">
      {period && <span>Ref.: {period}</span>}
      {s && period && <span aria-hidden>·</span>}
      {s && (
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline decoration-line underline-offset-2">
          {s.label}<ArrowUpRight size={11} aria-hidden />
        </a>
      )}
    </span>
  );
}

export function StatCard({ s, big }: { s: Stat; big?: boolean }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="text-[12px] font-medium text-ink-3">{s.label}</div>
      <div className={`mt-1 font-display leading-tight text-ink ${big || s.value !== undefined ? 'text-[24px]' : 'text-[18px]'}`}>{formatStat(s)}</div>
      {s.note && <p className="mt-1 text-[12.5px] leading-snug text-ink-2">{s.note}</p>}
      <div className="mt-auto"><SourceRef id={s.sourceId} period={s.period} /></div>
    </div>
  );
}

/** Expand/collapse without navigation (native <details>, keyboard and screen-reader friendly). */
export function Expand({ summary, children, className = '' }: { summary: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="tap flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[14px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <ChevronDown size={18} className="shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-2 text-[14px] leading-relaxed text-ink-2">{children}</div>
    </details>
  );
}

export function InfoCard({ title, text, index }: { title: string; text: string; index?: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-baseline gap-2">
        {index !== undefined && <span className="font-display text-[20px] text-lacquer">{index}</span>}
        <div className="text-[15px] font-semibold leading-snug">{title}</div>
      </div>
      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

export function DidYouKnow({ children, label = 'Você sabia?' }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-gold-soft p-4">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a5518]"><Lightbulb size={13} aria-hidden /> {label}</div>
      <div className="text-[14.5px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------ GDP chart */
export function GdpBar({ parts, period, note, sourceId, title }: { parts: { id: string; label: string; value: number; color: string }[]; period: string; note: string; sourceId: string; title: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  return (
    <figure className="card p-4" aria-label={`${title}, ${period}`}>
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[12px] text-ink-3">{period}</span>
      </figcaption>
      <div className="flex h-7 w-full overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${formatPct(p.value)}`).join('; ')}>
        {parts.map((p) => <div key={p.id} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
      </div>
      <ul className="mt-3 space-y-2">
        {parts.map((p) => (
          <li key={p.id} className="flex items-start gap-2.5 text-[13.5px]">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: p.color }} aria-hidden />
            <span className="min-w-0 flex-1 text-ink-2">{p.label}</span>
            <b className="shrink-0 tabular-nums">{formatPct(p.value)}</b>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] leading-snug text-ink-3">{note}</p>
      <SourceRef id={sourceId} period={period} />
    </figure>
  );
}

/* -------------------------------------------------------------- timeline */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  const [open, setOpen] = useState<string>();
  return (
    <ol className="relative mx-5 border-l-2 border-line pl-5">
      {events.map((e) => {
        const isOpen = open === e.id;
        return (
          <li key={e.id} className="relative pb-4 last:pb-0">
            <span className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ring-4 ring-paper ${isOpen ? 'bg-lacquer' : 'bg-ink-3'}`} aria-hidden />
            <button type="button" onClick={() => setOpen(isOpen ? undefined : e.id)} aria-expanded={e.detail ? isOpen : undefined} disabled={!e.detail}
              className="tap block w-full text-left disabled:cursor-default">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-lacquer">{e.when}</div>
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-[18px] leading-snug">{e.title}</div>
                {e.detail && <ChevronDown size={17} className={`mt-1 shrink-0 text-ink-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />}
              </div>
              <p className="mt-0.5 text-[14px] leading-relaxed text-ink-2">{e.text}</p>
            </button>
            {e.detail && isOpen && <p className="mt-2 rounded-xl bg-card p-3 text-[13.5px] leading-relaxed text-ink-2 shadow-sm">{e.detail}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------- North/Centre/South */
export function RegionCompare() {
  const [aspect, setAspect] = useState(regions.aspects[0].id);
  return (
    <div className="px-4">
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Comparar regiões por">
        {regions.aspects.map((a) => (
          <button key={a.id} role="tab" aria-selected={aspect === a.id} onClick={() => setAspect(a.id)}
            className={`tap shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${aspect === a.id ? 'bg-ink text-paper' : 'bg-card text-ink-2 shadow-sm'}`}>
            {a.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {regions.columns.map((c, i) => (
          <div key={c.id} className="card flex flex-col overflow-hidden">
            <div className="px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-white" style={{ background: ['var(--color-lacquer)', 'var(--color-gold)', 'var(--color-jade)'][i] }}>{c.name}</div>
            <p className="p-3 text-[13px] leading-snug text-ink-2">{c.values[aspect]}</p>
          </div>
        ))}
      </div>
      <Expand summary="Ver tudo lado a lado" className="mt-2">
        <div className="space-y-3">
          {regions.columns.map((c) => (
            <div key={c.id} className="rounded-xl bg-card p-3 shadow-sm">
              <div className="mb-1 font-display text-[17px] text-ink">{c.name}</div>
              <dl className="space-y-1 text-[13px]">
                {regions.aspects.map((a) => <div key={a.id}><dt className="inline font-semibold text-ink">{a.label}: </dt><dd className="inline">{c.values[a.id]}</dd></div>)}
              </dl>
            </div>
          ))}
        </div>
      </Expand>
      <p className="mt-1 text-[12.5px] text-ink-3">{regions.note}</p>
    </div>
  );
}

/* ----------------------------------------------------------------- cities */
export function CityCard({ c }: { c: GuideCity }) {
  const city = model.city(c.cityId);
  const firstDay = model.datesForCity(c.cityId)[0];
  return (
    <article className="card overflow-hidden">
      <Cover hue={city?.artHue ?? 20} seed={`guide-${c.id}`} className="h-32">
        <div className="flex h-full flex-col justify-end p-4 text-white">
          {c.unesco && <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"><Landmark size={12} aria-hidden /> Patrimônio UNESCO</span>}
          <div className="font-display text-[24px] leading-none">{c.name}</div>
          {c.localName !== c.name && <div className="mt-0.5 text-[13px] text-white/85">{c.localName}</div>}
        </div>
      </Cover>
      <div className="px-4 pt-3">
        <p className="text-[14px] leading-relaxed text-ink-2">{c.lead}</p>
        <Expand summary="Guia rápido">
          <ul className="list-disc space-y-1 pl-5">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
          {c.unesco && <p className="mt-2 text-[12.5px] text-ink-3">UNESCO: {c.unesco}</p>}
          <p className="mt-2 rounded-xl bg-gold-soft p-3 text-[13.5px] text-ink"><b>Curiosidade:</b> {c.curiosity}</p>
          {c.sourceId && <SourceRef id={c.sourceId} />}
        </Expand>
      </div>
      {firstDay && (
        <div className="border-t border-line px-4 py-2.5">
          <Link to={`/day/${firstDay}`} className="tap inline-flex min-h-9 items-center gap-1 text-[13px] font-semibold text-lacquer">Ver no roteiro <ArrowUpRight size={14} className="rotate-45" aria-hidden /></Link>
        </div>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- phrases */
export function PhraseCard({ vi, pt }: { vi: string; pt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(vi).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div lang="vi" className="font-display text-[24px] leading-tight text-ink">{vi}</div>
        <div className="mt-0.5 text-[13.5px] text-ink-3">{pt}</div>
      </div>
      <button type="button" onClick={copy} className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 text-ink-2" aria-label={copied ? `Copiado: ${vi}` : `Copiar "${vi}"`}>
        {copied ? <Check size={18} className="text-jade" aria-hidden /> : <Copy size={17} aria-hidden />}
      </button>
    </div>
  );
}
