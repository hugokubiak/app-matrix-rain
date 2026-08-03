import type { CharsetKey } from './charsets/index.js';

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
  fadeOpacity: 0.05,
  respectReducedMotion: true,
} as const satisfies Omit<MatrixRainConfig, 'direction'>;

// TODO: validate/normalize a Partial<MatrixRainConfig> against DEFAULT_CONFIG
// (clamp numeric ranges, validate charset key, derive direction from charset).
export function resolveConfig(_config?: Partial<MatrixRainConfig>): MatrixRainConfig {
  throw new Error('Not implemented');
}
