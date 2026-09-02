import { describe, it, expect, vi } from 'vitest';
import { createRainState, primeCanvas, stepRain, SYMBOL_SIZE } from './rain.js';

function ctxStub(): CanvasRenderingContext2D {
  return {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    fillStyle: '',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;
}

describe('createRainState', () => {
  it('lays one stream every SYMBOL_SIZE px across the width, plus the trailing <= column', () => {
    const state = createRainState(280); // 280 / 14 = 20 -> i in 0..20 -> 21 streams
    expect(state.streams).toHaveLength(21);
    expect(state.frameCount).toBe(0);
  });

  it('keeps a stream for a zero-width canvas', () => {
    expect(createRainState(0).streams).toHaveLength(1);
  });

  it('gives each stream totalSymbols in 5..35 and totalSymbols + 1 symbols', () => {
    for (const stream of createRainState(560).streams) {
      expect(stream.totalSymbols).toBeGreaterThanOrEqual(5);
      expect(stream.totalSymbols).toBeLessThanOrEqual(35);
      expect(stream.symbols).toHaveLength(stream.totalSymbols + 1);
    }
  });

  it('fades opacity from 255 at the head down the column', () => {
    const stream = createRainState(14).streams[0];
    if (!stream) throw new Error('expected a stream');
    expect(stream.symbols[0]?.opacity).toBe(255);
    const opacities = stream.symbols.map((s) => s.opacity);
    for (let i = 1; i < opacities.length; i += 1) {
      expect(opacities[i] ?? 0).toBeLessThan(opacities[i - 1] ?? 0);
    }
  });

  it('shares one speed across a stream and gives every symbol a starting value', () => {
    for (const stream of createRainState(280).streams) {
      expect(stream.speed).toBeGreaterThanOrEqual(5);
      expect(stream.speed).toBeLessThanOrEqual(22);
      for (const sym of stream.symbols) {
        expect(sym.speed).toBe(stream.speed);
        expect(sym.value).not.toBe('');
        expect(sym.switchInterval).toBeGreaterThanOrEqual(2);
        expect(sym.switchInterval).toBeLessThanOrEqual(25);
      }
    }
  });

  it('marks at most one symbol per stream as the head', () => {
    for (const stream of createRainState(560).streams) {
      expect(stream.symbols.filter((s) => s.first).length).toBeLessThanOrEqual(1);
    }
  });
});

describe('stepRain', () => {
  it('drops each symbol by its speed and bumps the frame count', () => {
    const state = createRainState(56);
    const sym = state.streams[0]?.symbols[0];
    if (!sym) throw new Error('expected a symbol');
    sym.y = 0;
    const { speed } = sym;
    stepRain(ctxStub(), state, 56, 400);
    expect(sym.y).toBeCloseTo(speed);
    expect(state.frameCount).toBe(1);
  });

  it('wraps a symbol to the top once it reaches the bottom edge', () => {
    const state = createRainState(56);
    const sym = state.streams[0]?.symbols[0];
    if (!sym) throw new Error('expected a symbol');
    sym.y = 500;
    stepRain(ctxStub(), state, 56, 400);
    expect(sym.y).toBe(0);
  });

  it('re-rolls a symbol value on its switchInterval', () => {
    const state = createRainState(14);
    const sym = state.streams[0]?.symbols[0];
    if (!sym) throw new Error('expected a symbol');
    sym.switchInterval = 1;
    sym.value = 'Z';
    stepRain(ctxStub(), state, 14, 400); // frameCount 0 -> 0 % 1 === 0
    expect(sym.value).not.toBe('Z');
  });

  it('does not throw with a glitch overlay active', () => {
    const state = createRainState(84);
    const glitch = { x: 20, y: 50, radius: 100, strength: 0.8 };
    expect(() => stepRain(ctxStub(), state, 84, 400, glitch)).not.toThrow();
  });
});

describe('primeCanvas', () => {
  it('paints the ground black and sets the 14px monospace font', () => {
    const ctx = ctxStub();
    primeCanvas(ctx, 100, 50);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 50);
    expect(ctx.font).toBe(`${SYMBOL_SIZE}px Consolas, monospace`);
    expect(ctx.textBaseline).toBe('alphabetic');
  });
});
