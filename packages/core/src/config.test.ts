import { describe, it, expect } from 'vitest';
import { resolveConfig, DEFAULT_CONFIG } from './config.js';

describe('resolveConfig', () => {
  it('returns the defaults when called with no argument', () => {
    const cfg = resolveConfig();
    expect(cfg.charset).toBe('latin');
    expect(cfg.speed).toBe(DEFAULT_CONFIG.speed);
    expect(cfg.density).toBe(DEFAULT_CONFIG.density);
    expect(cfg.color).toBe(DEFAULT_CONFIG.color);
    expect(cfg.direction).toBe('ltr');
  });

  it('falls back to latin for an unknown charset', () => {
    // @ts-expect-error deliberately passing an invalid charset key
    expect(resolveConfig({ charset: 'klingon' }).charset).toBe('latin');
  });

  it('derives rtl direction from the arabic charset', () => {
    expect(resolveConfig({ charset: 'arabic' }).direction).toBe('rtl');
  });

  it('keeps an explicit direction over the charset default', () => {
    expect(resolveConfig({ charset: 'arabic', direction: 'ltr' }).direction).toBe('ltr');
  });

  it('clamps speed to [0.1, 10]', () => {
    expect(resolveConfig({ speed: 0 }).speed).toBe(0.1);
    expect(resolveConfig({ speed: 999 }).speed).toBe(10);
  });

  it('clamps density to [0.1, 5]', () => {
    expect(resolveConfig({ density: 0 }).density).toBe(0.1);
    expect(resolveConfig({ density: 42 }).density).toBe(5);
  });

  it('passes through custom values inside the allowed range', () => {
    const cfg = resolveConfig({ speed: 2.5, density: 3, color: '#ff0000', fontSize: 24 });
    expect(cfg.speed).toBe(2.5);
    expect(cfg.density).toBe(3);
    expect(cfg.color).toBe('#ff0000');
    expect(cfg.fontSize).toBe(24);
  });
});
