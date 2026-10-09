import React, { useRef } from 'react';
import { Story, STORIES } from '../data/stories';
import { ArrowDown, ArrowUp, Sparkles, ArrowRight } from 'lucide-react';
import { cursorManager } from './CustomCursor';
import { sound } from '../utils/audio';

interface SafeStoryButtonProps {
  onSelect: () => void;
  accent: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Mobile-safe button that discriminates between vertical scroll drags and deliberate taps.
 * Only deliberate taps trigger onSelect. Vertical swipes pass through to page scrolling.
 */
const SafeStoryButton: React.FC<SafeStoryButtonProps> = ({
  onSelect,
  accent,
  className = '',
  children,
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: performance.now(),
      };
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current && e.touches.length === 1) {
      const dx = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
      if (dx > 8 || dy > 8) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDraggingRef.current) {
      touchStartRef.current = null;
      return;
    }
    if (touchStartRef.current) {
      const duration = performance.now() - touchStartRef.current.time;
      if (duration < 400) {
        e.preventDefault();
        sound.playBookOpen();
        onSelect();
      }
    }
    touchStartRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
      return;
    }
    sound.playBookOpen();
    onSelect();
  };

  return (
    <button
      onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
      onPointerLeave={() => cursorManager.setMode('default')}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      style={{
        borderColor: `${accent}99`,
      }}
      className={`group inline-flex items-center space-x-3 min-h-[46px] px-6 py-2.5 border bg-[#070707]/90 hover:bg-[#070707] backdrop-blur text-xs font-grotesk tracking-[0.22em] text-[#F1EEE8] uppercase rounded-sm transition-all shadow-md active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

interface SpatialTypographyProps {
  scrollProgress: number; // 0 to 1
  onSelectStory: (story: Story) => void;
  onSpinStart: () => void;
  onSpinFinish: (story: Story) => void;
  chosenRandomStory: Story | null;
  isRandomSpinning: boolean;
}

export const SpatialTypography: React.FC<SpatialTypographyProps> = ({
  scrollProgress,
  onSelectStory,
  onSpinStart,
  onSpinFinish,
  chosenRandomStory,
  isRandomSpinning,
}) => {
  const p = scrollProgress;

  // Opacity curves mapped to the new scroll choreography
  // 0-15%: Intro
  // 15-30%: Story 1
  // 30-45%: Story 2
  // 45-60%: Story 3
  // 60-72%: Story 4
  // 72-84%: Story 5
  // 84-96%: Story 6
  // 96-100%: Oracle / Terminus
  const getZoneOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (p < start || p > end) return 0;
    if (p >= peakStart && p <= peakEnd) return 1;
    if (p < peakStart) return (p - start) / (peakStart - start);
    return (end - p) / (end - peakEnd);
  };

  const introOpacity = getZoneOpacity(0.0, 0.0, 0.10, 0.15);
  const story1Opacity = getZoneOpacity(0.14, 0.18, 0.27, 0.31);
  const story2Opacity = getZoneOpacity(0.29, 0.33, 0.42, 0.46);
  const story3Opacity = getZoneOpacity(0.44, 0.48, 0.57, 0.61);
  const story4Opacity = getZoneOpacity(0.59, 0.63, 0.69, 0.73);
  const story5Opacity = getZoneOpacity(0.71, 0.75, 0.81, 0.85);
  const story6Opacity = getZoneOpacity(0.83, 0.87, 0.93, 0.96);
  const oracleOpacity = getZoneOpacity(0.94, 0.96, 0.985, 0.995);
  const terminusOpacity = getZoneOpacity(0.985, 0.995, 1.0, 1.0);

  const activeNumber =
    p < 0.15
      ? '00'
      : p < 0.30
      ? '01'
      : p < 0.45
      ? '02'
      : p < 0.60
      ? '03'
      : p < 0.72
      ? '04'
      : p < 0.84
      ? '05'
      : p < 0.96
      ? '06'
      : 'Ω';

  const scrollToTop = () => {
    sound.playClick(360);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerRandom = () => {
    sound.playBookOpen();
    onSpinStart();

    const nextIdx = Math.floor(Math.random() * STORIES.length);
    const selected = STORIES[nextIdx];

    setTimeout(() => {
      sound.playChime(660);
      onSpinFinish(selected);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 text-[#F1EEE8] select-none overflow-hidden">
      {/* ================================================================
          ZONE 0: RESTRAINED INTRO (CONTROLLED SCALE & EXPANSIVE SPACE)
          ================================================================ */}
      {introOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-6 sm:p-14 lg:p-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: introOpacity }}
        >
          {/* Top spacer for clean breathing room below nav */}
          <div className="pt-20 sm:pt-16 max-w-xl">
            <span className="font-grotesk text-[10px] sm:text-[11px] tracking-[0.32em] text-[#C9A66B] uppercase font-medium">
              THE LIVING LIBRARY
            </span>
          </div>

          {/* Controlled Center/Left Editorial Headline */}
          <div className="my-auto max-w-2xl space-y-4">
            <h1
              className="font-serif text-[#F1EEE8] font-light leading-[1.08] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.8vw, 68px)' }}
            >
              Every story leaves <br />
              <span className="italic text-[#E8E1D5]">something behind.</span>
            </h1>
            <p className="font-grotesk text-xs sm:text-sm tracking-[0.16em] text-[rgba(241,238,232,0.65)] uppercase max-w-md leading-relaxed">
              A cinematic spatial archive where stories exist as living records in deep 3D space.
            </p>
          </div>

          {/* Quiet Scroll Cue */}
          <div className="flex items-center space-x-3 text-[10px] font-grotesk tracking-[0.25em] text-[rgba(241,238,232,0.5)] uppercase pb-4">
            <ArrowDown className="w-3.5 h-3.5 text-[#C9A66B] animate-bounce" />
            <span>SWIPE OR SCROLL TO ENTER ARCHIVE</span>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 1: THE LAST TRAIN (LEFT-ALIGNED EDITORIAL METADATA)
          ================================================================ */}
      {story1Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story1Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#C9A66B]">
              <span>01 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_004</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              The Last <span className="italic text-[#E8E1D5]">Train</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>MYSTERY</span>
              <span className="text-white/30">·</span>
              <span>07 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              A train arrives after midnight, even though the station has already closed.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[0])}
                accent="#C9A66B"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 2: THE BOY WHO COLLECTED RAIN
          ================================================================ */}
      {story2Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story2Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#8798A5]">
              <span>02 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_002</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              The Boy Who <br />
              Collected <span className="italic text-[#8798A5]">Rain</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>MAGICAL REALISM</span>
              <span className="text-white/30">·</span>
              <span>05 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              Noah believed every rainstorm sounded different. So he started collecting them in glass bottles.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[1])}
                accent="#8798A5"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#8798A5] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 3: SEVEN MINUTES BEFORE MIDNIGHT
          ================================================================ */}
      {story3Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story3Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#E8E1D5]">
              <span>03 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_007</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              Seven Minutes <br />
              Before <span className="italic text-[#C9A66B]">Midnight</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>DRAMA</span>
              <span className="text-white/30">·</span>
              <span>06 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              At 11:53 PM, the entire city lost electricity. Seven minutes remained before the new year.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[2])}
                accent="#C9A66B"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 4: THE FORGOTTEN ROOM
          ================================================================ */}
      {story4Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story4Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#C9A66B]">
              <span>04 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_009</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              The Forgotten <span className="italic text-[#E8E1D5]">Room</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>PSYCHOLOGICAL</span>
              <span className="text-white/30">·</span>
              <span>08 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              A door that was not on the architectural blueprints appears in the hallway every third Tuesday.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[3])}
                accent="#C9A66B"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 5: A LETTER FROM TOMORROW
          ================================================================ */}
      {story5Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story5Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#8798A5]">
              <span>05 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_013</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              A Letter From <br />
              <span className="italic text-[#8798A5]">Tomorrow</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>SCIENCE FICTION</span>
              <span className="text-white/30">·</span>
              <span>05 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              The ink was still wet, but the date on the postmark was sixty years in the future.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[4])}
                accent="#8798A5"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#8798A5] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 6: THE SEA THAT REMEMBERED
          ================================================================ */}
      {story6Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story6Opacity }}
        >
          <div className="max-w-md sm:max-w-lg space-y-3.5">
            <div className="flex items-center space-x-3 font-mono text-[11px] tracking-widest text-[#C9A66B]">
              <span>06 / 06</span>
              <span className="text-white/30">·</span>
              <span>ARCHIVE_018</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight text-balance"
              style={{ fontSize: 'clamp(32px, 4.4vw, 54px)' }}
            >
              The Sea That <br />
              <span className="italic text-[#E8E1D5]">Remembered</span>
            </h2>

            <div className="flex items-center space-x-3 font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>MYTHOLOGY</span>
              <span className="text-white/30">·</span>
              <span>06 MIN READ</span>
            </div>

            <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] tracking-wide leading-relaxed max-w-sm line-clamp-2">
              Every shell washed ashore echoed the voice of someone who had drowned two centuries ago.
            </p>

            <div className="pt-3 pointer-events-auto">
              <SafeStoryButton
                onSelect={() => onSelectStory(STORIES[5])}
                accent="#C9A66B"
              >
                <span>ENTER STORY</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B] group-hover:translate-x-1 transition-transform" />
              </SafeStoryButton>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 7: THE ORACLE
          ================================================================ */}
      {oracleOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: oracleOpacity }}
        >
          <div className="max-w-lg space-y-5">
            {!chosenRandomStory ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
                    ORACULAR SELECTION
                  </span>
                  <h2
                    className="font-serif text-[#F1EEE8] font-light leading-tight"
                    style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                  >
                    Uncertain where <br />
                    <span className="italic text-[#E8E1D5]">to begin?</span>
                  </h2>
                </div>

                <p className="font-grotesk text-xs tracking-[0.16em] text-[rgba(241,238,232,0.6)] uppercase max-w-sm mx-auto">
                  Allow the archive to align its virtual coordinates to choose a codex.
                </p>

                <div className="pointer-events-auto pt-2">
                  <button
                    onPointerEnter={() => cursorManager.setMode('hover-nav')}
                    onPointerLeave={() => cursorManager.setMode('default')}
                    onClick={handleTriggerRandom}
                    disabled={isRandomSpinning}
                    className="inline-flex items-center space-x-3 min-h-[46px] px-7 py-3 border border-[#C9A66B]/60 hover:border-[#C9A66B] text-xs font-grotesk tracking-[0.22em] uppercase text-[#F1EEE8] transition-colors rounded-sm bg-[#070707]/85 backdrop-blur"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-[#C9A66B] ${isRandomSpinning ? 'animate-spin' : ''}`} />
                    <span>{isRandomSpinning ? 'ALIGNING REPOSITORY...' : 'LET THE ARCHIVE DECIDE'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn p-7 border border-[#C9A66B]/30 rounded-sm bg-[#070707]/90 backdrop-blur">
                <span className="font-grotesk text-[10px] tracking-[0.25em] text-[#C9A66B] uppercase">
                  {chosenRandomStory.archiveId} // ORACLE SELECTION
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F1EEE8]">
                  {chosenRandomStory.title}
                </h3>
                <p className="font-serif text-sm italic text-[#C9A66B]">
                  {chosenRandomStory.genre} — {chosenRandomStory.readingTime}
                </p>
                <div className="pointer-events-auto pt-2 flex items-center justify-center space-x-4">
                  <SafeStoryButton
                    onSelect={() => onSelectStory(chosenRandomStory)}
                    accent="#C9A66B"
                    className="!bg-[#F1EEE8] !text-[#070707] font-semibold"
                  >
                    <span>ENTER STORY</span>
                  </SafeStoryButton>
                  <button
                    onPointerEnter={() => cursorManager.setMode('hover-nav')}
                    onPointerLeave={() => cursorManager.setMode('default')}
                    onClick={handleTriggerRandom}
                    className="min-h-[44px] px-5 py-2.5 border border-white/20 text-xs font-grotesk tracking-[0.16em] uppercase text-[rgba(241,238,232,0.7)] hover:text-[#F1EEE8] rounded-sm"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 8: SANCTUARY TERMINUS
          ================================================================ */}
      {terminusOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-6 sm:p-14 lg:p-20 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: terminusOpacity }}
        >
          <div className="pt-20 sm:pt-16">
            <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
              SANCTUARY TERMINUS
            </span>
          </div>

          <div className="my-auto max-w-2xl space-y-5">
            <h2 className="font-serif text-2xl sm:text-5xl text-[#F1EEE8] font-light italic">
              “Some stories are waiting to be found.”
            </h2>
            <div className="pointer-events-auto pt-2">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-nav')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={scrollToTop}
                className="inline-flex items-center space-x-3 min-h-[46px] px-6 py-2.5 border border-[#C9A66B] text-xs font-grotesk tracking-[0.22em] uppercase text-[#C9A66B] hover:text-[#F1EEE8] bg-[#070707]/80 backdrop-blur transition-colors rounded-sm"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>EXPLORE ARCHIVE AGAIN</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono tracking-[0.2em] text-[rgba(241,238,232,0.4)] uppercase pt-5 border-t border-white/10 pb-4">
            <div>THE LIVING LIBRARY // DIGITAL REPOSITORY</div>
            <div>EVERY STORY LEAVES SOMETHING BEHIND</div>
            <div>SPATIAL 3D ARCHIVE</div>
          </div>
        </div>
      )}

      {/* ================================================================
          MINIMAL RIGHT EDGE PROGRESS INDICATOR (POINTER-EVENTS-NONE)
          ================================================================ */}
      <div className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 font-mono text-[10px] text-[rgba(241,238,232,0.4)] pointer-events-none select-none z-30">
        <span className="text-[#C9A66B] tracking-widest">{activeNumber}</span>
        <div className="relative w-[1px] h-32 bg-white/10 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full bg-[#C9A66B] transition-all duration-150"
            style={{ height: `${p * 100}%` }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C9A66B] shadow-sm shadow-[#C9A66B]"
            style={{ top: `${p * 100}%` }}
          />
        </div>
        <span className="tracking-widest">06</span>
      </div>
    </div>
  );
};
