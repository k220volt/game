// Original synthesized music and effects. No external audio assets.
export class Sound {
  enabled = true;
  private ctx?: AudioContext;
  private bus?: GainNode;
  private beat = 0;
  private elapsed = 0;
  active = false;
  unlock() {
    try {
      this.ctx ??= new AudioContext();
      if (!this.bus) { this.bus = this.ctx.createGain(); this.bus.connect(this.ctx.destination); }
      this.bus.gain.value = this.enabled ? 0.18 : 0;
      void this.ctx.resume().catch(() => {});
    } catch { /* The game remains playable if audio is unsupported. */ }
  }
  toggle() { this.enabled = !this.enabled; this.unlock(); }
  suspend() { if (this.ctx) void this.ctx.suspend().catch(() => {}); }
  note(freq: number, length = .18, delay = 0, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.bus || !this.enabled || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.5, t + .015); gain.gain.exponentialRampToValueAtTime(.001, t + length);
    osc.connect(gain); gain.connect(this.bus); osc.start(t); osc.stop(t + length + .02);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  effect(good: boolean) { (good ? [659, 880, 1047] : [294, 220]).forEach((n, i) => this.note(n, .16, i * .075, 'triangle')); }
  fanfare(win: boolean) { (win ? [523, 659, 784, 1047, 784, 1047] : [392, 349, 294, 262]).forEach((n, i) => this.note(n, .3, i * .16)); }
  update(delta: number) {
    if (!this.active) return;
    this.elapsed += delta;
    if (this.elapsed < 370) return;
    this.elapsed = 0;
    const melody = [523, 0, 659, 784, 659, 0, 587, 0, 494, 0, 587, 698, 587, 0, 523, 0];
    const n = melody[this.beat++ % melody.length];
    if (n) this.note(n, .27);
    if (this.beat % 4 === 0) this.note(131, .45, 0, 'triangle');
  }
}
