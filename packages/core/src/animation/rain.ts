import { glitchInfluence, type GlitchState } from './glitch.js';

// Verbatim port of emilyxxie/green_rain sketch.js (Coding Train "Green Rain"),
// driven by gsap.ticker instead of the p5 draw loop. Everything is fixed to the
// original: 14px cell, katakana + digit glyphs, rgba(140,255,170) / rgba(0,255,70)
// greens, the 0.588 black veil, fadeInterval 1.6, speeds 5..22, switchInterval
// 2..25, start offset -2000..0. MatrixRainConfig (charset, color, fontSize,
// density, direction, fadeOpacity, backgroundColor) does NOT affect this
// renderer. The only addition is an optional glitch overlay, fully inert unless a
// GlitchState is passed in.

export const SYMBOL_SIZE = 14;
const FADE_INTERVAL = 1.6;

interface RainSymbol {
  x: number;
  y: number;
  value: string | number;
  speed: number;
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

function setToRandomSymbol(symbol: RainSymbol, frameCount: number): void {
  const charType = Math.round(random(0, 5));
  if (frameCount % symbol.switchInterval === 0) {
    if (charType > 1) {
      symbol.value = String.fromCharCode(0x30a0 + Math.floor(random(0, 97)));
    } else {
      symbol.value = Math.floor(random(0, 10));
    }
  }
}

function generateSymbols(stream: RainStream, x: number, startY: number, frameCount: number): void {
  let opacity = 255;
  let first = Math.round(random(0, 4)) === 1;
  let y = startY;
  for (let i = 0; i <= stream.totalSymbols; i += 1) {
    const symbol: RainSymbol = {
      x,
      y,
      value: '',
      speed: stream.speed,
      first,
      opacity,
      switchInterval: Math.round(random(2, 25)),
    };
    setToRandomSymbol(symbol, frameCount);
    stream.symbols.push(symbol);
    opacity -= 255 / stream.totalSymbols / FADE_INTERVAL;
    y -= SYMBOL_SIZE;
    first = false;
  }
}

export function createRainState(width: number): RainState {
  const streams: RainStream[] = [];
  let x = 0;
  for (let i = 0; i <= width / SYMBOL_SIZE; i += 1) {
    const stream: RainStream = {
      symbols: [],
      totalSymbols: Math.round(random(5, 35)),
      speed: random(5, 22),
    };
    generateSymbols(stream, x, random(-2000, 0), 0);
    streams.push(stream);
    x += SYMBOL_SIZE;
  }
  return { streams, frameCount: 0 };
}

// The non-loop half of the original setup(): black fill + font + baseline.
export function primeCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${SYMBOL_SIZE}px Consolas, monospace`;
  ctx.textBaseline = 'alphabetic';
}

// The original draw().
export function stepRain(
  ctx: CanvasRenderingContext2D,
  state: RainState,
  width: number,
  height: number,
  glitch: GlitchState | null = null,
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.588)';
  ctx.fillRect(0, 0, width, height);

  for (const stream of state.streams) {
    for (const symbol of stream.symbols) {
      const alpha = Math.max(symbol.opacity, 0) / 255;
      const influence = glitchInfluence(glitch, symbol.x, symbol.y);
      const jitter = influence > 0 ? (Math.random() - 0.5) * influence * SYMBOL_SIZE : 0;

      if (influence > 0.4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else if (symbol.first) {
        ctx.fillStyle = `rgba(140, 255, 170, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(0, 255, 70, ${alpha})`;
      }

      ctx.fillText(String(symbol.value), symbol.x + jitter, symbol.y);

      symbol.y = symbol.y >= height ? 0 : symbol.y + symbol.speed;
      setToRandomSymbol(symbol, state.frameCount);
    }
  }

  state.frameCount += 1;
}
