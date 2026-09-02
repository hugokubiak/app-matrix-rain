import { describe, it, expect } from 'vitest';
import { createScramble, stepScramble, renderScramble, type ScrambleState } from './scramble.js';

function advance(state: ScrambleState, ticks: number): ScrambleState {
  let current: ScrambleState | null = state;
  for (let i = 0; i < ticks; i += 1) {
    if (current === null) throw new Error('scramble ended before the requested tick count');
    current = stepScramble(current);
  }
  if (current === null) throw new Error('scramble ended before the requested tick count');
  return current;
}

describe('createScramble', () => {
  it('pre-reveals spaces and nothing else', () => {
    const state = createScramble('ab c');
    expect(state.revealed).toEqual([false, false, true, false]);
    expect(state.ticksElapsed).toBe(0);
  });
});

describe('stepScramble', () => {
  it('locks in one more character every two ticks', () => {
    const start = createScramble('abcd');
    expect(advance(start, 2).revealed).toEqual([true, false, false, false]);
    expect(advance(start, 4).revealed).toEqual([true, true, false, false]);
  });

  it('reveals the whole target once enough ticks have passed', () => {
    expect(advance(createScramble('abcd'), 8).revealed.every(Boolean)).toBe(true);
  });

  it('returns null after the target has been held for a while', () => {
    let current: ScrambleState | null = createScramble('ab');
    let steps = 0;
    while (current !== null && steps < 500) {
      current = stepScramble(current);
      steps += 1;
    }
    expect(current).toBeNull();
    expect(steps).toBeGreaterThan(2);
  });
});

describe('renderScramble', () => {
  it('shows revealed characters verbatim and noise for the rest', () => {
    const out = renderScramble(advance(createScramble('abcd'), 4), ['X']);
    expect(out[0]).toBe('a');
    expect(out[1]).toBe('b');
    expect(out.slice(2)).toBe('XX');
  });

  it('keeps spaces intact', () => {
    expect(renderScramble(createScramble('a b'), ['X'])).toBe('X X');
  });

  it('keeps the target length', () => {
    expect(renderScramble(createScramble('neo'), ['0', '1'])).toHaveLength(3);
  });
});
