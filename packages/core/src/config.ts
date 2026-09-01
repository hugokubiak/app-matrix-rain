import { CHARSETS, type CharsetKey } from './charsets/index.js';
import { defaultDirectionFor } from './direction.js';

export type Direction = 'ltr' | 'rtl';

export interface MatrixRainConfig {
  charset: CharsetKey;
  direction?: Direction; // auto-derived from charset if omitted (arabic -> rtl)
  fontSize?: number;
  speed?: number;
  density?: number;
  color?: string;
  backgroundColor?: string;
  glitchOnHover?: boolean;
  fadeOpacity?: number;
  respectReducedMotion?: boolean;
}

export const DEFAULT_CONFIG = {
  charset: 'latin',
  fontSize: 16,
  speed: 1,
  density: 1,
  color: '#00ff41',
  backgroundColor: '#000000',
  glitchOnHover: false,
  fadeOpacity: 0.08,
  respectReducedMotion: true,
} as const satisfies Omit<MatrixRainConfig, 'direction'>;

export function resolveConfig(config: Partial<MatrixRainConfig> = {}): MatrixRainConfig {
  const charset: CharsetKey = config.charset && config.charset in CHARSETS ? config.charset : DEFAULT_CONFIG.charset;

  return {
    ...DEFAULT_CONFIG,
    ...config,
    charset,
    direction: config.direction ?? defaultDirectionFor(charset),
    speed: clamp(config.speed ?? DEFAULT_CONFIG.speed, 0.1, 10),
    density: clamp(config.density ?? DEFAULT_CONFIG.density, 0.1, 5),
    fadeOpacity: clamp(config.fadeOpacity ?? DEFAULT_CONFIG.fadeOpacity, 0, 1),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
