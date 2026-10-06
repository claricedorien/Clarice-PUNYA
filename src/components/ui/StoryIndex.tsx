import React, { useState } from 'react';
import { Story, STORIES } from '../../data/stories';
import { X, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

interface StoryIndexProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (story: Story) => void;
  onHoverPreview?: (storyId: string | null) => void;
}

export const StoryIndex: React.FC<StoryIndexProps> = ({
  isOpen,
  onClose,
  onSelectStory,
  onHoverPreview,
}) => {
  const [hoveredStory, setHoveredStory] = useState<Story | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#070707]/90 backdrop-blur-md text-[#F1EEE8] animate-fadeIn select-none">
      {/* Background Dim Backdrop */}
      <div className="relative w-full max-w-5xl h-full max-h-[88vh] mx-auto p-8 sm:p-14 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B]" />
            <h2 className="font-display text-sm tracking-[0.3em] uppercase text-[#F1EEE8]">
              ARCHIVE CATALOG // STORY INDEX
            </h2>
          </div>

          <button
            onPointerEnter={() => cursorManager.setMode('hover-nav')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={() => {
              sound.playClick(320);
              onClose();
            }}
            className="flex items-center space-x-2 text-xs font-grotesk tracking-[0.2em] text-[rgba(241,238,232,0.6)] hover:text-[#F1EEE8] transition-colors"
          >
            <span>CLOSE</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story List & Live Hover Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
          {/* Left Column: Numbered Editorial Story List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {STORIES.map((story, idx) => {
              const numStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
              const isHovered = hoveredStory?.id === story.id;
              return (
                <div
                  key={story.id}
                  onPointerEnter={() => {
                    setHoveredStory(story);
                    onHoverPreview?.(story.id);
                    sound.playBookHover();
                    cursorManager.setMode('hover-story', 'ENTER');
                  }}
                  onPointerLeave={() => {
                    onHoverPreview?.(null);
                    cursorManager.setMode('default');
                  }}
                  onClick={() => {
                    onHoverPreview?.(null);
                    onSelectStory(story);
                    onClose();
                  }}
                  className={`group flex items-baseline justify-between py-2 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                    isHovered ? 'pl-2 border-[#C9A66B]/30' : ''
                  }`}
                >
                  <div className="flex items-baseline space-x-6">
                    <span className="font-mono text-xs text-[#C9A66B] tabular-nums tracking-widest">
                      {numStr}
                    </span>
                    <h3
                      className={`font-serif text-2xl sm:text-3xl transition-colors duration-300 ${
                        isHovered ? 'text-[#F1EEE8]' : 'text-[rgba(241,238,232,0.7)]'
                      }`}
                    >
                      {story.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-grotesk text-[rgba(241,238,232,0.45)]">
                    <span className="hidden sm:inline">{story.genre}</span>
                    <span>—</span>
                    <span>{story.readingTime}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 text-[#C9A66B] transition-transform duration-300 ${
                        isHovered ? 'translate-x-1 opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Physical Artefact Details & Excerpt (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center border-l border-white/10 lg:pl-10">
            {hoveredStory ? (
              <div className="space-y-4 animate-fadeIn">
                <span className="font-grotesk text-[10px] tracking-[0.25em] text-[#C9A66B] uppercase">
                  {hoveredStory.archiveId} // PHYSICAL ARTIFACT
                </span>
                <h4 className="font-serif text-2xl text-[#F1EEE8] italic">
                  “{hoveredStory.description}”
                </h4>
                <p className="font-grotesk text-xs text-[rgba(241,238,232,0.55)] leading-relaxed">
                  {hoveredStory.excerpt}
                </p>
                <div className="pt-4 flex items-center space-x-4">
                  <span className="text-xs font-mono text-[#C9A66B] uppercase tracking-widest">
                    CLICK TO ENTER WORLD
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-grotesk tracking-[0.2em] text-[rgba(241,238,232,0.35)] uppercase space-y-2">
                <p>HOVER ANY ARCHIVE RECORD TO INSPECT PROXIMITY TELEMETRY.</p>
                <p>CLICK TO DIRECTLY NAVIGATE THE VIRTUAL CAMERA.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-mono tracking-[0.2em] text-[rgba(241,238,232,0.4)] uppercase">
          <span>THE LIVING LIBRARY // ARCHIVE SECTOR 01</span>
          <span>{STORIES.length} PHYSICAL CODICES SUSPENDED IN 3D SPACE</span>
        </div>
      </div>
    </div>
  );
};
