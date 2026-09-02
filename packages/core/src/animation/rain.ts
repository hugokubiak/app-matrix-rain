import type { MatrixRainConfig } from '../config.js';
import { glitchInfluence, type GlitchState } from './glitch.js';

// emilyxxie/green_rain (sketch.js) ported to gsap.ticker, then wired back to
// MatrixRainConfig. Structure follows the original: 14px cell, fadeInterval 1.6,
// speeds 5..22 px/frame, switchInterval 2..25, start offset -2000..0, the greens
// rgba(140,255,170) / rgba(0,255,70). The ground is cleared opaque every frame,
// so the trail is the stream's own head->tail opacity ramp, no ghosting.
//
// Config hooks: fontSize -> cell size (speeds and the start offset scale with
// it), speed -> fall multiplier, density -> stream length, color -> the two
// greens (head is the body colour lifted toward white), backgroundColor -> the
// ground, direction -> RTL mirroring, charset -> glyph set.

export const SYMBOL_SIZE = 14;
const FADE_INTERVAL = 1.6;
const REF_CELL = 14;
const HEAD_LIFT = 140 / 255; // 0 -> 140, matching green_rain's rgba(140,255,170)

interface RainSymbol {
  x: number;
  y: number;
  glyph: number; // index into the active charset
  speed: number; // px per frame before the config.speed multiplier
  first: boolean;
  opacity: number;
  switchInterval: number;
}

interface RainStream {
  symbols: RainSymbol[];
  totalSymbols: number;
  speed: number;
}

export interface RainState {
  streams: RainStream[];
  frameCount: number;
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randIndex(count: number): number {
  return Math.floor(Math.random() * count);
}

function generateSymbols(stream: RainStream, x: number, startY: number, cell: number): void {
  let opacity = 255;
  let first = Math.round(random(0, 4)) === 1;
  let y = startY;
  for (let i = 0; i <= stream.totalSymbols; i += 1) {
    stream.symbols.push({
      x,
      y,
      glyph: 0,
      speed: stream.speed,
      first,
      opacity,
      switchInterval: Math.max(1, Math.round(random(2, 25))),
    });
    opacity -= 255 / stream.totalSymbols / FADE_INTERVAL;
    y -= cell;
    first = false;
  }
}

export function createRainState(width: number, fontSize = SYMBOL_SIZE, density = 1): RainState {
  const cell = fontSize;
  const cellRatio = cell / REF_CELL;
  const streams: RainStream[] = [];
  let x = 0;
  for (let i = 0; i <= width / cell; i += 1) {
    const stream: RainStream = {
      symbols: [],
      totalSymbols: Math.max(1, Math.round(random(5, 35) * density)),
      speed: random(5, 22) * cellRatio,
    };
    generateSymbols(stream, x, random(-2000, 0) * cellRatio, cell);
    streams.push(stream);
    x += cell;
  }
  return { streams, frameCount: 0 };
}

// The non-loop half of the original setup(): ground fill + font + baseline.
export function primeCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MatrixRainConfig,
): void {
  ctx.fillStyle = config.backgroundColor ?? '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${config.fontSize ?? SYMBOL_SIZE}px Consolas, ui-monospace, monospace`;
  ctx.textBaseline = 'alphabetic';
}

// The original draw().
export function stepRain(
  ctx: CanvasRenderingContext2D,
  state: RainState,
  chars: string[],
  config: MatrixRainConfig,
  width: number,
  height: number,
  glitch: GlitchState | null = null,
): void {
  const cell = config.fontSize ?? SYMBOL_SIZE;
  const speedMul = config.speed ?? 1;
  const rtl = config.direction === 'rtl';
  const glyphCount = Math.max(1, chars.length);
  const [br, bg, bb] = channels(config.color ?? '#00ff41');
  const [hr, hg, hb] = lift(br, bg, bb);

  ctx.fillStyle = config.backgroundColor ?? '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${cell}px Consolas, ui-monospace, monospace`;

  for (const stream of state.streams) {
    for (const symbol of stream.symbols) {
      const alpha = Math.max(symbol.opacity, 0) / 255;
      const drawX = rtl ? width - cell - symbol.x : symbol.x;
      const influence = glitchInfluence(glitch, drawX, symbol.y);
      const jitter = influence > 0 ? (Math.random() - 0.5) * influence * cell : 0;

      if (influence > 0.4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else if (symbol.first) {
        ctx.fillStyle = `rgba(${hr}, ${hg}, ${hb}, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${br}, ${bg}, ${bb}, ${alpha})`;
      }

      ctx.fillText(chars[symbol.glyph] ?? '', drawX + jitter, symbol.y);

      symbol.y = symbol.y >= height ? 0 : symbol.y + symbol.speed * speedMul;
      if (state.frameCount % symbol.switchInterval === 0) {
        symbol.glyph = randIndex(glyphCount);
      }
    }
  }

  state.frameCount += 1;
}

function channels(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return [0, 255, 70]; // green_rain's body green
  return [parseInt(match[1] ?? '00', 16), parseInt(match[2] ?? 'ff', 16), parseInt(match[3] ?? '46', 16)];
}

function lift(r: number, g: number, b: number): [number, number, number] {
  const up = (c: number): number => Math.round(c + (255 - c) * HEAD_LIFT);
  return [up(r), up(g), up(b)];
}
