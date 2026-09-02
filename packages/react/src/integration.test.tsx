// @vitest-environment jsdom
//
// Integration: the React wrapper mounted on the REAL core class (app-matrix-rain
// is NOT mocked here) rendering to a canvas. Only gsap's ticker is faked so the
// frame loop can be pumped by hand, and the 2d context is a spy.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { tickerAdd, tickerRemove, tickerFps } = vi.hoisted(() => ({
  tickerAdd: vi.fn(),
  tickerRemove: vi.fn(),
  tickerFps: vi.fn(),
}));
vi.mock('gsap', () => ({
  default: { ticker: { add: tickerAdd, remove: tickerRemove, fps: tickerFps } },
}));

import { MatrixRain, type MatrixRainHandle } from './index.js';

function fakeCtx(): CanvasRenderingContext2D {
  return {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 12 })),
    fillStyle: '',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;
}

let ctx: CanvasRenderingContext2D;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  tickerAdd.mockClear();
  tickerRemove.mockClear();
  ctx = fakeCtx();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

function pumpFrame(deltaMs = 1000): void {
  const cb = tickerAdd.mock.calls.at(-1)?.[0] as ((time: number, delta: number) => void) | undefined;
  if (!cb) throw new Error('ticker callback was never registered');
  cb(0, deltaMs);
}

describe('<MatrixRain /> on the real core', () => {
  it('mounts a real canvas and paints it through the real stepRain', async () => {
    await act(async () => root.render(<MatrixRain charset="latin" />));
    expect(host.querySelector('canvas')).toBeInstanceOf(HTMLCanvasElement);

    pumpFrame();
    expect(ctx.fillRect).toHaveBeenCalled(); // ground clear
    expect(ctx.fillText).toHaveBeenCalled(); // glyphs drawn
  });

  it('applies a prop change through the real updateConfig without remounting', async () => {
    await act(async () => root.render(<MatrixRain charset="latin" speed={1} />));
    const canvas = host.querySelector('canvas');
    await act(async () => root.render(<MatrixRain charset="katakana" speed={3} />));

    expect(host.querySelectorAll('canvas')).toHaveLength(1);
    expect(host.querySelector('canvas')).toBe(canvas);
    expect(() => pumpFrame()).not.toThrow();
  });

  it('runs the real scramble easter egg through the ref', async () => {
    const ref = createRef<MatrixRainHandle>();
    await act(async () => root.render(<MatrixRain ref={ref} charset="latin" />));

    (ctx.measureText as unknown as ReturnType<typeof vi.fn>).mockClear();
    ref.current?.scrambleText('wake up');
    pumpFrame();
    expect(ctx.measureText).toHaveBeenCalled(); // drawScramble measures its text
  });

  it('tears the real instance down on unmount', async () => {
    await act(async () => root.render(<MatrixRain charset="latin" />));
    expect(host.querySelector('canvas')).not.toBeNull();

    await act(async () => root.unmount());
    expect(host.querySelector('canvas')).toBeNull();
    expect(tickerRemove).toHaveBeenCalled();
    root = createRoot(host); // keep the afterEach unmount harmless
  });
});
