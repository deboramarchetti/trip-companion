import { describe, expect, it } from 'vitest';
import * as g from '../src/data/guide';
import { formatPct, formatStat } from '../src/components/guide/GuideUI';
import { tripData } from '../src/data/trip';

const allStats = [...g.headline, ...g.keyFacts, ...g.economy.facts, ...g.lifeQuality.indicators];

describe('Vietnã 101 content', () => {
  it('has the 14 sections, in order', () => {
    expect(g.sections.map((s) => s.id)).toEqual(['numeros', 'economia', 'vida', 'historia', 'crencas', 'ruas', 'cafe', 'comida', 'regioes', 'cidades', 'etiqueta', 'curiosidades', 'idioma', 'pratico']);
  });

  it('every numeric statistic has a reference period, and sources exist', () => {
    const ids = new Set(g.sources.map((s) => s.id));
    for (const s of allStats) {
      if (s.value !== undefined) expect(s.period, s.id).toBeTruthy();
      if (s.sourceId) expect(ids.has(s.sourceId), s.sourceId).toBe(true);
    }
    for (const id of [g.economy.gdpShares.sourceId, g.beliefs.sourceId, g.coffee.sourceId, g.etiquette.sourceId, ...g.cities.map((c) => c.sourceId).filter(Boolean)]) expect(ids.has(id!), id).toBe(true);
    // Every statistic from the national statistics office is tied to it.
    for (const s of allStats.filter((x) => x.period === '2025' && x.value !== undefined && x.id !== 'ethnic')) expect(s.sourceId, s.id).toBeTruthy();
  });

  it('sources are real https links, no duplicates', () => {
    for (const s of g.sources) expect(s.url).toMatch(/^https:\/\//);
    expect(new Set(g.sources.map((s) => s.url)).size).toBe(g.sources.length);
  });

  it('GDP composition adds up to exactly 100,00%', () => {
    const sum = g.economy.gdpShares.parts.reduce((a, p) => a + p.value, 0);
    expect(Math.round(sum * 100) / 100).toBe(100);
    expect(g.economy.gdpShares.period).toMatch(/2026/);
  });

  it('numbers are shown in Brazilian format', () => {
    expect(formatStat({ value: 102.3, decimals: 1, suffix: ' milhões' })).toBe('102,3 milhões');
    expect(formatStat({ value: 5026, prefix: 'US$ ' })).toBe('US$ 5.026');
    expect(formatStat({ value: 8.02, decimals: 2, suffix: '%' })).toBe('8,02%');
    expect(formatPct(42.97)).toBe('42,97%');
  });

  it('timeline, curiosities, phrases and cities are complete', () => {
    expect(g.history.events.length).toBeGreaterThanOrEqual(10);
    for (const y of ['1945', '1954', '1975', '1976', '1986']) expect(g.history.events.some((e) => e.when === y), y).toBe(true);
    expect(g.didYouKnow).toHaveLength(15);
    expect(g.phrases.list).toHaveLength(10);
    expect(g.cities).toHaveLength(6);
    const cityIds = new Set(tripData.cities.map((c) => c.id));
    for (const c of g.cities) expect(cityIds.has(c.cityId), c.cityId).toBe(true);
    for (const col of g.regions.columns) for (const a of g.regions.aspects) expect(col.values[a.id], `${col.id}.${a.id}`).toBeTruthy();
  });

  it('is a general guide: no personal data or private trip details', () => {
    const text = JSON.stringify(g);
    for (const t of tripData.trip.travelers ?? []) expect(text, t.name).not.toMatch(new RegExp(`\\b${t.name}\\b`));
    expect(text).not.toMatch(/dieta|alerg/i);
  });
});
