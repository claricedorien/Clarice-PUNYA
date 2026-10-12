import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface Chapter01ExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function Chapter01Experience({
  isOpen,
  onClose,
  onContinue,
}: Chapter01ExperienceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

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

  // Scroll tracking within fullscreen narrative container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const p = Math.min(Math.max(el.scrollTop / total, 0), 1);
      setScrollProgress(p);
    }
  };

  // Canvas atmosphere: gentle drifting rain, lantern particles, mist waves & water ripples
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

    // Drifting particles: firefly sparks + fine rain streaks
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.4) * 0.45,
      speedY: Math.random() * 0.65 + 0.35,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? 'rgba(255, 198, 118, ' : 'rgba(240, 245, 250, '
    }));

    // Fine rain streaks
    const rain = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      length: Math.random() * 18 + 12,
      speedY: Math.random() * 4 + 7,
      speedX: -1.2,
      alpha: Math.random() * 0.22 + 0.08
    }));

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, w, h);

      // 1. Drifting rain streaks
      ctx.lineWidth = 1;
      for (const r of rain) {
        ctx.strokeStyle = `rgba(223, 231, 240, ${r.alpha})`;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + r.speedX * 2, r.y + r.length);
        ctx.stroke();

        r.y += r.speedY;
        r.x += r.speedX;
        if (r.y > h) {
          r.y = -20;
          r.x = Math.random() * w;
        }
      }

      // 2. Warm lantern embers & moonlight pollen
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += Math.sin(time + p.pulse) * 0.4 + p.speedX;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.pulse));
        ctx.fillStyle = `${p.color}${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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

  // Cinematic scroll interpolation values
  // Camera pans subtly across courtyard, zooms gently, and lighting warms up
  const bgScale = 1 + scrollProgress * 0.08;
  const bgTranslateX = -scrollProgress * 3.5; // percent
  const bgTranslateY = -scrollProgress * 2.0; // percent

  // Silhouette opacity & position based on story progression
  // Visible during 20% - 85%
  const silhouetteOpacity =
    scrollProgress > 0.12 && scrollProgress < 0.88
      ? Math.min(Math.sin(((scrollProgress - 0.12) / 0.76) * Math.PI) * 1.35, 1)
      : 0;

  // Head raise animation trigger near 60% - 80%
  const headRaise = Math.max(0, Math.min(1, (scrollProgress - 0.55) / 0.2));

  // Warmth multiplier for stage 80% - 100%
  const warmGlowIntensity = Math.min(1, Math.max(0, (scrollProgress - 0.7) / 0.3));

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#040609] select-none text-[#F1EEE8] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter 01: Before the Armor — The House of Fa"
    >
      {/* =========================================================================
          1. FULLSCREEN CINEMATIC CANVAS & HOUSE OF FA ENVIRONMENT
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: High-Fidelity House of Fa Courtyard Background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 ease-out will-change-transform"
          style={{
            backgroundImage: "url('/landing-pages/secret-pathways-assets/mulan-fa-courtyard-night.jpg')",
            transform: `scale(${bgScale}) translate3d(${bgTranslateX}%, ${bgTranslateY}%, 0)`,
            filter: `brightness(${0.85 + warmGlowIntensity * 0.2}) contrast(1.12) saturate(${1.0 + warmGlowIntensity * 0.25})`,
          }}
        />

        {/* Layer 2: Moving Moonlight Wash & Imperial Scrim */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(180,210,240,0.18)_0%,rgba(6,9,14,0.45)_50%,rgba(3,5,8,0.85)_100%)] transition-opacity duration-700"
        />

        {/* Layer 3: Warm Lantern Light Bloom on Pavilion (Pulses and intensifies toward conclusion) */}
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            opacity: 0.35 + warmGlowIntensity * 0.5,
            background:
              'radial-gradient(circle at 25% 65%, rgba(255, 142, 60, 0.28) 0%, rgba(200, 70, 30, 0.12) 40%, transparent 70%), radial-gradient(circle at 62% 52%, rgba(255, 185, 90, 0.22) 0%, transparent 50%)',
          }}
        />

        {/* Layer 4: Interactive Live Canvas Particles (Embers & Rain Mist) */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none opacity-85" />

        {/* Layer 5: Mulan Silhouette Micro-Animation in Doorway / Pavilion */}
        <div
          className="absolute bottom-0 right-[15%] sm:right-[22%] md:right-[28%] z-20 pointer-events-none transition-all duration-700 ease-out flex flex-col items-center"
          style={{
            opacity: silhouetteOpacity,
            transform: `translate3d(0, ${15 - scrollProgress * 15}px, 0) scale(${0.96 + scrollProgress * 0.05})`,
          }}
        >
          {/* Detailed SVG Silhouette of Mulan in traditional Hanfu before armor */}
          <svg
            className="w-[140px] sm:w-[190px] md:w-[240px] h-auto drop-shadow-[0_12px_36px_rgba(0,0,0,0.85)] filter brightness-95"
            viewBox="0 0 200 480"
            fill="none"
          >
            <defs>
              <linearGradient id="mulanShade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a2533" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#080c12" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#040608" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="silkEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 175, 110, 0.6)" />
                <stop offset="50%" stopColor="rgba(190, 215, 235, 0.3)" />
                <stop offset="100%" stopColor="rgba(180, 40, 30, 0.5)" />
              </linearGradient>
            </defs>

            {/* Hair pin & topknot with delicate head tilt micro-motion */}
            <g
              style={{
                transformOrigin: '98px 90px',
                transform: `rotate(${headRaise * -5.5}deg) translateY(${headRaise * -2.5}px)`,
                transition: 'transform 0.4s ease-out',
              }}
            >
              {/* Head & hair silhouette */}
              <ellipse cx="98" cy="78" rx="20" ry="24" fill="url(#mulanShade)" />
              {/* Elegant hair bun & pin */}
              <circle cx="94" cy="52" r="14" fill="url(#mulanShade)" />
              <path d="M78 50 L122 46" stroke="#c9a24a" strokeWidth="2.5" strokeLinecap="round" />
              {/* Hair ribbon dangling */}
              <path
                d={`M84 56 Q${80 + Math.sin(scrollProgress * 12) * 5} 90 82 120`}
                stroke="#e0231c"
                strokeWidth="2.2"
                fill="none"
              />
              {/* Profile cheek & slender neck */}
              <path d="M108 82 Q112 92 104 104 L92 104" fill="url(#mulanShade)" />
            </g>

            {/* Slender shoulders and hanfu bodice */}
            <path
              d="M68 116 C80 106 116 106 128 116 L144 165 C132 178 64 178 52 165 Z"
              fill="url(#mulanShade)"
            />

            {/* Flowing wide silk sleeves with breathing motion */}
            <path
              d={`M56 140 C${42 + Math.sin(scrollProgress * 8) * 6} 200 48 290 62 330 C75 295 86 210 82 170 Z`}
              fill="url(#mulanShade)"
            />
            <path
              d={`M140 140 C${154 - Math.sin(scrollProgress * 8) * 6} 200 148 290 134 330 C121 295 110 210 114 170 Z`}
              fill="url(#mulanShade)"
            />

            {/* Long pleated robe cascading down to stone floor */}
            <path
              d="M72 170 L124 170 L146 390 C152 430 162 465 174 476 L26 476 C38 465 48 430 54 390 Z"
              fill="url(#mulanShade)"
            />

            {/* Rim light highlight accent along silk drape */}
            <path
              d="M128 116 L144 165 L136 260 L148 420 L174 476"
              stroke="url(#silkEdge)"
              strokeWidth="1.8"
              fill="none"
              opacity="0.8"
            />
          </svg>

          {/* Character presence aura label */}
          <div className="mt-2 text-center pointer-events-none">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#dfe7e0]/40 block">
              花木兰 · FA MULAN
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#c9a24a]/60">
              BEFORE THE ARMOR
            </span>
          </div>
        </div>

        {/* Layer 6: Lotus pond reflection shimmer at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#040609] via-[#05080e]/60 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          2. MINIMAL DIRECT HUD NAVIGATION CONTROLS (Top-Right & Top-Left)
          ========================================================================= */}
      {/* Top-Left: Chapter Identity Badge */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-40 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dfe7e0]/15 bg-[#05070a]/70 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#e0231c] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#dfe7e0]/80">
            CHAPTER 01 // HOUSE OF FA
          </span>
        </div>
        <span className="hidden md:inline text-xs font-serif italic text-[#c9a24a]/75 tracking-wider">
          “Quiet filial walls”
        </span>
      </div>

      {/* Top-Right: RETURN TO GRID / CLOSE DIRECT BUTTON */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-40">
        <button
          onClick={handleClose}
          className="group flex items-center gap-3 px-5 py-2.5 min-h-[44px] min-w-[44px] rounded-full border border-[#dfe7e0]/25 bg-[#090d14]/85 backdrop-blur-md text-[#dfe7e0] text-xs font-mono uppercase tracking-widest hover:border-[#dfe7e0] hover:text-white hover:bg-[#121924] active:scale-95 transition-all cursor-pointer shadow-2xl"
          aria-label="Return to chapter grid"
          data-cursor-label="CLOSE"
        >
          <span className="text-base leading-none text-[#ff826e] group-hover:rotate-90 transition-transform">
            ×
          </span>
          <span>RETURN TO GRID</span>
        </button>
      </div>

      {/* Bottom-Right: CONTINUE TO 02 FLOATING ACTION */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-40">
        <button
          onClick={handleContinue}
          className="group flex items-center gap-3 px-6 py-3 min-h-[44px] rounded-full border border-[#c9a24a]/60 bg-[#0c121b]/90 backdrop-blur-md text-[#f7df94] text-xs font-medium uppercase tracking-[0.2em] hover:border-[#f7df94] hover:bg-[#151f2e] hover:shadow-[0_0_28px_rgba(201,162,74,0.38)] active:scale-95 transition-all cursor-pointer shadow-2xl"
          aria-label="Continue to Chapter 02: The Summons"
          data-cursor-label="NEXT"
        >
          <span>CONTINUE: 02 THE SUMMONS</span>
          <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Progress Bar along bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#e0231c] via-[#c9a24a] to-[#f7df94] transition-all duration-150"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* =========================================================================
          3. SCROLL-DRIVEN CINEMATIC STORY PROGRESSION
          ========================================================================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-30 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        {/* ACT 1 (0% - 20%): Entrance into House of Fa Courtyard */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-4xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <span className="text-xs font-mono text-[#e0231c] tracking-[0.25em] font-semibold">
                CHAPTER 01
              </span>
              <span className="text-xs text-[#dfe7e0]/30">/</span>
              <span className="text-xs font-mono text-[#c9a24a] tracking-[0.2em] uppercase">
                FAMILY · HOME · TRADITION · IDENTITY
              </span>
            </div>

            <div className="flex items-baseline gap-5">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight uppercase text-white font-serif">
                Before The Armor
              </h1>
              <span className="text-3xl sm:text-5xl font-serif text-[#dfe7e0]/30 tracking-widest">
                盔甲之前
              </span>
            </div>

            <p className="text-lg sm:text-2xl font-serif italic text-[#c9a24a] leading-relaxed max-w-2xl pt-2">
              “Quiet filial walls and the weight of tradition before the summons arrived.”
            </p>

            <div className="pt-8 flex items-center gap-3 text-xs font-mono tracking-widest text-[#dfe7e0]/50 uppercase">
              <span className="inline-block animate-bounce">↓</span>
              <span>SCROLL TO ENTER THE NARRATIVE</span>
            </div>
          </div>
        </section>

        {/* ACT 2 (20% - 40%): The Loom & Filial Expectation */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl ml-auto md:mr-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/75 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#e0231c] uppercase block">
              01. The Ancestral Estate
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              Beneath the carved eaves of the ancestral estate, the loom clattered with the steady cadence of generations before her.
            </p>
            <p className="text-base sm:text-xl font-serif italic text-[#c9a24a] leading-relaxed">
              “Every fold of silk was an expectation woven into fabric.”
            </p>
          </div>
        </section>

        {/* ACT 3 (40% - 60%): The Garden Pavilion & Lotus Pool */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/75 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#c9a24a] uppercase block">
              02. Dusk Over the Lotus Pool
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              Every tea bowl served a ritual of daughterly devotion.
            </p>
            <p className="text-base sm:text-xl font-light text-[#c8d1ca] leading-relaxed">
              Yet in the garden pavilion at dusk, reflecting upon the lotus pool, Mulan saw a horizon stretching far beyond the compound walls.
            </p>
          </div>
        </section>

        {/* ACT 4 (60% - 80%): Looking Outward Beyond the Compound */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl ml-auto md:mr-24">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/75 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#ff7360] uppercase block">
              03. The Unseen Horizon
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              She watched the vermilion moon lift over the tiled roofs, feeling the silence between filial duty and who she truly was.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono uppercase tracking-wider text-[#dfe7e0]/60">
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">VIRTUE</span>
                <span className="text-[#f1eee8] text-sm font-medium">孝 · Filial Duty</span>
              </div>
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">CALLING</span>
                <span className="text-[#c9a24a] text-sm font-medium">The Impending Trial</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACT 5 (80% - 100%): The Awakening Flame & Chapter Climax */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 max-w-4xl mx-auto pb-24">
          <div className="space-y-8 p-10 sm:p-14 rounded-3xl bg-[#06090e]/85 backdrop-blur-xl border border-[#c9a24a]/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#e0231c] font-bold">
              THE VOW BEFORE THE SUMMONS
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-light text-white leading-snug">
              “Her honor was not a passive inheritance,<br className="hidden sm:inline" />
              but a flame waiting for its true trial.”
            </h2>

            <p className="text-sm sm:text-base text-[#c8d1ca] max-w-xl mx-auto font-light leading-relaxed">
              In the darkness of the ancestral hall, the loom fell quiet. The imperial decree would arrive with dawn, and the woman behind the armor would make her choice.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={handleClose}
                className="px-6 py-3.5 min-h-[44px] rounded-full border border-[#dfe7e0]/25 text-[#dfe7e0] text-xs font-mono uppercase tracking-widest hover:border-white hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                data-cursor-label="GRID"
              >
                ← Return to Sanctuary
              </button>
              <button
                onClick={handleContinue}
                className="group flex items-center gap-3 px-8 py-3.5 min-h-[44px] rounded-full border border-[#c9a24a] bg-[#0c121b] text-[#f7df94] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#182333] hover:shadow-[0_0_35px_rgba(201,162,74,0.45)] active:scale-95 transition-all cursor-pointer"
                data-cursor-label="NEXT"
              >
                <span>CONTINUE TO 02 — THE SUMMONS</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
