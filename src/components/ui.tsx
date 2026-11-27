import { Check, Clock3, MapPin, Navigation, Sparkles } from 'lucide-react';
import type { Place, Status } from '../data/types';
import { mapsDirectionsUrl, mapsSearchUrl } from '../lib/maps';

const STATUS: Record<Status, { label: string; cls: string; Icon: typeof Check }> = {
  confirmed: { label: 'Confirmado', cls: 'bg-jade-soft text-jade', Icon: Check },
  suggestion: { label: 'Sugestão', cls: 'bg-gold-soft text-[#7a5518]', Icon: Sparkles },
  pending: { label: 'Pendente', cls: 'bg-paper-2 text-ink-2', Icon: Clock3 },
};

export function StatusBadge({ status, compact }: { status: Status; compact?: boolean }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>
      <s.Icon size={11} strokeWidth={2.5} aria-hidden />
      {!compact && s.label}
      {compact && <span className="sr-only">{s.label}</span>}
    </span>
  );
}

export function PlaceholderBadge({ children = 'Placeholder' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-ink-3/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
      {children}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-5">
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="text-[22px] font-medium leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

type MapPlace = Pick<Place, 'name' | 'address' | 'coords' | 'googlePlaceId' | 'mapsQuery' | 'mapsUrl'>;

/** Primary "open in Google Maps" action. */
export function MapsButton({ place, label = 'Abrir no Maps', variant = 'soft', directions, travelmode }: {
  place: MapPlace;
  label?: string;
  variant?: 'soft' | 'solid' | 'ghost' | 'onDark';
  directions?: boolean;
  travelmode?: 'walking' | 'driving';
}) {
  const cls =
    variant === 'solid'
      ? 'bg-ink text-paper'
      : variant === 'ghost'
        ? 'text-lacquer'
        : variant === 'onDark'
        ? 'bg-paper/15 text-paper'
        : 'bg-paper-2 text-ink';
  const Icon = directions ? Navigation : MapPin;
  return (
    <a
      href={directions ? mapsDirectionsUrl(place, travelmode) : mapsSearchUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      className={`tap inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${cls}`}
    >
      <Icon size={14} aria-hidden />
      {label}
    </a>
  );
}

export function Row({ icon: Icon, children, className = '' }: { icon: typeof Check; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2.5 text-[13.5px] text-ink-2 ${className}`}>
      <Icon size={15} className="mt-[3px] shrink-0 text-ink-3" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: typeof Check; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-5 rounded-[var(--radius-card)] border border-dashed border-line px-5 py-7 text-center">
      <Icon size={22} className="mx-auto mb-2 text-ink-3" aria-hidden />
      <div className="font-display text-[17px]">{title}</div>
      {children && <div className="mx-auto mt-1 max-w-[30ch] text-[13px] text-ink-3">{children}</div>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="no-scrollbar flex overflow-x-auto rounded-full bg-paper-2 p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 shrink-0 whitespace-nowrap rounded-full px-2 py-1.5 text-[12.5px] font-medium transition-colors min-[360px]:text-[13px] ${value === o.value ? 'bg-card text-ink shadow-sm' : 'text-ink-3'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
