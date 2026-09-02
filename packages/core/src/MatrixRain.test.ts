// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { tickerAdd, tickerRemove } = vi.hoisted(() => ({
  tickerAdd: vi.fn(),
  tickerRemove: vi.fn(),
}));
vi.mock('gsap', () => ({
  default: { ticker: { add: tickerAdd, remove: tickerRemove } },
}));

import { MatrixRain } from './MatrixRain.js';

function stubContext(): CanvasRenderingContext2D {
  const ctx = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    fillStyle: '',
    font: '',
    globalAlpha: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

let getContext: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tickerAdd.mockClear();
  tickerRemove.mockClear();
  getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => stubContext());
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

function preferReducedMotion(matches: boolean): void {
  (window as unknown as { matchMedia: () => { matches: boolean } }).matchMedia = () => ({ matches });
}

describe('MatrixRain', () => {
  it('appends a canvas to the container', () => {
    const host = document.createElement('div');
    new MatrixRain(host);
    expect(host.querySelector('canvas')).not.toBeNull();
  });

  it('throws when the 2d context is unavailable', () => {
    getContext.mockReturnValue(null);
    expect(() => new MatrixRain(document.createElement('div'))).toThrow(/context/i);
  });

  it('start() registers exactly one ticker callback, stop() removes it', () => {
    const rain = new MatrixRain(document.createElement('div'));
    rain.start();
    rain.start();
    expect(tickerAdd).toHaveBeenCalledTimes(1);
    rain.stop();
    expect(tickerRemove).toHaveBeenCalledTimes(1);
  });

  it('does not animate when reduced motion is preferred', () => {
    preferReducedMotion(true);
    const rain = new MatrixRain(document.createElement('div'), { respectReducedMotion: true });
    rain.start();
    expect(tickerAdd).not.toHaveBeenCalled();
  });

  it('animates under reduced motion when respectReducedMotion is false', () => {
    preferReducedMotion(true);
    const rain = new MatrixRain(document.createElement('div'), { respectReducedMotion: false });
    rain.start();
    expect(tickerAdd).toHaveBeenCalledTimes(1);
  });

  it('updateConfig tolerates an unknown charset', () => {
    const rain = new MatrixRain(document.createElement('div'));
    // @ts-expect-error invalid charset on purpose
    expect(() => rain.updateConfig({ charset: 'klingon' })).not.toThrow();
  });

  it('runs a tick without throwing, glitch enabled', () => {
    const rain = new MatrixRain(document.createElement('div'), { glitchOnHover: true });
    rain.start();
    const tick = tickerAdd.mock.calls[0]?.[0] as (time: number, deltaMs: number) => void;
    expect(() => tick(0, 1000)).not.toThrow();
  });

  it('renders scramble text on the next tick without throwing', () => {
    const rain = new MatrixRain(document.createElement('div'));
    rain.start();
    rain.scrambleText('neo');
    const tick = tickerAdd.mock.calls[0]?.[0] as (time: number, deltaMs: number) => void;
    expect(() => tick(0, 1000)).not.toThrow();
  });

  it('destroy() removes the canvas and unregisters the ticker', () => {
    const host = document.createElement('div');
    const rain = new MatrixRain(host);
    rain.start();
    rain.destroy();
    expect(host.querySelector('canvas')).toBeNull();
    expect(tickerRemove).toHaveBeenCalled();
  });
});
