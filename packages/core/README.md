# app-matrix-rain (core)

Not built yet, scaffold only. Roadmap lives in the [root README](../../README.md).

Vanilla TS core of the effect. Renders to `<canvas>`, animated with GSAP.

## Planned API

```ts
interface MatrixRainConfig {
  charset: 'latin' | 'katakana' | 'cyrillic' | 'thai' | 'arabic' | 'runic' | 'binary' | 'hex' | 'code';
  direction?: 'ltr' | 'rtl'; // auto-derived from charset if omitted (arabic -> rtl)
  fontSize?: number;
  speed?: number;
  density?: number;
  color?: string;
  backgroundColor?: string;
  glitchOnHover?: boolean;
  respectReducedMotion?: boolean; // true by default
}

class MatrixRain {
  constructor(container: HTMLElement, config?: Partial<MatrixRainConfig>);
  start(): void;
  stop(): void;
  updateConfig(config: Partial<MatrixRainConfig>): void;
  scrambleText(text: string): void;
  destroy(): void;
}
```

## Adding a charset

Each script gets its own file in `src/charsets/`:

1. Add `src/charsets/<name>.ts` exporting the character list.
2. Register it in `src/charsets/index.ts`.
3. RTL script? Wire the default direction in `src/direction.ts`.
