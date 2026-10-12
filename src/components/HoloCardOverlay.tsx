import React, { useEffect, useState } from 'react';

export interface HoloCardOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  onContinue: () => void;
  isOpen: boolean;
}

export function HoloCardOverlay({
  children,
  onClose,
  onContinue,
  isOpen,
}: HoloCardOverlayProps) {
  // Staged cinematic transition phases:
  // stage 0: initial trigger (button interaction confirms)
  // stage 1: page darkens slightly (0.0 - 0.6s)
  // stage 2: background UI fades down (0.2 - 0.8s)
  // stage 3: holographic light emerges (0.4 - 1.0s)
  // stage 4: card scales & fades in (0.6 - 1.2s)
  const [stage, setStage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setStage(1);

      const t1 = setTimeout(() => setStage(2), 200);
      const t2 = setTimeout(() => setStage(3), 400);
      const t3 = setTimeout(() => setStage(4), 600);

      // Lock background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setStage(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const handleContinue = () => {
    setIsClosing(true);
    setTimeout(() => {
      onContinue();
      setIsClosing(false);
    }, 400);
  };

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen && stage === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClosing
          ? 'opacity-0 pointer-events-none'
          : stage >= 1
          ? 'opacity-100'
          : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Holographic Card Experience"
    >
      {/* 1. Backdrop scrim - cinematic dimming */}
      <div
        className={`absolute inset-0 bg-[#05070a]/92 backdrop-blur-md transition-opacity duration-700 ${
          stage >= 2 && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 2. Holographic bloom / radiance expanding outward */}
      <div
        className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-1000 ease-out ${
          stage >= 3 && !isClosing
            ? 'scale-100 opacity-100'
            : 'scale-75 opacity-0'
        }`}
      >
        <div className="w-[85vw] max-w-[900px] h-[85vh] max-h-[900px] rounded-full bg-[radial-gradient(circle,rgba(224,35,28,0.22)_0%,rgba(201,162,74,0.14)_35%,rgba(10,14,22,0)_70%)] blur-3xl animate-pulse" />
      </div>

      {/* 3. Top-Right Minimal Close Control (44px min touch target, accessible) */}
      <div
        className={`absolute top-6 right-6 z-50 transition-all duration-500 delay-300 ${
          stage >= 3 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <button
          onClick={handleClose}
          className="group flex items-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-full border border-[#dfe7e0]/25 bg-[#05070a]/80 backdrop-blur-md text-[#dfe7e0] text-xs font-mono uppercase tracking-widest hover:border-[#dfe7e0] hover:text-white hover:bg-[#0e141e] active:scale-95 transition-all cursor-pointer shadow-2xl"
          aria-label="Close holographic card experience"
        >
          <span className="text-base leading-none text-[#ff826e] group-hover:rotate-90 transition-transform">×</span>
          <span>CLOSE</span>
        </button>
      </div>

      {/* 4. Main 3D Card Experience Container */}
      <div
        className={`relative z-40 w-full h-full flex items-center justify-center transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          stage >= 4 && !isClosing
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-90 opacity-0 translate-y-6'
        }`}
      >
        {children}
      </div>

      {/* 5. Bottom Center Minimal Continue Control (44px min touch target, accessible) */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 delay-500 ${
          stage >= 4 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          onClick={handleContinue}
          className="group flex items-center gap-3 px-8 py-3.5 min-h-[48px] min-w-[44px] rounded-full border border-[#c9a24a]/60 bg-[#0c121b]/90 backdrop-blur-md text-[#f7df94] text-xs font-medium uppercase tracking-[0.22em] hover:border-[#f7df94] hover:bg-[#151f2e] hover:shadow-[0_0_30px_rgba(201,162,74,0.35)] active:scale-95 transition-all cursor-pointer"
          aria-label="Continue the walk into next story chapter"
        >
          <span>CONTINUE THE WALK</span>
          <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}

export default HoloCardOverlay;
