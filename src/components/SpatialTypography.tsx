import React from 'react';
import { Story, STORIES } from '../data/stories';
import { ArrowDown, ArrowUp, Sparkles, ChevronRight } from 'lucide-react';
import { cursorManager } from './CustomCursor';
import { sound } from '../utils/audio';

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

  // Opacity helpers based on progression ranges
  const getZoneOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (p < start || p > end) return 0;
    if (p >= peakStart && p <= peakEnd) return 1;
    if (p < peakStart) return (p - start) / (peakStart - start);
    return (end - p) / (end - peakEnd);
  };

  const introOpacity = getZoneOpacity(0.0, 0.0, 0.08, 0.13);
  const story1Opacity = getZoneOpacity(0.12, 0.16, 0.24, 0.28);
  const story2Opacity = getZoneOpacity(0.28, 0.32, 0.40, 0.44);
  const story3Opacity = getZoneOpacity(0.44, 0.48, 0.56, 0.60);
  const story4Opacity = getZoneOpacity(0.60, 0.64, 0.71, 0.75);
  const story5Opacity = getZoneOpacity(0.74, 0.77, 0.83, 0.86);
  const story6Opacity = getZoneOpacity(0.85, 0.88, 0.92, 0.95);
  const oracleOpacity = getZoneOpacity(0.93, 0.95, 0.97, 0.985);
  const terminusOpacity = getZoneOpacity(0.98, 0.99, 1.0, 1.0);

  const activeNumber =
    p < 0.13
      ? '00'
      : p < 0.28
      ? '01'
      : p < 0.44
      ? '02'
      : p < 0.60
      ? '03'
      : p < 0.75
      ? '04'
      : p < 0.86
      ? '05'
      : p < 0.94
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
          ZONE 0: INTRO
          ================================================================ */}
      {introOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-8 sm:p-16 lg:p-24 transition-opacity duration-300"
          style={{ opacity: introOpacity }}
        >
          <div className="pt-16">
            <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
              THE LIVING LIBRARY
            </span>
          </div>

          <div className="my-auto max-w-4xl space-y-6">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-9xl text-[#F1EEE8] font-light leading-[0.95] tracking-tight">
              EVERY STORY <br />
              <span className="italic text-[#E8E1D5]">LEAVES SOMETHING</span> <br />
              BEHIND.
            </h1>
            <p className="font-grotesk text-xs tracking-[0.25em] text-[rgba(241,238,232,0.55)] uppercase max-w-md">
              A cinematic archive where stories exist as physical objects in an infinite space.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-grotesk tracking-[0.25em] text-[rgba(241,238,232,0.4)] uppercase">
            <ArrowDown className="w-3.5 h-3.5 text-[#C9A66B] animate-bounce" />
            <span>SCROLL TO ENTER</span>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 1: THE LAST TRAIN (Left-aligned huge editorial title)
          ================================================================ */}
      {story1Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story1Opacity }}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center space-x-4 font-mono text-xs tracking-widest text-[#C9A66B]">
              <span>01 / 06</span>
              <span>—</span>
              <span>ARCHIVE_004</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(56px, 8.5vw, 140px)' }}
            >
              THE <br />
              LAST <br />
              <span className="italic text-[#E8E1D5]">TRAIN</span>
            </h2>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-8 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>MYSTERY</span>
              <span className="hidden sm:inline">·</span>
              <span>07 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[0])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#C9A66B] hover:text-[#F1EEE8] uppercase transition-colors"
              >
                <span>CLICK ARTEFACT TO ENTER</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 2: THE BOY WHO COLLECTED RAIN (Right-aligned asymmetric)
          ================================================================ */}
      {story2Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-end px-8 sm:px-16 lg:px-24 text-right transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story2Opacity }}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-end space-x-4 font-mono text-xs tracking-widest text-[#8798A5]">
              <span>ARCHIVE_002</span>
              <span>—</span>
              <span>02 / 06</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 120px)' }}
            >
              THE BOY <br />
              WHO COLLECTED <br />
              <span className="italic text-[#8798A5]">RAIN</span>
            </h2>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end sm:space-x-8 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.65)] uppercase">
              <span>MAGICAL REALISM</span>
              <span className="hidden sm:inline">·</span>
              <span>05 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[1])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#8798A5] hover:text-[#F1EEE8] uppercase transition-colors"
              >
                <span>ENTER MEMORY CODEX</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 3: SEVEN MINUTES BEFORE MIDNIGHT (Centered monumental)
          ================================================================ */}
      {story3Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story3Opacity }}
        >
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center space-x-4 font-mono text-xs tracking-widest text-[#E8E1D5]">
              <span>03 / 06</span>
              <span>—</span>
              <span>ARCHIVE_007</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 120px)' }}
            >
              SEVEN MINUTES <br />
              BEFORE <br />
              <span className="italic text-[#C9A66B]">MIDNIGHT</span>
            </h2>

            <div className="pt-2 flex items-center space-x-6 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.6)] uppercase">
              <span>DRAMA</span>
              <span>·</span>
              <span>06 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[2])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#E8E1D5] hover:text-[#C9A66B] uppercase transition-colors"
              >
                <span>ENTER WORLD RECORD</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 4: THE FORGOTTEN ROOM
          ================================================================ */}
      {story4Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story4Opacity }}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center space-x-4 font-mono text-xs tracking-widest text-[#C9A66B]">
              <span>04 / 06</span>
              <span>—</span>
              <span>ARCHIVE_009</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 120px)' }}
            >
              THE <br />
              FORGOTTEN <br />
              <span className="italic text-[#E8E1D5]">ROOM</span>
            </h2>

            <div className="pt-2 flex items-center space-x-6 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.6)] uppercase">
              <span>PSYCHOLOGICAL</span>
              <span>·</span>
              <span>08 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[3])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#C9A66B] hover:text-[#F1EEE8] uppercase transition-colors"
              >
                <span>ENTER ARCHITECTURAL CODEX</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 5: A LETTER FROM TOMORROW
          ================================================================ */}
      {story5Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-end px-8 sm:px-16 lg:px-24 text-right transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story5Opacity }}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-end space-x-4 font-mono text-xs tracking-widest text-[#8798A5]">
              <span>ARCHIVE_013</span>
              <span>—</span>
              <span>05 / 06</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 120px)' }}
            >
              A LETTER <br />
              FROM <br />
              <span className="italic text-[#8798A5]">TOMORROW</span>
            </h2>

            <div className="pt-2 flex items-center justify-end space-x-6 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.6)] uppercase">
              <span>SCIENCE FICTION</span>
              <span>·</span>
              <span>05 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[4])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#8798A5] hover:text-[#F1EEE8] uppercase transition-colors"
              >
                <span>ENTER CHRONO RECORD</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 6: THE SEA THAT REMEMBERED
          ================================================================ */}
      {story6Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: story6Opacity }}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center space-x-4 font-mono text-xs tracking-widest text-[#C9A66B]">
              <span>06 / 06</span>
              <span>—</span>
              <span>ARCHIVE_018</span>
            </div>

            <h2
              className="font-serif text-[#F1EEE8] font-light leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 120px)' }}
            >
              THE SEA <br />
              THAT <br />
              <span className="italic text-[#E8E1D5]">REMEMBERED</span>
            </h2>

            <div className="pt-2 flex items-center space-x-6 font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.6)] uppercase">
              <span>MYTHOLOGY</span>
              <span>·</span>
              <span>06 MIN READ</span>
            </div>

            <div className="pt-6 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(STORIES[5])}
                className="group inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] text-[#C9A66B] hover:text-[#F1EEE8] uppercase transition-colors"
              >
                <span>ENTER SALINE RECORD</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ZONE 7: THE ORACLE (RANDOM STORY)
          ================================================================ */}
      {oracleOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: oracleOpacity }}
        >
          <div className="max-w-xl space-y-6">
            {!chosenRandomStory ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
                    ORACULAR CHAMBER
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl text-[#F1EEE8] font-light leading-tight">
                    DON'T KNOW <br />
                    <span className="italic text-[#E8E1D5]">WHERE TO BEGIN?</span>
                  </h2>
                </div>

                <p className="font-grotesk text-xs tracking-[0.18em] text-[rgba(241,238,232,0.55)] uppercase max-w-sm mx-auto">
                  Let the archive align its virtual coordinates to choose a codex for you.
                </p>

                <div className="pointer-events-auto pt-2">
                  <button
                    onPointerEnter={() => cursorManager.setMode('hover-nav')}
                    onPointerLeave={() => cursorManager.setMode('default')}
                    onClick={handleTriggerRandom}
                    disabled={isRandomSpinning}
                    className="inline-flex items-center space-x-3 px-8 py-3.5 border border-[#C9A66B]/50 hover:border-[#C9A66B] text-xs font-grotesk tracking-[0.25em] uppercase text-[#F1EEE8] transition-colors rounded-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-[#C9A66B] ${isRandomSpinning ? 'animate-spin' : ''}`} />
                    <span>{isRandomSpinning ? 'ARCHIVE TURNING...' : 'LET THE ARCHIVE DECIDE'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn p-8 border border-[#C9A66B]/30 rounded-sm">
                <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
                  {chosenRandomStory.archiveId} // ORACLE SELECTION
                </span>
                <h3 className="font-serif text-3xl text-[#F1EEE8]">
                  {chosenRandomStory.title}
                </h3>
                <p className="font-serif text-sm italic text-[#C9A66B]">
                  {chosenRandomStory.genre} — {chosenRandomStory.readingTime}
                </p>
                <div className="pointer-events-auto pt-2 flex items-center justify-center space-x-4">
                  <button
                    onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
                    onPointerLeave={() => cursorManager.setMode('default')}
                    onClick={() => onSelectStory(chosenRandomStory)}
                    className="px-6 py-2.5 bg-[#F1EEE8] text-[#070707] text-xs font-grotesk tracking-[0.2em] uppercase font-semibold transition-colors"
                  >
                    ENTER STORY
                  </button>
                  <button
                    onPointerEnter={() => cursorManager.setMode('hover-nav')}
                    onPointerLeave={() => cursorManager.setMode('default')}
                    onClick={handleTriggerRandom}
                    className="px-5 py-2.5 border border-white/20 text-xs font-grotesk tracking-[0.18em] uppercase text-[rgba(241,238,232,0.7)] hover:text-[#F1EEE8]"
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
          ZONE 8: SANCTUARY TERMINUS (END OF ARCHIVE)
          ================================================================ */}
      {terminusOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-8 sm:p-16 lg:p-24 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: terminusOpacity }}
        >
          <div className="pt-16">
            <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
              SANCTUARY TERMINUS
            </span>
          </div>

          <div className="my-auto max-w-3xl space-y-8">
            <h2 className="font-serif text-4xl sm:text-6xl text-[#F1EEE8] font-light italic">
              “Some stories are waiting to be found.”
            </h2>
            <div className="pointer-events-auto pt-2">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-nav')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={scrollToTop}
                className="inline-flex items-center space-x-3 text-xs font-grotesk tracking-[0.25em] uppercase text-[#C9A66B] hover:text-[#F1EEE8] transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>EXPLORE THE ARCHIVE AGAIN</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono tracking-[0.2em] text-[rgba(241,238,232,0.35)] uppercase pt-8 border-t border-white/10">
            <div>THE LIVING LIBRARY // ANNO 2026</div>
            <div>EVERY STORY LEAVES SOMETHING BEHIND</div>
            <div>PERSISTENT FULLSCREEN WEBGL ARCHIVE</div>
          </div>
        </div>
      )}

      {/* ================================================================
          MINIMAL RIGHT EDGE PROGRESS INDICATOR (01 ———— 06)
          ================================================================ */}
      <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 font-mono text-[10px] text-[rgba(241,238,232,0.4)] pointer-events-none select-none">
        <span className="text-[#C9A66B] tracking-widest">{activeNumber}</span>
        <div className="relative w-[1px] h-32 bg-white/10">
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
