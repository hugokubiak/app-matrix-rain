const keywords = [
  'const',
  'let',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'import',
  'export',
  'class',
  'async',
  'await',
  'def',
  'lambda',
  'yield',
  'self',
  'None',
  'True',
  'False',
];
const symbols = ['{', '}', '(', ')', '[', ']', ';', '=>', '==', '===', '!=', '&&', '||', '+=', '<', '>', '::', '0x'];

export const code: string[] = [...keywords, ...symbols];
