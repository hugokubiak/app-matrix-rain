import { describe, it, expect } from 'vitest';
import { defaultDirectionFor } from './direction.js';
import { CHARSETS, type CharsetKey } from './charsets/index.js';

describe('defaultDirectionFor', () => {
  it('returns rtl for arabic', () => {
    expect(defaultDirectionFor('arabic')).toBe('rtl');
  });

  it('returns ltr for every non-arabic charset', () => {
    const others = (Object.keys(CHARSETS) as CharsetKey[]).filter((key) => key !== 'arabic');
    for (const key of others) {
      expect(defaultDirectionFor(key)).toBe('ltr');
    }
  });
});
