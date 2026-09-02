import { describe, it, expect, vi } from 'vitest';
import { createRainState, primeCanvas, stepRain, SYMBOL_SIZE } from './rain.js';
import type { MatrixRainConfig } from '../config.js';

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

const cfg: MatrixRainConfig = {
  charset: 'katakana',
  direction: 'ltr',
  fontSize: 14,
  speed: 1,
  density: 1,
  color: '#00ff41',
  backgroundColor: '#000000',
  glitchOnHover: false,
  respectReducedMotion: true,
};

describe('createRainState', () => {
  it('lays one stream per cell across the width plus the trailing <= column', () => {
    const state = createRainState(280, 14, 1); // 280 / 14 = 20 -> i in 0..20 -> 21
    expect(state.streams).toHaveLength(21);
    expect(state.frameCount).toBe(0);
  });

  it('keeps a stream for a zero-width canvas', () => {
    expect(createRainState(0, 14, 1).streams).toHaveLength(1);
  });

  it('gives each stream totalSymbols + 1 symbols and a shared speed', () => {
    for (const stream of createRainState(560, 14, 1).streams) {
      expect(stream.symbols).toHaveLength(stream.totalSymbols + 1);
      for (const sym of stream.symbols) {
        expect(sym.speed).toBe(stream.speed);
        expect(sym.switchInterval).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('fades opacity from 255 at the head down the column', () => {
    const stream = createRainState(14, 14, 1).streams[0];
    if (!stream) throw new Error('expected a stream');
    expect(stream.symbols[0]?.opacity).toBe(255);
    const opacities = stream.symbols.map((s) => s.opacity);
    for (let i = 1; i < opacities.length; i += 1) {
      expect(opacities[i] ?? 0).toBeLessThan(opacities[i - 1] ?? 0);
    }
  });

  it('scales the symbol count with density', () => {
    const avg = (width: number, density: number): number => {
      const streams = createRainState(width, 14, density).streams;
      return streams.reduce((sum, s) => sum + s.symbols.length, 0) / streams.length;
    };
    expect(avg(560, 3)).toBeGreaterThan(avg(560, 0.3));
  });

  it('scales stream speed with the cell size', () => {
    const maxSpeed = (fontSize: number): number =>
      Math.max(...createRainState(2000, fontSize, 1).streams.map((s) => s.speed));
    expect(maxSpeed(28)).toBeGreaterThan(maxSpeed(14));
  });
});

describe('stepRain', () => {
  it('drops each symbol by speed * config.speed and bumps the frame count', () => {
    const state = createRainState(56, 14, 1);
    const sym = state.streams[0]?.symbols[0];
    if (!sym) throw new Error('expected a symbol');
    sym.y = 0;
    const base = sym.speed;
    stepRain(ctxStub(), state, ['ア'], { ...cfg, speed: 2 }, 56, 400, null);
    expect(sym.y).toBeCloseTo(base * 2);
    expect(state.frameCount).toBe(1);
  });

  it('wraps a symbol to the top once it reaches the bottom edge', () => {
    const state = createRainState(56, 14, 1);
    const sym = state.streams[0]?.symbols[0];
    if (!sym) throw new Error('expected a symbol');
    sym.y = 500;
    stepRain(ctxStub(), state, ['ア'], cfg, 56, 400, null);
    expect(sym.y).toBe(0);
  });

  it('re-rolls a glyph index on its switchInterval', () => {
    const state = createRainState(14, 14, 1);
    const stream = state.streams[0];
    if (!stream) throw new Error('expected a stream');
    for (const sym of stream.symbols) {
      sym.switchInterval = 1;
      sym.glyph = 0;
    }
    stepRain(ctxStub(), state, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], cfg, 14, 400, null);
    expect(stream.symbols.some((s) => s.glyph !== 0)).toBe(true);
  });

  it('mirrors column x for rtl', () => {
    const firstDrawnX = (direction: 'ltr' | 'rtl'): number | undefined => {
      const state = createRainState(56, 14, 1);
      const ctx = ctxStub();
      const xs: number[] = [];
      (ctx.fillText as unknown as ReturnType<typeof vi.fn>).mockImplementation((_t: string, x: number) => {
        xs.push(x);
      });
      stepRain(ctx, state, ['ア'], { ...cfg, direction }, 56, 400, null);
      return xs[0];
    };
    expect(firstDrawnX('ltr')).toBe(0);
    expect(firstDrawnX('rtl')).toBe(56 - 14);
  });

  it('does not throw with a glitch overlay active', () => {
    const state = createRainState(84, 14, 1);
    const glitch = { x: 20, y: 50, radius: 100, strength: 0.8 };
    expect(() => stepRain(ctxStub(), state, ['a', 'b'], cfg, 84, 400, glitch)).not.toThrow();
  });
});

describe('primeCanvas', () => {
  it('paints the configured ground and font', () => {
    const ctx = ctxStub();
    primeCanvas(ctx, 100, 50, { ...cfg, backgroundColor: '#101010', fontSize: 20 });
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 50);
    expect(ctx.fillStyle).toBe('#101010');
    expect(ctx.font).toBe('20px Consolas, ui-monospace, monospace');
  });

  it('falls back to the green_rain defaults', () => {
    const ctx = ctxStub();
    primeCanvas(ctx, 10, 10, { ...cfg, fontSize: undefined, backgroundColor: undefined });
    expect(ctx.fillStyle).toBe('#000000');
    expect(ctx.font).toBe(`${SYMBOL_SIZE}px Consolas, ui-monospace, monospace`);
  });
});
