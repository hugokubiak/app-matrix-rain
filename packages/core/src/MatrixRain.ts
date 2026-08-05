import gsap from 'gsap';
import { resolveConfig, type MatrixRainConfig } from './config.js';
import { CHARSETS } from './charsets/index.js';
import { createRainState, stepRain, type RainState } from './animation/rain.js';

export class MatrixRain {
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private config: MatrixRainConfig;
  private state: RainState;
  private running = false;
  private accumulatorMs = 0;
  private readonly onResize = (): void => this.resize();
  private readonly onTick = (_time: number, deltaTimeMs: number): void => this.tick(deltaTimeMs);

  constructor(container: HTMLElement, config?: Partial<MatrixRainConfig>) {
    this.container = container;
    this.config = resolveConfig(config);

    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('app-matrix-rain: canvas 2d context unavailable');
    }
    this.ctx = ctx;

    this.resize();
    this.state = createRainState(this.canvas.width, this.config.fontSize ?? 16);

    window.addEventListener('resize', this.onResize);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this.onTick);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    gsap.ticker.remove(this.onTick);
  }

  updateConfig(config: Partial<MatrixRainConfig>): void {
    this.config = resolveConfig({ ...this.config, ...config });
    this.state = createRainState(this.canvas.width, this.config.fontSize ?? 16);
  }

  scrambleText(_text: string): void {
    throw new Error('Not implemented');
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }

  private resize(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  private tick(deltaTimeMs: number): void {
    const stepsPerSecond = 25 * (this.config.speed ?? 1);
    const intervalMs = 1000 / stepsPerSecond;

    this.accumulatorMs += deltaTimeMs;
    if (this.accumulatorMs < intervalMs) return;
    this.accumulatorMs %= intervalMs;

    const chars = CHARSETS[this.config.charset];
    stepRain(this.ctx, this.state, chars, this.config, this.canvas.width, this.canvas.height);
  }
}
