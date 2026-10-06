import React from 'react';
import { X } from 'lucide-react';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutOverlay: React.FC<AboutOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#070707]/90 backdrop-blur-md text-[#F1EEE8] animate-fadeIn select-none p-6">
      <div className="relative w-full max-w-xl border border-white/10 bg-[#0B0B0B]/80 p-8 sm:p-12 rounded-sm shadow-2xl">
        {/* Close Button */}
        <button
          onPointerEnter={() => cursorManager.setMode('hover-nav')}
          onPointerLeave={() => cursorManager.setMode('default')}
          onClick={() => {
            sound.playClick(320);
            onClose();
          }}
          className="absolute top-6 right-6 p-2 text-[rgba(241,238,232,0.6)] hover:text-[#F1EEE8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="space-y-8">
          <div>
            <span className="font-grotesk text-[10px] tracking-[0.3em] text-[#C9A66B] uppercase">
              ARCHIVE PHILOSOPHY
            </span>
            <h2 className="font-display text-2xl tracking-[0.18em] text-[#F1EEE8] uppercase mt-2">
              THE LIVING LIBRARY
            </h2>
          </div>

          <div className="space-y-5 font-serif text-xl sm:text-2xl text-[rgba(241,238,232,0.85)] leading-relaxed italic">
            <p>
              A digital archive for stories that deserve more than a page.
            </p>
            <p className="text-[#C9A66B] not-italic font-grotesk text-sm uppercase tracking-[0.2em]">
              Stories here are not simply read. They are entered.
            </p>
            <p className="text-base font-normal not-italic text-[rgba(241,238,232,0.65)] font-serif leading-relaxed">
              Each archive contains fragments of a world: images, sound, memory, movement, and text.
              Artifacts are preserved in zero gravity, waiting for a visitor to awaken their resonance.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-[0.2em] text-[rgba(241,238,232,0.4)] uppercase">
            <span>FOUNDED ANNO 2026 // DIGITAL ARCHIVE</span>
            <span>THREE.JS · WEBGL · CINEMATIC SCROLL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
