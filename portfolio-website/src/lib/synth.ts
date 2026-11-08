/**
 * Tiny in-browser synth so the music page can actually be heard.
 * Each track is a slow chord of detuned oscillators through a low-pass
 * filter and an analyser that feeds the canvas visualiser.
 */
export class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private voices: OscillatorNode[] = [];
  private data: Uint8Array<ArrayBuffer> | null = null;
  playing = false;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.0001;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    filter.Q.value = 0.7;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;

    master.connect(filter);
    filter.connect(analyser);
    analyser.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.analyser = analyser;
    this.data = new Uint8Array(analyser.frequencyBinCount);
    return ctx;
  }

  private stopVoices() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    const voices = this.voices;
    this.voices = [];
    voices.forEach((osc) => {
      try {
        osc.stop(now + 0.75);
      } catch {
        /* already stopped */
      }
    });
  }

  start(chord: number[]) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    void ctx.resume();
    this.stopVoices();

    const now = ctx.currentTime;
    const master = this.master;

    chord.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'sine' : index % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = index % 2 === 0 ? -5 : 6;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16 / (index + 1.4), now + 1.4 + index * 0.16);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      this.voices.push(osc);
    });

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.42, now + 1.6);
    this.playing = true;
  }

  stop() {
    this.stopVoices();
    this.playing = false;
  }

  levels(): Uint8Array<ArrayBuffer> | null {
    if (!this.analyser || !this.data) return null;
    this.analyser.getByteFrequencyData(this.data);
    return this.data;
  }

  dispose() {
    this.stop();
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.analyser = null;
    this.master = null;
  }
}
