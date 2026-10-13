/**
 * Original royalty-free Chinese instrumental soundscape synthesizer.
 * Synthesizes traditional Chinese pentatonic instruments (Guzheng, Dizi flute,
 * Guqin bass drone, and temple singing bowl) via Web Audio API.
 * 
 * Mood: cinematic, elegant, contemplative, ancient Chinese atmosphere.
 * No copyrighted Disney or Mulan soundtrack melodies.
 */

// Traditional Chinese Pentatonic Scale (D Pentatonic: Gong, Shang, Jiao, Zhi, Yu)
const PENTATONIC_SCALE = [
  146.83, // D3
  164.81, // E3
  196.00, // G3
  220.00, // A3
  246.94, // B3
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
];

export class ChineseInstrumentalEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isRunning = false;
  private phraseTimer: number | null = null;
  private bellTimer: number | null = null;
  private targetVolume = 0.20;

  constructor() {}

  public init(): boolean {
    if (this.ctx && this.ctx.state !== 'closed') return true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Algorithmic courtyard reverb (lush ancient pavilion impulse)
      this.reverbNode = this.createCourtyardReverb(this.ctx, 2.8, 0.65);
      this.reverbNode.connect(this.masterGain);

      return true;
    } catch {
      return false;
    }
  }

  public async start(): Promise<void> {
    if (!this.init() || !this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return;
      }
    }

    if (this.isRunning) return;
    this.isRunning = true;

    // Smoothly fade in to target volume
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.exponentialRampToValueAtTime(this.targetVolume, now + 1.2);

    // 1. Start gentle ambient Guqin drone
    this.startAmbientDrone();

    // 2. Schedule Guzheng & Dizi flute musical phrases
    this.scheduleNextPhrase();

    // 3. Schedule periodic soft temple singing bowl / bell
    this.scheduleTempleBell();
  }

  public setVolume(vol: number, rampDuration = 0.8): void {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    if (this.targetVolume > 0.001) {
      this.masterGain.gain.exponentialRampToValueAtTime(this.targetVolume, now + rampDuration);
    } else {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + rampDuration);
    }
  }

  public pause(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);

    if (this.phraseTimer) {
      window.clearTimeout(this.phraseTimer);
      this.phraseTimer = null;
    }
    if (this.bellTimer) {
      window.clearTimeout(this.bellTimer);
      this.bellTimer = null;
    }
    this.stopAmbientDrone();
    this.isRunning = false;
  }

  public isContextRunning(): boolean {
    return Boolean(this.ctx && this.ctx.state === 'running' && this.isRunning);
  }

  // --- INSTRUMENT SYNTHESIS: Guzheng Plucked String ---
  private pluckGuzheng(freq: number, velocity = 0.5, timeOffset = 0): void {
    if (!this.ctx || !this.masterGain || !this.reverbNode) return;

    const startTime = this.ctx.currentTime + timeOffset;

    // Harmonic plucked oscillator (combination of sine & triangle with sharp transient)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1st harmonic

    // Subtle pitch bend / string tension relaxation
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.996, startTime + 0.35);

    // Pluck envelope: 6ms sharp attack, exponential decay
    const peakGain = 0.35 * velocity;
    oscGain.gain.setValueAtTime(0.0001, startTime);
    oscGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
    oscGain.gain.exponentialRampToValueAtTime(peakGain * 0.25, startTime + 0.35);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8);

    // Warm low-pass filter to simulate wood resonator
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.2, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 1.2);

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(filter);

    // Send part dry to master, part wet to courtyard reverb
    const dryGain = this.ctx.createGain();
    dryGain.gain.value = 0.7;
    filter.connect(dryGain);
    dryGain.connect(this.masterGain);

    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.5;
    filter.connect(wetGain);
    wetGain.connect(this.reverbNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 3.0);
    osc2.stop(startTime + 3.0);
  }

  // --- INSTRUMENT SYNTHESIS: Dizi Bamboo Flute ---
  private playDiziFlute(freq: number, duration: number, timeOffset = 0): void {
    if (!this.ctx || !this.masterGain || !this.reverbNode) return;

    const startTime = this.ctx.currentTime + timeOffset;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Vibrato LFO (4.8 Hz gentle vibrato)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.8, startTime);
    lfoGain.gain.setValueAtTime(freq * 0.012, startTime); // subtle micro-vibrato
    lfo.connect(osc.frequency);

    // Breath noise simulation layer
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = freq * 1.8;
    noiseFilter.Q.value = 3.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.04, startTime + 0.15);
    noiseGain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Flute note envelope: gentle breath attack (120ms), sustained peace, soft release
    const gainNode = this.ctx.createGain();
    const targetAmp = 0.22;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(targetAmp, startTime + 0.14);
    gainNode.gain.setValueAtTime(targetAmp * 0.9, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);

    // Mix to reverb for spacious ancient atmosphere
    gainNode.connect(this.masterGain);
    gainNode.connect(this.reverbNode);
    noiseGain.connect(this.reverbNode);

    lfo.start(startTime + 0.08);
    osc.start(startTime);
    noiseSource.start(startTime);

    lfo.stop(startTime + duration + 0.1);
    osc.stop(startTime + duration + 0.1);
    noiseSource.stop(startTime + duration + 0.1);
  }

  // --- INSTRUMENT SYNTHESIS: Temple Singing Bowl / Bell ---
  private strikeTempleBell(timeOffset = 0): void {
    if (!this.ctx || !this.masterGain || !this.reverbNode) return;

    const startTime = this.ctx.currentTime + timeOffset;
    const baseFreq = 587.33; // D5 high sacred resonance

    const harmonics = [1, 2.76, 5.4, 8.9];
    const harmonicGains = [0.15, 0.06, 0.02, 0.008];

    harmonics.forEach((h, idx) => {
      if (!this.ctx || !this.reverbNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, startTime);

      const amp = harmonicGains[idx] || 0.02;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (idx === 0 ? 5.5 : 2.5));

      osc.connect(gain);
      gain.connect(this.reverbNode);

      osc.start(startTime);
      osc.stop(startTime + 6.0);
    });
  }

  // --- Guqin Ambient Bass Drone ---
  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain || this.droneOsc1) return;

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.value = 73.42; // D2 deep root
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.value = 110.00; // A2 fifth

    this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3.0);

    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private stopAmbientDrone(): void {
    if (this.droneOsc1) {
      try {
        this.droneOsc1.stop();
        this.droneOsc2?.stop();
      } catch {}
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneGain = null;
    }
  }

  // --- Contemplative Musical Phrasing Generator ---
  private scheduleNextPhrase(): void {
    if (!this.isRunning || !this.ctx) return;

    // Pick a musical motif from traditional pentatonic scales
    const motifLength = Math.floor(Math.random() * 3) + 3; // 3 to 5 notes
    let offset = 0;

    // 1. Guzheng arpeggio / motif
    for (let i = 0; i < motifLength; i++) {
      const noteIndex = Math.floor(Math.random() * PENTATONIC_SCALE.length);
      const freq = PENTATONIC_SCALE[noteIndex];
      const velocity = 0.4 + Math.random() * 0.35;
      this.pluckGuzheng(freq, velocity, offset);
      offset += 0.35 + Math.random() * 0.45; // relaxed tempo
    }

    // 2. Occasionally answer with a contemplative Dizi flute phrase
    if (Math.random() > 0.45) {
      const fluteNote = PENTATONIC_SCALE[Math.floor(Math.random() * 6) + 4]; // Mid-high register
      const duration = 1.8 + Math.random() * 1.4;
      this.playDiziFlute(fluteNote, duration, offset + 0.2);
      offset += duration;
    }

    // Interval between phrases: 3.5 to 7.0 seconds of peaceful silence
    const pauseDuration = (4.0 + Math.random() * 3.5) * 1000;
    this.phraseTimer = window.setTimeout(() => {
      this.scheduleNextPhrase();
    }, (offset * 1000) + pauseDuration);
  }

  private scheduleTempleBell(): void {
    if (!this.isRunning) return;

    this.strikeTempleBell(0.2);

    // Next bell in 20 - 32 seconds
    const interval = (20 + Math.random() * 12) * 1000;
    this.bellTimer = window.setTimeout(() => {
      this.scheduleTempleBell();
    }, interval);
  }

  // --- Algorithmic Courtyard Impulse Reverb ---
  private createCourtyardReverb(ctx: AudioContext, duration: number, decay: number): ConvolverNode {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = (length - i) / length;
      const env = Math.pow(n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }
}

// Global singleton instance
export const globalAudioEngine = new ChineseInstrumentalEngine();
