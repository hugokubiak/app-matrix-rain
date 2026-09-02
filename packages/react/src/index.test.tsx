// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { mockInstances, FakeCore } = vi.hoisted(() => {
  type Inst = {
    container: HTMLElement;
    config: Record<string, unknown> | undefined;
    start: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    updateConfig: ReturnType<typeof vi.fn>;
    scrambleText: ReturnType<typeof vi.fn>;
  };
  const mockInstances: Inst[] = [];
  class FakeCore {
    container: HTMLElement;
    config: Record<string, unknown> | undefined;
    start = vi.fn();
    destroy = vi.fn();
    updateConfig = vi.fn();
    scrambleText = vi.fn();
    constructor(container: HTMLElement, config?: Record<string, unknown>) {
      this.container = container;
      this.config = config;
      mockInstances.push(this);
    }
  }
  return { mockInstances, FakeCore };
});

vi.mock('app-matrix-rain', () => ({ MatrixRain: FakeCore }));

import { MatrixRain, type MatrixRainHandle } from './index.js';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockInstances.length = 0;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe('<MatrixRain /> wrapper', () => {
  it('creates the core instance and starts it on mount', async () => {
    await act(async () => root.render(<MatrixRain charset="katakana" speed={2} />));
    expect(mockInstances).toHaveLength(1);
    expect(mockInstances[0]?.container).toBeInstanceOf(HTMLElement);
    expect(mockInstances[0]?.config).toMatchObject({ charset: 'katakana', speed: 2 });
    expect(mockInstances[0]?.start).toHaveBeenCalledTimes(1);
  });

  it('strips undefined props so the core keeps its own defaults', async () => {
    await act(async () => root.render(<MatrixRain charset="latin" />));
    expect(mockInstances[0]?.config).not.toHaveProperty('speed');
    expect(mockInstances[0]?.config).not.toHaveProperty('color');
  });

  it('applies prop changes through updateConfig without remounting', async () => {
    await act(async () => root.render(<MatrixRain charset="latin" speed={1} />));
    await act(async () => root.render(<MatrixRain charset="latin" speed={5} />));
    expect(mockInstances).toHaveLength(1);
    expect(mockInstances[0]?.updateConfig).toHaveBeenLastCalledWith(expect.objectContaining({ speed: 5 }));
  });

  it('destroys the instance on unmount', async () => {
    const localHost = document.createElement('div');
    document.body.appendChild(localHost);
    const localRoot = createRoot(localHost);
    await act(async () => localRoot.render(<MatrixRain charset="latin" />));
    const instance = mockInstances[0];
    await act(async () => localRoot.unmount());
    expect(instance?.destroy).toHaveBeenCalledTimes(1);
    localHost.remove();
  });

  it('forwards scrambleText through the ref', async () => {
    const ref = createRef<MatrixRainHandle>();
    await act(async () => root.render(<MatrixRain ref={ref} charset="latin" />));
    ref.current?.scrambleText('wake up');
    expect(mockInstances[0]?.scrambleText).toHaveBeenCalledWith('wake up');
  });
});
