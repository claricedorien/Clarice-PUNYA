import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './Scene';
import { DarkSoulsHoloCard } from './components/DarkSoulsHoloCard';
import { HoloCardOverlay } from './components/HoloCardOverlay';
import { CustomCursor } from './components/CustomCursor';
import {
  ChapterExperienceModal,
  ChapterId,
} from './components/ChapterExperienceModal';
import { AudioProvider, useAudio } from './audio/AudioContext';
import { SoundControl } from './components/SoundControl';
import { preloadChapter02 } from './utils/preloadChapter02';

function AppContent() {
  const [showHoloCard, setShowHoloCard] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ChapterId | null>(null);
  const { setDucked } = useAudio();

  // 1. Preload Chapter 02 (ThreeUI Chinese Tower Landscape) during browser idle time
  useEffect(() => {
    preloadChapter02();
  }, []);

  // 2. Audio Ducking / Crossfade: smooth volume ducking when entering chapters or holo card
  const isOverlayOpen = showHoloCard || activeChapter !== null;
  useEffect(() => {
    setDucked(isOverlayOpen);
  }, [isOverlayOpen, setDucked]);

  // Listen for message from iframe (kage.html) or custom event
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BEGIN_THE_WALK') {
        setShowHoloCard(true);
      } else if (event.data?.type === 'OPEN_CHAPTER') {
        const chId = event.data?.chapterId as ChapterId;
        if (chId) {
          setActiveChapter(chId);
        }
      }
    };

    const handleHoloEvent = () => {
      setShowHoloCard(true);
    };

    const handleChapterEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ chapterId: ChapterId }>;
      if (customEvent.detail?.chapterId) {
        setActiveChapter(customEvent.detail.chapterId);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('BEGIN_THE_WALK', handleHoloEvent);
    window.addEventListener('OPEN_CHAPTER', handleChapterEvent);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('BEGIN_THE_WALK', handleHoloEvent);
      window.removeEventListener('OPEN_CHAPTER', handleChapterEvent);
    };
  }, []);

  const handleCloseHolo = useCallback(() => {
    setShowHoloCard(false);
  }, []);

  const handleContinueHolo = useCallback(() => {
    setShowHoloCard(false);
    // Send message to iframe to continue the walk into the beginning / next chapter
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ type: 'CONTINUE_THE_WALK' }, '*');
      } catch {
        // ignore cross-origin safety
      }
    });
  }, []);

  const handleCloseChapter = useCallback(() => {
    setActiveChapter(null);
  }, []);

  const handleContinueChapter = useCallback(
    (nextChapterId: ChapterId | null) => {
      if (nextChapterId) {
        // Transition directly to the next chapter experience
        setActiveChapter(nextChapterId);
        // Also inform iframe to highlight the next chapter card
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          try {
            iframe.contentWindow?.postMessage(
              { type: 'HIGHLIGHT_CHAPTER', chapterId: nextChapterId },
              '*'
            );
          } catch {}
        });
      } else {
        // Returned to sanctuary grid
        setActiveChapter(null);
      }
    },
    []
  );

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#05070a]">
      {/* 1. Underlying Mulan Page - preserved state and scroll position */}
      <div
        className={`w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOverlayOpen
            ? 'scale-[0.985] filter brightness-50 contrast-125 pointer-events-none'
            : 'scale-100 filter brightness-100 contrast-100'
        }`}
      >
        <Scene />
      </div>

      {/* 2. Fullscreen Holographic Card Experience */}
      <HoloCardOverlay
        isOpen={showHoloCard}
        onClose={handleCloseHolo}
        onContinue={handleContinueHolo}
      >
        <DarkSoulsHoloCard
          variant="cindermane"
          cardName="CLAIRE"
          characterTitle="THE ASHEN WARRIOR · FA MULAN"
          onClose={handleCloseHolo}
          onContinue={handleContinueHolo}
        />
      </HoloCardOverlay>

      {/* 3. Fullscreen Chapter Experience Modal / Overlay */}
      <ChapterExperienceModal
        chapterId={activeChapter}
        onClose={handleCloseChapter}
        onContinue={handleContinueChapter}
      />

      {/* 4. Persistent Sound Control (SOUND ON / SOUND OFF) */}
      <SoundControl />

      {/* 5. Universal High-Z Custom Cursor for Desktop (z-index: 99999) */}
      <CustomCursor />
    </main>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
