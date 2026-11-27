import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Eye, Info } from 'lucide-react';
import { Cover } from '../components/Cover';
import { Segmented } from '../components/ui';
import {
  CityCard, DidYouKnow, Expand, GdpBar, InfoCard, PhraseCard, RegionCompare, SectionHeader, SourceRef, StatCard, Timeline, formatStat,
} from '../components/guide/GuideUI';
import {
  beliefs, cities, coffee, didYouKnow, economy, etiquette, food, gdpPerCapitaExplainer, headline, history, intro, keyFacts, lifeQuality,
  phrases, practical, regions, reviewedAt, sections, sources, street, type FoodRegion, type SectionId,
} from '../data/guide';

const SCROLL_MT = 'scroll-mt-[calc(60px+env(safe-area-inset-top))]';

/** Vietnã 101 — editorial mini-guide. All content is local (works offline). */
export function Guide() {
  const [active, setActive] = useState<SectionId>(sections[0].id);
  const chips = useRef<Record<string, HTMLButtonElement | null>>({});

  // Highlight the chip of the section being read: the last section whose top passed under the chip bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const bar = document.querySelector('nav[aria-label="Seções do guia"]')?.getBoundingClientRect().bottom ?? 0;
      let current: SectionId = sections[0].id;
      for (const s of sections) { const el = document.getElementById(s.id); if (el && el.getBoundingClientRect().top <= bar + 24) current = s.id; }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => { chips.current[active]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }, [active]);
  const go = (id: SectionId) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="pb-28">
      {/* Hero */}
      <Cover hue={8} seed="vietna-101" className="h-[52vh] max-h-[460px] min-h-[340px]">
        <div className="pt-safe flex h-full flex-col justify-end px-5 pb-6 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">All you need to know</div>
          <h1 className="mt-1 font-display text-[44px] font-normal leading-none">Vietnã 101</h1>
          <p className="mt-2 text-[16px] text-white/90">Tudo que vale a pena saber sobre o país</p>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-white/85">{intro.hero}</p>
        </div>
      </Cover>

      {/* Big numbers */}
      <div className="relative z-10 mx-4 -mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-paper/10 shadow-[var(--shadow-lift)]">
        {headline.map((s) => (
          <div key={s.id} className="bg-ink px-4 py-3.5 text-paper">
            <div className="font-display text-[28px] leading-none">{formatStat(s)}</div>
            <div className="mt-1 text-[12px] leading-snug text-paper/75">{s.label}</div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-wider text-paper/50">{s.period}</div>
          </div>
        ))}
      </div>

      {/* Category chips */}
      <nav className="pt-safe sticky top-0 z-30 mt-6 border-b border-line/70 bg-paper/95 backdrop-blur-xl" aria-label="Seções do guia">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
          {sections.map((s) => (
            <button key={s.id} ref={(el) => { chips.current[s.id] = el; }} onClick={() => go(s.id)} aria-current={active === s.id ? 'true' : undefined}
              className={`tap shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${active === s.id ? 'bg-ink text-paper' : 'bg-card text-ink-2 shadow-sm'}`}>
              {s.chip}
            </button>
          ))}
        </div>
      </nav>

      {/* 1 — numbers */}
      <section id="numeros" className={`pt-8 ${SCROLL_MT}`}>
        <SectionHeader id="numeros" eyebrow="01 · O Vietnã em números" title="Um retrato rápido" lead={intro.lead} />
        <div className="grid grid-cols-2 gap-2.5 px-4">
          {keyFacts.map((s) => <StatCard key={s.id} s={s} />)}
        </div>
        <div className="mx-4 mt-3 card px-4 py-1">
          <Expand summary={<span className="inline-flex items-center gap-2"><Info size={16} className="text-gold" aria-hidden />{gdpPerCapitaExplainer.title}</span>}>
            {gdpPerCapitaExplainer.body.map((p) => <p key={p} className="mb-2">{p}</p>)}
          </Expand>
        </div>
      </section>

      {/* 2 — economy */}
      <section id="economia" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="economia" eyebrow="02 · A transformação econômica" title={economy.title} />
        <div className="mx-5 space-y-2 border-l-2 border-lacquer pl-4 text-[15px] leading-relaxed text-ink-2">
          {economy.story.map((p) => <p key={p}>{p}</p>)}
        </div>
        <h3 className="mb-2 mt-6 px-5 text-[13px] font-semibold uppercase tracking-wider text-ink-3">Os cinco motores</h3>
        <div className="space-y-2.5 px-4">
          {economy.engines.map((e, i) => <InfoCard key={e.title} index={i + 1} title={e.title} text={e.text} />)}
        </div>
        <div className="mt-4 px-4"><GdpBar {...economy.gdpShares} /></div>
        <div className="mt-3 grid grid-cols-1 gap-2.5 px-4 min-[380px]:grid-cols-2">
          {economy.facts.map((s) => <StatCard key={s.id} s={s} />)}
        </div>
        <div className="mx-4 mt-3"><DidYouKnow label="Oportunidade e risco">{economy.vulnerability}</DidYouKnow></div>
      </section>

      {/* 3 — quality of life */}
      <section id="vida" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="vida" eyebrow="03 · Pobreza e qualidade de vida" title={lifeQuality.title} lead={lifeQuality.intro} />
        <div className="space-y-2.5 px-4">
          {lifeQuality.indicators.map((s) => <StatCard key={s.id} s={s} />)}
        </div>
        <div className="mx-4 mt-3 card p-4">
          <div className="text-[13px] font-semibold uppercase tracking-wider text-jade">Avanços relevantes</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lifeQuality.progress.map((p) => <span key={p} className="rounded-full bg-jade-soft px-3 py-1 text-[13px] text-jade">{p}</span>)}
          </div>
          <div className="mt-4 text-[13px] font-semibold uppercase tracking-wider text-lacquer">Desafios</div>
          <ul className="mt-1 divide-y divide-line">
            {lifeQuality.challenges.map((c) => (
              <li key={c.title} className="py-2.5 text-[13.5px] leading-snug"><b className="text-ink">{c.title}.</b> <span className="text-ink-2">{c.text}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — history */}
      <section id="historia" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="historia" eyebrow="04 · História" title={history.title} lead="Toque nos marcos com seta para aprofundar." />
        <Timeline events={history.events} />
        <div className="mx-4 mt-5 card p-4">
          <div className="text-[13px] font-semibold uppercase tracking-wider text-ink-3">Como o país é governado</div>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{history.politics}</p>
        </div>
      </section>

      {/* 5 — beliefs */}
      <section id="crencas" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="crencas" eyebrow="05 · Religião, crenças e valores" title={beliefs.title} lead={beliefs.intro} />
        <div className="grid grid-cols-1 gap-2.5 px-4 min-[380px]:grid-cols-2">
          {beliefs.cards.map((c) => <InfoCard key={c.title} title={c.title} text={c.text} />)}
        </div>
        <div className="mx-4 mt-3"><DidYouKnow label="Repare">{beliefs.curiosity}</DidYouKnow></div>
        <div className="px-5"><SourceRef id={beliefs.sourceId} /></div>
      </section>

      {/* 6 — street life */}
      <section id="ruas" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="ruas" eyebrow="06 · A vida nas ruas" title="A cidade acontece na calçada" lead="Deslize para ver os oito temas." />
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {street.cards.map((c, i) => (
            <div key={c.title} className="card w-[76%] max-w-[300px] shrink-0 snap-start p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{String(i + 1).padStart(2, '0')} / {street.cards.length}</div>
              <div className="mt-1 font-display text-[20px] leading-snug">{c.title}</div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mx-4 mt-3 rounded-[var(--radius-card)] bg-ink p-4 text-paper">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-paper/70"><Eye size={15} aria-hidden /> O que observar hoje</div>
          <ul className="space-y-2 text-[14px] leading-snug">
            {street.observe.map((q) => <li key={q} className="flex gap-2"><span className="text-gold" aria-hidden>→</span>{q}</li>)}
          </ul>
        </div>
      </section>

      {/* 7 — coffee */}
      <section id="cafe" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="cafe" eyebrow="07 · Café: o outro gigante mundial" title={coffee.title} />
        <ul className="mx-4 card divide-y divide-line px-4">
          {coffee.facts.map((f) => <li key={f} className="py-2.5 text-[14px] leading-snug text-ink-2">{f}</li>)}
        </ul>
        <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {coffee.drinks.map((d) => (
            <div key={d.name} className="w-[70%] max-w-[260px] shrink-0 snap-start rounded-[var(--radius-card)] bg-[#3b2a20] p-4 text-[#f6ead9] shadow-[var(--shadow-card)]">
              <div lang="vi" className="font-display text-[21px] leading-tight">{d.name}</div>
              <div className="mt-0.5 text-[12.5px] text-[#e6c9a8]">{d.pt}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#f6ead9]/90">{d.text}</p>
            </div>
          ))}
        </div>
        <div className="mx-4 mt-2"><DidYouKnow label="Contexto">{coffee.culture}</DidYouKnow></div>
        <div className="px-5"><SourceRef id={coffee.sourceId} /></div>
      </section>

      {/* 8 — food */}
      <FoodSection />

      {/* 9 — regions */}
      <section id="regioes" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="regioes" eyebrow="09 · Norte, Centro e Sul" title={regions.title} lead="Escolha um aspecto para comparar as três regiões." />
        <RegionCompare />
      </section>

      {/* 10 — cities */}
      <section id="cidades" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="cidades" eyebrow="10 · Conheça as cidades do roteiro" title="Seis paradas, seis histórias" />
        <div className="space-y-3 px-4">{cities.map((c) => <CityCard key={c.id} c={c} />)}</div>
      </section>

      {/* 11 — etiquette */}
      <section id="etiqueta" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="etiqueta" eyebrow="11 · Costumes e etiqueta" title={etiquette.title} />
        <div className="grid grid-cols-1 gap-2.5 px-4 min-[380px]:grid-cols-2">
          {etiquette.cards.map((c) => <InfoCard key={c.title} title={c.title} text={c.text} />)}
        </div>
        <div className="px-5"><SourceRef id={etiquette.sourceId} /></div>
      </section>

      {/* 12 — did you know */}
      <section id="curiosidades" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="curiosidades" eyebrow="12 · Curiosidades que surpreendem" title="Você sabia?" />
        <FactDeck />
      </section>

      {/* 13 — phrases */}
      <section id="idioma" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="idioma" eyebrow="13 · Vietnamita de sobrevivência" title="Dez frases que abrem portas" lead={phrases.note} />
        <div className="space-y-2 px-4">{phrases.list.map((p) => <PhraseCard key={p.vi} vi={p.vi} pt={p.pt} />)}</div>
      </section>

      {/* 14 — practical */}
      <section id="pratico" className={`pt-12 ${SCROLL_MT}`}>
        <SectionHeader id="pratico" eyebrow="14 · Informações práticas" title="O essencial, sem internet" />
        <dl className="mx-4 card divide-y divide-line px-4">
          {practical.rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-[13.5px]">
              <dt className="font-semibold text-ink">{r.label}</dt>
              <dd className="text-ink-2">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mx-5 mt-2 text-[12.5px] leading-snug text-ink-3">{practical.caveat}</p>
      </section>

      {/* Sources (discreet footer) */}
      <footer id="fontes" className={`mx-4 mt-12 border-t border-line pt-2 ${SCROLL_MT}`}>
        <Expand summary={<span className="text-[13px] font-medium text-ink-3">Fontes e atualização</span>}>
          <p className="text-[12.5px] text-ink-3">Conteúdo revisado em {reviewedAt}. Os números são um retrato com o período de referência indicado em cada um, não dados em tempo real, e não são atualizados automaticamente.</p>
          <ul className="mt-3 space-y-2">
            {sources.map((s) => (
              <li key={s.id} className="text-[13px] leading-snug">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-ink underline decoration-line underline-offset-2">
                  <span><b>{s.label}</b> — {s.detail}</span><ArrowUpRight size={13} className="mt-0.5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-3">Os links abrem no navegador quando houver conexão; o guia funciona sem internet.</p>
        </Expand>
      </footer>
    </div>
  );
}

function FoodSection() {
  const [region, setRegion] = useState<FoodRegion['id']>('norte');
  const r = food.regions.find((x) => x.id === region)!;
  return (
    <section id="comida" className={`pt-12 ${SCROLL_MT}`}>
      <SectionHeader id="comida" eyebrow="08 · Gastronomia por região" title="Um país, três cozinhas" lead={food.intro} />
      <div className="px-4">
        <Segmented value={region} onChange={setRegion} options={food.regions.map((x) => ({ value: x.id, label: x.name }))} />
        <p className="mt-3 px-1 text-[13.5px] italic text-ink-2">{r.profile}</p>
        <div className="mt-2 space-y-2">
          {r.dishes.map((d) => (
            <div key={d.name} className="card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <div lang="vi" className="font-display text-[20px] leading-tight">{d.name}</div>
                <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-3">{r.name}</span>
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{d.text}</p>
              {d.note && <p className="mt-1 text-[12.5px] text-ink-3">{d.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One surprising fact at a time, with previous/next. */
function FactDeck() {
  const [i, setI] = useState(0);
  const n = didYouKnow.length;
  return (
    <div className="px-4">
      <div className="rounded-[var(--radius-card)] bg-gold-soft p-5" aria-live="polite">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a5518]">Você sabia? · {i + 1} de {n}</div>
        <p className="mt-2 min-h-[4.5em] font-display text-[20px] leading-snug text-ink">{didYouKnow[i]}</p>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => setI((i - 1 + n) % n)} className="tap grid h-11 w-11 place-items-center rounded-full bg-card text-ink-2 shadow-sm" aria-label="Curiosidade anterior"><ChevronLeft size={19} aria-hidden /></button>
          <div className="flex gap-1" aria-hidden>{didYouKnow.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? 'w-4 bg-[#7a5518]' : 'w-1.5 bg-[#7a5518]/30'}`} />)}</div>
          <button type="button" onClick={() => setI((i + 1) % n)} className="tap grid h-11 w-11 place-items-center rounded-full bg-card text-ink-2 shadow-sm" aria-label="Próxima curiosidade"><ChevronRight size={19} aria-hidden /></button>
        </div>
      </div>
      <Expand summary="Ver todas as 15" className="mt-1">
        <ol className="list-decimal space-y-1.5 pl-5">{didYouKnow.map((d) => <li key={d}>{d}</li>)}</ol>
      </Expand>
    </div>
  );
}
