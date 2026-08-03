import type { CharsetKey } from './charsets/index.js';
import type { Direction } from './config.js';

// TODO: map each charset to its natural reading/fall direction (arabic -> rtl, rest -> ltr).
export function defaultDirectionFor(_charset: CharsetKey): Direction {
  throw new Error('Not implemented');
}
