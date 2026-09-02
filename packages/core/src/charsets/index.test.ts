import { describe, it, expect } from 'vitest';
import { CHARSETS, type CharsetKey } from './index.js';

const KEYS: CharsetKey[] = [
  'latin',
  'katakana',
  'cyrillic',
  'thai',
  'arabic',
  'runic',
  'binary',
  'hex',
  'code',
];

describe('CHARSETS', () => {
  it('registers exactly the nine known charsets', () => {
    expect(Object.keys(CHARSETS).sort()).toEqual([...KEYS].sort());
  });

  it.each(KEYS)('%s is a non-empty list of non-empty strings', (key) => {
    const chars = CHARSETS[key];
    expect(Array.isArray(chars)).toBe(true);
    expect(chars.length).toBeGreaterThan(0);
    expect(chars.every((char) => typeof char === 'string' && char.length > 0)).toBe(true);
  });

  it('binary is only 0 and 1', () => {
    expect(CHARSETS.binary).toEqual(['0', '1']);
  });

  it('hex covers 0-9 and A-F in order', () => {
    expect(CHARSETS.hex.join('')).toBe('0123456789ABCDEF');
  });
});
