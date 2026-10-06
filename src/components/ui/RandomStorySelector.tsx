import React, { useState } from 'react';
import { Story, STORIES } from '../../data/stories';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

interface RandomStorySelectorProps {
  onSpinStart: () => void;
  onSpinFinish: (story: Story) => void;
  onSelectStory: (story: Story) => void;
  chosenStory: Story | null;
  isSpinning: boolean;
}

export const RandomStorySelector: React.FC<RandomStorySelectorProps> = ({
  onSpinStart,
  onSpinFinish,
  onSelectStory,
  chosenStory,
  isSpinning,
}) => {
  const [lastIndex, setLastIndex] = useState<number>(-1);

  const handleTriggerRandom = () => {
    sound.playBookOpen();
    onSpinStart();

    // Select random story not equal to lastIndex
    let nextIdx = Math.floor(Math.random() * STORIES.length);
    if (nextIdx === lastIndex && STORIES.length > 1) {
      nextIdx = (nextIdx + 1) % STORIES.length;
    }
    setLastIndex(nextIdx);
    const selected = STORIES[nextIdx];

    setTimeout(() => {
      sound.playChime(660);
      onSpinFinish(selected);
    }, 1800);
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center space-y-6 select-none">
      {!chosenStory ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
              ZONE 05 // ORACULAR SELECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#F1EEE8] tracking-wide leading-tight">
              LET THE LIBRARY <br />
              <span className="italic text-[#E8E1D5]">CHOOSE FOR YOU.</span>
            </h2>
          </div>

          <p className="font-grotesk text-xs text-[rgba(241,238,232,0.55)] max-w-md mx-auto leading-relaxed">
            Allow the archive’s virtual gravitational eddy to settle upon a forgotten codex.
          </p>

          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={handleTriggerRandom}
            disabled={isSpinning}
            className="group inline-flex items-center space-x-3 px-8 py-3.5 border border-[#C9A66B]/50 hover:border-[#C9A66B] bg-[#0B0B0B]/70 hover:bg-[#C9A66B]/10 text-xs font-grotesk tracking-[0.25em] uppercase text-[#F1EEE8] transition-all duration-300 rounded-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#C9A66B] ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'TRAVERSING ARCHIVE...' : 'FIND ME A STORY'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn p-8 border border-[#C9A66B]/30 bg-[#0B0B0B]/85 backdrop-blur-md rounded-sm">
          <div className="space-y-1">
            <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
              {chosenStory.archiveId} // ORACLE SELECTION
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#F1EEE8]">
              {chosenStory.title}
            </h3>
            <p className="font-serif text-sm italic text-[#C9A66B]">
              {chosenStory.genre} — {chosenStory.readingTime}
            </p>
          </div>

          <p className="font-grotesk text-xs text-[rgba(241,238,232,0.7)] max-w-sm mx-auto leading-relaxed">
            “{chosenStory.description}”
          </p>

          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onPointerEnter={() => cursorManager.setMode('hover-story', 'ENTER')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => onSelectStory(chosenStory)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#F1EEE8] hover:bg-[#E8E1D5] text-[#070707] text-xs font-grotesk tracking-[0.2em] uppercase font-semibold transition-colors rounded-sm"
            >
              <span>ENTER STORY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={handleTriggerRandom}
              disabled={isSpinning}
              className="inline-flex items-center space-x-2 px-5 py-2.5 border border-white/20 hover:border-white/40 text-xs font-grotesk tracking-[0.18em] uppercase text-[rgba(241,238,232,0.75)] hover:text-[#F1EEE8] transition-colors rounded-sm"
            >
              <RotateCcw className="w-3 h-3 text-[#C9A66B]" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
