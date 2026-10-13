import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface Chapter04ExperienceProps {
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

export function Chapter04Experience({
  isOpen,
  onClose,
  onContinue,
}: Chapter04ExperienceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollProgressRef = useRef(0);
  const activeSegmentRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeSegment, setActiveSegment] = useState(0);

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

  // Mouse parallax on desktop
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouseOffset({ x, y });
  }, []);

  // Scroll tracking with hysteresis to prevent state bouncing
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const rawP = el.scrollTop / total;
      const p = clamp(rawP, 0, 1);
      scrollProgressRef.current = p;
      setScrollProgress(p);

      // Hysteresis dead-band for section switching (avoids flickering around boundaries)
      const current = activeSegmentRef.current;
      let next = current;
      const upThresholds = [0.20, 0.40, 0.60, 0.80];
      const downThresholds = [0.16, 0.36, 0.56, 0.76];

      if (next < 4 && p > upThresholds[next]) {
        next = current + 1;
      } else if (next > 0 && p < downThresholds[next - 1]) {
        next = current - 1;
      }

      if (next !== current) {
        activeSegmentRef.current = next;
        setActiveSegment(next);
      }
    }
  };

  const scrollToSegment = (index: number) => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const targetY = (index / 4.5) * (el.scrollHeight - el.clientHeight);
    el.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Canvas atmosphere: blizzard particles, sparks, and mist initialized ONCE and animated continuously
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

    // Multi-layer snow particles (initialized once)
    const flakeCount = 130;
    const flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * (w + 400) - 200,
      y: Math.random() * h,
      radius: Math.random() * 2.6 + 0.6,
      speedX: Math.random() * 7 + 5,
      speedY: Math.random() * 3 + 1.8,
      alpha: Math.random() * 0.6 + 0.2,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.06,
      layer: Math.random() > 0.75 ? 'foreground' : 'background',
    }));

    // Sulfur fire sparks & cannon smoke embers (initialized once)
    const sparkCount = 36;
    const sparks = Array.from({ length: sparkCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.2 + 0.8,
      speedX: Math.random() * 6 + 4,
      speedY: -(Math.random() * 3.5 + 1),
      alpha: 0,
      hue: Math.random() * 25 + 20,
    }));

    // Mountain fog cloud banks (initialized once)
    const fogBanks = Array.from({ length: 5 }, (_, i) => ({
      x: (i * w) / 4,
      y: h * 0.65 + (Math.random() - 0.5) * 120,
      radius: Math.random() * 280 + 320,
      speed: Math.random() * 0.35 + 0.2,
      alpha: Math.random() * 0.11 + 0.05,
    }));

    let smoothedProgress = scrollProgressRef.current;

    const render = () => {
      // Smooth interpolation of scroll progress inside render loop
      const targetP = scrollProgressRef.current;
      smoothedProgress += (targetP - smoothedProgress) * 0.12;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw rolling mountain fog banks
      for (const fog of fogBanks) {
        fog.x += fog.speed;
        if (fog.x - fog.radius > w) fog.x = -fog.radius;

        const grad = ctx.createRadialGradient(
          fog.x,
          fog.y,
          fog.radius * 0.1,
          fog.x,
          fog.y,
          fog.radius
        );
        grad.addColorStop(0, `rgba(168, 195, 218, ${fog.alpha})`);
        grad.addColorStop(0.6, `rgba(130, 158, 182, ${fog.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(10, 18, 28, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw blowing blizzard snowflakes
      for (const f of flakes) {
        f.x += f.speedX;
        f.y += f.speedY;
        f.spin += f.spinSpeed;

        if (f.x > w + 100) f.x = -100;
        if (f.y > h + 20) f.y = -20;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.spin);

        if (f.layer === 'foreground') {
          ctx.strokeStyle = `rgba(235, 245, 255, ${f.alpha})`;
          ctx.lineWidth = f.radius * 1.2;
          ctx.beginPath();
          ctx.moveTo(-f.radius * 2, -f.radius);
          ctx.lineTo(f.radius * 3.5, f.radius * 1.5);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(215, 232, 248, ${f.alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Draw sulfur fire embers with smoothstep intensity (Scene 4)
      const fireIntensity = clamp(
        smoothstep(0.48, 0.62, smoothedProgress) * (1.0 - smoothstep(0.74, 0.84, smoothedProgress)),
        0,
        1
      );

      if (fireIntensity > 0.02) {
        for (const s of sparks) {
          s.x += s.speedX * (1 + fireIntensity);
          s.y += s.speedY;

          if (s.x > w + 50 || s.y < -50) {
            s.x = Math.random() * (w * 0.4);
            s.y = h * 0.7 + Math.random() * (h * 0.3);
            s.alpha = Math.random() * 0.8 + 0.2;
          }

          const currentAlpha = s.alpha * fireIntensity;
          if (currentAlpha > 0.01) {
            ctx.fillStyle = `hsla(${s.hue}, 95%, 60%, ${currentAlpha})`;
            ctx.shadowColor = `hsla(${s.hue}, 100%, 50%, 0.7)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Smooth lighting layers interpolation
  const fireLanceGlowOpacity = clamp(
    smoothstep(0.50, 0.62, scrollProgress) * (1.0 - smoothstep(0.74, 0.82, scrollProgress)),
    0,
    1
  );

  const avalancheWhiteoutOpacity = clamp(
    smoothstep(0.72, 0.86, scrollProgress),
    0,
    1
  );

  // Subtle avalanche vibration (displacement only, max 1.2px, zero opacity change)
  const avalancheShakeIntensity = clamp(
    smoothstep(0.58, 0.66, scrollProgress) * (1.0 - smoothstep(0.78, 0.84, scrollProgress)),
    0,
    1
  );
  const shakeOffset =
    avalancheShakeIntensity > 0.05
      ? Math.sin(Date.now() * 0.05) * 1.2 * avalancheShakeIntensity
      : 0;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#060A10] text-[#E8F0F8] transition-opacity duration-500 ease-out select-none ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter 04: The Mountain · 雪山之战"
    >
      {/* Dynamic Background World: High Northern Ridge Battlefield */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          transform: `scale(${1.04 + scrollProgress * 0.08}) translate3d(${
            mouseOffset.x * -14 + shakeOffset
          }px, ${mouseOffset.y * -14 + shakeOffset}px, 0)`,
        }}
      >
        {/* Base mountain photo texture */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.72] contrast-[1.18] saturate-[0.88]"
          style={{
            backgroundImage: `url('/landing-pages/secret-pathways-assets/mulan-04-mountain.jpg')`,
            transform: `scale(1.02)`,
          }}
        />

        {/* Cinematic cold glacier gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#09111C]/75 to-[#060B12]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060910]/90 via-transparent to-[#060910]/85" />

        {/* Cold frost vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(138, 172, 204, 0.08) 0%, rgba(6, 10, 16, 0.7) 70%, rgba(4, 7, 12, 0.95) 100%)',
          }}
        />

        {/* Layer 1: Fiery Amber Glow for Fire Lance (smooth continuous opacity) */}
        <div
          className="absolute inset-0 pointer-events-none will-change-[opacity]"
          style={{
            background:
              'radial-gradient(circle at 40% 60%, rgba(243, 140, 40, 0.22) 0%, transparent 65%)',
            opacity: fireLanceGlowOpacity,
          }}
        />

        {/* Layer 2: Glacial Whiteout Glow for Avalanche Aftermath (smooth continuous opacity) */}
        <div
          className="absolute inset-0 pointer-events-none will-change-[opacity]"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(200, 225, 250, 0.20) 0%, transparent 70%)',
            opacity: avalancheWhiteoutOpacity,
          }}
        />
      </div>

      {/* Canvas 2D Particle System: Blizzard, Snowflakes, Sulfur fire sparks, Mountain mist */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Cinematic Film Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.24] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '3px 3px',
        }}
      />

      {/* =========================================================================
          TOP EDITORIAL HUD
          ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-12 py-7 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E57338] shadow-[0_0_12px_#E57338] animate-pulse" />
          <div className="flex flex-col">
            <span
              className="text-[10px] sm:text-[11px] font-mono tracking-[0.34em] uppercase text-[#9CB3C9]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CHAPTER 04 / 05 · MILITARY CHRONICLE
            </span>
            <div className="flex items-baseline space-x-3 mt-0.5">
              <span
                className="text-lg sm:text-2xl font-serif tracking-[0.06em] text-[#F3F7FA] font-light"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The Mountain
              </span>
              <span className="text-sm sm:text-base text-[#9CB3C9]/70 font-light tracking-widest">
                雪山之战
              </span>
            </div>
          </div>
        </div>

        {/* Close Button / Return */}
        <button
          onClick={handleClose}
          data-cursor-label="CLOSE"
          className="group relative flex items-center space-x-3 px-5 py-2.5 rounded-full border border-[#8DA4B8]/30 bg-[#0A131F]/60 backdrop-blur-md text-[#E1EAF2] hover:text-white hover:border-[#E57338]/80 hover:bg-[#0E1A2B]/80 transition-all duration-300"
          aria-label="Return to chapter grid"
        >
          <span
            className="text-[11px] tracking-[0.24em] font-mono uppercase text-[#A8BED0] group-hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            RETURN TO GRID
          </span>
          <span className="text-base text-[#8DA4B8] group-hover:text-[#E57338] group-hover:rotate-90 transition-transform duration-300">
            ✕
          </span>
        </button>
      </header>

      {/* =========================================================================
          BOTTOM HUD & NARRATIVE PROGRESSION TRACKER
          ========================================================================= */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-start sm:items-end justify-between pointer-events-auto gap-4 sm:gap-0 bg-gradient-to-t from-[#04070C] via-[#04070C]/80 to-transparent">
        {/* Scene Segment Jump Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {[
            { label: '01 寒崖', name: 'The Pass' },
            { label: '02 铁骑', name: 'The Horde' },
            { label: '03 审势', name: 'The Terrain' },
            { label: '04 烽火', name: 'Fire Lance' },
            { label: '05 残阳', name: 'Avalanche' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSegment(idx)}
              data-cursor-label={`SCENE ${idx + 1}`}
              className={`text-left px-2.5 py-1.5 rounded transition-all duration-300 ${
                activeSegment === idx
                  ? 'bg-[#142336] border border-[#8DA4B8]/60 text-white shadow-[0_0_12px_rgba(141,164,184,0.25)]'
                  : 'text-[#7D94A8] hover:text-[#C5D7E8] hover:bg-[#0B1522]/50'
              }`}
            >
              <div
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {item.label}
              </div>
            </button>
          ))}
        </div>

        {/* Continue to Chapter 05 CTA */}
        <div className="flex items-center space-x-4 self-end sm:self-auto">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span
              className="text-[10px] font-mono tracking-[0.22em] text-[#7E96AC] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              NEXT DESTINATION
            </span>
            <span
              className="text-xs text-[#E1EAF2] font-serif tracking-wide"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Chapter 05: Honor Without Disguise
            </span>
          </div>

          <button
            onClick={handleContinue}
            data-cursor-label="CONTINUE"
            className="group relative flex items-center space-x-3 px-6 py-3 rounded-full bg-[#E57338] text-white hover:bg-[#F28246] transition-all duration-300 shadow-[0_0_24px_rgba(229,115,56,0.35)] hover:shadow-[0_0_32px_rgba(229,115,56,0.6)] cursor-pointer"
          >
            <span
              className="text-xs tracking-[0.2em] font-mono uppercase font-medium"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CONTINUE: 05 HONOR
            </span>
            <span className="text-sm transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </footer>

      {/* =========================================================================
          SCROLLING CINEMATIC STORY CANVAS (FULLSCREEN NARRATIVE VERTICAL ROAD)
          ========================================================================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* =====================================================================
            STAGE 1: THE FROZEN GORGE (寒崖绝境)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 pt-32 pb-24 relative">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-3 mb-4">
              <span
                className="text-xs font-mono tracking-[0.3em] uppercase text-[#E57338]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                SCENE 01 / 05 · ELEVATION 3,400M
              </span>
              <span className="w-8 h-[1px] bg-[#E57338]/40" />
              <span className="text-xs font-mono tracking-widest text-[#849DB2]">
                NORTHERN RIDGE PASS
              </span>
            </div>

            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-[0.03em] text-white font-normal leading-[1.08] mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Between the crags of the northern ridge,
              <br />
              <span className="italic text-[#9CB6CE]">
                blizzard winds carry the roar of war.
              </span>
            </h1>

            <p
              className="text-base sm:text-xl text-[#B9CEDB] max-w-2xl font-light leading-relaxed mb-8 drop-shadow"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The mountain pass stood entombed in ice and suffocating wind. Outnumbered by the
              invading khaganate forces charging across the frozen basin, brute force was certain
              extinction.
            </p>

            {/* Tactical Environment Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl border border-[#8DA4B8]/20 bg-[#07111D]/70 backdrop-blur-md max-w-3xl">
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#738C9F] block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  TERRAIN
                </span>
                <span className="text-sm font-serif text-[#F0F5FA] font-medium">
                  Glacial Basin & Sheer Crags
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#738C9F] block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  TEMPERATURE
                </span>
                <span className="text-sm font-mono text-[#A7C0D4]">
                  -28°C · Blizzard Gale
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#738C9F] block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  IMPERIAL CORPS
                </span>
                <span className="text-sm font-serif text-[#F0F5FA] font-medium">
                  Understrength Division
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#738C9F] block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  VIRTUE
                </span>
                <span className="text-sm font-serif text-[#E57338] font-medium">
                  智 · Tactical Wisdom
                </span>
              </div>
            </div>

            {/* Scroll Down Prompt */}
            <div className="mt-14 flex items-center space-x-3 text-[#7B94A9]">
              <span
                className="text-[10px] font-mono tracking-[0.28em] uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                SCROLL TO ADVANCE STRATEGY
              </span>
              <div className="w-5 h-8 rounded-full border border-[#7B94A9]/40 flex items-start justify-center p-1">
                <div className="w-1 h-2 rounded-full bg-[#E57338] animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STAGE 2: THE INVADING HORDE (铁骑压境)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-3 px-3 py-1 rounded-full border border-[#8DA4B8]/30 bg-[#091522]/60">
                <span
                  className="text-[10px] font-mono tracking-[0.26em] uppercase text-[#E57338]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  TACTICAL CRISIS · 铁骑逼近
                </span>
              </div>

              <h2
                className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Ten thousand cavalry
                <br />
                <span className="text-[#96B1C9] italic">
                  cutting through the white tempest.
                </span>
              </h2>

              <p
                className="text-base sm:text-lg text-[#BDD1E0] font-light leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The enemy vanguard crested the frozen col with devastating momentum. Drums shook
                the frost from the pine trees. Imperial archers drew freezing bows, their fingers
                numb against the string, knowing that an open clash on this ground was guaranteed
                defeat.
              </p>

              <blockquote className="border-l-2 border-[#E57338] pl-5 py-1 text-sm sm:text-base italic text-[#C9DCE8]/90 font-serif">
                “To face overwhelming numbers in an open field is folly. To make the earth fight for
                you is victory.”
              </blockquote>
            </div>

            <div className="lg:col-span-6">
              {/* Cinematic Art Card: Snow Pass with atmospheric depth */}
              <div className="relative rounded-2xl overflow-hidden border border-[#8DA4B8]/30 bg-[#091524]/80 shadow-[0_16px_40px_rgba(0,0,0,0.7)] group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src="/landing-pages/secret-pathways-assets/mulan-card-03-mountain.jpg"
                    alt="The Mountain Battlefield"
                    className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060D17] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#060D17]/80 backdrop-blur-md border border-[#8DA4B8]/30 text-[10px] font-mono tracking-widest text-[#A8C2D6]">
                    NORTH PASS · RECONNAISSANCE
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7D97AB]">
                    <span>ENEMY VANGUARD: 10,000+</span>
                    <span className="text-[#E57338]">THREAT: CRITICAL</span>
                  </div>
                  <p className="text-sm text-[#C4D7E6] font-serif leading-relaxed">
                    General Shan Yu’s falcon circles above the frozen pass. Every second wasted
                    narrows the possibility of escape.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STAGE 3: THE CALCULATION / READING THE LANDSCAPE (审势借力)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#8DA4B8]/40 bg-[#081525]/80">
              <span
                className="text-[11px] font-mono tracking-[0.26em] uppercase text-[#A7C3DB]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                THE TACTICAL PIVOT · 审势借力
              </span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-serif text-white font-light tracking-wide leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              She did not look at the army.
              <br />
              <span className="italic text-[#E57338]">She looked at the mountain.</span>
            </h2>

            <p
              className="text-base sm:text-xl text-[#BED2E0] font-light leading-relaxed max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              High upon the sheer granite wall, millions of tons of dry snow hung balanced upon an
              unstable limestone lip. It was an avalanche waiting for a whisper.
            </p>

            {/* Strategic Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6">
              <div className="p-6 rounded-xl border border-red-900/30 bg-[#160B0B]/40 backdrop-blur-md space-y-2">
                <span
                  className="text-[10px] font-mono tracking-widest text-[#E74C3C] uppercase"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE CONVENTIONAL WILL
                </span>
                <h4
                  className="text-xl font-serif text-white font-medium"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Direct Clash & Steel
                </h4>
                <p className="text-sm text-[#D1B8B8] leading-relaxed font-light">
                  Hold the narrow valley floor with spearmen. Result: Annihilation by overwhelming
                  mass within twenty minutes.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#E57338]/40 bg-[#141C28]/80 backdrop-blur-md space-y-2 shadow-[0_0_24px_rgba(229,115,56,0.15)]">
                <span
                  className="text-[10px] font-mono tracking-widest text-[#E57338] uppercase"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE MULAN STRATAGEM
                </span>
                <h4
                  className="text-xl font-serif text-white font-medium"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Awaken the Mountain Ridge
                </h4>
                <p className="text-sm text-[#D7E4EE] leading-relaxed font-light">
                  Target the fragile cornice with the final fire-lance rocket. Convert the enemy’s
                  momentum into their tomb.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STAGE 4: THE FIRE LANCE (烽火破晓 · 铜炮引燃)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              {/* Visual Spotlight: Bronze Mortar & Fire Lance Rocket */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E57338]/40 bg-[#0B1522]/90 shadow-[0_0_40px_rgba(229,115,56,0.25)] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#8DA4B8]/20 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E57338] animate-ping" />
                    <span
                      className="text-xs font-mono tracking-widest uppercase text-[#F2945D]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      FINAL ORDNANCE · 神机火矢
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#7D97AB]">AMMUNITION: 1 / 1</span>
                </div>

                <div className="space-y-4">
                  <div className="text-3xl sm:text-4xl font-serif text-white">
                    The Single Arc of Crimson Flame
                  </div>
                  <p className="text-sm sm:text-base text-[#C6D8E6] font-serif leading-relaxed">
                    With steady hands amidst the biting blizzard, she seized the heavy bronze
                    mortar. Turning away from the approaching horsemen, she aimed the black iron
                    barrel upward toward the clouds.
                  </p>
                  <p className="text-sm sm:text-base text-[#C6D8E6] font-serif leading-relaxed">
                    A solitary flint spark caught the sulfur wick. In a burst of blinding gold, the
                    fire lance tore into the white sky.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#91A8BD]">
                  <span>TRAJECTORY: 62° ELEVATION</span>
                  <span className="text-[#E57338] font-bold">TARGET: SUMMIT CORNICE</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center space-x-3 px-3 py-1 rounded-full border border-[#E57338]/40 bg-[#1A120E]/70">
                <span
                  className="text-[10px] font-mono tracking-[0.26em] uppercase text-[#E57338]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  THE SHOT · 一击定乾坤
                </span>
              </div>

              <h2
                className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                A spark of courage
                <br />
                <span className="italic text-[#E57338]">against ten thousand blades.</span>
              </h2>

              <p
                className="text-base sm:text-lg text-[#BDD1E0] font-light leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The rocket hissed through the gale like a falling star reversed. Its crimson plume
                carved a smoking path through the blizzard, striking true into the heart of the snow
                crag with a subterranean shudder.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STAGE 5: THE AVALANCHE & THE SURVIVOR (雪崩残阳 · 舍身卫国)
            ===================================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-24 relative">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full border border-[#8DA4B8]/40 bg-[#0A1626]/80">
              <span
                className="text-[11px] font-mono tracking-[0.28em] uppercase text-[#B5D1E8]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                AFTERMATH · 雪崩与新生
              </span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-serif text-white font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The mountain broke its silence.
              <br />
              <span className="italic text-[#9CB8D1]">A white ocean buried the war.</span>
            </h2>

            <p
              className="text-base sm:text-xl text-[#BED2E2] font-light leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The deafening thunder of collapsing glaciers swallowed the battle cry. When the roaring
              snow cloud finally settled, the invading army was broken—and amidst the blinding
              white silence, Mulan dragged her wounded body from the drift.
            </p>

            {/* Chapter 04 Final Chronicle Wrapup */}
            <div className="p-8 rounded-2xl border border-[#8DA4B8]/30 bg-[#071322]/85 backdrop-blur-md space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-[#8DA4B8]/20 pb-6">
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#7D96AA] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    BATTLE OUTCOME
                  </span>
                  <span className="text-base font-serif text-white font-medium">
                    The Pass Secured · Vanguard Neutralized
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#7D96AA] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    THE COST
                  </span>
                  <span className="text-base font-serif text-[#E57338] font-medium">
                    Wounded in the Drift · Disguise Shattered
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] font-mono tracking-widest text-[#7D96AA] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    LESSON OF THE MOUNTAIN
                  </span>
                  <span className="text-base font-serif text-white font-medium">
                    Wisdom Outlasts Pure Might
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
                <div>
                  <span
                    className="text-[10px] font-mono tracking-[0.24em] text-[#7D96AA] uppercase block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    THE STORY CONTINUES
                  </span>
                  <h3
                    className="text-2xl font-serif text-white"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    05 — Honor Without Disguise
                  </h3>
                  <p className="text-sm text-[#9BB3C7] font-light mt-1">
                    Behind the soldier’s armor is a daughter ready to claim her own truth.
                  </p>
                </div>

                <button
                  onClick={handleContinue}
                  data-cursor-label="PROCEED"
                  className="px-8 py-3.5 rounded-full bg-[#E57338] text-white hover:bg-[#F28246] transition-all duration-300 font-mono text-xs uppercase tracking-[0.22em] shadow-[0_0_24px_rgba(229,115,56,0.4)] hover:shadow-[0_0_36px_rgba(229,115,56,0.65)] cursor-pointer whitespace-nowrap"
                >
                  ENTER CHAPTER 05 →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
