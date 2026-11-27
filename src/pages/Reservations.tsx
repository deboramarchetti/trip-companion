import { useEffect, useState } from 'react';
import { Bed, KeyRound, Lock, Plane, Ticket, Unlock } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { model } from '../data';
import { BookingCard, FlightCard, HotelCard } from '../components/Reservations';
import { EmptyState, Segmented } from '../components/ui';
import { TodoPanel, todoCounts } from '../components/Todo';
import { ViewerSwitch } from '../components/ViewerGate';
import { Documents } from '../components/Documents';
import { usePrivate } from '../state/privateData';

type Tab = 'all' | 'todo' | 'docs' | 'flights' | 'hotels' | 'bookings';

export function Reservations() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) ?? 'all';
  const setTab = (v: Tab) => setParams((p) => { v === 'all' ? p.delete('tab') : p.set('tab', v); return p; }, { replace: true });
  const show = (t: Tab) => tab === 'all' || tab === t;
  useEffect(() => { if (location.hash.includes('sync=') && tab !== 'todo') setTab('todo'); }, []); // eslint-disable-line

  const flights = [...model.flights].sort((a, b) => (a.departDate + (a.departTime ?? '')).localeCompare(b.departDate + (b.departTime ?? '')));
  const hotels = [...model.hotels].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const bookings = [...model.bookings].sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));

  return (
    <div className="pt-safe pb-8">
      <header className="px-5 pb-4 pt-6">
        <div className="eyebrow mb-1">Central de informações</div>
        <h1 className="text-[32px] font-normal leading-tight">Reservas</h1>
        <div className="mt-1"><ViewerSwitch /></div>
        <div className="mt-4">
          <Segmented<Tab> value={tab} onChange={setTab} options={[
            { value: 'all', label: 'Tudo' }, { value: 'todo', label: `A fazer${todoCounts().toBook ? ` (${todoCounts().toBook})` : ''}` }, { value: 'docs', label: 'Documentos' }, { value: 'flights', label: 'Voos' }, { value: 'hotels', label: 'Hotéis' }, { value: 'bookings', label: 'Passeios' },
          ]} />
        </div>
      </header>

      <UnlockCard />

      {tab === 'todo' && <div className="mt-6"><TodoPanel /></div>}
      {tab === 'docs' && <div className="mt-6"><Documents /></div>}
      {tab === 'all' && <TodoSummary onOpen={() => setTab('todo')} />}

      {show('flights') && (
        <Section title="Voos" count={flights.length}>
          {flights.length ? flights.map((f) => <FlightCard key={f.id} flight={f} />) : <EmptyState icon={Plane} title="Nenhum voo ainda">Serão importados do roteiro.</EmptyState>}
        </Section>
      )}
      {show('hotels') && (
        <Section title="Hotéis" count={hotels.length}>
          {hotels.length ? hotels.map((h) => <HotelCard key={h.id} hotel={h} />) : <EmptyState icon={Bed} title="Nenhum hotel ainda">Serão importados do roteiro.</EmptyState>}
        </Section>
      )}
      {show('bookings') && (
        <Section title="Transportes e passeios" count={bookings.length}>
          {bookings.length ? bookings.map((b) => <BookingCard key={b.id} booking={b} />) : <EmptyState icon={Ticket} title="Nenhuma reserva ainda">Transfers, trens, barcos e passeios aparecerão aqui.</EmptyState>}
        </Section>
      )}
      <p className="mx-5 mt-8 text-center text-[11.5px] text-ink-3">Todos os horários estão no horário local de cada lugar.</p>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-baseline gap-2 px-5 text-[22px] font-normal">
        {title} {count > 0 && <span className="font-sans text-[13px] text-ink-3">{count}</span>}
      </h2>
      <div className={count ? 'space-y-3 px-4' : ''}>{children}</div>
    </section>
  );
}

function UnlockCard() {
  const { state, unlock, lock } = usePrivate();
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const { hash } = useLocation();
  useEffect(() => { if (hash === '#unlock' || hash.startsWith('#codes')) setTimeout(() => document.getElementById(hash.slice(1).split('=')[0])?.scrollIntoView({ behavior: 'smooth' }), 50); }, [hash]);

  if (state === 'none' || state === 'opening') return null;
  if (state === 'unlocked') {
    return (
      <div className="mx-5 flex items-center justify-between rounded-2xl bg-jade-soft px-4 py-2.5 text-[13px] text-jade">
        <span className="flex items-center gap-2"><Unlock size={14} aria-hidden /> Códigos de reserva visíveis neste aparelho</span>
        <button onClick={lock} className="font-semibold">Bloquear</button>
      </div>
    );
  }
  return (
    <form
      id="unlock"
      className="card mx-5 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await unlock(pass.trim());
        setBusy(false);
        setError(!ok);
        if (ok) setPass('');
      }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-ink-2"><Lock size={18} aria-hidden /></div>
        <div className="text-[13.5px]">
          <div className="font-medium">Códigos protegidos</div>
          <div className="text-ink-3">Digite a senha da viagem uma vez para ver localizadores, bilhetes e contatos. Fica salva só neste celular e funciona offline.</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3">
          <KeyRound size={14} className="text-ink-3" aria-hidden />
          <input type="password" autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Senha da viagem"
            className="w-full bg-transparent py-2 text-[16px] outline-none" aria-label="Senha da viagem" />
        </label>
        <button disabled={!pass || busy} className="tap rounded-full bg-ink px-4 text-[13px] font-semibold text-paper disabled:opacity-40">{busy ? '…' : 'Abrir'}</button>
      </div>
      {error && <div className="mt-2 text-[12.5px] text-lacquer">Senha incorreta.</div>}
    </form>
  );
}

function TodoSummary({ onOpen }: { onOpen: () => void }) {
  const c = todoCounts();
  if (!c.toBook && !c.missing) return null;
  return (
    <button onClick={onOpen} className="tap card mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-center gap-3 p-4 text-left">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white ${c.urgent ? 'bg-lacquer' : 'bg-gold'}`}>{c.toBook}</span>
      <span className="min-w-0 flex-1 text-[13.5px]">
        <span className="block font-semibold">A fazer antes da viagem</span>
        <span className="block text-ink-3">{c.toBook} para reservar{c.urgent ? ` (${c.urgent} urgente)` : ''} · {c.missing} com dados faltando</span>
      </span>
      <span className="text-[13px] font-semibold text-lacquer">Ver</span>
    </button>
  );
}
