/**
 * AETHERIA Procedural Sound Engine
 * Generates an ethereal, cinematic ambient soundscape and tactile interactive feedback
 * using the Web Audio API without any external media dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.masterGain.connect(this.filter);
      this.filter.connect(this.ctx.destination);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      this.startDrone();
      this.playChime(520);
    } else {
      this.stopDrone();
    }
    return this.isEnabled;
  }

  public getStatus(): boolean {
    return this.isEnabled;
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.07, now + 2.5);

    // Deep harmonic triad: 55Hz (A1), 82.4Hz (E2), 110Hz (A2)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(55, now);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(82.4, now);

    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(110, now);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.35, now);

    this.droneOsc1.connect(droneGain);
    this.droneOsc2.connect(droneGain);
    this.subOsc.connect(droneGain);
    droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.subOsc.start();
  }

  private stopDrone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);

    setTimeout(() => {
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.subOsc?.stop();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
        this.subOsc?.disconnect();
      } catch {
        // Safe cleanup
      }
    }, 1100);
  }

  /**
   * Modulates the atmospheric filter frequency based on scroll progress or mouse velocity
   */
  public updateAtmosphere(cutoff: number) {
    if (!this.isEnabled || !this.ctx || !this.filter) return;
    const clamped = Math.max(180, Math.min(1800, cutoff));
    this.filter.frequency.setTargetAtTime(clamped, this.ctx.currentTime, 0.2);
  }

  /**
   * Crystalline resonance chord when crossing scene thresholds
   */
  public playSceneTransition(sceneIndex: number) {
    if (!this.isEnabled || !this.ctx) return;
    const baseFreqs = [220, 277.18, 329.63, 440, 554.37];
    const root = baseFreqs[sceneIndex % baseFreqs.length];
    const chord = [root, root * 1.5, root * 2];

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  /**
   * Delicate glass click on UI interactions
   */
  public playClick(pitch: number = 720) {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.05);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Audio catch
    }
  }

  /**
   * Resonant chime for key interactions or button triggers
   */
  public playChime(freq: number = 440) {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Audio catch
    }
  }

  /**
   * Delicate crystalline shimmer when hovering a floating 3D book
   */
  public playBookHover() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5 crystal chord
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + i * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.015, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      });
    } catch {
      // Audio catch
    }
  }

  /**
   * Cinematic book selection & opening chord
   */
  public playBookOpen() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Resonant bass swell + high harmonic
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(130.81, now); // C3
      bass.frequency.exponentialRampToValueAtTime(196.0, now + 0.8); // G3
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      bass.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bass.start(now);
      bass.stop(now + 1.9);

      // Shimmer sweep
      const sweep = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(523.25, now);
      sweep.frequency.exponentialRampToValueAtTime(1046.5, now + 0.6);
      sweepGain.gain.setValueAtTime(0.001, now);
      sweepGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      sweep.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweep.start(now);
      sweep.stop(now + 1.3);
    } catch {
      // Audio catch
    }
  }

  /**
   * Tactile parchment / paper turning sound
   */
  public playPageTurn() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Filtered noise burst for paper texture
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Audio catch
    }
  }

  /**
   * Subtle ember crackle
   */
  public playEmberCrack() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio catch
    }
  }

  /**
   * Clock escapement tick
   */
  public playClockTick(isMidnight: boolean = false) {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isMidnight ? 440 : 880, now);

      gain.gain.setValueAtTime(isMidnight ? 0.06 : 0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (isMidnight ? 0.8 : 0.04));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isMidnight ? 0.85 : 0.05));
    } catch {
      // Audio catch
    }
  }
}

export const sound = new SoundEngine();
