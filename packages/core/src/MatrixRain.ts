import type { MatrixRainConfig } from './config.js';

// TODO: MVP, canvas rendering driven by gsap.ticker, latin charset, basic config.
export class MatrixRain {
  constructor(_container: HTMLElement, _config?: Partial<MatrixRainConfig>) {
    throw new Error('Not implemented');
  }

  start(): void {
    throw new Error('Not implemented');
  }

  stop(): void {
    throw new Error('Not implemented');
  }

  updateConfig(_config: Partial<MatrixRainConfig>): void {
    throw new Error('Not implemented');
  }

  scrambleText(_text: string): void {
    throw new Error('Not implemented');
  }

  destroy(): void {
    throw new Error('Not implemented');
  }
}
