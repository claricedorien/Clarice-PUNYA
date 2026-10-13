import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface Chapter03ExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function Chapter03Experience({
  isOpen,
  onClose,
  onContinue,
}: Chapter03ExperienceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

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

  // Subtle mouse parallax on desktop
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouseOffset({ x, y });
  }, []);

  // Scroll tracking within fullscreen narrative container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const p = Math.min(Math.max(el.scrollTop / total, 0), 1);
      setScrollProgress(p);
    }
  };

  // Canvas atmosphere: torrential night rain streaks, puddle ripples, wind mist, and lantern sparks
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

    // Wind-driven rain streaks
    const rainCount = 110;
    const rain = Array.from({ length: rainCount }, () => ({
      x: Math.random() * (w + 400) - 200,
      y: Math.random() * h,
      length: Math.random() * 26 + 18,
      speedY: Math.random() * 9 + 14,
      speedX: -3.8,
      alpha: Math.random() * 0.28 + 0.12,
      thickness: Math.random() * 1.2 + 0.6,
    }));

    // Rain splashes & puddle ripple rings
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }
    const ripples: Ripple[] = [];

    // Stable lantern embers & floating night dust
    const embers = Array.from({ length: 32 }, () => ({
      x: Math.random() * w * 0.5,
      y: Math.random() * h,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.2) * 0.8,
      speedY: -(Math.random() * 0.6 + 0.2),
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw and update rain streaks
      for (const r of rain) {
        ctx.strokeStyle = `rgba(215, 230, 245, ${r.alpha})`;
        ctx.lineWidth = r.thickness;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + r.speedX * 2, r.y + r.length);
        ctx.stroke();

        r.y += r.speedY;
        r.x += r.speedX;

        // Reset and trigger occasional puddle splash
        if (r.y > h - 40 && Math.random() > 0.88) {
          if (ripples.length < 24) {
            ripples.push({
              x: r.x,
              y: h - Math.random() * 60 - 10,
              radius: 1,
              maxRadius: Math.random() * 16 + 8,
              alpha: 0.45,
            });
          }
        }

        if (r.y > h + 30) {
          r.y = -30;
          r.x = Math.random() * (w + 400) - 200;
        }
      }

      // 2. Draw ground water puddle ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        ctx.strokeStyle = `rgba(180, 210, 240, ${rp.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.radius * 1.8, rp.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        rp.radius += 0.75;
        rp.alpha -= 0.016;

        if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 3. Stable lantern embers
      for (const p of embers) {
        p.y += p.speedY;
        p.x += Math.sin(time + p.pulse) * 0.5 + p.speedX;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w * 0.4;
        }
        const a = p.alpha * (0.5 + 0.5 * Math.sin(time * 2.5 + p.pulse));
        ctx.fillStyle = `rgba(255, 175, 90, ${a})`;
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
  // Section progression stages:
  // Section 1: The Decision (0.00 - 0.22)
  // Section 2: The Transformation (0.22 - 0.48)
  // Section 3: The Gate (0.48 - 0.72)
  // Section 4: The Departure (0.72 - 0.88)
  // Section 5: Closing Beat / Hua Ping (0.88 - 1.00)

  const bgScale = 1.03 + scrollProgress * 0.12;
  const bgTranslateX = -scrollProgress * 4.5 + mouseOffset.x * 0.8;
  const bgTranslateY = -scrollProgress * 2.5 + mouseOffset.y * 0.5;

  // Scene state triggers
  const s1Active = scrollProgress <= 0.24;
  const s2Active = scrollProgress > 0.18 && scrollProgress <= 0.52;
  const s3Active = scrollProgress > 0.46 && scrollProgress <= 0.76;
  const s4Active = scrollProgress > 0.70 && scrollProgress <= 0.92;
  const s5Active = scrollProgress > 0.86;

  // Gate open progress (opens in section 3 & 4)
  const gateOpenProgress = Math.min(1, Math.max(0, (scrollProgress - 0.48) / 0.25));

  // Gallop velocity multiplier for section 4 & 5
  const gallopSpeed = Math.min(1, Math.max(0, (scrollProgress - 0.72) / 0.18));

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#030508] select-none text-[#F1EEE8] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter 03: Borrowed Armor — 借来的盔甲"
    >
      {/* =========================================================================
          1. FULLSCREEN CINEMATIC ENVIRONMENT & LAYERED VISUAL WORLD
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Photographic High-Res Base Plate (Night courtyard, stable gate, rain mist) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 ease-out will-change-transform"
          style={{
            backgroundImage: "url('/landing-pages/secret-pathways-assets/mulan-03-borrowed-armor.jpg')",
            transform: `scale(${bgScale}) translate3d(${bgTranslateX}%, ${bgTranslateY}%, 0)`,
            filter: `brightness(${0.78 + gallopSpeed * 0.12}) contrast(1.18) saturate(${0.9 + gallopSpeed * 0.2})`,
          }}
        />

        {/* Layer 2: Deep Night Storm & Steel Blue Moonlight Vignette */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(ellipse at 80% 15%, rgba(140, 180, 220, 0.26) 0%, rgba(6, 12, 20, 0.55) 45%, rgba(2, 4, 7, 0.92) 100%)',
          }}
        />

        {/* Layer 3: Warm Flickering Stable Lantern Light on Left Wall */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: 0.45 - gallopSpeed * 0.35,
            background:
              'radial-gradient(circle at 18% 42%, rgba(255, 140, 50, 0.32) 0%, rgba(180, 50, 20, 0.14) 38%, transparent 68%)',
          }}
        />

        {/* Layer 4: Distant Lightning Flash / Blade Glint sheen */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            opacity: s2Active ? 0.18 : 0.05,
            background:
              'linear-gradient(135deg, rgba(200, 225, 255, 0.12) 0%, transparent 40%, rgba(255, 255, 255, 0.08) 60%, transparent 100%)',
          }}
        />

        {/* Layer 5: Interactive Live Canvas Particles (Wind-driven rain, ripples, embers) */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none opacity-90" />

        {/* Layer 6: Dynamic Cinematic SVG Character & World Visuals */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* --- STAGE 1 & 2: Mulan with the Ancestral Sword & Lamellar Armor --- */}
          <div
            className="absolute bottom-0 right-[12%] sm:right-[18%] md:right-[24%] transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              opacity: s1Active || s2Active ? 1 : 0,
              transform: `translate3d(${s2Active ? -20 : 0}px, ${s2Active ? -10 : 0}px, 0) scale(${s2Active ? 1.05 : 0.98})`,
            }}
          >
            <svg
              className="w-[170px] sm:w-[230px] md:w-[280px] h-auto drop-shadow-[0_16px_40px_rgba(0,0,0,0.92)]"
              viewBox="0 0 240 480"
              fill="none"
            >
              <defs>
                <linearGradient id="ironPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a5b6d" />
                  <stop offset="35%" stopColor="#222f3e" />
                  <stop offset="70%" stopColor="#141c26" />
                  <stop offset="100%" stopColor="#080c10" />
                </linearGradient>
                <linearGradient id="steelBladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a0b8cc" />
                  <stop offset="45%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#8da0b2" />
                  <stop offset="100%" stopColor="#3d4e5f" />
                </linearGradient>
                <linearGradient id="armorGlint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                  <stop offset="50%" stopColor="rgba(190,215,240,0.4)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>

              {/* Ancestral Jian Sword catching moonlight */}
              <g
                style={{
                  transformOrigin: '120px 220px',
                  transform: s2Active ? 'rotate(-18deg) translate(-10px, 15px)' : 'rotate(0deg)',
                  transition: 'transform 0.6s ease-out',
                }}
              >
                {/* Blade */}
                <path d="M118 70 L122 70 L123 270 L120 286 L117 270 Z" fill="url(#steelBladeGrad)" />
                {/* Blade Fuller & Gleam highlight */}
                <line x1="120" y1="74" x2="120" y2="265" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                {/* Sword Guard (Ancestral bronze dragon crossguard) */}
                <path d="M104 270 L136 270 L132 278 L108 278 Z" fill="#c9a24a" stroke="#8c6a28" strokeWidth="1" />
                {/* Hilt and Pommel */}
                <rect x="117" y="278" width="6" height="34" rx="2" fill="#2d1d17" stroke="#c9a24a" strokeWidth="0.8" />
                <circle cx="120" cy="315" r="5" fill="#c9a24a" />
                {/* Crimson silk hilt tassel waving in night draft */}
                <path
                  d={`M120 318 Q${116 + Math.sin(scrollProgress * 14) * 6} 345 ${118 + Math.sin(scrollProgress * 10) * 8} 370`}
                  stroke="#e0231c"
                  strokeWidth="2.2"
                  fill="none"
                />
              </g>

              {/* Mulan Silhouette & Tightening Armor Body */}
              <g id="mulanWarriorFigure">
                {/* Head & Haircut Silhouette */}
                {s1Active ? (
                  // Section 1: Traditional long hair before cut
                  <g>
                    <ellipse cx="120" cy="80" rx="19" ry="23" fill="#090d14" />
                    {/* Long hair flowing down back before the cut */}
                    <path
                      d="M104 88 C94 130 92 190 98 240 C106 195 110 140 114 96 Z"
                      fill="#070a0e"
                    />
                  </g>
                ) : (
                  // Section 2+: Severed topknot and cropped soldier hair
                  <g>
                    <ellipse cx="120" cy="80" rx="18" ry="22" fill="#0a0f18" />
                    {/* Soldier topknot wrapped tight */}
                    <circle cx="120" cy="56" r="10" fill="#090d14" />
                    <rect x="114" y="52" width="12" height="6" rx="2" fill="#c9a24a" opacity="0.8" />
                    {/* Strands of sheared hair drifting to stone floor */}
                    <path d="M96 160 Q90 200 86 240" stroke="#090d14" strokeWidth="1.2" opacity="0.6" />
                    <path d="M102 175 Q98 220 92 260" stroke="#090d14" strokeWidth="1.2" opacity="0.5" />
                  </g>
                )}

                {/* Heavy Iron Lamellar Cuirass & Shoulder Pauldrons */}
                {/* Pauldrons / Shoulders */}
                <path
                  d="M72 108 C86 98 102 96 120 96 C138 96 154 98 168 108 L180 145 C158 152 82 152 60 145 Z"
                  fill="url(#ironPlateGrad)"
                  stroke="#2b3b4c"
                  strokeWidth="1.5"
                />
                {/* Metallic glint highlight on shoulder */}
                <path d="M76 112 L164 112" stroke="url(#armorGlint)" strokeWidth="1.8" />

                {/* Lamellar Chest Plates (overlapping scales) */}
                <path
                  d="M78 144 L162 144 L154 220 L86 220 Z"
                  fill="url(#ironPlateGrad)"
                  stroke="#1c2836"
                  strokeWidth="1.5"
                />
                {/* Horizontal plate tiers */}
                <line x1="80" y1="162" x2="160" y2="162" stroke="#354556" strokeWidth="1.2" />
                <line x1="82" y1="180" x2="158" y2="180" stroke="#354556" strokeWidth="1.2" />
                <line x1="84" y1="198" x2="156" y2="198" stroke="#354556" strokeWidth="1.2" />

                {/* Cords & Leather Ties tightened around ribs */}
                <line x1="86" y1="210" x2="154" y2="210" stroke="#966a38" strokeWidth="2.5" />
                <circle cx="120" cy="210" r="4" fill="#c9a24a" />

                {/* Leather War Skirt / Greaves */}
                <path
                  d="M86 220 L154 220 L166 380 C170 420 178 458 184 476 L56 476 C62 458 70 420 74 380 Z"
                  fill="#080c12"
                  stroke="#1b2532"
                  strokeWidth="1.5"
                />

                {/* Soldier Traveling Cloak blowing in the night rain */}
                <path
                  d={`M60 138 C${38 - Math.sin(scrollProgress * 12) * 12} 210 ${32 - Math.sin(scrollProgress * 10) * 16} 310 ${44 - Math.sin(scrollProgress * 8) * 18} 440 C68 390 76 280 72 170 Z`}
                  fill="#0e1722"
                  opacity="0.9"
                />
              </g>
            </svg>

            {/* Character caption badge */}
            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#dfe7e0]/50 uppercase block">
                {s1Active ? 'FA MULAN · IN THE SHADOWS' : 'HUA PING · BORROWED STEEL'}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#c9a24a]/70">
                {s1Active ? 'THE ANCESTRAL ESTATE' : 'LAMELLAR ARMOR CINCHED'}
              </span>
            </div>
          </div>

          {/* --- STAGE 3: The Stable Gate & Father\'s Warhorse --- */}
          <div
            className="absolute bottom-0 left-[8%] sm:left-[16%] md:left-[22%] transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              opacity: s3Active ? 1 : 0,
              transform: `translate3d(0, ${s3Active ? 0 : 30}px, 0)`,
            }}
          >
            <svg
              className="w-[200px] sm:w-[280px] md:w-[360px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
              viewBox="0 0 320 360"
              fill="none"
            >
              {/* Massive Wooden Gate Swing */}
              <g
                style={{
                  transformOrigin: '20px 180px',
                  transform: `rotateY(${gateOpenProgress * -45}deg)`,
                  transition: 'transform 0.8s ease-out',
                }}
              >
                {/* Gate Post & Heavy Beams */}
                <rect x="10" y="20" width="22" height="340" fill="#18130f" stroke="#0d0a08" strokeWidth="2" />
                <rect x="30" y="40" width="120" height="300" rx="4" fill="#241c15" stroke="#120e0a" strokeWidth="2" />
                <line x1="30" y1="120" x2="150" y2="120" stroke="#3d2f23" strokeWidth="4" />
                <line x1="30" y1="220" x2="150" y2="220" stroke="#3d2f23" strokeWidth="4" />
                {/* Iron studs on gate */}
                {[60, 100, 140, 180, 240, 280].map((y, idx) => (
                  <circle key={idx} cx="85" cy={y} r="3.5" fill="#4d5f70" />
                ))}
                {/* Open Latch dangling */}
                <rect x="140" y="165" width="18" height="6" rx="2" fill="#c9a24a" stroke="#8a6e30" strokeWidth="1" />
              </g>

              {/* Noble Warhorse in the Rain Mist */}
              <g id="warhorseProfile">
                {/* Horse Body, Neck & Head */}
                <path
                  d="M140 220 C140 180 170 150 210 140 C230 110 245 75 265 60 C275 52 290 60 286 78 C282 95 272 110 268 126 C280 134 290 142 284 154 C272 165 248 160 235 170 C220 200 225 250 228 320 L212 320 C208 270 200 230 185 220 L150 220 Z"
                  fill="#11161f"
                  stroke="#1c2430"
                  strokeWidth="2"
                />
                {/* Mane blowing in the wind */}
                <path
                  d={`M240 85 Q${225 - Math.sin(scrollProgress * 12) * 8} 115 220 145 Q${210 - Math.sin(scrollProgress * 10) * 10} 175 205 195`}
                  stroke="#080c12"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Bridle & Leather Reins */}
                <line x1="275" y1="72" x2="282" y2="100" stroke="#966a38" strokeWidth="1.8" />
                <line x1="282" y1="100" x2="260" y2="120" stroke="#966a38" strokeWidth="1.8" />
                <path
                  d={`M280 102 Q${240 + Math.sin(scrollProgress * 8) * 8} 160 215 190`}
                  stroke="#c9a24a"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Steed eye and ear */}
                <path d="M260 52 L266 68 L254 66 Z" fill="#11161f" stroke="#1c2430" />
                <circle cx="270" cy="74" r="2.2" fill="#d0e2ec" />
                {/* Warm breath mist vapor in cold night rain */}
                <ellipse
                  cx="296"
                  cy="146"
                  rx="18"
                  ry="8"
                  fill="rgba(210, 230, 250, 0.22)"
                  className="animate-pulse"
                />
              </g>
            </svg>

            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#dfe7e0]/50 uppercase block">
                FATHER’S BLACK STEED · THE TIMBER GATE
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#c9a24a]/70">
                LATCH RELEASED INTO THE STORM
              </span>
            </div>
          </div>

          {/* --- STAGE 4 & 5: Mounted Gallop into the Torrential Night --- */}
          <div
            className="absolute bottom-[6%] right-[10%] sm:right-[18%] md:right-[26%] transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              opacity: s4Active || s5Active ? 1 : 0,
              transform: `translate3d(${gallopSpeed * -30}px, ${-gallopSpeed * 15}px, 0) scale(${1.0 + gallopSpeed * 0.1})`,
            }}
          >
            <svg
              className="w-[220px] sm:w-[320px] md:w-[420px] h-auto drop-shadow-[0_24px_60px_rgba(0,0,0,0.95)]"
              viewBox="0 0 400 320"
              fill="none"
            >
              <g id="mountedGallop">
                {/* Galloping Steed in full stride */}
                <path
                  d="M120 180 C150 150 220 140 260 160 C290 140 310 90 330 70 C340 60 360 70 354 90 C348 110 335 130 330 150 C350 160 365 170 358 185 C340 200 300 190 280 200 C250 210 240 260 220 280 C210 290 190 270 200 240 L160 250 L120 270 C100 280 80 260 100 230 C110 215 110 195 120 180 Z"
                  fill="#0c1017"
                  stroke="#1c2533"
                  strokeWidth="2.5"
                />
                {/* Whipping Mane and Tail in the Gale */}
                <path
                  d={`M320 85 Q${285 - Math.sin(scrollProgress * 16) * 15} 105 260 120`}
                  stroke="#070a0e"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d={`M110 190 Q${60 - Math.sin(scrollProgress * 14) * 20} 200 40 230`}
                  stroke="#070a0e"
                  strokeWidth="9"
                  strokeLinecap="round"
                />

                {/* Mounted Mulan in Father's Armor */}
                {/* Torso & Pauldrons leaning forward in military gallop */}
                <path
                  d="M205 150 L240 135 L260 175 L215 190 Z"
                  fill="url(#ironPlateGrad)"
                  stroke="#2b3b4c"
                  strokeWidth="1.8"
                />
                {/* Soldier Topknot head leaning into wind */}
                <ellipse cx="245" cy="115" rx="14" ry="17" fill="#090d14" />
                <circle cx="242" cy="98" r="7" fill="#080c10" />
                {/* Military Cloak billowing backward */}
                <path
                  d={`M205 145 C${160 - Math.sin(scrollProgress * 15) * 22} 150 ${130 - Math.sin(scrollProgress * 12) * 26} 170 ${90 - Math.sin(scrollProgress * 10) * 30} 185 C140 185 180 180 215 180 Z`}
                  fill="#0e1722"
                  opacity="0.95"
                />
                {/* Ancestral sword strapped horizontally across back */}
                <line x1="180" y1="130" x2="265" y2="165" stroke="#ffffff" strokeWidth="2.2" opacity="0.9" />
                <circle cx="180" cy="130" r="3.5" fill="#c9a24a" />

                {/* Hooves splashing water on ancient wet stones */}
                <ellipse cx="100" cy="275" rx="22" ry="5" fill="rgba(180, 215, 245, 0.3)" />
                <ellipse cx="220" cy="285" rx="25" ry="6" fill="rgba(180, 215, 245, 0.3)" />
              </g>
            </svg>

            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#dfe7e0]/50 uppercase block">
                INTO THE STORM · TOWARD YELLOW RIVER
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#c9a24a]/70">
                HUA PING · DAUNTLESS COURAGE
              </span>
            </div>
          </div>
        </div>

        {/* Layer 7: Ground Water Reflection Shimmer along bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030508] via-[#05080e]/70 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          2. MINIMAL DIRECT HUD NAVIGATION CONTROLS (Top-Left & Top-Right)
          ========================================================================= */}
      {/* Top-Left: Chapter Identity Badge (Clean editorial typography, zero-pill) */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-40 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#dfe7e0]/15 bg-[#05070a]/75 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#e0231c] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#dfe7e0]/85 font-semibold">
            03 / 05 · BORROWED ARMOR
          </span>
          <span className="text-[#dfe7e0]/30 text-xs">·</span>
          <span className="text-[11px] font-serif text-[#c9a24a] tracking-widest">
            借来的盔甲
          </span>
        </div>
      </div>

      {/* Top-Right: Accessible × CLOSE & RETURN TO GRID Button */}
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

      {/* Bottom-Right: Floating CONTINUE TO 04 THE MOUNTAIN */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-40">
        <button
          onClick={handleContinue}
          className="group flex items-center gap-3 px-6 py-3 min-h-[44px] rounded-full border border-[#c9a24a]/60 bg-[#0c121b]/90 backdrop-blur-md text-[#f7df94] text-xs font-medium uppercase tracking-[0.2em] hover:border-[#f7df94] hover:bg-[#151f2e] hover:shadow-[0_0_28px_rgba(201,162,74,0.38)] active:scale-95 transition-all cursor-pointer shadow-2xl"
          aria-label="Continue to Chapter 04: The Mountain"
          data-cursor-label="NEXT"
        >
          <span>CONTINUE: 04 THE MOUNTAIN</span>
          <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Slender Cinematic Progress Tracker along the viewport bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#e0231c] via-[#c9a24a] to-[#f7df94] transition-all duration-150"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* =========================================================================
          3. SCROLL-DRIVEN CINEMATIC STORY PROGRESSION (5 SECTIONS)
          ========================================================================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-30 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        {/* ------------------------------------------------------------------
            SECTION 1 — THE DECISION (0% - 20%)
            Stable & room atmosphere. Rain outside. Sword catches dim moonlight.
            ------------------------------------------------------------------ */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-4xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 text-xs font-mono">
              <span className="text-[#e0231c] tracking-[0.25em] font-semibold">
                CHAPTER 03
              </span>
              <span className="text-[#dfe7e0]/30">/</span>
              <span className="text-[#c9a24a] tracking-[0.2em] uppercase">
                NIGHT DEPARTURE · ARMOR · IDENTITY · DISGUISE
              </span>
            </div>

            <div className="flex items-baseline gap-5">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight uppercase text-white font-serif">
                Borrowed Armor
              </h1>
              <span className="text-3xl sm:text-5xl font-serif text-[#dfe7e0]/30 tracking-widest">
                借来的盔甲
              </span>
            </div>

            <p className="text-lg sm:text-2xl font-serif italic text-[#c9a24a] leading-relaxed max-w-2xl pt-2">
              “With a single swordstroke, her hair fell to the stone floor. She rode into the rain alone.”
            </p>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#06090e]/75 backdrop-blur-md border border-[#dfe7e0]/10 max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              <span className="text-xs font-mono tracking-[0.2em] text-[#e0231c] uppercase block mb-2">
                01. The Quiet Stable
              </span>
              <p className="text-xl sm:text-2xl font-serif text-[#f1eee8] leading-relaxed font-light">
                The night rain masked the creak of the stable latch.
              </p>
              <p className="text-sm sm:text-base text-[#c8d1ca] font-light leading-relaxed mt-3">
                In the silence of the courtyard, cold moonlight glinted upon the steel of the ancestral blade.
                Her father’s armor lay rested in the shadows, waiting for a son who was never born.
              </p>
            </div>

            <div className="pt-6 flex items-center gap-3 text-xs font-mono tracking-widest text-[#dfe7e0]/50 uppercase">
              <span className="inline-block animate-bounce">↓</span>
              <span>SCROLL TO ENTER THE TRANSFORMATION</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            SECTION 2 — THE TRANSFORMATION (20% - 45%)
            Hair falls. Armor tightened. Daughter shifts to soldier.
            ------------------------------------------------------------------ */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl ml-auto md:mr-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/80 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_24px_70px_rgba(0,0,0,0.8)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#c9a24a] uppercase block">
              02. The Severed Knot & Cinch of Steel
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              Dressed in laminated iron plates cut for a veteran twice her breadth,
              she cinched the leather cords tight enough to bruise her ribs.
            </p>
            <p className="text-base sm:text-xl font-serif italic text-[#c9a24a] leading-relaxed">
              “Every plate bore the scars of battles fought before her birth. Now they held her breath.”
            </p>
            <p className="text-xs sm:text-sm text-[#c8d1ca] font-light leading-relaxed">
              She bound her hair into the warrior’s topknot, letting the trimmed silk fall among the iron shavings.
              The mirror in the stable lantern showed not Fa Mulan, but the silhouette of an imperial conscript.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            SECTION 3 — THE GATE (45% - 70%)
            The horse is revealed. Heavy timber gate unlatches. Mulan mounts.
            ------------------------------------------------------------------ */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/80 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_24px_70px_rgba(0,0,0,0.8)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#e0231c] uppercase block">
              03. The Unlatched Timber Gate
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              She took up her father’s horse.
            </p>
            <p className="text-base sm:text-xl font-serif italic text-[#c9a24a] leading-relaxed">
              “The heavy wooden gate creaked open into rain and utter darkness.”
            </p>
            <p className="text-xs sm:text-sm text-[#c8d1ca] font-light leading-relaxed">
              The warhorse exhaled white mist into the chill downpour, recognizing the ancestral saddle and bridle.
              Placing her boot into the rusted stirrup, she looked back once at the dark eaves of home—then pulled the latch shut behind her forever.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            SECTION 4 — THE DEPARTURE (70% - 90%)
            Riding out into the rain. Hooves on wet stones. The estate recedes.
            ------------------------------------------------------------------ */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-3xl ml-auto md:mr-24">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#06090e]/80 backdrop-blur-md border border-[#dfe7e0]/10 shadow-[0_24px_70px_rgba(0,0,0,0.8)] space-y-6">
            <span className="text-xs font-mono tracking-[0.2em] text-[#ff7360] uppercase block">
              04. The Midnight Gallop
            </span>
            <p className="text-xl sm:text-3xl font-serif text-[#f1eee8] leading-relaxed font-light">
              Taking up her father’s horse, she galloped toward the Yellow River camp.
            </p>
            <p className="text-base sm:text-xl font-light text-[#c8d1ca] leading-relaxed">
              No longer Fa Mulan, she entered the muster ranks as Hua Ping—a soldier born of necessity and quiet steel.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono uppercase tracking-wider text-[#dfe7e0]/60">
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">MUSTER POINT</span>
                <span className="text-[#f1eee8] text-sm font-medium">Yellow River Encampment</span>
              </div>
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">RELIC</span>
                <span className="text-[#c9a24a] text-sm font-medium">The Ancestral Jian Sword</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            SECTION 5 — CLOSING BEAT (90% - 100%)
            Road darkens toward military camp. Virtue & Next Chapter Callout.
            ------------------------------------------------------------------ */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 max-w-4xl mx-auto pb-24">
          <div className="space-y-8 p-10 sm:p-14 rounded-3xl bg-[#06090e]/85 backdrop-blur-xl border border-[#c9a24a]/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)] w-full">
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#e0231c] font-bold">
              05. THE EMBARKATION
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-light text-white leading-snug">
              “A soldier born of necessity<br className="hidden sm:inline" />
              and quiet steel.”
            </h2>

            <p className="text-sm sm:text-base text-[#c8d1ca] max-w-xl mx-auto font-light leading-relaxed">
              Behind her lay the peaceful looms and daughterly rituals of the House of Fa. Ahead lay the northern mountains, the blizzard winds, and an empire fighting for its survival.
            </p>

            {/* Campaign Dossier Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-lg mx-auto border-t border-white/10 text-xs font-mono uppercase tracking-wider text-[#dfe7e0]/65 text-left">
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">VIRTUE</span>
                <span className="text-[#f1eee8] text-sm font-medium">勇 · Dauntless Courage</span>
              </div>
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">IDENTITY</span>
                <span className="text-[#c9a24a] text-sm font-medium">Hua Ping (花平)</span>
              </div>
              <div>
                <span className="text-[10px] text-[#dfe7e0]/40 block">DESTINATION</span>
                <span className="text-[#ff7360] text-sm font-medium">Northern Snow Pass</span>
              </div>
            </div>

            {/* Interactive Actions */}
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
                <span>CONTINUE TO 04 — THE MOUNTAIN</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
