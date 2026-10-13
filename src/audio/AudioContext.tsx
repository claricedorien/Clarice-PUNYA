import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { globalAudioEngine } from './ChineseInstrumentalEngine';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  isDucked: boolean;
  toggleMute: () => void;
  setDucked: (ducked: boolean) => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  isMuted: false,
  isDucked: false,
  toggleMute: () => {},
  setDucked: () => {},
});

const LANDING_VOLUME = 0.20;
const DUCKED_VOLUME = 0.10;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDucked, setIsDucked] = useState(false);
  const hasUserInteracted = useRef(false);

  // Initialize and start on first intentional user gesture
  const startAudioOnInteraction = useCallback(async () => {
    if (hasUserInteracted.current || isMuted) return;
    hasUserInteracted.current = true;

    try {
      await globalAudioEngine.start();
      const currentVol = isDucked ? DUCKED_VOLUME : LANDING_VOLUME;
      globalAudioEngine.setVolume(currentVol, 1.0);
      setIsPlaying(true);
    } catch {
      // Autoplay blocked or gesture not registered yet
    }
  }, [isMuted, isDucked]);

  // Global listeners for first user interaction (touch, click, scroll, keydown)
  useEffect(() => {
    const handleGesture = () => {
      startAudioOnInteraction();
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'USER_INTERACTION' || e.data?.type === 'BEGIN_THE_WALK' || e.data?.type === 'OPEN_CHAPTER') {
        startAudioOnInteraction();
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, handleGesture, { passive: true, once: true }));
    window.addEventListener('message', handleMessage);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleGesture));
      window.removeEventListener('message', handleMessage);
    };
  }, [startAudioOnInteraction]);

  // Handle Ducking / Chapter crossfade
  const handleSetDucked = useCallback((ducked: boolean) => {
    setIsDucked(ducked);
    if (!isMuted && isPlaying) {
      const targetVol = ducked ? DUCKED_VOLUME : LANDING_VOLUME;
      globalAudioEngine.setVolume(targetVol, 0.8);
    }
  }, [isMuted, isPlaying]);

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Unmuting: resume or start audio
      setIsMuted(false);
      globalAudioEngine.start().then(() => {
        const targetVol = isDucked ? DUCKED_VOLUME : LANDING_VOLUME;
        globalAudioEngine.setVolume(targetVol, 0.8);
        setIsPlaying(true);
      });
    } else {
      // Muting: ramp volume down and pause
      setIsMuted(true);
      globalAudioEngine.pause();
      setIsPlaying(false);
    }
  }, [isMuted, isDucked]);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        isDucked,
        toggleMute,
        setDucked: handleSetDucked,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
