import { useState } from 'react';
import { ArrowLeftRight, Settings2 } from 'lucide-react';
import { fmtMoney, fmtVnd, parseDong } from '../expenses/logic';

const QUICK = [20_000, 50_000, 100_000, 200_000, 500_000];
const fmtK = (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}tr` : `${v / 1_000}k`);
/** Keeps what was typed readable: digits get thousand separators; "50k" / "1,5tr" stay as typed. */
const pretty = (s: string) => (/^[\d.]+$/.test(s) ? (s.replace(/\./g, '') ? new Intl.NumberFormat('pt-BR').format(Number(s.replace(/\./g, ''))) : '') : s);

/** Fast ₫ → R$ / US$ converter with the group's rates (the same used to split expenses). Works offline. */
export function CurrencyConverter({ rates, onEditRates }: { rates: { BRL: number; USD: number }; onEditRates?: () => void }) {
  const [text, setText] = useState('');
  const vnd = parseDong(text);
  const ok = Number.isFinite(vnd) && vnd > 0;
  return (
    <section className="card mx-4 mb-4 p-4" aria-label="Conversor de moeda">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3"><ArrowLeftRight size={13} aria-hidden /> Conversor rápido</div>
        {onEditRates && <button onClick={onEditRates} className="tap flex items-center gap-1 text-[12px] text-ink-3"><Settings2 size={12} aria-hidden /> Cotações</button>}
      </div>
      <label className="flex items-baseline gap-2 rounded-2xl bg-paper px-3 py-2">
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="Valor em dong"
          value={text}
          onChange={(e) => setText(pretty(e.target.value))}
          className="min-w-0 flex-1 bg-transparent font-display text-[28px] tabular-nums outline-none placeholder:font-sans placeholder:text-[16px] placeholder:text-ink-3"
          aria-label="Valor em dong"
        />
        <span className="text-[18px] text-ink-3">₫</span>
      </label>
      <div className="no-scrollbar -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setText(pretty(String(q)))} className="tap shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-medium tabular-nums text-ink-2">{fmtK(q)}</button>
        ))}
        <button type="button" onClick={() => setText((t) => (t && /^[\d.]+$/.test(t) ? pretty(t + '000') : t))} className="tap shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2" aria-label="Acrescentar três zeros">+000</button>
        {text && <button type="button" onClick={() => setText('')} className="tap shrink-0 rounded-full px-3 py-1.5 text-[12.5px] text-ink-3">Limpar</button>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
        {(['BRL', 'USD'] as const).map((c) => (
          <div key={c} className="rounded-2xl bg-ink px-3 py-2.5 text-paper">
            <div className="text-[11px] uppercase tracking-wider text-paper/60">{c === 'BRL' ? 'Reais' : 'Dólares'}</div>
            <div className="font-display text-[24px] leading-tight tabular-nums">{ok ? fmtMoney(vnd / rates[c], c) : '—'}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-ink-3">
        1 R$ = {fmtVnd(rates.BRL)} · 1 US$ = {fmtVnd(rates.USD)} · cotações do grupo, as mesmas da divisão de gastos. Dica: 50k = 50.000 ₫; 1,5tr = 1.500.000 ₫.
      </p>
    </section>
  );
}
