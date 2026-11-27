import { describe, expect, it } from 'vitest';
import { balances, equalShares, parseAmount, settleUp, toVnd, type Row } from '../src/expenses/logic';

const exp = (id: string, paidBy: 'ana' | 'leo' | 'sam', amount: number, who: ('ana' | 'leo' | 'sam')[], currency: 'VND' | 'BRL' = 'VND', rate = 1): Row => ({
  id, kind: 'expense', deleted: false, client_updated_at: '2027-11-22T00:00:00Z',
  data: { description: id, amount, currency, rateToVnd: rate, paidBy, shares: equalShares(toVnd(amount, rate), who), splitMode: 'equal', category: 'Comida', date: '2027-11-22' },
});

describe('expense split', () => {
  it('equal shares add up exactly to the total', () => {
    const s = equalShares(100_000, ['ana', 'leo', 'sam']);
    expect(Object.values(s).reduce((a, b) => a! + b!, 0)).toBe(100_000);
    expect(s).toEqual({ ana: 33_334, leo: 33_333, sam: 33_333 });
  });

  it('computes balances and the fewest transfers', () => {
    const rows = [
      exp('jantar', 'ana', 900_000, ['ana', 'leo', 'sam']), // each 300k
      exp('grab', 'sam', 300_000, ['ana', 'leo', 'sam']), // each 100k
      exp('spa-casal', 'leo', 800_000, ['ana', 'leo']), // only the couple
    ];
    const b = balances(rows);
    expect(b.total).toBe(2_000_000);
    expect(b.net).toEqual({ ana: 900_000 - 300_000 - 100_000 - 400_000, leo: 800_000 - 300_000 - 100_000 - 400_000, sam: 300_000 - 300_000 - 100_000 });
    expect(Object.values(b.net).reduce((a, c) => a + c, 0)).toBe(0);
    expect(settleUp(b.net)).toEqual([{ from: 'sam', to: 'ana', amount: 100_000 }]);
  });

  it('settlements and deletions change the balance', () => {
    const rows: Row[] = [
      exp('hotel', 'ana', 3_000_000, ['ana', 'leo', 'sam']),
      { ...exp('apagado', 'sam', 999_000, ['ana']), deleted: true },
      { id: 's1', kind: 'settlement', deleted: false, client_updated_at: '2027-11-23T00:00:00Z', data: { from: 'sam', to: 'ana', amount: 1_000_000, currency: 'VND', rateToVnd: 1, date: '2027-11-23' } },
    ];
    const b = balances(rows);
    expect(b.net.sam).toBe(0);
    expect(settleUp(b.net)).toEqual([{ from: 'leo', to: 'ana', amount: 1_000_000 }]);
  });

  it('converts other currencies with the rate saved on the expense', () => {
    const b = balances([exp('jantar-real', 'leo', 150, ['leo', 'sam'], 'BRL', 4_700)]);
    expect(b.total).toBe(705_000);
    expect(b.net.sam).toBe(-352_500);
  });

  it('reads amounts the way people type them', () => {
    expect(parseAmount('450.000', 'VND')).toBe(450_000);
    expect(parseAmount('450000', 'VND')).toBe(450_000);
    expect(parseAmount('12,50', 'BRL')).toBe(12.5);
    expect(parseAmount('1.234,56', 'BRL')).toBe(1234.56);
    expect(parseAmount('12.5', 'USD')).toBe(12.5);
    expect(Number.isNaN(parseAmount('', 'VND'))).toBe(true);
    // review findings: thousands dot in reais/dollars, US format, junk
    expect(parseAmount('1.500', 'BRL')).toBe(1500);
    expect(parseAmount('1.000', 'BRL')).toBe(1000);
    expect(parseAmount('1.234.567', 'BRL')).toBe(1234567);
    expect(parseAmount('1,234.56', 'USD')).toBe(1234.56);
    expect(parseAmount('1,500', 'USD')).toBe(1500);
    expect(parseAmount('12,5', 'BRL')).toBe(12.5);
    expect(parseAmount('1.50', 'USD')).toBe(1.5);
    for (const bad of ['1e3', '-50', 'abc', '1..2', '1.2.3,4.5']) expect(Number.isNaN(parseAmount(bad, 'BRL'))).toBe(true);
    expect(Number.isNaN(parseAmount('12a', 'VND'))).toBe(true);
  });
});

describe('bad data never breaks the balances', () => {
  it('skips malformed rows', async () => {
    const { isValidRow } = await import('../src/expenses/logic');
    const bad = [null, {}, { id: 'x', kind: 'expense', client_updated_at: 't', data: {} }, { id: 'y', kind: 'expense', client_updated_at: 't', data: { description: 'a', amount: 'mil', rateToVnd: 1, paidBy: 'ana', shares: {}, date: 'd' } }, { id: 'z', kind: 'expense', client_updated_at: 't', data: { description: 'a', amount: 1, rateToVnd: 1, paidBy: 'hacker', shares: {}, date: 'd' } }];
    expect(bad.map(isValidRow)).toEqual([false, false, false, false, false]);
    expect(() => balances(bad as unknown as Row[])).not.toThrow();
    expect(balances(bad as unknown as Row[]).total).toBe(0);
  });
});
