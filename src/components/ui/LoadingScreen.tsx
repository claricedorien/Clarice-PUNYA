import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoaded: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsDone(true), 400);
          setTimeout(() => onLoaded(), 1100);
          return 100;
        }
        const delta = Math.floor(Math.random() * 9) + 4;
        return Math.min(100, prev + delta);
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onLoaded]);

  const formattedProgress = progress < 10 ? `0${progress}` : `${progress}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070707] text-[#F1EEE8] select-none transition-opacity duration-1000 ${
        isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Title */}
        <span className="font-display text-xs tracking-[0.35em] text-[#F1EEE8] uppercase">
          THE LIVING LIBRARY
        </span>

        {/* Subtitle */}
        <span className="font-grotesk text-[10px] tracking-[0.25em] text-[#C9A66B] uppercase">
          ARCHIVE LOADING
        </span>

        {/* Minimal Numerical Counter */}
        <div className="pt-4 font-mono text-2xl tracking-[0.2em] text-[#E8E1D5] tabular-nums font-light">
          {formattedProgress}
        </div>
      </div>

      {/* Very faint minimal indicator */}
      <div className="absolute bottom-12 text-[9px] font-mono tracking-[0.25em] text-[rgba(241,238,232,0.3)] uppercase">
        ARCHIVE_CORE // WEBGL INITIALIZATION
      </div>
    </div>
  );
};
