import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardPaste, Plus, Send, Trash2, X } from 'lucide-react';
import { localStore, model } from '../data';
import type { BookingKind, LocalEdit, LocalItem, Priority, Status } from '../data/types';
import { encryptJSON, decryptJSON, type Envelope } from '../lib/crypto';
import { hasLocalChanges, mergeLocal, saveLocal } from '../lib/localStore';

const saveOrWarn = (s: Parameters<typeof saveLocal>[0]) => {
  if (saveLocal(s)) return true;
  alert('Não foi possível salvar neste celular (armazenamento cheio ou navegação privada).');
  return false;
};
import { fmtDayMonthShort, fmtWeekdayShort } from '../lib/time';
import { usePrivate } from '../state/privateData';
import { BOOKING_LABEL } from './Reservations';
import { VIEWER, missingFor, needsOwnCode, partyKey, viewerName } from '../lib/viewer';

/* ------------------------------------------------------------- the lists */

type Target = { type: 'booking' | 'flight' | 'hotel'; id: string; title: string; date: string; priority?: Priority; bookBy?: string; missing?: string[]; notes?: string; local?: boolean; status?: Status; perParty?: boolean; ownCode?: boolean };

function collect() {
  const all: Target[] = [
    ...model.bookings.map((b) => ({ type: 'booking' as const, id: b.id, title: b.title, date: b.date, priority: b.priority, bookBy: b.bookBy, missing: missingFor(b, VIEWER, false), ownCode: needsOwnCode(b), notes: b.notes, status: b.status, perParty: b.perParty, local: localStore.items.some((i) => i.id === b.id) })),
    ...model.flights.map((f) => ({ type: 'flight' as const, id: f.id, title: `Voo ${f.from} → ${f.to}${f.flightNumber ? ` · ${f.flightNumber}` : ''}`, date: f.departDate, priority: f.priority, bookBy: f.bookBy, missing: missingFor(f, VIEWER, false), ownCode: needsOwnCode(f), status: f.status, perParty: f.perParty })),
    ...model.hotels.map((h) => ({ type: 'hotel' as const, id: h.id, title: model.place(h.placeId)?.name ?? h.id, date: h.checkIn, priority: h.priority, bookBy: h.bookBy, missing: missingFor(h, VIEWER, false), ownCode: needsOwnCode(h), status: h.status, perParty: h.perParty })),
  ];
  const rank = { high: 0, medium: 1, low: 2 } as const;
  const toBook = all.filter((t) => t.status === 'pending').sort((a, b) => rank[a.priority ?? 'low'] - rank[b.priority ?? 'low'] || a.date.localeCompare(b.date));
  const missing = all.filter((t) => t.status !== 'pending' && t.missing?.length).sort((a, b) => a.date.localeCompare(b.date));
  const codes = all.filter((t) => t.status !== 'pending' && t.ownCode).sort((a, b) => a.date.localeCompare(b.date));
  return { toBook, missing, codes };
}

const PRIORITY: Record<Priority, { label: string; cls: string }> = {
  high: { label: 'Urgente', cls: 'bg-lacquer text-white' },
  medium: { label: 'Em breve', cls: 'bg-gold text-white' },
  low: { label: 'Sem pressa', cls: 'bg-paper-2 text-ink-2' },
};

export function todoCounts() {
  const { toBook, missing } = collect();
  return { toBook: toBook.length, missing: missing.length, urgent: toBook.filter((t) => t.priority === 'high').length };
}

