import { latin } from './latin.js';
import { katakana } from './katakana.js';
import { cyrillic } from './cyrillic.js';
import { thai } from './thai.js';
import { arabic } from './arabic.js';
import { runic } from './runic.js';
import { binary } from './binary.js';
import { hex } from './hex.js';
import { code } from './code.js';

export type CharsetKey =
  | 'latin'
  | 'katakana'
  | 'cyrillic'
  | 'thai'
  | 'arabic'
  | 'runic'
  | 'binary'
  | 'hex'
  | 'code';

export const CHARSETS: Record<CharsetKey, string[]> = {
  latin,
  katakana,
  cyrillic,
  thai,
  arabic,
  runic,
  binary,
  hex,
  code,
};
