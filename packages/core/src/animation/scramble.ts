export interface ScrambleState {
  target: string;
  revealed: boolean[];
  ticksElapsed: number;
  holdTicksRemaining: number;
}

const LOCK_INTERVAL_TICKS = 2;
const HOLD_TICKS = 60;

export function createScramble(text: string): ScrambleState {
  return {
    target: text,
    revealed: [...text].map((ch) => ch === ' '),
    ticksElapsed: 0,
    holdTicksRemaining: HOLD_TICKS,
  };
}

export function stepScramble(state: ScrambleState): ScrambleState | null {
  const ticksElapsed = state.ticksElapsed + 1;
  const revealCount = Math.floor(ticksElapsed / LOCK_INTERVAL_TICKS);
  const revealed = [...state.target].map((ch, i) => ch === ' ' || i < revealCount);
  const allRevealed = revealed.every(Boolean);

  if (allRevealed) {
    const holdTicksRemaining = state.holdTicksRemaining - 1;
    if (holdTicksRemaining <= 0) return null;
    return { ...state, revealed, ticksElapsed, holdTicksRemaining };
  }

  return { ...state, revealed, ticksElapsed };
}

export function renderScramble(state: ScrambleState, noiseChars: string[]): string {
  return [...state.target]
    .map((ch, i) => (state.revealed[i] ? ch : noiseChars[Math.floor(Math.random() * noiseChars.length)] ?? ch))
    .join('');
}