export function TodoPanel() {
  const { toBook, missing, codes } = collect();
  // "Adicionar seu código" on a hotel/flight card opens straight into that item's form.
  const [editing, setEditing] = useState<Target | 'new' | null>(() => {
    const id = typeof location !== 'undefined' ? location.hash.match(/^#codes=([\w-]+)$/)?.[1] : undefined;
    return (id && codes.find((t) => t.id === id)) || null;
  });
  return (
    <div className="space-y-6">
      {codes.length > 0 && (
        <section id="codes" className="scroll-mt-24">
          <h3 className="mb-1 flex items-baseline gap-2 px-5 font-display text-[19px]">Seus códigos de reserva <span className="font-sans text-[13px] text-ink-3">opcional</span></h3>
          <p className="mb-2 px-5 text-[12.5px] text-ink-3">{viewerName()}: reservado nos mesmos hotéis e voos, nas mesmas datas. Adicione aqui os seus localizadores e PINs: ficam neste celular para usar offline e com cópia criptografada no servidor (só abre com a senha da viagem).</p>
          <ul className="card mx-4 divide-y divide-line">
            {codes.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <CheckCircle2 size={15} className="shrink-0 text-jade" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium">{t.title}</div>
                  <div className="text-[12px] text-ink-3">{fmtWeekdayShort(t.date)}, {fmtDayMonthShort(t.date)} · reservado</div>
                </div>
                <button onClick={() => setEditing(t)} className="tap shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-semibold">Adicionar código</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 flex items-baseline gap-2 px-5 font-display text-[19px]">Falta reservar <span className="font-sans text-[13px] text-ink-3">{toBook.length}</span></h3>
        {toBook.length === 0 ? (
          <p className="mx-5 flex items-center gap-2 text-[13.5px] text-jade"><CheckCircle2 size={16} /> Tudo do roteiro está reservado.</p>
        ) : (
          <ul className="card mx-4 divide-y divide-line">
            {toBook.map((t) => (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {t.priority && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY[t.priority].cls}`}>{PRIORITY[t.priority].label}</span>}
                    <span className="text-[12px] text-ink-3">{fmtWeekdayShort(t.date)}, {fmtDayMonthShort(t.date)}</span>
                  </div>
                  <div className="mt-0.5 font-medium leading-snug">{t.title}</div>
                  {t.bookBy && <div className="text-[12.5px] text-ink-3">Reservar: {t.bookBy}</div>}
                </div>
                <button onClick={() => setEditing(t)} className="tap shrink-0 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-paper">Já reservei</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {missing.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-baseline gap-2 px-5 font-display text-[19px]">Reservado, mas faltam dados{VIEWER ? ` · ${viewerName()}` : ''} <span className="font-sans text-[13px] text-ink-3">{missing.length}</span></h3>
          <ul className="card mx-4 divide-y divide-line">
            {missing.map((t) => (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                <AlertCircle size={16} className="mt-1 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] text-ink-3">{fmtWeekdayShort(t.date)}, {fmtDayMonthShort(t.date)}</div>
                  <div className="font-medium leading-snug">{t.title}</div>
                  <div className="text-[12.5px] text-ink-3">Falta: {t.missing!.join(' · ')}</div>
                </div>
                <button onClick={() => setEditing(t)} className="tap shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-[12.5px] font-semibold">Completar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="px-4">
        <button onClick={() => setEditing('new')} className="tap flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-ink-3/50 py-3 text-[14px] font-semibold text-ink-2">
          <Plus size={16} /> Adicionar reserva ou passeio
        </button>
      </div>

      <LocalChanges onEdit={(t) => setEditing(t)} />
      <GroupSync />

      {editing && <EditSheet target={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* --------------------------------------------------------- local changes */

function LocalChanges({ onEdit }: { onEdit: (t: Target) => void }) {
  const items = localStore.items.filter((i) => !i.deleted);
  const edits = Object.keys(localStore.edits);
  if (!items.length && !edits.length) return null;
  return (
    <section>
      <h3 className="mb-1 px-5 font-display text-[19px]">Alterações feitas no app</h3>
      <p className="mb-2 px-5 text-[12.5px] text-ink-3">Salvas neste celular. Use "Compartilhar com o grupo" para enviar aos outros.</p>
      <ul className="card mx-4 divide-y divide-line text-[13.5px]">
        {edits.map((key) => {
          const [id, party] = key.split('@');
          const name = model.booking(id)?.title ?? (model.flight(id) ? `Voo ${model.flight(id)!.from} → ${model.flight(id)!.to}` : model.place(model.hotel(id)?.placeId)?.name) ?? id;
          return <li key={key} className="px-4 py-2.5"><span className="text-ink-3">{party ? `Códigos de ${viewerName(party) ?? party}:` : 'Atualizado:'}</span> {name}</li>;
        })}
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 px-4 py-2.5">
            <span className="min-w-0 flex-1"><span className="text-ink-3">Novo:</span> {it.title} · {fmtDayMonthShort(it.date)}</span>
            <button className="tap p-1 text-ink-3" aria-label="Editar" onClick={() => onEdit({ type: 'booking', id: it.id, title: it.title, date: it.date, local: true })}>Editar</button>
            <button className="tap p-1 text-lacquer" aria-label="Excluir" onClick={() => {
              if (!confirm(`Excluir "${it.title}"?`)) return;
              it.deleted = true; it.updatedAt = new Date().toISOString(); if (saveOrWarn(localStore)) location.reload();
            }}><Trash2 size={15} /></button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ edit sheet */

const KINDS: BookingKind[] = ['tour', 'transfer', 'car', 'train', 'bus', 'boat', 'cruise', 'ticket', 'restaurant', 'other'];

function EditSheet({ target, onClose }: { target?: Target; onClose: () => void }) {
  const isNew = !target;
  const existingItem = target?.local ? localStore.items.find((i) => i.id === target.id) : undefined;
  // Per-party items (same hotel, separate reservations): codes are saved for this phone's party.
  const splitKey = target?.perParty && VIEWER ? partyKey(target.id) : undefined;
  const prev: Partial<LocalEdit> = existingItem ?? (target ? { ...localStore.edits[target.id], ...(splitKey ? localStore.edits[splitKey] : {}) } : {});
  const [f, setF] = useState({
    title: existingItem?.title ?? '',
    kind: (existingItem?.kind ?? 'tour') as BookingKind,
    date: existingItem?.date ?? target?.date ?? model.trip.startDate,
    status: (prev.status ?? 'confirmed') as Status,
    time: prev.time ?? '',
    provider: prev.provider ?? '',
    flightNumber: prev.flightNumber ?? '',
    meetingPoint: prev.meetingPoint ?? '',
    bookingRef: prev.bookingRef ?? '',
    phone: prev.phone ?? '',
    contact: prev.contact ?? '',
    notes: prev.notes ?? '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const type = target?.type ?? 'booking';

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined)) as T;
    const edit: LocalEdit = clean({ status: f.status, time: f.time, provider: f.provider, flightNumber: type === 'flight' ? f.flightNumber : '', meetingPoint: type === 'booking' ? f.meetingPoint : '', bookingRef: f.bookingRef, phone: f.phone, contact: f.contact, notes: f.notes, updatedAt: now });
    if (isNew || existingItem) {
      if (!f.title.trim()) return alert('Dê um nome para a reserva.');
      const item: LocalItem = { ...edit, id: existingItem?.id ?? `local-${Date.now().toString(36)}`, kind: f.kind, title: f.title.trim(), date: f.date, status: f.status };
      const i = localStore.items.findIndex((x) => x.id === item.id);
      if (i >= 0) localStore.items[i] = item; else localStore.items.push(item);
    } else if (splitKey) {
      const { bookingRef, phone, contact, ...shared } = edit;
      localStore.edits[target!.id] = shared;
      localStore.edits[splitKey] = clean({ bookingRef, phone, contact, updatedAt: now });
    } else {
      localStore.edits[target!.id] = edit;
    }
    if (saveOrWarn(localStore)) location.reload();
  };

  const input = 'w-full rounded-xl border border-line bg-paper px-3 py-2 text-[16px] outline-none focus:border-ink-3';
  const label = 'block text-[12px] font-medium text-ink-3';
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="pb-safe max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">{isNew ? 'Nova reserva' : existingItem ? 'Editar reserva' : 'Atualizar reserva'}</div>
            <div className="font-display text-[21px] leading-tight">{isNew ? 'Adicionar ao roteiro' : target!.title}</div>
            {target?.missing && <div className="mt-1 text-[12.5px] text-ink-3">Falta: {target.missing.join(' · ')}</div>}
          </div>
          <button type="button" onClick={onClose} className="tap p-1 text-ink-3" aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          {(isNew || existingItem) && (
            <>
              <label className={label}>Nome<input className={input} value={f.title} onChange={set('title')} placeholder="Ex.: Cooking class Gioan" required /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className={label}>Tipo
                  <select className={input} value={f.kind} onChange={set('kind')}>{KINDS.map((k) => <option key={k} value={k}>{BOOKING_LABEL[k]}</option>)}</select>
                </label>
                <label className={label}>Dia
                  <select className={input} value={f.date} onChange={set('date')}>{model.days.map((d) => <option key={d.date} value={d.date}>{fmtWeekdayShort(d.date)}, {fmtDayMonthShort(d.date)}</option>)}</select>
                </label>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Situação
              <select className={input} value={f.status} onChange={set('status')}>
                <option value="confirmed">Reservado</option>
                <option value="pending">Ainda falta</option>
                <option value="suggestion">Só ideia</option>
              </select>
            </label>
            <label className={label}>{type === 'hotel' ? 'Check-in a partir de' : type === 'flight' ? 'Partida (hora local)' : 'Horário'}<input type="time" className={input} value={f.time} onChange={set('time')} /></label>
          </div>
          {type === 'flight' && <label className={label}>Nº do voo<input className={input} value={f.flightNumber} onChange={set('flightNumber')} placeholder="Ex.: VJ 123" /></label>}
          {type !== 'hotel' && <label className={label}>{type === 'flight' ? 'Companhia' : 'Empresa / operadora'}<input className={input} value={f.provider} onChange={set('provider')} /></label>}
          {type === 'booking' && <label className={label}>Ponto de encontro<input className={input} value={f.meetingPoint} onChange={set('meetingPoint')} placeholder="Ex.: buscam no hotel" /></label>}
          {splitKey && <p className="rounded-xl bg-paper px-3 py-2 text-[12px] text-ink-2">Código, telefone e contato ficam como reserva de <b>{viewerName()}</b>. Horário e observações valem para todos.</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Código / localizador<input className={input} value={f.bookingRef} onChange={set('bookingRef')} autoCapitalize="characters" /></label>
            <label className={label}>Telefone / WhatsApp<input type="tel" className={input} value={f.phone} onChange={set('phone')} /></label>
          </div>
          <label className={label}>Contato<input className={input} value={f.contact} onChange={set('contact')} placeholder="Nome do guia, e-mail…" /></label>
          <label className={label}>Observações<textarea className={`${input} min-h-[72px]`} value={f.notes} onChange={set('notes')} /></label>
        </div>
        <button className="tap mt-5 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-paper">Salvar no app</button>
        <p className="mt-2 text-center text-[11.5px] text-ink-3">Fica salvo neste celular e funciona offline. Depois, compartilhe com o grupo.</p>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------ group sync */

const PREFIX = 'OVT1.';
const encode = (env: Envelope) => PREFIX + btoa(JSON.stringify(env)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decode = (code: string): Envelope => {
  const b = code.trim().replace(/^.*?OVT1\./s, '').split(/\s/)[0].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b + '='.repeat((4 - (b.length % 4)) % 4)));
};
const PENDING = 'ovt:sync-pending';

function GroupSync() {
  const { state, passphrase } = usePrivate();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string>();
  const [busy, setBusy] = useState(false);

  // A shared link (…#sync=OVT1.xxx) was opened: keep it until the app is unlocked.
  useEffect(() => {
    const m = location.hash.match(/sync=(OVT1\.[\w-]+)/);
    if (m) { sessionStorage.setItem(PENDING, m[1]); history.replaceState(null, '', location.pathname + location.search); }
    const p = sessionStorage.getItem(PENDING);
    if (p) setCode(p);
  }, []);

  const share = async () => {
    if (!passphrase) return;
    setBusy(true);
    const c = encode(await encryptJSON(localStore, passphrase));
    const text = `Atualização do Our Vietnam Trip ✈️\nAbra o app (pelo ícone na tela de início) → Reservas → A fazer → Importar e cole o código:\n\n${c}`;
    setBusy(false);
    const copy = async () => {
      try { await navigator.clipboard.writeText(text); setMsg('Copiado! Cole no WhatsApp do grupo.'); }
      catch { setCode(c); setMsg('Copie o código do campo abaixo e mande no WhatsApp.'); }
    };
    try {
      if (navigator.share) await navigator.share({ title: 'Our Vietnam Trip', text });
      else await copy();
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') await copy(); // e.g. iPhone refusing after the slow encryption
    }
  };

  const importCode = async () => {
    if (!passphrase) return;
    setBusy(true);
    try {
      const incoming = await decryptJSON<typeof localStore>(decode(code), passphrase);
      const { store, changed } = mergeLocal(localStore, incoming);
      if (!saveOrWarn(store)) { setBusy(false); return; }
      sessionStorage.removeItem(PENDING);
      setMsg(changed ? `${changed} alteração(ões) importada(s).` : 'Nada novo — você já tinha tudo.');
      if (changed) setTimeout(() => location.reload(), 900);
    } catch {
      setMsg('Código inválido ou de outra senha.');
    }
    setBusy(false);
  };

  return (
    <section className="card mx-4 p-4">
      <div className="font-medium">Compartilhar com o grupo</div>
      <p className="mt-0.5 text-[12.5px] text-ink-3">Envie as alterações deste celular para os outros dois (criptografado com a senha da viagem), ou importe as deles.</p>
      {state !== 'unlocked' ? (
        <p className="mt-2 text-[12.5px] text-lacquer">Desbloqueie os códigos acima com a senha da viagem para compartilhar ou importar.</p>
      ) : (
        <>
          <button disabled={busy || !hasLocalChanges(localStore)} onClick={share} className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-[14px] font-semibold text-paper disabled:opacity-40">
            <Send size={15} /> {hasLocalChanges(localStore) ? 'Enviar minhas alterações' : 'Nenhuma alteração para enviar'}
          </button>
          <div className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Colar código OVT1.…" className="min-w-0 flex-1 rounded-full border border-line bg-paper px-3 py-2 text-[16px]" />
            <button disabled={busy || !code.includes('OVT1.')} onClick={importCode} className="tap flex items-center gap-1.5 rounded-full bg-paper-2 px-3 text-[13px] font-semibold disabled:opacity-40"><ClipboardPaste size={14} /> Importar</button>
          </div>
        </>
      )}
      {msg && <p className="mt-2 text-[12.5px] text-jade">{msg}</p>}
      <p className="mt-3 text-[11.5px] text-ink-3">Para deixar fixo no app de todos (inclusive em celular novo), envie o mesmo código para quem publica o app.</p>
    </section>
  );
}
