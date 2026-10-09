import React from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { cursorManager } from '../CustomCursor';
import { Story } from '../../data/stories';
import { sound } from '../../utils/audio';

interface NavigationProps {
  mode: 'archive' | 'story' | 'exitingStory';
  story?: Story | null;
  onExitStory?: () => void;
  onOpenIndex: () => void;
  onOpenAbout: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  mode,
  story,
  onExitStory,
  onOpenIndex,
  onOpenAbout,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 sm:px-12 py-5 sm:py-7 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Title & Subtle Archive Meta */}
      <div className="pointer-events-auto flex items-center space-x-3">
        <div
          onPointerEnter={() => cursorManager.setMode('hover-nav')}
          onPointerLeave={() => cursorManager.setMode('default')}
          className="flex flex-col group cursor-pointer min-h-[44px] justify-center"
          onClick={() => {
            if (mode === 'story') {
              onExitStory?.();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <span className="font-display text-xs sm:text-sm tracking-[0.28em] text-[#F1EEE8] uppercase font-semibold">
            THE LIVING LIBRARY
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#C9A66B] font-grotesk opacity-75 mt-0.5">
            {mode === 'story' && story
              ? `${story.archiveId} // RECORD`
              : 'EVERY STORY LEAVES SOMETHING BEHIND'}
          </span>
        </div>
      </div>

      {/* Top Right: INDEX, ABOUT, SOUND, or EXIT STORY (min 44px targets) */}
      <nav className="pointer-events-auto flex items-center space-x-3 sm:space-x-7 text-xs font-grotesk tracking-[0.2em] uppercase text-[rgba(241,238,232,0.65)]">
        {mode === 'story' ? (
          <>
            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={onToggleSound}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 text-[11px] hover:text-[#F1EEE8] transition-colors p-2"
              title={soundEnabled ? 'Mute Atmosphere' : 'Unmute Atmosphere'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#C9A66B]" />
                  <span className="text-[#C9A66B] hidden sm:inline">SOUND ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 opacity-60" />
                  <span className="hidden sm:inline">SOUND OFF</span>
                </>
              )}
            </button>

            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => {
                sound.playClick(320);
                onExitStory?.();
              }}
              className="min-h-[44px] px-3 flex items-center space-x-1.5 text-xs font-grotesk tracking-[0.2em] text-[#C9A66B] hover:text-[#F1EEE8] transition-colors font-semibold"
            >
              <X className="w-4 h-4" />
              <span>EXIT</span>
            </button>
          </>
        ) : (
          <>
            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={onOpenIndex}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#F1EEE8] transition-colors relative px-2.5"
            >
              INDEX
            </button>

            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={onOpenAbout}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#F1EEE8] transition-colors relative px-2.5"
            >
              ABOUT
            </button>

            <button
              onPointerEnter={() => cursorManager.setMode('hover-nav')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={onToggleSound}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 text-[11px] hover:text-[#F1EEE8] transition-colors px-2"
              title={soundEnabled ? 'Mute Atmospheric Audio' : 'Unmute Ambient Sound'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#C9A66B]" />
                  <span className="text-[#C9A66B] hidden sm:inline">SOUND ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 opacity-60" />
                  <span className="hidden sm:inline">SOUND OFF</span>
                </>
              )}
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
