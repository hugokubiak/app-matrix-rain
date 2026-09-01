import type { MatrixRainConfig } from '../config.js';
import { glitchInfluence, type GlitchState } from './glitch.js';

const INITIAL_OFFSET_ROWS = 100;

export interface RainState {
  drops: number[];
}

export function createRainState(width: number, fontSize: number): RainState {
  const columns = Math.max(1, Math.floor(width / fontSize));
  return {
    drops: Array.from({ length: columns }, () => Math.random() * -INITIAL_OFFSET_ROWS),
  };
}

export function stepRain(
  ctx: CanvasRenderingContext2D,
  state: RainState,
  chars: string[],
  config: MatrixRainConfig,
  width: number,
  height: number,
  glitch: GlitchState | null = null,
): void {
  const fontSize = config.fontSize ?? 16;
  const density = config.density ?? 1;
  const hue = hueOf(config.color ?? '#00ff41');

  ctx.globalAlpha = config.fadeOpacity ?? 0.08;
  ctx.fillStyle = config.backgroundColor ?? '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  ctx.font = `${fontSize}px monospace`;

  const rtl = config.direction === 'rtl';

  state.drops = state.drops.map((drop, i) => {
    const x = rtl ? width - (i + 1) * fontSize : i * fontSize;
    const y = drop * fontSize;
    const influence = glitchInfluence(glitch, x, y);
    const jitter = influence > 0 ? (Math.random() - 0.5) * influence * fontSize : 0;

    ctx.fillStyle = influence > 0.4 ? '#ffffff' : `hsl(${hue}, 100%, 75%)`;
    ctx.fillText(chars[Math.floor(Math.random() * chars.length)] ?? '', x + jitter, y);

    if (Math.random() > 1 - 0.02 * density) {
      ctx.fillStyle = influence > 0.4 ? '#ffffff' : `hsl(${hue}, 100%, 45%)`;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)] ?? '', x + jitter, y - fontSize);
    }

    if (y > height && Math.random() > 1 - 0.025 * density) {
      return 0;
    }
    return drop + 1;
  });
}

function hueOf(color: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  const hex = match?.[1];
  if (!hex) return 120;

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 120;

  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}
