import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface Chapter05ExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

function smoothstep(min: number, max: number, value: number): number {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const x = (value - min) / (max - min);
  return x * x * (3 - 2 * x);
}

function clamp(val: number, min = 0, max = 1): number {
  if (Number.isNaN(val) || !Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

// Pentatonic imperial frequencies for ceremonial sound cues (D, E, F#, A, B harmonic series)
const CEREMONIAL_PITCHES = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];

export function Chapter05Experience({
  isOpen,
  onClose,
  onContinue,
}: Chapter05ExperienceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollProgressRef = useRef(0);
  const activeSegmentRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeSegment, setActiveSegment] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 450);
  }, [onClose]);

  const handleContinue = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onContinue();
      setIsClosing(false);
    }, 450);
  }, [onContinue]);

  // Escape key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Subtle mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouseOffset({ x, y });
  }, []);

  // Web Audio Ceremonial Chime Generator
  const playCeremonialSound = useCallback((index: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = CEREMONIAL_PITCHES[index % CEREMONIAL_PITCHES.length];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle bell overtones
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 2.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    } catch {
      // Audio autoplay policy or unavailable context
    }
  }, [soundEnabled]);

  // Scroll tracking with dead-band hysteresis to prevent boundary flutter
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const rawP = el.scrollTop / total;
      const p = clamp(rawP, 0, 1);
      scrollProgressRef.current = p;
      setScrollProgress(p);

      const current = activeSegmentRef.current;
      let next = current;
      const upThresholds = [0.18, 0.38, 0.58, 0.78];
      const downThresholds = [0.14, 0.34, 0.54, 0.74];

      if (next < 4 && p > upThresholds[next]) {
        next = current + 1;
      } else if (next > 0 && p < downThresholds[next - 1]) {
        next = current - 1;
      }

      if (next !== current) {
        activeSegmentRef.current = next;
        setActiveSegment(next);
        playCeremonialSound(next);
      }
    }
  };

  const scrollToSegment = (index: number) => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const targetY = (index / 4.4) * (el.scrollHeight - el.clientHeight);
    el.scrollTo({ top: targetY, behavior: 'smooth' });
    playCeremonialSound(index);
  };

  // High-performance single-mount Canvas: Imperial floating sky lanterns, golden festive embers, and twilight fireworks
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 1. Floating Imperial Lanterns (ascending gently with soft swaying physics)
    interface SkyLantern {
      x: number;
      y: number;
      size: number;
      speedY: number;
      swayFreq: number;
      swayAmp: number;
      baseX: number;
      alpha: number;
      pulseOffset: number;
      depth: number;
    }

    const lanternCount = 38;
    const lanterns: SkyLantern[] = Array.from({ length: lanternCount }, () => {
      const x = Math.random() * (w + 120) - 60;
      const depth = Math.random();
      return {
        x,
        baseX: x,
        y: Math.random() * h,
        size: depth * 14 + 10,
        speedY: (1 - depth * 0.4) * 0.45 + 0.2,
        swayFreq: Math.random() * 0.002 + 0.001,
        swayAmp: depth * 22 + 8,
        alpha: depth * 0.45 + 0.35,
        pulseOffset: Math.random() * Math.PI * 2,
        depth,
      };
    });

    // 2. Rising Golden Sparks & Incandescent Festival Embers
    interface GoldEmber {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      maxAlpha: number;
      hue: number;
    }

    const emberCount = 75;
    const embers: GoldEmber[] = Array.from({ length: emberCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.4 + 0.8,
      speedY: Math.random() * 0.85 + 0.45,
      speedX: (Math.random() - 0.48) * 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      maxAlpha: Math.random() * 0.6 + 0.4,
      hue: Math.random() > 0.35 ? 42 : 18, // Gold (42) or Imperial Vermilion (18)
    }));

    // 3. Fireworks & Celestial Light Shimmers
    interface FireworkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }
    const fireworks: FireworkParticle[] = [];

    const spawnFirework = (centerX: number, centerY: number, color: string) => {
      const count = 32;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.2 + 0.8;
        fireworks.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          alpha: 1.0,
          color,
          life: 0,
          maxLife: Math.random() * 50 + 40,
        });
      }
    };

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      const curP = scrollProgressRef.current;

      // Periodic fireworks trigger during the triumphal climax (scrollProgress > 0.45)
      if (curP > 0.45 && frame % 120 === 0 && fireworks.length < 90) {
        const fwX = Math.random() * (w * 0.7) + w * 0.15;
        const fwY = Math.random() * (h * 0.35) + h * 0.08;
        const colors = ['#F5C542', '#FF6B4A', '#E8D298', '#FF8F6B'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        spawnFirework(fwX, fwY, color);
      }

      // Render Floating Sky Lanterns
      for (let i = 0; i < lanterns.length; i++) {
        const lan = lanterns[i];
        lan.y -= lan.speedY;
        lan.x = lan.baseX + Math.sin(frame * lan.swayFreq + lan.pulseOffset) * lan.swayAmp;

        if (lan.y < -lan.size * 2) {
          lan.y = h + lan.size * 2;
          lan.baseX = Math.random() * (w + 120) - 60;
        }

        const flicker = Math.sin(frame * 0.04 + lan.pulseOffset) * 0.12 + 0.88;
        const currentAlpha = lan.alpha * flicker;

        ctx.save();
        ctx.translate(lan.x, lan.y);

        // Soft outer ambient radial glow
        const glowGrad = ctx.createRadialGradient(0, 0, lan.size * 0.2, 0, 0, lan.size * 2.2);
        glowGrad.addColorStop(0, `rgba(255, 190, 80, ${currentAlpha * 0.65})`);
        glowGrad.addColorStop(0.5, `rgba(235, 95, 45, ${currentAlpha * 0.25})`);
        glowGrad.addColorStop(1, 'rgba(235, 95, 45, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, lan.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Paper Vessel
        ctx.fillStyle = `rgba(255, 175, 75, ${currentAlpha * 0.85})`;
        ctx.beginPath();
        const halfW = lan.size * 0.65;
        const halfH = lan.size * 0.9;
        ctx.moveTo(-halfW, -halfH);
        ctx.lineTo(halfW, -halfH);
        ctx.quadraticCurveTo(halfW * 1.15, 0, halfW * 0.8, halfH);
        ctx.lineTo(-halfW * 0.8, halfH);
        ctx.quadraticCurveTo(-halfW * 1.15, 0, -halfW, -halfH);
        ctx.closePath();
        ctx.fill();

        // Bright Core Flame
        const flameGrad = ctx.createRadialGradient(0, halfH * 0.35, 1, 0, halfH * 0.35, lan.size * 0.5);
        flameGrad.addColorStop(0, `rgba(255, 255, 220, ${currentAlpha})`);
        flameGrad.addColorStop(0.6, `rgba(255, 190, 60, ${currentAlpha * 0.9})`);
        flameGrad.addColorStop(1, 'rgba(255, 120, 30, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(0, halfH * 0.35, lan.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Render Rising Golden Festival Embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.speedY;
        e.x += e.speedX;

        if (e.y < -10) {
          e.y = h + 10;
          e.x = Math.random() * w;
        }

        const emberPulse = Math.sin(frame * 0.05 + i) * 0.25 + 0.75;
        ctx.fillStyle = e.hue === 42
          ? `rgba(255, 215, 110, ${e.alpha * emberPulse})`
          : `rgba(255, 110, 65, ${e.alpha * emberPulse})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Active Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // subtle gravity
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          fireworks.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Cinematic scroll interpolation values
  const bgScale = 1.0 + scrollProgress * 0.09;
  const bgTranslateY = scrollProgress * -38;
  const parallaxX = mouseOffset.x * 12;
  const parallaxY = mouseOffset.y * 8;

  // Act Opacity curves with smoothstep
  const act1Opacity = 1 - smoothstep(0.18, 0.28, scrollProgress);
  const act2Opacity = smoothstep(0.16, 0.24, scrollProgress) * (1 - smoothstep(0.38, 0.48, scrollProgress));
  const act3Opacity = smoothstep(0.36, 0.44, scrollProgress) * (1 - smoothstep(0.58, 0.68, scrollProgress));
  const act4Opacity = smoothstep(0.56, 0.64, scrollProgress) * (1 - smoothstep(0.78, 0.88, scrollProgress));
  const act5Opacity = smoothstep(0.76, 0.84, scrollProgress);

  // Imperial Palace Sunset & Vermilion Glow Intensity
  const vermilionGlow = 0.25 + smoothstep(0.2, 0.6, scrollProgress) * 0.45;
  const goldenHourAura = smoothstep(0.65, 0.95, scrollProgress);

  const actNames = [
    { num: '01', title: '金阙王都', label: 'The Capital Gates' },
    { num: '02', title: '朱殿丹墀', label: 'The Vermilion Hall' },
    { num: '03', title: '帝王之揖', label: "The Emperor's Bow" },
    { num: '04', title: '辞官归里', label: 'Refusal of Rank' },
    { num: '05', title: '故园无伪', label: 'Homecoming' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chapter 05: Honor Without Disguise"
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#070609] select-none transition-opacity duration-500 ease-out ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* =======================================================================
          BACKGROUND CINEMATIC LAYER: Vermilion Palace & Golden Imperial Sky
          ======================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform"
        style={{
          transform: `translate3d(${parallaxX}px, ${parallaxY + bgTranslateY}px, 0) scale(${bgScale})`,
          transition: 'transform 0.1s linear',
        }}
      >
        <img
          src="/landing-pages/secret-pathways-assets/mulan-05-honor.jpg"
          alt="Mulan Chapter 05 - Honor Without Disguise"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] saturate-[1.12]"
        />

        {/* Imperial Palace Atmosphere Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070609] via-[#100812]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070609]/90 via-transparent to-[#070609]/90" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1C050B]/50 via-transparent to-[#070609]/95 pointer-events-none transition-opacity duration-700"
          style={{ opacity: vermilionGlow }}
        />

        {/* Golden Hour Sunset Aura during Emperor's Bow & Homecoming */}
        <div
          className="absolute inset-0 bg-radial from-[#F5A623]/25 via-[#C0392B]/15 to-transparent pointer-events-none transition-opacity duration-1000"
          style={{ opacity: goldenHourAura }}
        />
      </div>

      {/* =======================================================================
          FLUID ATMOSPHERIC CANVAS: Sky Lanterns, Golden Sparks & Fireworks
          ======================================================================= */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Subtle Palace Silk Shimmer Vignette */}
      <div className="absolute inset-0 pointer-events-none z-15 shadow-[inset_0_0_140px_rgba(7,6,9,0.85)]" />

      {/* =======================================================================
          TOP EDITORIAL HUD: Chapter Identity, Act Quick Jump & Audio Toggle
          ======================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-6 pointer-events-auto bg-gradient-to-b from-[#070609]/90 to-transparent">
        <div className="flex items-center space-x-4">
          <span
            className="text-xs font-mono tracking-[0.25em] text-[#E5C378] uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            05 / CHAPTER V
          </span>
          <span className="text-[#6E6359] text-xs">·</span>
          <span
            className="text-sm font-serif tracking-widest text-[#E8D9C5] uppercase hidden sm:inline"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            无伪之荣
          </span>
          <span className="text-[#6E6359] text-xs hidden sm:inline">·</span>
          <span
            className="text-[11px] font-mono tracking-widest text-[#B39352] uppercase px-2 py-0.5 rounded border border-[#B39352]/30 bg-[#B39352]/10 hidden md:inline"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            THE CLIMAX
          </span>
        </div>

        {/* Quick Jump Act Navigation */}
        <nav
          aria-label="Scene Navigator"
          className="hidden lg:flex items-center space-x-1 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#140D18]/85 backdrop-blur-md"
        >
          {actNames.map((act, idx) => (
            <button
              key={act.num}
              onClick={() => scrollToSegment(idx)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                activeSegment === idx
                  ? 'bg-[#D4AF37] text-[#0A070D] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'text-[#C5B5A3] hover:text-white hover:bg-white/5'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {act.num} {act.title}
            </button>
          ))}
        </nav>

        {/* Sound Toggle & Close Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            data-cursor-label="AUDIO"
            className="p-2.5 rounded-full border border-[#D4AF37]/30 bg-[#120B15]/80 text-[#E5C378] hover:text-white hover:border-[#D4AF37]/60 transition-colors duration-200 cursor-pointer"
            title={soundEnabled ? 'Mute Ceremonial Chimes' : 'Unmute Ceremonial Chimes'}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          <button
            onClick={handleClose}
            data-cursor-label="CLOSE"
            className="group flex items-center space-x-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#120B15]/85 backdrop-blur-md text-[#E8D9C5] hover:text-white hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/15 transition-all duration-300 cursor-pointer"
          >
            <span
              className="text-[11px] font-mono tracking-widest uppercase hidden sm:inline"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CLOSE
            </span>
            <svg
              className="w-4 h-4 text-[#D4AF37] group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* =======================================================================
          BOTTOM PROGRESS HUD: Scroll Indicator & Scene Progression
          ======================================================================= */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-5 pointer-events-none bg-gradient-to-t from-[#070609]/95 to-transparent">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <span
            className="text-[11px] font-mono tracking-[0.24em] text-[#D4AF37] uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {actNames[activeSegment].num} / {actNames[activeSegment].title}
          </span>
          <span className="text-[#6E6359] text-xs">·</span>
          <span
            className="text-xs text-[#C5B5A3] font-light hidden sm:inline"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {actNames[activeSegment].label}
          </span>
        </div>

        {/* Visual Progress Bar with Gold Glow */}
        <div className="flex items-center space-x-4 pointer-events-auto">
          <div className="w-32 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#FF7A50] rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(212,175,55,0.6)]"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
          <span
            className="text-[11px] font-mono text-[#D4AF37] tracking-wider min-w-[3ch]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </footer>

      {/* =======================================================================
          SCROLLABLE NARRATIVE CONTAINER (5 Immersion Acts)
          ======================================================================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="Story Progression"
        className="relative z-20 h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth focus:outline-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* =====================================================================
            ACT 1: THE GATES OF THE CAPITAL (金阙王都 · 凯旋残阳)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div
            className="max-w-3xl space-y-8 transition-opacity duration-700"
            style={{ opacity: Math.max(0.15, act1Opacity) }}
          >
            <div className="flex items-center gap-3 text-xs text-[#E5C378] font-mono tracking-[0.3em] uppercase">
              <span>ACT 01</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>金阙王都</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>THE TRIUMPHAL ARRIVAL</span>
            </div>

            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white font-normal leading-[1.08] tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The dust of war settled.
                <br />
                <span className="italic text-[#E5C378]">The gates opened to the truth.</span>
              </h1>
              <p
                className="text-lg sm:text-2xl text-[#C9A96E] font-serif italic tracking-wide"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                “Behind the armor was never a nameless soldier, but a daughter who carved her own fate.”
              </p>
            </div>

            <div className="space-y-4 max-w-2xl text-base sm:text-lg text-[#D4C8B8] font-light leading-relaxed">
              <p>
                The capital stood bathed in amber twilight as imperial drums echoed across forty leagues of tiled rooftops.
                The invading vanguard had broken upon the northern passes; the dragon dynasty had survived.
              </p>
              <p>
                Yet as the victorious ranks marched through the vermilion arches, whispers rippled through the gathered
                throngs. Hua Ping had not fallen. But Hua Ping was no man.
              </p>
            </div>

            <div className="pt-4 flex items-center space-x-6 text-[#A89887] text-xs font-mono tracking-widest uppercase">
              <span className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                <span>SCROLL TO ENTER THE PALACE</span>
              </span>
              <span className="hidden sm:inline">↓</span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ACT 2: THE GRAND VERMILION HALL (朱殿丹墀 · 卸甲现真)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div
            className="max-w-3xl ml-auto space-y-8 transition-opacity duration-700"
            style={{ opacity: Math.max(0.15, act2Opacity) }}
          >
            <div className="flex items-center gap-3 text-xs text-[#E5C378] font-mono tracking-[0.3em] uppercase">
              <span>ACT 02</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>朱殿丹墀</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>THE SHEDDING OF THE ARMOR</span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-serif text-white font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Laminated iron laid down.
              <br />
              <span className="italic text-[#E5C378]">Integrity standing unadorned.</span>
            </h2>

            <div className="space-y-4 max-w-2xl text-base sm:text-lg text-[#D4C8B8] font-light leading-relaxed">
              <p>
                Beneath soaring pillars of carved cinnabar and gilded dragons, the court stood in breathless silence.
                The heavy breastplate—cut for her father’s shoulders, dented by snowdrifts and barbarian blades—was
                unbuckled plate by plate.
              </p>
              <p>
                She placed the jian sword and helmet upon the marble pavement. For twelve years, her virtue had been
                shrouded in secrecy. Now, standing in simple linen robes with her hair unbound, her honor needed no disguise.
              </p>
            </div>

            {/* Visual Artifact Panel */}
            <div className="p-6 rounded-xl border border-[#D4AF37]/30 bg-[#120914]/80 backdrop-blur-md space-y-3 max-w-lg">
              <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                <span>IMPERIAL SCRUTINY</span>
                <span>DECREE OF DISCLOSURE</span>
              </div>
              <p
                className="text-sm font-serif italic text-[#EAE0D5] leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                “You stole your father’s armor, deceived the army, and broke the imperial statutes. Yet you saved our cities,
                and without you, the throne would be ash.”
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ACT 3: THE EMPEROR'S BOW (帝王之揖 · 万民俯首)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div
            className="max-w-4xl mx-auto space-y-8 text-center transition-opacity duration-700"
            style={{ opacity: Math.max(0.15, act3Opacity) }}
          >
            <div className="inline-flex items-center gap-3 text-xs text-[#E5C378] font-mono tracking-[0.3em] uppercase">
              <span>ACT 03</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>帝王之揖</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>THE SUPREME REVERENCE</span>
            </div>

            <h2
              className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The Son of Heaven bowed.
              <br />
              <span className="italic text-[#E5C378]">And the empire knelt with him.</span>
            </h2>

            <p
              className="text-base sm:text-xl text-[#E8D9C5] font-light max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              In an act that shattered ten centuries of rigid dynastic protocol, the Emperor of all China descended
              the jade steps. He lowered his gilded head before the daughter of Fa.
              Behind him, five hundred ministers, royal generals, and guards sank to both knees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left max-w-3xl mx-auto">
              <div className="p-5 rounded-lg border border-[#D4AF37]/25 bg-[#140C1A]/75 backdrop-blur-md">
                <span
                  className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE IMPERIAL CREST
                </span>
                <span className="text-base font-serif text-white mt-1 block">
                  Crest of the Celestial Dragon
                </span>
                <p className="text-xs text-[#A89887] mt-1 font-light">
                  Conferred only upon sovereign protectors of the realm.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[#D4AF37]/25 bg-[#140C1A]/75 backdrop-blur-md">
                <span
                  className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE SHAN YU SWORD
                </span>
                <span className="text-base font-serif text-[#FF8F6B] mt-1 block">
                  Blade of the Invader
                </span>
                <p className="text-xs text-[#A89887] mt-1 font-light">
                  Surrendered to the daughter who vanquished the steppe.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[#D4AF37]/25 bg-[#140C1A]/75 backdrop-blur-md">
                <span
                  className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE VIRTUE
                </span>
                <span className="text-base font-serif text-white mt-1 block">
                  诚 · Absolute Integrity
                </span>
                <p className="text-xs text-[#A89887] mt-1 font-light">
                  Truth born of sacrifice, uncorrupted by vanity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ACT 4: THE REFUSAL OF RANK (辞官归里 · 唯愿还家)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div
            className="max-w-3xl space-y-8 transition-opacity duration-700"
            style={{ opacity: Math.max(0.15, act4Opacity) }}
          >
            <div className="flex items-center gap-3 text-xs text-[#E5C378] font-mono tracking-[0.3em] uppercase">
              <span>ACT 04</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>辞官归里</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>THE REFUSAL OF POWER</span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-serif text-white font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Gold and titles laid aside.
              <br />
              <span className="italic text-[#E5C378]">“I have been away too long.”</span>
            </h2>

            <div className="space-y-4 max-w-2xl text-base sm:text-lg text-[#D4C8B8] font-light leading-relaxed">
              <p>
                The Emperor offered the chancellery of the empire, a palace in the capital, and a treasury of silk and jade.
                Yet Mulan knelt and shook her head gently.
              </p>
              <p>
                “I did not march to conquer ministries, nor to govern courts. I marched so that my father would live to see
                another spring. Grant me only a swift horse with thousand-li hooves, that I may return to my home.”
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#D4AF37]/30 bg-[#120914]/80 backdrop-blur-md space-y-3 max-w-lg">
              <span
                className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase block"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                THE EMPEROR’S PARTING WORDS
              </span>
              <blockquote
                className="text-base font-serif italic text-white leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                “The flower that blooms in adversity is the most rare and beautiful of all.”
              </blockquote>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ACT 5: THE HOMECOMING & RESOLUTION (故园无伪 · 孝德无量)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div
            className="max-w-4xl mx-auto space-y-8 transition-opacity duration-700"
            style={{ opacity: Math.max(0.15, act5Opacity) }}
          >
            <div className="flex items-center gap-3 text-xs text-[#E5C378] font-mono tracking-[0.3em] uppercase">
              <span>EPILOGUE</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>故园无伪</span>
              <span aria-hidden="true" className="text-[#6E6359]">·</span>
              <span>THE GREATEST HONOR</span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-serif text-white font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The garden gate creaked open.
              <br />
              <span className="italic text-[#E5C378]">No longer hidden. Forever whole.</span>
            </h2>

            <p
              className="text-base sm:text-xl text-[#E8D9C5] font-light leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Under the quiet cherry blossoms where her journey had started in tears and doubt, her elderly father
              leaned upon his cane. He did not look at the imperial sword at her hip, nor the dragon crest upon her chest.
              He tossed his cane aside and held her close:
              <br />
              <span className="italic text-[#E5C378]">
                “The greatest gift and honor is having you for a daughter.”
              </span>
            </p>

            {/* Chapter 05 & Full Legend Wrap-Up Card */}
            <div className="p-8 sm:p-10 rounded-2xl border border-[#D4AF37]/40 bg-[#0F0814]/90 backdrop-blur-md space-y-8 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-[#D4AF37]/20 pb-6 text-left">
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    CHAPTER V
                  </span>
                  <span className="text-base font-serif text-white font-medium">
                    Honor Without Disguise
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    THE REALM
                  </span>
                  <span className="text-base font-serif text-white font-medium">
                    The Vermilion Palace & Fa Courtyard
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    SUPREME VIRTUE
                  </span>
                  <span className="text-base font-serif text-[#E5C378] font-medium">
                    诚 · True Authenticity
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#B39352] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    STATUS
                  </span>
                  <span className="text-base font-serif text-white font-medium">
                    Legend Completed · 功德圆满
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
                <div>
                  <span
                    className="text-[10px] font-mono tracking-[0.24em] text-[#B39352] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    THE FIVE VIRTUES EMBODIED
                  </span>
                  <h3
                    className="text-2xl font-serif text-white mt-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    孝 · 忠 · 勇 · 智 · 诚
                  </h3>
                  <p className="text-sm text-[#C5B5A3] font-light mt-1">
                    Filial Devotion · Fealty · Courage · Wisdom · Truth
                  </p>
                </div>

                <button
                  onClick={handleContinue}
                  data-cursor-label="SANCTUARY"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#0A070D] font-mono text-xs uppercase tracking-[0.22em] font-semibold hover:shadow-[0_0_32px_rgba(212,175,55,0.7)] transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  RETURN TO THE SANCTUARY →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
