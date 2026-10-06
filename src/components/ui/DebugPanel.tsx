import React from 'react';

interface DebugPanelProps {
  mode: string;
  scrollY: number;
  maxScroll: number;
  progress: number;
  storySlug: string | null;
  lenisStatus: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  mode,
  scrollY,
  maxScroll,
  progress,
  storySlug,
  lenisStatus,
}) => {
  return (
    <aside
      aria-label="Engine Diagnostics"
      className="fixed bottom-3 left-3 z-50 pointer-events-none select-none bg-black/85 backdrop-blur border border-white/15 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#F1EEE8] rounded shadow-lg space-y-0.5"
    >
      <div className="flex items-center space-x-2">
        <span className="text-[#C9A66B]">MODE:</span>
        <span className="uppercase font-semibold">{mode}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/50">SCROLL:</span>
        <span>{Math.round(scrollY)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/50">MAX:</span>
        <span>{Math.round(maxScroll)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-[#C9A66B]">PROGRESS:</span>
        <span className="text-emerald-400 font-mono">{progress.toFixed(3)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/50">STORY:</span>
        <span>{storySlug || 'none'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/50">LENIS:</span>
        <span className="text-emerald-400">{lenisStatus}</span>
      </div>
    </aside>
  );
};
