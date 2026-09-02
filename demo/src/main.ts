import { MatrixRain, type MatrixRainConfig } from 'app-matrix-rain';
import { createControls, type ControlsState } from './ui-controls.js';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('app-matrix-rain demo: #app not found');
}

const initialState: ControlsState = {
  charset: 'latin',
  directionMode: 'auto',
  fontSize: 16,
  speed: 1,
  density: 1,
  color: '#00ff41',
  backgroundColor: '#000000',
  glitchOnHover: false,
  fadeOpacity: 0.08,
  respectReducedMotion: true,
};

const rain = new MatrixRain(app, toConfig(initialState));
rain.start();

let pending: number | undefined;
createControls({
  initial: initialState,
  onChange: (state) => {
    // Debounce: dragging a slider fires ~1 event/frame, and updateConfig re-seeds
    // the rain each call. Coalesce to the trailing change.
    window.clearTimeout(pending);
    pending = window.setTimeout(() => rain.updateConfig(toConfig(state)), 120);
  },
  onScramble: (text) => rain.scrambleText(text),
});

// `auto` mirrors core's own default (arabic -> rtl); resolved here because
// updateConfig merges over the previously resolved direction and never clears it.
function toConfig(state: ControlsState): Partial<MatrixRainConfig> {
  const direction =
    state.directionMode === 'auto' ? (state.charset === 'arabic' ? 'rtl' : 'ltr') : state.directionMode;

  return {
    charset: state.charset,
    direction,
    fontSize: state.fontSize,
    speed: state.speed,
    density: state.density,
    color: state.color,
    backgroundColor: state.backgroundColor,
    glitchOnHover: state.glitchOnHover,
    fadeOpacity: state.fadeOpacity,
    respectReducedMotion: state.respectReducedMotion,
  };
}
