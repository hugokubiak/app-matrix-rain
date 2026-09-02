import { describe, it, expect } from 'vitest';
import { triggerGlitch, decayGlitch, glitchInfluence } from './glitch.js';

describe('triggerGlitch', () => {
  it('starts at full strength with the given position and radius', () => {
    expect(triggerGlitch(10, 20, 50)).toEqual({ x: 10, y: 20, radius: 50, strength: 1 });
  });

  it('uses a default radius when none is given', () => {
    expect(triggerGlitch(0, 0).radius).toBeGreaterThan(0);
  });
});

describe('decayGlitch', () => {
  it('returns null when passed null', () => {
    expect(decayGlitch(null)).toBeNull();
  });

  it('lowers strength by a fixed step each call', () => {
    expect(decayGlitch(triggerGlitch(0, 0))?.strength).toBeCloseTo(0.94);
  });

  it('returns null once the strength runs out', () => {
    let glitch: ReturnType<typeof decayGlitch> = triggerGlitch(0, 0);
    for (let i = 0; i < 100 && glitch !== null; i += 1) {
      glitch = decayGlitch(glitch);
    }
    expect(glitch).toBeNull();
  });
});

describe('glitchInfluence', () => {
  it('is 0 without a glitch', () => {
    expect(glitchInfluence(null, 5, 5)).toBe(0);
  });

  it('is 0 outside the radius', () => {
    expect(glitchInfluence(triggerGlitch(0, 0, 100), 200, 0)).toBe(0);
  });

  it('is strongest at the centre and fades to nothing at the edge', () => {
    const glitch = triggerGlitch(0, 0, 100);
    expect(glitchInfluence(glitch, 0, 0)).toBe(1);
    expect(glitchInfluence(glitch, 50, 0)).toBeCloseTo(0.5);
    expect(glitchInfluence(glitch, 100, 0)).toBe(0);
  });

  it('scales with the remaining strength', () => {
    expect(glitchInfluence({ x: 0, y: 0, radius: 100, strength: 0.5 }, 0, 0)).toBe(0.5);
  });
});
