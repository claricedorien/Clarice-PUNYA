import React, { useEffect, useState, useCallback, useRef } from 'react';
import { JapaneseTowerLandscape } from '../shaders/japanese-tower/JapaneseTowerLandscape';
import '../shaders/threeui.css';

export interface Chapter02ExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function Chapter02Experience({
  isOpen,
  onClose,
  onContinue,
}: Chapter02ExperienceProps) {
  const [animStage, setAnimStage] = useState(0); // 0: unmounted, 1: mounting/bg, 2: scene ready, 3: UI visible
  const [isClosing, setIsClosing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRefs = useRef<number[]>([]);

  // Clear timers on unmount
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setAnimStage(1);

      // Staged transition:
      // 0.0–0.4s: grid fades down & background prepares
      const t1 = window.setTimeout(() => setAnimStage(2), 200);
      // 0.6–1.0s: minimal chapter UI fades in above the visual
      const t2 = window.setTimeout(() => setAnimStage(3), 600);
      timeoutRefs.current = [t1, t2];

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearAllTimeouts();
        document.body.style.overflow = prevOverflow;
      };
    } else {
      setAnimStage(0);
      setIsLoaded(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  }, [onClose]);

  const handleContinue = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      onContinue();
      setIsClosing(false);
    }, 400);
  }, [onContinue]);

  // Esc key listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  if (!isOpen && animStage === 0) return null;

  return (
    <div
      className={`fixed inset-0 w-screen h-screen z-50 overflow-hidden bg-[#05070a] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClosing
          ? 'opacity-0 pointer-events-none'
          : animStage >= 1
          ? 'opacity-100'
          : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter 02: The Summons"
    >
      {/* 1. FULLSCREEN THREEUI ENVIRONMENT: Fills 100vw and 100vh with no card shell or modal margins */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${
          animStage >= 2 && !isClosing
            ? 'scale-100 opacity-100 filter brightness-100'
            : 'scale-[0.98] opacity-70 filter brightness-75'
        }`}
      >
        <JapaneseTowerLandscape
          country="china"
          className="w-full h-full"
        />
      </div>

      {/* 2. LIGHTWEIGHT LOADING FALLBACK OVERLAY: shown only if ThreeUI is warming up */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#06080d]/90 backdrop-blur-sm pointer-events-none transition-opacity duration-700 ${
            animStage >= 2 ? 'opacity-0 delay-700' : 'opacity-100'
          }`}
          onTransitionEnd={() => setIsLoaded(true)}
        >
          <div className="flex flex-col items-center text-center px-6">
            <span className="font-mono text-xs tracking-[0.3em] text-[#e0231c] uppercase mb-2 font-bold">
              02 · THE SUMMONS
            </span>
            <p className="font-serif text-sm tracking-widest text-[#dfe7e0]/80 uppercase mb-4">
              ENTERING THE IMPERIAL REALM...
            </p>
            <div className="w-36 h-[2px] bg-[#dfe7e0]/15 relative overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e0231c] to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 3. MINIMAL CHAPTER NARRATIVE UI: floating directly above the visual with pointer-events-none on wrapper */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 md:p-12">
        {/* Top Bar: Top-Left title & Top-Right close button */}
        <div className="w-full flex items-start justify-between">
          {/* Top-Left: Chapter index, Title, and Hanzi */}
          <div
            className={`transition-all duration-700 ease-out ${
              animStage >= 3 && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs tracking-[0.25em] text-[#e0231c] font-bold">
                02 / 05
              </span>
              <span className="text-[#dfe7e0]/30 text-xs">·</span>
              <span className="text-[10px] font-mono tracking-widest text-[#dfe7e0]/50 uppercase">
                IMPERIAL PROCLAMATION
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-[#f4efe8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              THE SUMMONS
            </h2>
            <p className="text-sm sm:text-base font-serif text-[#c9a24a] tracking-widest mt-1 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              征召令
            </p>
          </div>

          {/* Top-Right: Accessible × CLOSE button (44px min touch target) */}
          <div
            className={`pointer-events-auto transition-all duration-700 ease-out delay-100 ${
              animStage >= 3 && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4'
            }`}
          >
            <button
              onClick={handleClose}
              className="group flex items-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-full border border-[#dfe7e0]/25 bg-[#090d14]/75 backdrop-blur-md text-[#dfe7e0] text-xs font-mono uppercase tracking-widest hover:border-[#dfe7e0] hover:text-white hover:bg-[#121924]/90 active:scale-95 transition-all cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
              aria-label="Close chapter experience"
            >
              <span className="text-base leading-none text-[#ff826e] group-hover:rotate-90 transition-transform">
                ×
              </span>
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Bottom-Left narrative line & Bottom-Right Continue button */}
        <div className="w-full flex flex-col sm:flex-row items-end justify-between gap-6 mt-auto">
          {/* Bottom-Left: Narrative Line */}
          <div
            className={`max-w-md transition-all duration-700 ease-out delay-200 ${
              animStage >= 3 && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="font-serif text-sm sm:text-base italic leading-relaxed text-[#dfe7e0]/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              “An imperial decree arrives:
              <br className="hidden sm:inline" /> one man from every family must go to war.”
            </p>
          </div>

          {/* Bottom-Right: Continue to Chapter 03 button */}
          <div
            className={`pointer-events-auto transition-all duration-700 ease-out delay-300 ${
              animStage >= 3 && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={handleContinue}
              className="group flex items-center gap-3 px-5 py-3 min-h-[44px] rounded-full border border-[#c9a24a]/40 bg-[#090d14]/85 backdrop-blur-md text-[#f1eee8] text-xs font-mono tracking-widest uppercase hover:border-[#c9a24a] hover:bg-[#161f2c]/95 hover:text-white active:scale-95 transition-all cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
            >
              <span>CONTINUE: 03 BORROWED ARMOR</span>
              <span className="text-[#c9a24a] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
