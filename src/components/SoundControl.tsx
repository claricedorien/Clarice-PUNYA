import React from 'react';
import { useAudio } from '../audio/AudioContext';

export function SoundControl() {
  const { isPlaying, isMuted, toggleMute } = useAudio();

  const isSoundActive = isPlaying && !isMuted;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={toggleMute}
        type="button"
        className="group flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-full border border-[#dfe7e0]/20 bg-[#080c14]/85 backdrop-blur-md text-[#dfe7e0] hover:border-[#dfe7e0]/50 hover:bg-[#121926]/90 active:scale-95 transition-all cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.65)] select-none"
        aria-label={isSoundActive ? 'Mute background instrumental audio' : 'Unmute background instrumental audio'}
        title="Traditional Chinese Instrumental Ambience"
      >
        {/* Animated Soundwave Equalizer Indicator */}
        <div className="flex items-end gap-[2.5px] h-3.5 w-3.5 justify-center py-[1px]">
          {isSoundActive ? (
            <>
              <span className="w-[2px] bg-[#c9a24a] rounded-full h-full animate-[pulse_1.2s_ease-in-out_infinite]" />
              <span className="w-[2px] bg-[#ff826e] rounded-full h-2/3 animate-[pulse_0.9s_ease-in-out_infinite_0.2s]" />
              <span className="w-[2px] bg-[#dfe7e0] rounded-full h-full animate-[pulse_1.5s_ease-in-out_infinite_0.4s]" />
            </>
          ) : (
            <>
              <span className="w-[2px] bg-[#dfe7e0]/35 rounded-full h-1" />
              <span className="w-[2px] bg-[#dfe7e0]/35 rounded-full h-1" />
              <span className="w-[2px] bg-[#dfe7e0]/35 rounded-full h-1" />
            </>
          )}
        </div>

        {/* Text Label */}
        <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium">
          {isSoundActive ? 'SOUND ON' : 'SOUND OFF'}
        </span>
      </button>
    </div>
  );
}
