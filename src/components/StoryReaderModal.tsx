import React, { useState, useEffect, useRef } from 'react';
import { Book, StoryChapter } from '../data/books';
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles, BookOpen, Clock, Compass, Layers, Sliders } from 'lucide-react';
import { sound } from '../utils/audio';

interface StoryReaderModalProps {
  book: Book;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  book,
  onClose,
  soundEnabled,
  onToggleSound,
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'editorial'>('normal');

  // Interactive Chapter States
  // 1. Cinderella Ember Sparking
  const emberCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [emberCount, setEmberCount] = useState(0);

  // 2. Midnight Clock
  const [clockMinute, setClockMinute] = useState(45); // 11:45 PM
  const isMidnightReached = clockMinute >= 60;

  // 3. Sleeping Beauty Briar slider
  const [briarRetract, setBriarRetract] = useState(20);

  // 4. Glass Rose Prism
  const [prismAngle, setPrismAngle] = useState(45);

  const currentChapter = book.chapters[currentChapterIdx] || book.chapters[0];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick(320);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Ambient story particle canvas
  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ambientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; decay: number }[] = [];
    const maxParticles = 65;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.6,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        decay: Math.random() * 0.005 + 0.002,
      });
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.y < 0 || p.alpha <= 0) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.alpha = Math.random() * 0.6 + 0.2;
        }

        ctx.fillStyle = book.accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [book.accentColor]);

  // Ember Canvas Interactive Effect for Cinderella
  useEffect(() => {
    const canvas = emberCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let embers: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = [];

    const handleInteract = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      sound.playEmberCrack();
      setEmberCount((c) => c + 1);

      for (let i = 0; i < 8; i++) {
        embers.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -1.5 - Math.random() * 3.5,
          size: Math.random() * 3.5 + 1.2,
          life: 1.0,
        });
      }
    };

    const onMouseDown = (e: MouseEvent) => handleInteract(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) handleInteract(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart);

    const renderEmbers = () => {
      animId = requestAnimationFrame(renderEmbers);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      embers = embers.filter((e) => e.life > 0);
      embers.forEach((e) => {
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.016;

        ctx.fillStyle = '#ffb703';
        ctx.globalAlpha = e.life;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffeedd';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    renderEmbers();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, [currentChapterIdx]);

  const handleNextChapter = () => {
    if (currentChapterIdx < book.chapters.length - 1) {
      sound.playPageTurn();
      setCurrentChapterIdx((prev) => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      sound.playPageTurn();
      setCurrentChapterIdx((prev) => prev - 1);
    }
  };

  const handleClockChange = (val: number) => {
    setClockMinute(val);
    sound.playClockTick(val >= 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn overflow-hidden">
      {/* Background ambient particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <canvas ref={ambientCanvasRef} className="w-full h-full" />
      </div>

      {/* Reader Modal Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[94vh] mx-auto my-auto flex flex-col bg-[#08080c]/95 border border-white/10 rounded-xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Top Control Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/80 shrink-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                sound.playClick(360);
                onClose();
              }}
              className="group flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Library</span>
            </button>
            <span className="text-white/20">|</span>
            <span className="font-accent text-xs uppercase tracking-widest text-neutral-400">
              {book.category}
            </span>
          </div>

          {/* Center Title */}
          <div className="hidden md:flex flex-col items-center">
            <h2 className="font-accent text-sm tracking-[0.2em] text-white">
              {book.title.toUpperCase()}
            </h2>
            <span className="text-[10px] tracking-wider text-neutral-400">
              {book.subtitle}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Font size toggle */}
            <div className="flex items-center space-x-1 bg-white/5 border border-white/10 rounded px-2 py-1">
              <button
                onClick={() => {
                  sound.playClick(500);
                  setFontSizeLevel('normal');
                }}
                className={`text-[11px] px-1.5 py-0.5 rounded ${
                  fontSizeLevel === 'normal' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => {
                  sound.playClick(600);
                  setFontSizeLevel('large');
                }}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  fontSizeLevel === 'large' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => {
                  sound.playClick(700);
                  setFontSizeLevel('editorial');
                }}
                className={`text-xs px-1.5 py-0.5 rounded font-serif-display italic ${
                  fontSizeLevel === 'editorial' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Editorial Serif Size"
              >
                Ed
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Atmosphere' : 'Enable Atmosphere'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick(320);
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Reader Body Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: Book Folio Showcase & Chapter Nav (4 cols) */}
          <aside className="lg:col-span-4 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-neutral-950/40 flex flex-col justify-between">
            <div>
              {/* Cover Artwork Showcase with Perspective Tilt */}
              <div className="relative group max-w-[280px] mx-auto mb-6">
                <div
                  className="absolute -inset-1.5 rounded-lg opacity-40 blur-lg transition duration-700 group-hover:opacity-75"
                  style={{ backgroundColor: book.accentColor }}
                />
                <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-neutral-900">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="font-accent text-xs tracking-[0.2em] text-white">
                      {book.title.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Epigraph */}
              <blockquote className="text-center italic font-serif-display text-sm text-neutral-300 mb-6 px-2">
                {book.epigraph}
              </blockquote>

              {/* Book Metadata Sheet */}
              <div className="space-y-2.5 text-xs text-neutral-400 border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase tracking-wider">Archivist</span>
                  <span className="text-neutral-200">{book.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase tracking-wider">Era / Chronicle</span>
                  <span className="text-neutral-200">{book.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase tracking-wider">Reading Span</span>
                  <span className="text-neutral-200">{book.readingTime}</span>
                </div>
              </div>

              {/* Chapter Navigation Selector */}
              <div>
                <h4 className="text-[11px] font-accent uppercase tracking-[0.2em] text-neutral-400 mb-3 flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Codex Chapters</span>
                </h4>
                <div className="space-y-1.5">
                  {book.chapters.map((chap, idx) => (
                    <button
                      key={chap.id}
                      onClick={() => {
                        sound.playPageTurn();
                        setCurrentChapterIdx(idx);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded text-xs transition-all flex items-center justify-between ${
                        currentChapterIdx === idx
                          ? 'bg-white/15 text-white font-medium border-l-2'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                      }`}
                      style={{
                        borderLeftColor: currentChapterIdx === idx ? book.accentColor : 'transparent',
                      }}
                    >
                      <span className="truncate">{chap.title}</span>
                      {currentChapterIdx === idx && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: book.accentColor }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synopsis bottom note */}
            <div className="mt-8 pt-4 border-t border-white/10 text-[11px] leading-relaxed text-neutral-400">
              <span className="text-neutral-200 font-medium">Archival Synopsis: </span>
              {book.synopsis}
            </div>
          </aside>

          {/* Right Column: Full Reader Experience & Interactive Moments (8 cols) */}
          <main className="lg:col-span-8 p-6 lg:p-12 flex flex-col justify-between overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full">
              {/* Chapter Header */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 mb-2">
                  <span style={{ color: book.accentColor }}>✦ Chapter {currentChapterIdx + 1} of {book.chapters.length}</span>
                </div>
                <h3 className="font-accent text-2xl lg:text-3xl text-white tracking-wide mb-2">
                  {currentChapter.title}
                </h3>
                <p className="text-sm italic text-neutral-400 font-serif-display">
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Story Chapter Body Paragraphs */}
              <div
                className={`space-y-6 text-neutral-300 leading-relaxed font-serif-display ${
                  fontSizeLevel === 'large'
                    ? 'text-lg leading-loose'
                    : fontSizeLevel === 'editorial'
                    ? 'text-xl leading-loose italic'
                    : 'text-base leading-relaxed'
                }`}
              >
                {currentChapter.content.map((para, pIdx) => (
                  <p key={pIdx} className="relative">
                    {pIdx === 0 && (
                      <span
                        className="float-left text-4xl lg:text-5xl font-accent leading-none pr-3 pt-1"
                        style={{ color: book.accentColor }}
                      >
                        {para.charAt(0)}
                      </span>
                    )}
                    {pIdx === 0 ? para.slice(1) : para}
                  </p>
                ))}
              </div>

              {/* INTERACTIVE STORY ENGINE MOMENTS */}
              {currentChapter.interactiveType && (
                <div className="mt-10 p-6 rounded-xl border border-white/15 bg-neutral-900/60 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center space-x-2 text-xs font-accent tracking-widest uppercase text-white">
                      <Sparkles className="w-4 h-4" style={{ color: book.accentColor }} />
                      <span>Interactive Chapter Artifact</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {currentChapter.interactivePrompt}
                    </span>
                  </div>

                  {/* 1. Cinderella Ember Sparking */}
                  {currentChapter.interactiveType === 'ember-spark' && (
                    <div className="space-y-3">
                      <div className="relative h-44 rounded-lg bg-neutral-950 border border-amber-500/30 overflow-hidden cursor-crosshair">
                        <canvas
                          ref={emberCanvasRef}
                          width={600}
                          height={176}
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <p className="text-xs uppercase tracking-widest text-amber-300/40 font-mono">
                            [ CLICK OR DRAG TO AWAKEN EMBERS ]
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>Embers awakened: <strong className="text-amber-400 font-mono">{emberCount}</strong></span>
                        {emberCount > 5 && (
                          <span className="text-amber-300 animate-pulse font-serif-display italic">
                            ✦ "The ashes whisper: Midnight approaches..."
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Clock Toward Midnight Interaction */}
                  {currentChapter.interactiveType === 'clock-midnight' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400 font-mono">
                          GRAND CLOCK TIME: <strong className="text-white">11:{clockMinute < 60 ? (clockMinute < 10 ? `0${clockMinute}` : clockMinute) : '00 AM (MIDNIGHT)'}</strong>
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-mono ${
                            isMidnightReached ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 text-neutral-300'
                          }`}
                        >
                          {isMidnightReached ? '✦ 12:00 RESONANCE ACTIVE' : 'PENDULUM SWINGING'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="45"
                        max="60"
                        step="1"
                        value={clockMinute}
                        onChange={(e) => handleClockChange(parseInt(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />

                      {isMidnightReached ? (
                        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded text-xs text-amber-200 leading-relaxed font-serif-display italic animate-fadeIn">
                          "At the 12th stroke, the carriage crystallizes into pure resonance. The pumpkin seed blooms into starlight and the glass slipper begins its eternal song."
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic">
                          Advance the chronometer to the 12th hour to trigger the alchemical shift.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Sleeping Beauty Briar Retraction */}
                  {currentChapter.interactiveType === 'vine-retract' && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Briar Thorn Density: <strong className="text-emerald-400 font-mono">{100 - briarRetract}%</strong></span>
                        <span>Kingdom Sunlight: <strong className="text-neutral-200 font-mono">{briarRetract}%</strong></span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={briarRetract}
                        onChange={(e) => {
                          setBriarRetract(parseInt(e.target.value));
                          sound.playClick(400 + parseInt(e.target.value) * 3);
                        }}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <p className="text-[11px] text-neutral-400 italic font-serif-display">
                        {briarRetract > 70
                          ? '✦ The century-old thorns recede, unveiling the bioluminescent sleeping court.'
                          : 'Drag right to part the ancient bramble vines.'}
                      </p>
                    </div>
                  )}

                  {/* 4. Glass Rose Prism Harmonic */}
                  {currentChapter.interactiveType === 'prism-light' && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Prism Refraction Index: <strong className="text-sky-400 font-mono">{prismAngle}°</strong></span>
                        <span>Caustic Harmonic: <strong className="text-white font-mono">{(432 + prismAngle * 2).toFixed(1)} Hz</strong></span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={prismAngle}
                        onChange={(e) => {
                          setPrismAngle(parseInt(e.target.value));
                          sound.playClick(300 + parseInt(e.target.value) * 6);
                        }}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          background: `linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #f472b6)`,
                          filter: `brightness(${0.8 + prismAngle / 100})`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Chapter Pagination Navigation */}
            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIdx === 0}
                className={`flex items-center space-x-2 text-xs uppercase tracking-widest px-4 py-2 rounded transition-colors ${
                  currentChapterIdx === 0
                    ? 'text-neutral-600 cursor-not-allowed'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <div className="text-xs text-neutral-500 font-mono">
                {currentChapterIdx + 1} / {book.chapters.length}
              </div>

              {currentChapterIdx < book.chapters.length - 1 ? (
                <button
                  onClick={handleNextChapter}
                  className="flex items-center space-x-2 text-xs uppercase tracking-widest px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick(440);
                    onClose();
                  }}
                  className="flex items-center space-x-2 text-xs uppercase tracking-widest px-4 py-2 rounded bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <span>Finish & Return</span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
