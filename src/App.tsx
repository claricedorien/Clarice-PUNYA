import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './Scene';
import { DarkSoulsHoloCard } from './components/DarkSoulsHoloCard';
import { HoloCardOverlay } from './components/HoloCardOverlay';

export default function App() {
  const [showHoloCard, setShowHoloCard] = useState(false);

  // Listen for message from iframe (kage.html) or custom event
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BEGIN_THE_WALK') {
        setShowHoloCard(true);
      }
    };

    const handleCustomEvent = () => {
      setShowHoloCard(true);
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('BEGIN_THE_WALK', handleCustomEvent);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('BEGIN_THE_WALK', handleCustomEvent);
    };
  }, []);

  const handleClose = useCallback(() => {
    setShowHoloCard(false);
  }, []);

  const handleContinue = useCallback(() => {
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

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#05070a]">
      {/* 1. Underlying Mulan Page - preserved state and position */}
      <div
        className={`w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showHoloCard
            ? 'scale-[0.985] filter brightness-50 contrast-125 pointer-events-none'
            : 'scale-100 filter brightness-100 contrast-100'
        }`}
      >
        <Scene />
      </div>

      {/* 2. Fullscreen Holographic Card Experience */}
      <HoloCardOverlay
        isOpen={showHoloCard}
        onClose={handleClose}
        onContinue={handleContinue}
      >
        <DarkSoulsHoloCard
          variant="cindermane"
          cardName="CLAIRE"
          characterTitle="THE ASHEN WARRIOR · FA MULAN"
          onClose={handleClose}
          onContinue={handleContinue}
        />
      </HoloCardOverlay>
    </main>
  );
}
