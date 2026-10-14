// Web Audio API procedural Zen soundscape: gentle water ripples and tranquil harmonic wind chimes.
// 100% generated on-the-fly, zero external assets, strictly opt-in and muted by default.

class ZenAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private waterGain: GainNode | null = null;
  private chimeGain: GainNode | null = null;
  private timer: number | null = null;

  private pentatonicFrequencies = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private start() {
    if (!this.ctx) return;
    this.isPlaying = true;

    // 1. Water stream noise generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const waterFilter = this.ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    waterFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO for subtle water current undulating
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(waterFilter.frequency);
    lfo.start();

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.waterGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 2.0);

    whiteNoise.connect(waterFilter);
    waterFilter.connect(this.waterGain);
    this.waterGain.connect(this.ctx.destination);
    whiteNoise.start();

    // 2. Chime Master Gain
    this.chimeGain = this.ctx.createGain();
    this.chimeGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    this.chimeGain.connect(this.ctx.destination);

    // Start periodic organic chimes
    this.scheduleNextChime();
  }

  public playWaterPlop() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Audio context might be restricted
    }
  }

  private scheduleNextChime() {
    if (!this.isPlaying) return;
    const interval = 5000 + Math.random() * 7000;
    this.timer = window.setTimeout(() => {
      this.playChime();
      this.scheduleNextChime();
    }, interval);
  }

  private playChime() {
    if (!this.ctx || !this.chimeGain || !this.isPlaying) return;
    try {
      const freq = this.pentatonicFrequencies[Math.floor(Math.random() * this.pentatonicFrequencies.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2.76, now); // Metallic non-integer harmonic

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(noteGain);
      oscHarmonic.connect(noteGain);
      noteGain.connect(this.chimeGain);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 4.6);
      oscHarmonic.stop(now + 4.6);
    } catch {
      // Audio gracefully fails if throttled
    }
  }

  private stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      if (this.waterGain) {
        this.waterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
      }
      setTimeout(() => {
        if (!this.isPlaying && this.ctx) {
          this.ctx.suspend();
        }
      }, 1000);
    }
  }
}

export const zenAudio = new ZenAudioManager();
