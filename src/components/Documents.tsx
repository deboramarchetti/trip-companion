import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CloudUpload, FileText, Image as ImageIcon, Loader2, Plus, Share2, Trash2, X } from 'lucide-react';
import { PEOPLE, personName, type PersonId } from '../expenses/logic';
import { addDocument, hiddenSeeds, hideSeed, isDocsKey, localDocs, openDocument, openSeedDocument, prepareFile, removeDocument, syncDocuments, type StoredDoc } from '../docs/docs';
import { usePrivate } from '../state/privateData';
import { partyMembers } from '../lib/viewer';
import { PdfPages } from '../docs/PdfPages';
import { SYNC_ENABLED } from '../lib/backend';

const KINDS = ['E-visa', 'Seguro saúde', 'Vacina febre amarela (CIVP)', 'Passaporte', 'Seguro viagem', 'Outro'];
const partyPeople = (): PersonId[] => partyMembers();
const fmtSize = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

/** Documentos: visa, insurance, vaccine… encrypted on the phone, synced, available offline. */
export function Documents() {
  const { state, docsKey, seedDocs } = usePrivate();
  const [hidden, setHidden] = useState(hiddenSeeds);
  const key = isDocsKey(docsKey) ? docsKey : undefined;
  const [docs, setDocs] = useState<StoredDoc[]>([]);
  const [status, setStatus] = useState<'idle' | 'sync' | 'ok' | 'offline' | 'error' | 'local'>(SYNC_ENABLED ? 'idle' : 'local');
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<{ doc: StoredDoc; url: string; blob: Blob }>();
  const [err, setErr] = useState<string>();
  const [pdfFailed, setPdfFailed] = useState(false);
  const onPdfError = useCallback(() => setPdfFailed(true), []);

  const refresh = useCallback(async () => { try { setDocs(await localDocs()); } catch { setErr('Este navegador não permite guardar documentos (modo privado?).'); } }, []);
  const doSync = useCallback(async () => {
    if (!key || !SYNC_ENABLED) return;
    if (!navigator.onLine) { setStatus('offline'); return; }
    setStatus('sync');
    try { await syncDocuments(key); setStatus('ok'); } catch { setStatus('error'); }
    refresh();
  }, [key, refresh]);
  useEffect(() => { refresh(); doSync(); }, [refresh, doSync]);

  if (state !== 'unlocked') return <p className="mx-5 text-[13.5px] text-ink-3">Desbloqueie com a senha da viagem (acima) para ver os documentos.</p>;
  if (!key) return <p className="mx-5 text-[13.5px] text-ink-3">Documentos ainda não configurados para esta visão.</p>;

  const seedIds = new Set(seedDocs.map((x) => x.id));
  const open = async (d: StoredDoc) => {
    try {
      const seed = seedDocs.find((x) => x.id === d.id);
      const blob = seed ? await openSeedDocument(key, seed) : await openDocument(key, d.id);
      setPdfFailed(false);
      setViewing({ doc: d, blob, url: URL.createObjectURL(blob) });
    } catch (e) { setErr((e as Error).message); }
  };
  const share = async (v: { doc: StoredDoc; blob: Blob }) => {
    const ext = v.doc.mime === 'application/pdf' ? 'pdf' : 'jpg';
    const file = new File([v.blob], `${v.doc.title}${v.doc.shared ? '' : ` - ${personName(v.doc.owner)}`}.${ext}`.replace(/[\/\\?%*:|"<>→]/g, '-'), { type: v.doc.mime });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: v.doc.title });
      else window.open(URL.createObjectURL(v.blob), '_blank');
    } catch { /* cancelled */ }
  };
  const included: StoredDoc[] = seedDocs.filter((x) => !hidden.includes(x.id) && !docs.some((d) => d.id === x.id)).map((x) => ({ ...x, data: 'seed' }));
  const mine = [...included, ...docs].filter((d) => partyPeople().includes(d.owner));

  return (
    <div className="space-y-4">
      <div className="mx-5 flex items-center justify-between text-[12.5px] text-ink-3">
        <span>Criptografados no celular · abrem sem internet</span>
        <button onClick={doSync} className="tap flex items-center gap-1">
          {status === 'local' ? 'Modo local · só neste celular' : status === 'sync' ? <><Loader2 size={13} className="animate-spin" /> Sincronizando</> : status === 'error' ? <><AlertTriangle size={13} className="text-lacquer" /> Sem conexão</> : status === 'offline' ? 'Offline' : <><CheckCircle2 size={13} className="text-jade" /> Em dia</>}
        </button>
      </div>
      {err && <p className="mx-5 text-[12.5px] text-lacquer">{err}</p>}

      {mine.length === 0 ? (
        <p className="mx-4 rounded-[var(--radius-card)] border border-dashed border-line px-4 py-6 text-center text-[13.5px] text-ink-3">
          Nenhum documento ainda. Adicione o e-visa, o seguro saúde e o certificado de febre amarela de cada um — foto ou PDF.
        </p>
      ) : (
        <ul className="card mx-4 divide-y divide-line">
          {[...mine.filter((d) => d.shared), ...PEOPLE.filter((p) => partyPeople().includes(p.id)).flatMap((p) => mine.filter((d) => !d.shared && d.owner === p.id))].map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => open(d)} className="tap flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-ink-2">{d.mime === 'application/pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{d.title}</span>
                  <span className="block text-[12px] text-ink-3">{d.shared ? 'Todos' : personName(d.owner)} · {fmtSize(d.size)} · {seedIds.has(d.id) ? 'incluído no app' : d.pending === 'upload' ? 'a enviar' : d.data ? 'salvo neste celular' : 'baixando…'}</span>
                </span>
              </button>
              {d.pending === 'upload' && <CloudUpload size={16} className="shrink-0 text-gold" aria-label="A enviar" />}
            </li>
          ))}
        </ul>
      )}

      <div className="px-4">
        <button onClick={() => setAdding(true)} className="tap flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-ink-3/50 py-3 text-[14px] font-semibold text-ink-2">
          <Plus size={16} /> Adicionar documento
        </button>
        <p className="mt-2 text-center text-[11.5px] text-ink-3">Na imigração, tenha também a versão impressa.</p>
      </div>

      {adding && <AddSheet onClose={() => setAdding(false)} onSave={async (meta, file) => {
        const { bytes, mime } = await prepareFile(file);
        await addDocument(key, { ...meta, id: crypto.randomUUID(), mime }, bytes);
        setAdding(false); await refresh(); doSync();
      }} />}

      {viewing && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black" onClick={() => { URL.revokeObjectURL(viewing.url); setViewing(undefined); }}>
          <div className="pt-safe flex items-center justify-between gap-3 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="min-w-0 truncate text-[14px] font-medium">{viewing.doc.title} · {viewing.doc.shared ? 'Todos' : personName(viewing.doc.owner)}</span>
            <span className="flex shrink-0 gap-2">
              <button onClick={() => share(viewing)} className="tap flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px]"><Share2 size={14} /> {viewing.doc.mime === 'application/pdf' ? 'Abrir / salvar' : 'Compartilhar'}</button>
              <button onClick={() => { URL.revokeObjectURL(viewing.url); setViewing(undefined); }} className="tap p-1" aria-label="Fechar"><X size={20} /></button>
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-2 pb-4" onClick={(e) => e.stopPropagation()}>
            {viewing.doc.mime === 'application/pdf'
              ? pdfFailed
                ? <>
                    <p className="mb-2 px-2 text-center text-[12.5px] text-white/70">Se o documento não aparecer abaixo, toque em “Abrir / salvar”.</p>
                    <iframe title={viewing.doc.title} src={viewing.url} className="h-full w-full rounded-lg bg-white" />
                  </>
                : <PdfPages blob={viewing.blob} onError={onPdfError} />
              : <img src={viewing.url} alt={viewing.doc.title} className="mx-auto max-h-full max-w-full rounded-lg object-contain" />}
          </div>
          <div className="pb-safe flex justify-center pb-4" onClick={(e) => e.stopPropagation()}>
            <DeleteButton onConfirm={async () => {
              if (seedIds.has(viewing.doc.id)) { hideSeed(viewing.doc.id); setHidden(hiddenSeeds()); }
              else { await removeDocument(viewing.doc.id); }
              URL.revokeObjectURL(viewing.url); setViewing(undefined); await refresh(); doSync();
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [sure, setSure] = useState(false);
  return sure
    ? <button onClick={onConfirm} className="tap rounded-full bg-lacquer px-4 py-2 text-[13px] font-semibold text-white">Confirmar exclusão</button>
    : <button onClick={() => setSure(true)} className="tap flex items-center gap-1.5 px-3 py-2 text-[13px] text-white/70"><Trash2 size={14} /> Excluir documento</button>;
}

function AddSheet({ onClose, onSave }: { onClose: () => void; onSave: (meta: { owner: PersonId; title: string }, file: File) => Promise<void> }) {
  const people = partyPeople();
  const [owner, setOwner] = useState<PersonId>(people[0]);
  const [title, setTitle] = useState(KINDS[0]);
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <form className="pb-safe w-full max-w-xl rounded-t-3xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file) return setError('Escolha a foto ou o PDF.');
          setBusy(true); setError(undefined);
          try { await onSave({ owner, title: title.trim().slice(0, 80) || 'Documento' }, file); } catch (x) { setError((x as Error).message); setBusy(false); }
        }}>
        <div className="mb-4 flex items-center justify-between"><div className="font-display text-[21px]">Adicionar documento</div><button type="button" onClick={onClose} className="tap p-1 text-ink-3" aria-label="Fechar"><X size={20} /></button></div>
        <div className="space-y-3">
          <div><div className="text-[12px] font-medium text-ink-3">De quem é</div>
            <div className="mt-1 flex gap-2">{people.map((p) => <button type="button" key={p} onClick={() => setOwner(p)} className={`tap flex-1 rounded-full py-2 text-[14px] font-medium ${owner === p ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2'}`}>{personName(p)}</button>)}</div>
          </div>
          <div><div className="text-[12px] font-medium text-ink-3">Documento</div>
            <div className="mt-1 flex flex-wrap gap-1.5">{KINDS.map((k) => <button type="button" key={k} onClick={() => setTitle(k)} className={`tap rounded-full px-3 py-1 text-[12.5px] ${title === k ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2'}`}>{k}</button>)}</div>
            <input className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[16px]" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Nome do documento" />
          </div>
          <input ref={input} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
          <button type="button" onClick={() => input.current?.click()} className="tap w-full rounded-xl border border-dashed border-ink-3/50 px-3 py-3 text-[14px] text-ink-2">
            {file ? `${file.name} (${fmtSize(file.size)})` : 'Escolher foto ou PDF'}
          </button>
        </div>
        {error && <p className="mt-3 text-[13px] text-lacquer">{error}</p>}
        <button disabled={busy} className="tap mt-5 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-paper disabled:opacity-50">{busy ? 'Criptografando…' : 'Salvar'}</button>
      </form>
    </div>
  );
}
