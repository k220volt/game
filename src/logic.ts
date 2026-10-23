export type Hit = 'eppy' | 'flower' | 'empty' | 'miss';
export const DURATIONS = [3000, 2200, 1600] as const;
export const DELTAS: Record<Hit, number> = { eppy: 1, flower: -2, empty: -1, miss: 0 };
export class Round {
  score = 0;
  outcomes: Hit[] = [];
  locked = true;
  constructor(public level = 1) {}
  get done() { return this.outcomes.length === 10; }
  get passed() { return this.done && this.score >= 7; }
  get duration() { return DURATIONS[this.level - 1]; }
  open() { if (!this.done) this.locked = false; }
  hit(kind: Hit) {
    if (this.locked || this.done) return false;
    this.locked = true;
    this.outcomes.push(kind);
    this.score += DELTAS[kind];
    return true;
  }
}
export function positions(random = Math.random) {
  const slots = Array.from({ length: 9 }, (_, i) => i);
  for (let i = 8; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}
export function readBest() {
  try { const n = Number(localStorage.getItem('kiss-park-best')); return Number.isFinite(n) ? Math.min(30, Math.max(0, n)) : 0; } catch { return 0; }
}
export function saveBest(score: number) { const best = Math.max(readBest(), score); try { localStorage.setItem('kiss-park-best', String(best)); } catch { /* Storage may be unavailable in private mode. */ } return best; }
