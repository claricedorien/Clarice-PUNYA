import React from 'react';
import { Story, STORIES } from '../data/stories';
import { ArrowDown, ArrowUp, Sparkles, ChevronRight } from 'lucide-react';
import { RandomStorySelector } from './ui/RandomStorySelector';
import { cursorManager } from './CustomCursor';
import { sound } from '../utils/audio';

interface ScrollExperienceProps {
  onSelectStory: (story: Story) => void;
  onSpinStart: () => void;
  onSpinFinish: (story: Story) => void;
  chosenRandomStory: Story | null;
  isRandomSpinning: boolean;
  onOpenIndex: () => void;
}

export const ScrollExperience: React.FC<ScrollExperienceProps> = ({
  onSelectStory,
  onSpinStart,
  onSpinFinish,
  chosenRandomStory,
  isRandomSpinning,
  onOpenIndex,
}) => {
  const scrollToTop = () => {
    sound.playClick(360);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 w-full pointer-events-none select-none text-[#F1EEE8]">
      {/* ================================================================
          ZONE 01: INTRO (0 - 100vh)
          ================================================================ */}
      <section className="h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-20">
        <div className="pt-16">
          <p className="font-serif text-lg sm:text-2xl italic text-[rgba(241,238,232,0.65)] max-w-lg leading-relaxed">
            “Every story leaves something behind.”
          </p>
        </div>

        <div className="my-auto space-y-6 max-w-4xl">
          <div className="space-y-2">
            <span className="font-grotesk text-[11px] tracking-[0.35em] text-[#C9A66B] uppercase">
              SECTOR_01 // PHYSICAL MEMORY ARCHIVE
            </span>
            <h1 className="font-serif text-5xl sm:text-7xl md:text-9xl text-[#F1EEE8] font-normal tracking-tight leading-[0.95]">
              THE LIVING <br />
              <span className="italic text-[#E8E1D5]">LIBRARY</span>
            </h1>
          </div>

          <p className="font-grotesk text-xs sm:text-sm text-[rgba(241,238,232,0.55)] max-w-md leading-relaxed tracking-wide">
            A repository where stories exist not as flat text, but as physical worlds suspended inside an infinite architectural space.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-grotesk tracking-[0.25em] text-[rgba(241,238,232,0.4)] uppercase">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#C9A66B]" />
          <span>SCROLL TO ENTER ARCHIVE</span>
        </div>
      </section>

      {/* ================================================================
          ZONE 02: ENTER THE ARCHIVE (100 - 200vh)
          ================================================================ */}
      <section className="h-screen flex flex-col justify-center px-8 sm:px-14 lg:px-20">
        <div className="max-w-2xl space-y-6">
          <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
            ZONE 02 // ARCHITECTURAL THRESHOLD
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#F1EEE8] leading-tight font-light">
            Monoliths, suspended folios, and the quiet weight of recorded time.
          </h2>
          <p className="font-grotesk text-xs text-[rgba(241,238,232,0.55)] leading-relaxed max-w-lg">
            As you advance through the chamber, the virtual camera navigates between dark concrete planes and suspended memory codices. Proximity awakens their resonance.
          </p>
          <div className="pt-2 flex items-center space-x-6 text-[10px] font-mono tracking-widest text-[#C9A66B] uppercase">
            <span>HOLDINGS: 06 STORIES RECORDED</span>
            <span>·</span>
            <span>ZERO GRAVITY SUSPENSION</span>
          </div>
        </div>
      </section>

      {/* ================================================================
          ZONE 03: FEATURED STORIES (200 - 300vh)
          ================================================================ */}
      <section className="h-screen flex flex-col justify-center px-8 sm:px-14 lg:px-20">
        <div className="max-w-3xl space-y-10">
          <div className="space-y-2">
            <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
              ZONE 03 // FEATURED CODICES
            </span>
            <h2 className="font-serif text-3xl sm:text-6xl text-[#F1EEE8] font-light">
              Three Distinct Worlds.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pointer-events-auto">
            {STORIES.slice(0, 3).map((story) => (
              <div
                key={story.id}
                onPointerEnter={() => cursorManager.setMode('hover-story', 'VIEW')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => onSelectStory(story)}
                className="group p-5 border border-white/10 hover:border-[#C9A66B]/60 bg-[#0B0B0B]/75 backdrop-blur-md cursor-pointer transition-all duration-300 rounded-sm"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#C9A66B] mb-3">
                  <span>{story.archiveId}</span>
                  <span>{story.readingTime}</span>
                </div>
                <h3 className="font-serif text-xl text-[#F1EEE8] group-hover:text-[#E8E1D5] transition-colors mb-1">
                  {story.title}
                </h3>
                <p className="font-grotesk text-[11px] text-[rgba(241,238,232,0.45)] mb-4">
                  {story.genre}
                </p>
                <span className="text-[10px] font-grotesk tracking-widest uppercase text-[#C9A66B] flex items-center space-x-1">
                  <span>ENTER CODEX</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          ZONE 04: EXPLORE THE COLLECTION (300 - 400vh)
          ================================================================ */}
      <section className="h-screen flex flex-col justify-center px-8 sm:px-14 lg:px-20">
        <div className="max-w-2xl space-y-6">
          <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
            ZONE 04 // THE EXTENDED ARCHIVE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#F1EEE8] font-light leading-tight">
            Moving through an infinite exhibition of thought.
          </h2>
          <p className="font-grotesk text-xs text-[rgba(241,238,232,0.55)] leading-relaxed">
            Every artefact preserves a moment frozen in literary amber. You can inspect any item in the 3D space directly or summon the full archive catalog.
          </p>

          <div className="pt-2 pointer-events-auto">
            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={onOpenIndex}
              className="inline-flex items-center space-x-3 px-6 py-2.5 border border-white/20 hover:border-[#C9A66B] text-xs font-grotesk tracking-[0.2em] uppercase text-[#F1EEE8] transition-colors rounded-sm bg-[#070707]/60"
            >
              <span>OPEN FULL ARCHIVE INDEX (06)</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C9A66B]" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          ZONE 05: RANDOM STORY ORACLE (400 - 500vh)
          ================================================================ */}
      <section className="h-screen flex items-center justify-center px-6 pointer-events-auto">
        <RandomStorySelector
          onSpinStart={onSpinStart}
          onSpinFinish={onSpinFinish}
          onSelectStory={onSelectStory}
          chosenStory={chosenRandomStory}
          isSpinning={isRandomSpinning}
        />
      </section>

      {/* ================================================================
          ZONE 06: END OF ARCHIVE (500 - 600vh)
          ================================================================ */}
      <section className="h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-20 border-t border-white/5">
        <div className="pt-10">
          <span className="font-grotesk text-[10px] tracking-[0.35em] text-[#C9A66B] uppercase">
            ZONE 06 // SANCTUARY TERMINUS
          </span>
        </div>

        <div className="my-auto max-w-3xl space-y-8">
          <h2 className="font-serif text-4xl sm:text-6xl text-[#F1EEE8] font-light italic">
            “Some stories are waiting to be found.”
          </h2>

          <p className="font-grotesk text-xs text-[rgba(241,238,232,0.5)] max-w-md leading-relaxed">
            The archive remains silent until approached. Each reading leaves a quiet imprint upon the digital grain.
          </p>

          <div className="pointer-events-auto pt-4">
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

        {/* Minimal Colophon Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono tracking-[0.2em] text-[rgba(241,238,232,0.35)] uppercase pt-8 border-t border-white/5">
          <div>THE LIVING LIBRARY // ANNO 2026</div>
          <div>EVERY STORY LEAVES SOMETHING BEHIND</div>
          <div>WEBGL 3D ARCHIVE · CURATED DIGITAL ANTHOLOGY</div>
        </div>
      </section>
    </div>
  );
};
