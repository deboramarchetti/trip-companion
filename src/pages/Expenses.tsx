import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bed, Bus, Check, CloudOff, KeyRound, MoreHorizontal, Plus, RefreshCw, Settings2, ShoppingBag, Smartphone, Ticket, Trash2, Utensils, X } from 'lucide-react';
import {
  CATEGORIES, PEOPLE, balances, equalShares, fmtMoney, fmtVnd, formatAmount, formatTyping, parseAmount, personName, settleUp, toVnd,
  type Category, type Currency, type ExpenseData, type PersonId, type Row, type SettlementData, SETTINGS_ID,
} from '../expenses/logic';
import { isExpensesKey, load, put, rejected, settingsOf, sync } from '../expenses/sync';
import { usePrivate } from '../state/privateData';
import { fmtDayMonthShort, fmtWeekdayShort } from '../lib/time';
import { model } from '../data';
import { tripToday } from '../data/model';
import { partyMembers } from '../lib/viewer';
import { useOffline } from '../state/offline';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { SYNC_ENABLED } from '../lib/backend';

const CAT_ICON: Record<Category, typeof Utensils> = { Comida: Utensils, Transporte: Bus, Hospedagem: Bed, Passeios: Ticket, Compras: ShoppingBag, Outros: MoreHorizontal };
const ME_KEY = 'ovt:me';
const readMe = (): PersonId => {
  const fallback: PersonId = partyMembers()[0] ?? PEOPLE[0]?.id;
  try {
    const v = localStorage.getItem(ME_KEY);
    return v && PEOPLE.some((p) => p.id === v) ? v : fallback;
  } catch { return fallback; }
};
const todayHere = () => tripToday(model);
/** "≈ R$ 51,77 · US$ 9,36" with the group's rates (the same as the converter). */
const inBrlUsd = (vnd: number, rates: { BRL: number; USD: number }) => `≈ ${fmtMoney(vnd / rates.BRL, 'BRL')} · ${fmtMoney(vnd / rates.USD, 'USD')}`;
/** iPhone/iPad Safari keeps a separate storage for the home-screen app. */
const isIosBrowserTab = () => /iP(hone|ad|od)/.test(navigator.userAgent) && !(navigator as unknown as { standalone?: boolean }).standalone && !matchMedia('(display-mode: standalone)').matches;
const uuid = () => crypto.randomUUID();

type SyncState = 'idle' | 'syncing' | 'ok' | 'offline' | 'error' | 'local';

