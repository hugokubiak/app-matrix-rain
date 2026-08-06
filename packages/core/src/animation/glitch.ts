export interface GlitchState {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

const DEFAULT_RADIUS = 120;
const DECAY_PER_STEP = 0.06;

export function triggerGlitch(x: number, y: number, radius = DEFAULT_RADIUS): GlitchState {
  return { x, y, radius, strength: 1 };
}

export function decayGlitch(glitch: GlitchState | null): GlitchState | null {
  if (!glitch) return null;
  const strength = glitch.strength - DECAY_PER_STEP;
  return strength <= 0 ? null : { ...glitch, strength };
}

export function glitchInfluence(glitch: GlitchState | null, x: number, y: number): number {
  if (!glitch) return 0;
  const dx = x - glitch.x;
  const dy = y - glitch.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > glitch.radius) return 0;
  return (1 - dist / glitch.radius) * glitch.strength;
}
