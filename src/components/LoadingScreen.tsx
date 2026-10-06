import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        // Organic acceleration
        const increment = Math.floor(Math.random() * 8) + 3;
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  const handleEnterClick = () => {
    setIsFading(true);
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-8 sm:p-14 bg-[#030305] text-white transition-all duration-1000 ${
        isFading ? 'opacity-0 pointer-events-none scale-105 filter blur-md' : 'opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="tracking-widest uppercase">AETHERIA // FLOATING STORY LIBRARY</span>
        </div>
        <div className="tracking-widest">
          {progress < 100 ? `AWAKENING ARCHIVES ${progress}%` : 'ARCHIVES READY'}
        </div>
      </div>

      {/* Center Cinematic Typography & Gate Trigger */}
      <div className="my-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-mono tracking-widest text-amber-400/80 uppercase">
            An Immersive Sanctuary of Floating Codices
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-normal text-neutral-100 tracking-tight leading-[1.05]">
            The Floating Story Library
          </h1>
        </div>

        <p className="text-sm sm:text-base text-neutral-300 font-light max-w-xl leading-relaxed font-serif-display italic">
          Enter an abstract zero-gravity universe where ancient fairy tales and cosmic manuscripts drift through atmospheric stardust and acoustic resonance.
        </p>

        <div className="pt-6">
          {isReady ? (
            <button
              onClick={handleEnterClick}
              data-magnetic="true"
              className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-full border border-amber-400/40 bg-white/[0.04] backdrop-blur-md text-xs font-mono tracking-widest uppercase text-white hover:bg-white hover:text-black hover:border-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-amber-400/10"
            >
              <span>ENTER THE FLOATING LIBRARY</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <div className="w-48 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="tabular-nums font-mono text-amber-400">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Technical Spec Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono text-neutral-400 border-t border-white/[0.08] pt-6">
        <div>SPATIAL AUDIO RECOMMENDED · ZERO-GRAVITY CODICES</div>
        <div>WEBGL 2.0 / 3D VOLUMETRIC SPACE / 60 FPS</div>
      </div>
    </div>
  );
};
