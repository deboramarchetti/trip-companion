import { describe, expect, it } from 'vitest';
import { accessKey, decryptBytes, encryptBytes, isDocsKey } from '../src/docs/docs';

const key = 'a'.repeat(64);
describe('documents are end-to-end encrypted', () => {
  it('round-trips bytes and never stores plaintext', async () => {
    const bytes = new TextEncoder().encode('PASSAPORTE FW000000 – teste');
    const { iv, data } = await encryptBytes(key, bytes);
    expect(atob(data)).not.toContain('PASSAPORTE');
    expect(new TextDecoder().decode(await decryptBytes(key, iv, data))).toBe('PASSAPORTE FW000000 – teste');
    await expect(decryptBytes('b'.repeat(64), iv, data)).rejects.toBeTruthy();
  });
  it('handles a large file (6 MB)', async () => {
    const big = new Uint8Array(6_000_000).map((_, i) => i % 251);
    const { iv, data } = await encryptBytes(key, big);
    const back = await decryptBytes(key, iv, data);
    expect(back.length).toBe(big.length);
    expect(back[123456]).toBe(big[123456]);
  });
  it('the server token is a hash, not the key', async () => {
    const t = await accessKey(key);
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(t).not.toBe(key);
    expect(isDocsKey(key)).toBe(true);
    expect(isDocsKey('xyz')).toBe(false);
  });
});

describe('documents included in the app', () => {
  it('each included file decrypts to a real PDF with the party key (when private data is available)', async () => {
    const { existsSync, readFileSync } = await import('node:fs');
    if (!existsSync('private/private.json')) return;
    const priv = JSON.parse(readFileSync('private/private.json', 'utf8'));
    for (const party of ['couple', 'sam']) {
      const entry = priv[`__docs@${party}`];
      for (const s of entry.seed ?? []) {
        const data = readFileSync(`public/seed-docs/${s.id}.txt`, 'utf8').trim();
        expect(atob(data)).not.toContain('%PDF');
        const bytes = await decryptBytes(entry.docsKey, s.iv, data);
        expect(bytes.length).toBe(s.size);
        expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
        // the other party's key cannot open it
        const other = priv[`__docs@${party === 'couple' ? 'sam' : 'couple'}`].docsKey;
        await expect(decryptBytes(other, s.iv, data)).rejects.toBeTruthy();
      }
    }
  });
});
