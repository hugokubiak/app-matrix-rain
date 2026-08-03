// TODO: registry of all charsets + CharsetKey union type.
// Each charset lives in its own file (see README "Adding a new charset").
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
