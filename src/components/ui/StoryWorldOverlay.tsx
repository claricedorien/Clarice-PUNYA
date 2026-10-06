import React from 'react';
import { Story } from '../../data/stories';
import { X, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { cursorManager } from '../CustomCursor';
import { sound } from '../../utils/audio';

interface StoryWorldOverlayProps {
  story: Story;
  storyProgress: number; // 0 to 1
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StoryWorldOverlay: React.FC<StoryWorldOverlayProps> = ({
  story,
  storyProgress,
  onExit,
  soundEnabled,
  onToggleSound,
}) => {
  const sp = storyProgress;

  // Chapter boundaries:
  // Ch 1: 0.00 - 0.16
  // Ch 2: 0.16 - 0.32
  // Ch 3: 0.32 - 0.48
  // Ch 4: 0.48 - 0.64
  // Ch 5: 0.64 - 0.82
  // Ch 6: 0.82 - 1.00
  const getChapterOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (sp < start || sp > end) return 0;
    if (sp >= peakStart && sp <= peakEnd) return 1;
    if (sp < peakStart) return (sp - start) / (peakStart - start);
    return (end - sp) / (end - peakEnd);
  };

  const ch1Opacity = getChapterOpacity(0.00, 0.03, 0.12, 0.17);
  const ch2Opacity = getChapterOpacity(0.16, 0.20, 0.28, 0.33);
  const ch3Opacity = getChapterOpacity(0.32, 0.36, 0.44, 0.49);
  const ch4Opacity = getChapterOpacity(0.48, 0.52, 0.60, 0.65);
  const ch5Opacity = getChapterOpacity(0.64, 0.68, 0.78, 0.83);
  const ch6Opacity = getChapterOpacity(0.82, 0.86, 0.98, 1.00);

  const chapterRoman =
    sp < 0.16
      ? 'I'
      : sp < 0.32
      ? 'II'
      : sp < 0.48
      ? 'III'
      : sp < 0.64
      ? 'IV'
      : sp < 0.82
      ? 'V'
      : 'VI';

  const chapterNum =
    sp < 0.16
      ? '01'
      : sp < 0.32
      ? '02'
      : sp < 0.48
      ? '03'
      : sp < 0.64
      ? '04'
      : sp < 0.82
      ? '05'
      : '06';

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none text-[#F1EEE8] overflow-hidden">
      {/* Top Persistent Story HUD */}
      <header className="absolute top-0 left-0 right-0 px-8 sm:px-14 py-7 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-4">
          <span className="font-display text-xs tracking-[0.28em] text-[#F1EEE8] uppercase font-semibold">
            THE LIVING LIBRARY
          </span>
          <span className="text-white/20">/</span>
          <span className="font-mono text-[11px] text-[#C9A66B] tracking-widest">
            {story.archiveId}
          </span>
          <span className="text-white/20 hidden sm:inline">/</span>
          <span className="font-grotesk text-[10px] tracking-widest text-[rgba(241,238,232,0.5)] uppercase hidden sm:inline">
            {story.title}
          </span>
        </div>

        <div className="flex items-center space-x-6 text-xs font-grotesk tracking-[0.2em] uppercase text-[rgba(241,238,232,0.65)]">
          {/* Sound Toggle */}
          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={onToggleSound}
            className="flex items-center space-x-1.5 hover:text-[#F1EEE8] transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#C9A66B]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-60" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>

          {/* EXIT STORY BUTTON (NON-NEGOTIABLE FUNCTIONAL REQUIREMENT) */}
          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={() => {
              sound.playClick(320);
              onExit();
            }}
            className="flex items-center space-x-2 text-[#C9A66B] hover:text-[#F1EEE8] transition-colors font-medium border border-[#C9A66B]/40 hover:border-[#C9A66B] px-3.5 py-1.5 rounded-sm bg-[#070707]/60 backdrop-blur-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>EXIT STORY</span>
          </button>
        </div>
      </header>

      {/* Right Edge Chapter Counter */}
      <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 font-mono text-[11px] pointer-events-none">
        <span className="text-[#C9A66B] tracking-widest font-semibold">{chapterNum}</span>
        <div className="w-4 h-[1px] bg-[#C9A66B]/40" />
        <span className="text-[rgba(241,238,232,0.35)] tracking-widest">06</span>
        <span className="pt-2 text-[10px] font-serif italic text-[rgba(241,238,232,0.5)]">
          {chapterRoman}
        </span>
      </div>

      {/* ================================================================
          CHAPTER 01 (0 - 16%): The Acoustic Droplet
          ================================================================ */}
      {ch1Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20 lg:px-32 max-w-4xl transition-opacity duration-300"
          style={{ opacity: ch1Opacity }}
        >
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-widest text-[#8798A5] uppercase">
              CHAPTER I // ACOUSTIC SEED
            </span>
            <p className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#F1EEE8] leading-[1.1] tracking-tight">
              Noah believed <br />
              <span className="italic text-[#8798A5]">every rainstorm</span> <br />
              sounded different.
            </p>
            <p className="font-serif text-sm sm:text-base text-[rgba(241,238,232,0.5)] italic pt-2">
              To his ears, precipitation was not water—it was acoustic memory falling from the stratosphere.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          CHAPTER 02 (16 - 32%): The Bottled Storms
          ================================================================ */}
      {ch2Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-end px-8 sm:px-20 lg:px-32 text-right max-w-5xl ml-auto transition-opacity duration-300"
          style={{ opacity: ch2Opacity }}
        >
          <div className="space-y-6">
            <span className="font-mono text-xs tracking-widest text-[#8798A5] uppercase">
              CHAPTER II // SPECIMENS
            </span>
            <p className="font-serif text-4xl sm:text-6xl font-light text-[#F1EEE8] leading-[1.1]">
              So he started <br />
              <span className="italic text-[#E8E1D5]">collecting them.</span>
            </p>

            <div className="space-y-2 pt-2 font-mono text-xs sm:text-sm tracking-[0.25em] text-[#8798A5] uppercase">
              <p>SUMMER RAIN.</p>
              <p className="text-[rgba(241,238,232,0.8)]">MORNING RAIN.</p>
              <p className="text-[rgba(241,238,232,0.5)]">RAIN AGAINST HOSPITAL WINDOWS.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          CHAPTER 03 (32 - 48%): Harder Storms
          ================================================================ */}
      {ch3Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 sm:px-20 max-w-3xl mx-auto transition-opacity duration-300"
          style={{ opacity: ch3Opacity }}
        >
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-widest text-[#C9A66B] uppercase">
              CHAPTER III // ENCLOSURE
            </span>
            <p className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#F1EEE8] leading-[1.15]">
              Some storms were <br />
              <span className="italic text-[#C9A66B] font-normal">harder</span> <br />
              to keep.
            </p>
            <p className="font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.45)] uppercase pt-4">
              Vapors that condensed only when the glass was cold as grief.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          CHAPTER 04 (48 - 64%): The Forgotten Name (Stillness)
          ================================================================ */}
      {ch4Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20 lg:px-32 max-w-4xl transition-opacity duration-300"
          style={{ opacity: ch4Opacity }}
        >
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-widest text-[rgba(241,238,232,0.4)] uppercase">
              CHAPTER IV // ABSENCE
            </span>
            <p className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#E8E1D5] leading-[1.2]">
              Rain from the day <br />
              his mother forgot <br />
              <span className="italic text-[#F1EEE8]">his name.</span>
            </p>
            <p className="font-serif text-sm sm:text-base text-[rgba(241,238,232,0.5)] italic pt-2">
              Motion slows. The drops suspended motionless in the cold chamber air.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          CHAPTER 05 (64 - 82%): Constellation of Phials
          ================================================================ */}
      {ch5Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-end px-8 sm:px-20 lg:px-32 text-right max-w-4xl ml-auto transition-opacity duration-300"
          style={{ opacity: ch5Opacity }}
        >
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-widest text-[#8798A5] uppercase">
              CHAPTER V // THE REPOSITORY
            </span>
            <p className="font-serif text-4xl sm:text-6xl font-light text-[#F1EEE8] leading-[1.2]">
              He kept every storm <br />
              inside a small <br />
              <span className="italic text-[#8798A5]">glass bottle.</span>
            </p>
            <p className="font-grotesk text-xs tracking-[0.2em] text-[rgba(241,238,232,0.45)] uppercase pt-2">
              Dozens of amber light points extending endlessly into darkness.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          CHAPTER 06 (82 - 100%): The Reverse Rain & Record Conclusion
          ================================================================ */}
      {ch6Opacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 sm:px-20 max-w-3xl mx-auto transition-opacity duration-300 pointer-events-auto"
          style={{ opacity: ch6Opacity }}
        >
          <div className="space-y-6">
            <span className="font-mono text-xs tracking-widest text-[#C9A66B] uppercase">
              CHAPTER VI // RELEASE
            </span>

            <p className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#F1EEE8] leading-[1.2]">
              And years later, <br />
              when he could no longer remember her voice, <br />
              <span className="italic text-[#C9A66B]">he opened the rain.</span>
            </p>

            <div className="pt-4 space-y-2 font-mono text-[11px] text-[rgba(241,238,232,0.5)] tracking-widest uppercase">
              <p>ARCHIVE_002 // END RECORD</p>
              <p className="text-[#8798A5]">PRECIPITATION TRAJECTORY: REVERSED</p>
            </div>

            <div className="pt-6 flex items-center justify-center space-x-4">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-nav')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playClick(360);
                  onExit();
                }}
                className="inline-flex items-center space-x-3 px-8 py-3.5 bg-[#F1EEE8] hover:bg-[#E8E1D5] text-[#070707] text-xs font-grotesk tracking-[0.25em] uppercase font-semibold transition-all rounded-sm shadow-xl"
              >
                <span>RETURN TO ARCHIVE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