export function Expenses() {
  const { state, expensesKey, unlock } = usePrivate();
  const { online } = useOffline();
  const [store, setStore] = useState(load);
  const key = isExpensesKey(expensesKey) ? expensesKey : undefined;
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [editing, setEditing] = useState<Row | 'new-expense' | { settle: { from: PersonId; to: PersonId; amount: number } } | null>(null);
  const [showRates, setShowRates] = useState(false);


  const doSync = useCallback(async () => {
    if (!key) return;
    if (!SYNC_ENABLED) { setSyncState('local'); return; }
    if (!navigator.onLine) { setSyncState('offline'); return; }
    setSyncState('syncing');
    try { setStore(await sync(key)); setSyncState('ok'); } catch { setSyncState('error'); }
  }, [key]);

  useEffect(() => {
    if (!key) return;
    doSync();
    const t = setInterval(() => document.visibilityState === 'visible' && doSync(), 20_000);
    const vis = () => document.visibilityState === 'visible' && doSync();
    document.addEventListener('visibilitychange', vis);
    addEventListener('online', doSync);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); removeEventListener('online', doSync); };
  }, [key, doSync]);

  const rows = useMemo(() => Object.values(store.rows), [store]);
  const b = useMemo(() => balances(rows), [rows]);
  const plan = useMemo(() => settleUp(b.net), [b]);
  const list = useMemo(
    () => rows.filter((r) => !r.deleted && r.kind !== 'settings').sort((x, y) => (y.data as ExpenseData).date.localeCompare((x.data as ExpenseData).date) || y.client_updated_at.localeCompare(x.client_updated_at)),
    [rows],
  );
  const save = (row: Omit<Row, 'client_updated_at'>) => { setStore(put(row)); setEditing(null); doSync(); };

  if (state !== 'unlocked') return <Locked unlock={unlock} />;

  return (
    <div className="pt-safe pb-28">
      <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-6">
        <div>
          <div className="eyebrow mb-1">Divisão de gastos</div>
          <h1 className="text-[32px] font-normal leading-tight">Contas</h1>
        </div>
        <button onClick={doSync} className="tap mb-1 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[12px] text-ink-2 shadow-sm">
          {syncState === 'local' ? <><Smartphone size={13} /> Modo local · só neste celular</>
            : !key ? <><CloudOff size={13} /> Sem chave de sincronização</>
            : syncState === 'offline' || !online ? <><CloudOff size={13} /> Offline{store.pending.length ? ` · ${store.pending.length} a enviar` : ''}</>
            : syncState === 'error' ? <><RefreshCw size={13} className="text-lacquer" /> Sem conexão com o servidor{store.pending.length ? ` · ${store.pending.length} a enviar` : ''}</>
            : syncState === 'syncing' ? <><RefreshCw size={13} className="animate-spin" /> Sincronizando</>
            : <><Check size={13} className="text-jade" /> Sincronizado</>}
        </button>
      </header>

      <CurrencyConverter rates={settingsOf(store).rates} onEditRates={() => setShowRates(true)} />

      {isIosBrowserTab() && (
        <p className="mx-4 mb-3 rounded-2xl bg-gold-soft/60 px-4 py-2.5 text-[12.5px] text-ink-2">
          Você está no Safari. Lance os gastos pelo <b>app instalado na tela de início</b>: o Safari guarda os dados separados e pode apagá-los.
        </p>
      )}
      {rejected().length > 0 && (
        <p className="mx-4 mb-3 rounded-2xl bg-lacquer-soft px-4 py-2.5 text-[12.5px] text-lacquer">{rejected().length} gasto(s) foram recusados pelo servidor e ficaram só neste celular. Abra, revise e salve de novo.</p>
      )}

      {/* Balances */}
      <section className="card mx-4 divide-y divide-line">
        {PEOPLE.map((p) => {
          const v = b.net[p.id];
          return (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">{p.name}</div>
                <div className="text-[12px] text-ink-3">pagou {fmtVnd(b.paid[p.id])} · consumiu {fmtVnd(b.consumed[p.id])}</div>
              </div>
              <div className={`shrink-0 text-right text-[15px] font-semibold tabular-nums ${v > 500 ? 'text-jade' : v < -500 ? 'text-lacquer' : 'text-ink-3'}`}>
                {Math.abs(v) <= 500 ? 'quite' : <><span className="text-[12px] font-medium">{v > 0 ? 'recebe' : 'deve'}</span> <span className="whitespace-nowrap">{fmtVnd(Math.abs(v))}</span></>}
                {Math.abs(v) > 500 && (
                  <span className="block whitespace-nowrap text-[11.5px] font-normal leading-snug text-ink-3">
                    ≈ {fmtMoney(Math.abs(v) / settingsOf(store).rates.BRL, 'BRL')}<br />{fmtMoney(Math.abs(v) / settingsOf(store).rates.USD, 'USD')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex justify-between px-4 py-2.5 text-[12.5px] text-ink-3">
          <span>Total da viagem</span><span className="tabular-nums">{fmtVnd(b.total)}</span>
        </div>
      </section>

      {/* Settle up */}
      {plan.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 px-5 text-[19px] font-normal">Como acertar</h2>
          <ul className="card mx-4 divide-y divide-line">
            {plan.map((t) => (
              <li key={t.from + t.to} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1 text-[14px]">
                  <b>{personName(t.from)}</b> <ArrowRight size={13} className="inline text-ink-3" /> <b>{personName(t.to)}</b>
                  <span className="block text-[13px] tabular-nums text-ink-2">{fmtVnd(t.amount)}</span>
                  <span className="block text-[12px] tabular-nums text-ink-3">{inBrlUsd(t.amount, settingsOf(store).rates)}</span>
                </span>
                <button onClick={() => setEditing({ settle: t })} className="tap shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-semibold">Registrar pagamento</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* List */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-5">
          <h2 className="text-[19px] font-normal">Gastos <span className="font-sans text-[13px] text-ink-3">{list.filter((r) => r.kind === 'expense').length}</span></h2>
          <button onClick={() => setShowRates(true)} className="tap flex items-center gap-1 text-[12.5px] text-ink-3"><Settings2 size={13} /> Cotações</button>
        </div>
        {list.length === 0 ? (
          <p className="mx-5 rounded-[var(--radius-card)] border border-dashed border-line px-4 py-6 text-center text-[13.5px] text-ink-3">
            Nenhum gasto ainda. Toque em <b>+ Gasto</b> para lançar o primeiro — funciona sem internet.
          </p>
        ) : (
          <ul className="card mx-4 divide-y divide-line">
            {list.map((r) => <ListRow key={r.id} r={r} onOpen={() => setEditing(r)} />)}
          </ul>
        )}
      </section>

      <button onClick={() => setEditing('new-expense')} className="tap fixed right-5 z-30 flex items-center gap-2 rounded-full bg-lacquer px-5 py-3.5 text-[15px] font-semibold text-white shadow-[var(--shadow-lift)]" style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}>
        <Plus size={18} /> Gasto
      </button>

      {editing === 'new-expense' && <ExpenseForm rates={settingsOf(store).rates} onClose={() => setEditing(null)} onSave={save} />}
      {editing && typeof editing === 'object' && 'kind' in editing && editing.kind === 'expense' && (
        <ExpenseForm rates={settingsOf(store).rates} row={editing} onClose={() => setEditing(null)} onSave={save} />
      )}
      {editing && typeof editing === 'object' && ('settle' in editing || ('kind' in editing && editing.kind === 'settlement')) && (
        <SettleForm
          initial={'settle' in editing ? editing.settle : undefined}
          row={'kind' in editing && editing.kind === 'settlement' ? editing : undefined}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {showRates && <RatesForm rates={settingsOf(store).rates} onClose={() => setShowRates(false)} onSave={(rates) => { save({ id: SETTINGS_ID, kind: 'settings', data: { rates }, deleted: false }); setShowRates(false); }} />}
    </div>
  );
}

function ListRow({ r, onOpen }: { r: Row; onOpen: () => void }) {
  if (r.kind === 'settlement') {
    const d = r.data;
    return (
      <li><button onClick={onOpen} className="tap flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-jade-soft text-jade"><Check size={16} /></span>
        <span className="min-w-0 flex-1 text-[14px]"><b>{personName(d.from)}</b> pagou <b>{personName(d.to)}</b>
          <span className="block text-[12px] text-ink-3">{fmtWeekdayShort(d.date)}, {fmtDayMonthShort(d.date)} · acerto</span></span>
        <span className="text-[14px] font-semibold tabular-nums">{fmtMoney(d.amount, d.currency)}</span>
      </button></li>
    );
  }
  if (r.kind !== 'expense') return null;
  const d = r.data;
  const who = Object.keys(d.shares) as PersonId[];
  return (
    <li><button onClick={onOpen} className="tap flex w-full items-center gap-3 px-4 py-3 text-left">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft text-[#7a5518]" title={d.category}>{(() => { const I = CAT_ICON[d.category] ?? MoreHorizontal; return <I size={16} aria-label={d.category} />; })()}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-medium">{d.description}</span>
        <span className="block truncate text-[12px] text-ink-3">{personName(d.paidBy)} pagou · {who.length === 3 ? 'todos' : who.map(personName).join(' e ')} · {fmtDayMonthShort(d.date)}</span>
      </span>
      <span className="text-right">
        <span className="block text-[14px] font-semibold tabular-nums">{fmtMoney(d.amount, d.currency)}</span>
        {d.currency !== 'VND' && <span className="block text-[11px] text-ink-3 tabular-nums">{fmtVnd(toVnd(d.amount, d.rateToVnd))}</span>}
      </span>
    </button></li>
  );
}

/* ----------------------------------------------------------------- forms */

const sheet = 'pb-safe max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl';
const input = 'w-full rounded-xl border border-line bg-paper px-3 py-2 text-[16px] outline-none focus:border-ink-3';
const label = 'block text-[12px] font-medium text-ink-3';

function Sheet({ title, onClose, children, onSubmit }: { title: string; onClose: () => void; children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <form className={sheet} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-[21px]">{title}</div>
          <button type="button" onClick={onClose} className="tap p-1 text-ink-3" aria-label="Fechar"><X size={20} /></button>
        </div>
        {children}
      </form>
    </div>
  );
}

function PersonChips({ value, onChange, multi }: { value: PersonId[]; onChange: (v: PersonId[]) => void; multi?: boolean }) {
  return (
    <div className="flex gap-2">
      {PEOPLE.map((p) => {
        const on = value.includes(p.id);
        return (
          <button type="button" key={p.id} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== p.id) : [...value, p.id]) : [p.id])}
            className={`tap flex-1 rounded-full py-2 text-[14px] font-medium ${on ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2'}`}>{p.name}</button>
        );
      })}
    </div>
  );
}

function CurrencyPick({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value as Currency)} aria-label="Moeda">
      <option value="VND">₫ dong</option><option value="BRL">R$ real</option><option value="USD">US$ dólar</option>
    </select>
  );
}

function ExpenseForm({ row, rates, onClose, onSave }: { row?: Extract<Row, { kind: 'expense' }>; rates: Record<'BRL' | 'USD', number>; onClose: () => void; onSave: (r: Omit<Row, 'client_updated_at'>) => void }) {
  const d = row?.data;
  const [desc, setDesc] = useState(d?.description ?? '');
  const [currency, setCurrency] = useState<Currency>(d?.currency ?? 'VND');
  const [amountText, setAmountText] = useState(d ? formatAmount(d.amount, d.currency) : '');
  const [paidBy, setPaidBy] = useState<PersonId>(d?.paidBy ?? readMe());
  const [who, setWho] = useState<PersonId[]>(d ? (Object.keys(d.shares) as PersonId[]) : PEOPLE.map((p) => p.id));
  const [mode, setMode] = useState<'equal' | 'exact'>(d?.splitMode ?? 'equal');
  const [exact, setExact] = useState<Partial<Record<PersonId, string>>>(() => {
    if (!d || d.splitMode !== 'exact') return {};
    return Object.fromEntries(Object.entries(d.shares).map(([p, v]) => [p, formatAmount(Math.round((v as number) / d.rateToVnd * 100) / 100, d.currency)]));
  });
  const [category, setCategory] = useState<Category>(d?.category ?? 'Comida');
  const [date, setDate] = useState(d?.date ?? todayHere());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string>();

  const rate = currency === 'VND' ? 1 : row && d?.currency === currency ? d.rateToVnd : rates[currency];
  const amount = parseAmount(amountText, currency);
  const totalVnd = Number.isFinite(amount) ? toVnd(amount, rate) : 0;
  const exactSum = who.reduce((s, p) => s + (parseAmount(exact[p] ?? '', currency) || 0), 0);

  const submit = () => {
    if (!desc.trim()) return setError('Descreva o gasto.');
    if (!(amount > 0)) return setError('Valor inválido.');
    if (!who.length) return setError('Escolha quem divide.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Escolha a data.');
    if (amount > 1e12) return setError('Valor alto demais — confira.');
    let shares: Partial<Record<PersonId, number>>;
    if (mode === 'equal') shares = equalShares(totalVnd, who);
    else {
      if (Math.abs(exactSum - amount) > (currency === 'VND' ? 1 : 0.01)) return setError(`A soma das partes (${fmtMoney(exactSum, currency)}) precisa ser igual ao total.`);
      shares = Object.fromEntries(who.map((p) => [p, toVnd(parseAmount(exact[p] ?? '0', currency) || 0, rate)]));
      const diff = totalVnd - Object.values(shares).reduce<number>((s, v) => s + (v ?? 0), 0);
      shares[who[0]] = (shares[who[0]] ?? 0) + diff; // rounding
    }
    try { localStorage.setItem(ME_KEY, paidBy); } catch { /* ignore */ }
    const data: ExpenseData = { description: desc.trim(), amount, currency, rateToVnd: rate, paidBy, shares, splitMode: mode, category, date, createdBy: d?.createdBy ?? paidBy };
    onSave({ id: row?.id ?? uuid(), kind: 'expense', data, deleted: false });
  };

  return (
    <Sheet title={row ? 'Editar gasto' : 'Novo gasto'} onClose={onClose} onSubmit={submit}>
      <div className="space-y-3">
        <label className={label}>Descrição<input className={input} value={desc} maxLength={120} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Jantar no Madam Thu" autoFocus={!row} /></label>
        <div className="grid grid-cols-[1fr_130px] gap-3">
          <label className={label}>Valor<input className={input} inputMode={currency === 'VND' ? 'numeric' : 'decimal'} value={amountText} onChange={(e) => setAmountText(formatTyping(e.target.value, currency))} placeholder={currency === 'VND' ? '450.000' : '120,00'} /></label>
          <label className={label}>Moeda<CurrencyPick value={currency} onChange={(c) => {
            // Keep the same amount when switching currency (the comma means cents only in R$/US$).
            const re = (t: string) => { const v = parseAmount(t, currency); return Number.isFinite(v) ? formatAmount(v, c) : formatTyping(t, c); };
            setAmountText(re); setExact((x) => Object.fromEntries(Object.entries(x).map(([p, t]) => [p, t ? re(t) : t]))); setCurrency(c);
          }} /></label>
        </div>
        {currency !== 'VND' && totalVnd > 0 && <div className="text-[12px] text-ink-3">= {fmtVnd(totalVnd)} (1 {currency} = {fmtVnd(rate)})</div>}
        <div><div className={label}>Quem pagou</div><div className="mt-1"><PersonChips value={[paidBy]} onChange={(v) => setPaidBy(v[0])} /></div></div>
        <div>
          <div className="flex items-center justify-between">
            <span className={label}>Dividir entre</span>
            <div className="flex rounded-full bg-paper-2 p-0.5 text-[12px]">
              {(['equal', 'exact'] as const).map((m) => <button type="button" key={m} onClick={() => setMode(m)} className={`rounded-full px-2.5 py-1 ${mode === m ? 'bg-card shadow-sm' : 'text-ink-3'}`}>{m === 'equal' ? 'Igual' : 'Valores'}</button>)}
            </div>
          </div>
          <div className="mt-1"><PersonChips value={who} onChange={setWho} multi /></div>
          {mode === 'equal' && who.length > 0 && totalVnd > 0 && <div className="mt-1 text-[12px] text-ink-3">{fmtVnd(totalVnd / who.length)} para cada</div>}
          {mode === 'exact' && (
            <div className="mt-2 space-y-2">
              {who.map((p) => (
                <label key={p} className="flex items-center gap-3 text-[14px]"><span className="w-16">{personName(p)}</span>
                  <input className={input} inputMode={currency === 'VND' ? 'numeric' : 'decimal'} value={exact[p] ?? ''} onChange={(e) => setExact({ ...exact, [p]: formatTyping(e.target.value, currency) })} /></label>
              ))}
              <div className="text-[12px] text-ink-3">Soma: {fmtMoney(exactSum, currency)} de {Number.isFinite(amount) ? fmtMoney(amount, currency) : '—'}</div>
            </div>
          )}
        </div>
        <div><div className={label}>Categoria</div>
          <div className="mt-1 flex flex-wrap gap-1.5">{CATEGORIES.map((c) => <button type="button" key={c} onClick={() => setCategory(c)} className={`tap rounded-full px-3 py-1 text-[12.5px] ${category === c ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2'}`}>{c}</button>)}</div>
        </div>
        <label className={label}>Data<input type="date" required className={input} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </div>
      {error && <p className="mt-3 text-[13px] text-lacquer">{error}</p>}
      <button className="tap mt-5 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-paper">Salvar</button>
      {row && (confirmDelete ? (
        <button type="button" onClick={() => onSave({ ...row, deleted: true })} className="tap mt-2 w-full rounded-full bg-lacquer py-2.5 text-[14px] font-semibold text-white">Confirmar exclusão</button>
      ) : (
        <button type="button" onClick={() => setConfirmDelete(true)} className="tap mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] text-lacquer"><Trash2 size={14} /> Excluir gasto</button>
      ))}
    </Sheet>
  );
}

function SettleForm({ initial, row, onClose, onSave }: { initial?: { from: PersonId; to: PersonId; amount: number }; row?: Extract<Row, { kind: 'settlement' }>; onClose: () => void; onSave: (r: Omit<Row, 'client_updated_at'>) => void }) {
  const d = row?.data;
  const [from, setFrom] = useState<PersonId>(d?.from ?? initial?.from ?? PEOPLE[PEOPLE.length - 1]?.id);
  const [to, setTo] = useState<PersonId>(d?.to ?? initial?.to ?? PEOPLE[0]?.id);
  const [amountText, setAmountText] = useState(d ? formatAmount(d.amount, 'VND') : initial ? formatAmount(initial.amount, 'VND') : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string>();
  const submit = () => {
    const amount = parseAmount(amountText, 'VND');
    if (!(amount > 0)) return setError('Valor inválido.');
    if (from === to) return setError('Escolha pessoas diferentes.');
    const data: SettlementData = { from, to, amount, currency: 'VND', rateToVnd: 1, date: d?.date ?? todayHere() };
    onSave({ id: row?.id ?? uuid(), kind: 'settlement', data, deleted: false });
  };
  return (
    <Sheet title="Registrar pagamento" onClose={onClose} onSubmit={submit}>
      <div className="space-y-3">
        <div><div className={label}>Quem pagou</div><div className="mt-1"><PersonChips value={[from]} onChange={(v) => setFrom(v[0])} /></div></div>
        <div><div className={label}>Para quem</div><div className="mt-1"><PersonChips value={[to]} onChange={(v) => setTo(v[0])} /></div></div>
        <label className={label}>Valor (₫)<input className={input} inputMode="numeric" value={amountText} onChange={(e) => setAmountText(formatTyping(e.target.value, 'VND'))} /></label>
        <p className="text-[12px] text-ink-3">Use quando alguém transferir ou entregar dinheiro para acertar a conta (Pix, dinheiro…).</p>
      </div>
      {error && <p className="mt-3 text-[13px] text-lacquer">{error}</p>}
      <button className="tap mt-5 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-paper">Salvar</button>
      {row && (confirmDelete ? (
        <button type="button" onClick={() => onSave({ ...row, deleted: true })} className="tap mt-2 w-full rounded-full bg-lacquer py-2.5 text-[14px] font-semibold text-white">Confirmar exclusão</button>
      ) : (
        <button type="button" onClick={() => setConfirmDelete(true)} className="tap mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] text-lacquer"><Trash2 size={14} /> Excluir</button>
      ))}
    </Sheet>
  );
}

function RatesForm({ rates, onClose, onSave }: { rates: Record<'BRL' | 'USD', number>; onClose: () => void; onSave: (r: Record<'BRL' | 'USD', number>) => void }) {
  const [brl, setBrl] = useState(String(rates.BRL));
  const [usd, setUsd] = useState(String(rates.USD));
  return (
    <Sheet title="Cotações" onClose={onClose} onSubmit={() => onSave({ BRL: parseAmount(brl, 'VND') || rates.BRL, USD: parseAmount(usd, 'VND') || rates.USD })}>
      <div className="space-y-3">
        <label className={label}>1 real (R$) = quantos dong?<input className={input} inputMode="numeric" value={brl} onChange={(e) => setBrl(e.target.value)} /></label>
        <label className={label}>1 dólar (US$) = quantos dong?<input className={input} inputMode="numeric" value={usd} onChange={(e) => setUsd(e.target.value)} /></label>
        <p className="text-[12px] text-ink-3">Valem para os próximos gastos lançados em real ou dólar (os já lançados mantêm a cotação do dia). Valem para os três celulares.</p>
      </div>
      <button className="tap mt-5 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-paper">Salvar</button>
    </Sheet>
  );
}

function Locked({ unlock }: { unlock: (p: string) => Promise<boolean> }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="pt-safe px-5 pt-10">
      <h1 className="text-[32px] font-normal">Contas</h1>
      <div className="-mx-5 mt-5"><CurrencyConverter rates={settingsOf(load()).rates} /></div>
      <form className="card mt-1 p-4" onSubmit={async (e) => { e.preventDefault(); setErr(!(await unlock(pass))); }}>
        <div className="flex items-center gap-2 font-medium"><KeyRound size={16} /> Senha da viagem</div>
        <p className="mt-1 text-[13px] text-ink-3">Os gastos são compartilhados entre os três celulares e protegidos pela senha da viagem.</p>
        <div className="mt-3 flex gap-2">
          <input type="password" autoCapitalize="none" className={input} value={pass} onChange={(e) => setPass(e.target.value)} aria-label="Senha da viagem" />
          <button className="tap rounded-full bg-ink px-4 text-[13px] font-semibold text-paper">Abrir</button>
        </div>
        {err && <p className="mt-2 text-[12.5px] text-lacquer">Senha incorreta.</p>}
      </form>
    </div>
  );
}
