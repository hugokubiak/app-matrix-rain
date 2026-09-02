// Live control panel for the demo: charset select, direction, font size, speed,
// density, colors, glitch toggle, reduced-motion toggle, scramble text field.
// Vanilla DOM, no framework. Emits the full panel state on every change; the caller
// maps it to a MatrixRainConfig patch.
import type { CharsetKey } from 'app-matrix-rain';

export type DirectionMode = 'auto' | 'ltr' | 'rtl';

export interface ControlsState {
  charset: CharsetKey;
  directionMode: DirectionMode;
  fontSize: number;
  speed: number;
  density: number;
  color: string;
  backgroundColor: string;
  glitchOnHover: boolean;
  respectReducedMotion: boolean;
}

export interface CreateControlsOptions {
  initial: ControlsState;
  onChange(state: ControlsState): void;
  onScramble(text: string): void;
}

export interface ControlsHandle {
  element: HTMLElement;
  destroy(): void;
}

const CHARSET_KEYS: readonly CharsetKey[] = [
  'latin',
  'katakana',
  'cyrillic',
  'thai',
  'arabic',
  'runic',
  'binary',
  'hex',
  'code',
];

const DIRECTION_MODES: readonly DirectionMode[] = ['auto', 'ltr', 'rtl'];

export function createControls(options: CreateControlsOptions): ControlsHandle {
  const state: ControlsState = { ...options.initial };
  const emit = (): void => options.onChange({ ...state });

  const panel = document.createElement('form');
  panel.className = 'controls';
  panel.setAttribute('autocomplete', 'off');
  panel.addEventListener('submit', (event) => event.preventDefault());

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'controls__toggle';
  header.textContent = 'controls';
  const body = document.createElement('div');
  body.className = 'controls__body';
  header.addEventListener('click', () => body.toggleAttribute('hidden'));
  panel.append(header, body);

  const charset = selectField('charset', CHARSET_KEYS, state.charset, (value) => {
    state.charset = value as CharsetKey;
    emit();
  });

  const direction = selectField('direction', DIRECTION_MODES, state.directionMode, (value) => {
    state.directionMode = value as DirectionMode;
    emit();
  });

  const fontSize = rangeField('font size', { min: 8, max: 40, step: 1 }, state.fontSize, (value) => {
    state.fontSize = value;
    emit();
  });

  const speed = rangeField('speed', { min: 0.1, max: 10, step: 0.1 }, state.speed, (value) => {
    state.speed = value;
    emit();
  });

  const density = rangeField('density', { min: 0.1, max: 5, step: 0.1 }, state.density, (value) => {
    state.density = value;
    emit();
  });

  const color = colorField('color', state.color, (value) => {
    state.color = value;
    emit();
  });

  const backgroundColor = colorField('background', state.backgroundColor, (value) => {
    state.backgroundColor = value;
    emit();
  });

  const glitch = checkboxField('glitch on hover/click', state.glitchOnHover, (value) => {
    state.glitchOnHover = value;
    emit();
  });

  const reducedMotion = checkboxField('respect reduced motion', state.respectReducedMotion, (value) => {
    state.respectReducedMotion = value;
    emit();
  });

  body.append(
    charset,
    direction,
    fontSize,
    speed,
    density,
    color,
    backgroundColor,
    glitch,
    reducedMotion,
    scrambleField((text) => options.onScramble(text)),
  );

  document.body.appendChild(panel);

  return {
    element: panel,
    destroy: () => panel.remove(),
  };
}

function field(labelText: string): { row: HTMLLabelElement; label: HTMLSpanElement } {
  const row = document.createElement('label');
  row.className = 'controls__row';
  const label = document.createElement('span');
  label.className = 'controls__label';
  label.textContent = labelText;
  row.appendChild(label);
  return { row, label };
}

function selectField(
  labelText: string,
  values: readonly string[],
  current: string,
  onInput: (value: string) => void,
): HTMLLabelElement {
  const { row } = field(labelText);
  const select = document.createElement('select');
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    if (value === current) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener('change', () => onInput(select.value));
  row.appendChild(select);
  return row;
}

function rangeField(
  labelText: string,
  bounds: { min: number; max: number; step: number },
  current: number,
  onInput: (value: number) => void,
): HTMLLabelElement {
  const { row } = field(labelText);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(bounds.min);
  input.max = String(bounds.max);
  input.step = String(bounds.step);
  input.value = String(current);

  const output = document.createElement('output');
  output.className = 'controls__value';
  output.textContent = String(current);

  input.addEventListener('input', () => {
    const value = Number(input.value);
    output.textContent = input.value;
    onInput(value);
  });

  row.append(input, output);
  return row;
}

function colorField(labelText: string, current: string, onInput: (value: string) => void): HTMLLabelElement {
  const { row } = field(labelText);
  const input = document.createElement('input');
  input.type = 'color';
  input.value = current;
  input.addEventListener('input', () => onInput(input.value));
  row.appendChild(input);
  return row;
}

function checkboxField(labelText: string, current: boolean, onInput: (value: boolean) => void): HTMLLabelElement {
  const { row } = field(labelText);
  row.classList.add('controls__row--checkbox');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = current;
  input.addEventListener('change', () => onInput(input.checked));
  row.appendChild(input);
  return row;
}

function scrambleField(onScramble: (text: string) => void): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'controls__row controls__row--scramble';

  const label = document.createElement('span');
  label.className = 'controls__label';
  label.textContent = 'scramble';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'wake up, neo…';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'run';

  const fire = (): void => {
    const text = input.value.trim();
    if (text) onScramble(text);
  };
  button.addEventListener('click', fire);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fire();
    }
  });

  row.append(label, input, button);
  return row;
}
