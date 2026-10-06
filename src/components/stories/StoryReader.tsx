import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../../data/stories';
import { X, List, Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

interface StoryReaderProps {
  story: Story;
  onExit: () => void;
  onOpenIndex: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onExit,
  onOpenIndex,
  soundEnabled,
  onToggleSound,
}) => {
  const [readProgress, setReadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick(320);
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Scroll listener for reading progress
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setReadProgress(progress);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // WebGL / Canvas visual atmosphere tailored to the story
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Story 01: The Last Train (drifting mist and railway rails)
    // Story 02: The Boy Who Collected Rain (raindrops & ripple reflections)
    // Story 03: Seven Minutes Before Midnight (twinkling constellations & dark city grid)
    interface AtmosphericParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
    }

    const particles: AtmosphericParticle[] = [];
    const count = story.visualTheme === 'rain-glass' ? 70 : 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: story.visualTheme === 'rain-glass' ? (Math.random() - 0.5) * 0.2 : (Math.random() - 0.5) * 0.4,
        vy: story.visualTheme === 'rain-glass' ? Math.random() * 2.5 + 1.2 : -Math.random() * 0.3 - 0.1,
        size: Math.random() * 2.5 + 1.0,
        alpha: Math.random() * 0.5 + 0.15,
        decay: Math.random() * 0.004 + 0.001,
      });
    }

    let clock = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      clock += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric background tint
      if (story.visualTheme === 'train-mist') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(7, 7, 7, 0.95)');
        grad.addColorStop(0.5, 'rgba(12, 12, 15, 0.92)');
        grad.addColorStop(1, 'rgba(7, 7, 7, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Distant train rails perspective lines
        ctx.strokeStyle = 'rgba(201, 166, 107, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.moveTo(width * 0.7, height);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.stroke();
      } else if (story.visualTheme === 'rain-glass') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(7, 9, 12, 0.94)');
        grad.addColorStop(1, 'rgba(5, 7, 9, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(7, 7, 7, 0.96)');
        grad.addColorStop(1, 'rgba(10, 8, 12, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Atmospheric Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (story.visualTheme === 'rain-glass') {
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.fillStyle = '#8798A5';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.alpha -= p.decay;
          if (p.y < 0 || p.alpha <= 0) {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.alpha = Math.random() * 0.5 + 0.15;
          }
          ctx.fillStyle = story.accent;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [story.visualTheme, story.accent]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070707] text-[#F1EEE8] select-none animate-fadeIn overflow-hidden">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

      {/* Thin Vertical Reading Progress Line on the left edge */}
      <div className="fixed top-0 left-0 bottom-0 w-[2px] bg-white/10 z-30">
        <div
          className="w-full bg-[#C9A66B] transition-all duration-150"
          style={{ height: `${readProgress * 100}%` }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between px-8 sm:px-14 py-6 border-b border-white/10 bg-[#070707]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={onExit}
            className="flex items-center space-x-2 text-xs font-grotesk tracking-[0.2em] uppercase text-[rgba(241,238,232,0.7)] hover:text-[#F1EEE8] transition-colors"
          >
            <span>THE LIVING LIBRARY</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-mono text-[11px] text-[#C9A66B] tracking-widest">
            {story.archiveId}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-6 text-xs font-grotesk tracking-[0.2em] uppercase text-[rgba(241,238,232,0.65)]">
          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={onToggleSound}
            className="flex items-center space-x-2 hover:text-[#F1EEE8] transition-colors"
            title={soundEnabled ? 'Mute Atmosphere' : 'Unmute Atmosphere'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span className="hidden sm:inline text-[#C9A66B]">SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SOUND OFF</span>
              </>
            )}
          </button>

          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={onOpenIndex}
            className="hover:text-[#F1EEE8] transition-colors flex items-center space-x-1.5"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">INDEX</span>
          </button>

          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={() => {
              sound.playClick(320);
              onExit();
            }}
            className="flex items-center space-x-1.5 hover:text-[#F1EEE8] text-[#C9A66B] transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">EXIT STORY</span>
          </button>
        </div>
      </header>

      {/* Main Scrollytelling Reader Area */}
      <div
        ref={containerRef}
        className="relative z-20 flex-1 overflow-y-auto px-6 sm:px-12 py-16 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-36 pb-40">
          {/* Story Title Hero Block */}
          <section className="min-h-[70vh] flex flex-col justify-center space-y-8 border-b border-white/10 pb-16">
            <div className="space-y-3">
              <span className="font-grotesk text-xs tracking-[0.3em] text-[#C9A66B] uppercase">
                {story.genre} · {story.readingTime}
              </span>
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-[#F1EEE8] font-normal leading-[1.05] tracking-tight">
                {story.title}
              </h1>
            </div>

            <p className="font-serif text-xl sm:text-2xl text-[rgba(241,238,232,0.85)] italic leading-relaxed max-w-xl">
              “{story.description}”
            </p>

            <div className="pt-12 flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[rgba(241,238,232,0.4)] uppercase">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#C9A66B]" />
              <span>SCROLL TO ENTER CHAPTER RECORD</span>
            </div>
          </section>

          {/* Sequential Scrollytelling Chapters */}
          {story.sections.map((sec, secIdx) => (
            <section key={sec.number} className="space-y-24">
              {/* Section Header */}
              <div className="flex items-baseline space-x-6 border-b border-white/10 pb-4">
                <span className="font-mono text-xs tracking-widest text-[#C9A66B]">
                  {sec.number}
                </span>
                <h2 className="font-grotesk text-xs uppercase tracking-[0.25em] text-[rgba(241,238,232,0.5)]">
                  {sec.heading}
                </h2>
              </div>

              {/* Story Narrative Beats with Generous Whitespace */}
              <div className="space-y-24">
                {sec.cues.map((cue, cIdx) => (
                  <div key={cIdx} className="space-y-4 group">
                    <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#F1EEE8] font-light leading-[1.25] tracking-tight">
                      {cue.text}
                    </p>

                    {cue.subtext && (
                      <p className="font-serif text-base sm:text-lg text-[rgba(241,238,232,0.55)] italic leading-relaxed max-w-xl">
                        {cue.subtext}
                      </p>
                    )}

                    {cue.visualShift && (
                      <div className="pt-2 flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#C9A66B]/75 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B]" />
                        <span>STAGE CUE // {cue.visualShift}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Concluding Story Codex Footer */}
          <section className="pt-24 border-t border-white/10 text-center space-y-6">
            <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
              END OF RECORD // {story.archiveId}
            </span>
            <h3 className="font-serif text-3xl text-[#F1EEE8] italic">
              “Every story leaves something behind.”
            </h3>

            <div className="pt-6">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-nav')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playClick(360);
                  onExit();
                }}
                className="inline-flex items-center space-x-3 px-8 py-3 border border-white/20 hover:border-[#C9A66B] text-xs font-grotesk tracking-[0.25em] uppercase text-[#F1EEE8] transition-colors rounded-sm"
              >
                <span>RETURN TO THE ARCHIVE</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
