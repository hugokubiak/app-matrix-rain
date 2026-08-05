import type { CharsetKey } from './charsets/index.js';
import type { Direction } from './config.js';

export function defaultDirectionFor(charset: CharsetKey): Direction {
  return charset === 'arabic' ? 'rtl' : 'ltr';
}
