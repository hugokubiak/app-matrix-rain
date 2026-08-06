import gsap from 'gsap';
import { resolveConfig, type MatrixRainConfig } from './config.js';
import { CHARSETS } from './charsets/index.js';
import { createRainState, stepRain, type RainState } from './animation/rain.js';
import { decayGlitch, triggerGlitch, type GlitchState } from './animation/glitch.js';
import { createScramble, renderScramble, stepScramble, type ScrambleState } from './animation/scramble.js';

export class MatrixRain {
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private config: MatrixRainConfig;
  private state: RainState;
  private running = false;
  private accumulatorMs = 0;
  private glitch: GlitchState | null = null;
  private scramble: ScrambleState | null = null;
  private readonly onResize = (): void => this.resize();
  private readonly onTick = (_time: number, deltaTimeMs: number): void => this.tick(deltaTimeMs);
  private readonly onGlitchPointer = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.glitch = triggerGlitch(event.clientX - rect.left, event.clientY - rect.top);
  };

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
    this.syncGlitchListeners();
  }

  start(): void {
    if (this.running) return;

    if (this.config.respectReducedMotion && prefersReducedMotion()) {
      const chars = CHARSETS[this.config.charset];
      stepRain(this.ctx, this.state, chars, this.config, this.canvas.width, this.canvas.height);
      return;
    }

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
    this.syncGlitchListeners();
  }

  scrambleText(text: string): void {
    this.scramble = createScramble(text);
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('mousemove', this.onGlitchPointer);
    this.canvas.removeEventListener('click', this.onGlitchPointer);
    this.canvas.remove();
  }

  private resize(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  private syncGlitchListeners(): void {
    this.canvas.removeEventListener('mousemove', this.onGlitchPointer);
    this.canvas.removeEventListener('click', this.onGlitchPointer);
    if (this.config.glitchOnHover) {
      this.canvas.addEventListener('mousemove', this.onGlitchPointer);
      this.canvas.addEventListener('click', this.onGlitchPointer);
    }
  }

  private tick(deltaTimeMs: number): void {
    const stepsPerSecond = 25 * (this.config.speed ?? 1);
    const intervalMs = 1000 / stepsPerSecond;

    this.accumulatorMs += deltaTimeMs;
    if (this.accumulatorMs < intervalMs) return;
    this.accumulatorMs %= intervalMs;

    this.glitch = decayGlitch(this.glitch);

    const chars = CHARSETS[this.config.charset];
    stepRain(this.ctx, this.state, chars, this.config, this.canvas.width, this.canvas.height, this.glitch);

    if (this.scramble) {
      this.scramble = stepScramble(this.scramble);
      if (this.scramble) this.drawScramble(this.scramble, chars);
    }
  }

  private drawScramble(scramble: ScrambleState, noiseChars: string[]): void {
    const fontSize = (this.config.fontSize ?? 16) * 1.5;
    const text = renderScramble(scramble, noiseChars);
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;

    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const padding = fontSize;
    const textWidth = this.ctx.measureText(text).width;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(x - textWidth / 2 - padding, y - fontSize, textWidth + padding * 2, fontSize * 2);

    this.ctx.fillStyle = this.config.color ?? '#00ff41';
    this.ctx.fillText(text, x, y);

    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
