/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Lenis from 'lenis';
import { ArchiveEnvironment } from './components/webgl/ArchiveEnvironment';
import { SpatialTypography } from './components/SpatialTypography';
import { StoryTextOverlay } from './components/stories/StoryTextOverlay';
import { Navigation } from './components/ui/Navigation';
import { StoryIndex } from './components/ui/StoryIndex';
import { AboutOverlay } from './components/ui/AboutOverlay';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { DebugPanel } from './components/ui/DebugPanel';
import { Story, STORIES } from './data/stories';
import { sound } from './utils/audio';

type ExperienceMode = 'archive' | 'story' | 'exitingStory';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Experience Mode State Machine
  const [mode, setMode] = useState<ExperienceMode>('archive');
  const modeRef = useRef<ExperienceMode>('archive');
  modeRef.current = mode;

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Independent Progress Tracks (0.0 to 1.0)
  const [archiveProgress, setArchiveProgress] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Diagnostic states for development debug panel
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [currentMaxScroll, setCurrentMaxScroll] = useState(0);
  const [lenisStatus, setLenisStatus] = useState('INITIALIZING');

  // Overlays
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Oracular Selection in Zone 05
  const [isRandomSpinning, setIsRandomSpinning] = useState(false);
  const [chosenRandomStory, setChosenRandomStory] = useState<Story | null>(null);

  // Persistent reference for archive scroll position restoration
  const savedArchiveScrollYRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);

  // 1. Initialize ONE Persistent Lenis Instance (NEVER destroyed across states)
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      lerp: 0.08,
      syncTouch: true,
    });
    lenisRef.current = lenis;
    setLenisStatus('RUNNING');

    const updateScrollMetrics = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const prog = Math.max(0, Math.min(1, scrollY / maxScroll));

      setCurrentScrollY(scrollY);
      setCurrentMaxScroll(maxScroll);

      if (modeRef.current === 'story') {
        setStoryProgress(prog);
      } else {
        setArchiveProgress(prog);
      }
    };

    lenis.on('scroll', () => {
      updateScrollMetrics();
    });

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics, { passive: true });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
      lenis.destroy();
    };
  }, []);

  // 2. Sound Toggle
  const handleToggleSound = useCallback(() => {
    const active = sound.toggle();
    setSoundEnabled(active);
  }, []);

  // 3. ENTER STORY MODE: Instant transition, real scroll track switch
  const handleSelectStory = useCallback((story: Story) => {
    // Save current archive scroll position to restore later
    savedArchiveScrollYRef.current = window.scrollY;

    setSelectedStory(story);
    setMode('story');

    // Immediately reset scroll to 0 for the story track & resize Lenis
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true });
      lenisRef.current?.start();
      lenisRef.current?.resize();
      setStoryProgress(0);
      setCurrentScrollY(0);
      setLenisStatus('RUNNING');
    });
  }, []);

  // 4. EXIT STORY: Clean restoration of archive scroll, camera, and layout
  const handleExitStory = useCallback(() => {
    const targetY = savedArchiveScrollYRef.current;
    setMode('archive');
    setSelectedStory(null);

    requestAnimationFrame(() => {
      window.scrollTo(0, targetY);
      lenisRef.current?.scrollTo(targetY, { immediate: true });
      lenisRef.current?.start();
      lenisRef.current?.resize();

      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const restoredProg = Math.max(0, Math.min(1, targetY / maxScroll));
      setArchiveProgress(restoredProg);
      setCurrentScrollY(targetY);
      setLenisStatus('RUNNING');
    });
  }, []);

  // 5. Overlay Open/Close (Temporarily pause Lenis while modal is open)
  const handleOpenIndex = useCallback(() => {
    setIsIndexOpen(true);
    lenisRef.current?.stop();
    setLenisStatus('PAUSED');
  }, []);

  const handleCloseIndex = useCallback(() => {
    setIsIndexOpen(false);
    lenisRef.current?.start();
    lenisRef.current?.resize();
    setLenisStatus('RUNNING');
  }, []);

  const handleOpenAbout = useCallback(() => {
    setIsAboutOpen(true);
    lenisRef.current?.stop();
    setLenisStatus('PAUSED');
  }, []);

  const handleCloseAbout = useCallback(() => {
    setIsAboutOpen(false);
    lenisRef.current?.start();
    lenisRef.current?.resize();
    setLenisStatus('RUNNING');
  }, []);

  // 6. Oracular Random Story Controls
  const handleSpinStart = useCallback(() => {
    setIsRandomSpinning(true);
    setChosenRandomStory(null);
  }, []);

  const handleSpinFinish = useCallback((story: Story) => {
    setIsRandomSpinning(false);
    setChosenRandomStory(story);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#070707] text-[#F1EEE8] selection:bg-[#C9A66B] selection:text-black">
      {/* Zero-Latency GPU Custom Cursor */}
      <CustomCursor />

      {/* Atmospheric Overlays (Subtle Grain & Radial Vignette) */}
      <div className="fixed inset-0 pointer-events-none z-20 film-grain opacity-25" />
      <div className="fixed inset-0 pointer-events-none z-20 vignette-radial opacity-70" />

      {/* PERSISTENT FULLSCREEN WEBGL ENGINE (Both Archive & Story 3D groups) */}
      <ArchiveEnvironment
        mode={mode}
        archiveProgress={archiveProgress}
        storyProgress={storyProgress}
        selectedStory={selectedStory}
        onSelectStory={handleSelectStory}
      />

      {/* REAL DOCUMENT SCROLL TRACKS: DRIVE REAL SCROLLING */}
      {mode === 'archive' && (
        <div
          className="archive-scroll-track w-full pointer-events-none opacity-0 select-none"
          style={{ height: '800vh' }}
          aria-hidden="true"
        />
      )}

      {mode === 'story' && (
        <div
          className="story-scroll-track w-full pointer-events-none opacity-0 select-none"
          style={{ height: '700vh' }}
          aria-hidden="true"
        />
      )}

      {/* ARCHIVE SPATIAL TYPOGRAPHY LAYER */}
      {mode === 'archive' && (
        <SpatialTypography
          scrollProgress={archiveProgress}
          onSelectStory={handleSelectStory}
          onSpinStart={handleSpinStart}
          onSpinFinish={handleSpinFinish}
          chosenRandomStory={chosenRandomStory}
          isRandomSpinning={isRandomSpinning}
        />
      )}

      {/* STORY MODE 6-PART SCROLLYTELLING TEXT OVERLAY */}
      {mode === 'story' && selectedStory && (
        <StoryTextOverlay
          story={selectedStory}
          storyProgress={storyProgress}
          onExit={handleExitStory}
        />
      )}

      {/* PERSISTENT NAVIGATION (ARCHIVE & STORY MODES) */}
      <Navigation
        mode={mode}
        story={selectedStory}
        onExitStory={handleExitStory}
        onOpenIndex={handleOpenIndex}
        onOpenAbout={handleOpenAbout}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* STORY INDEX CATALOG OVERLAY */}
      <StoryIndex
        isOpen={isIndexOpen}
        onClose={handleCloseIndex}
        onSelectStory={(story) => {
          handleCloseIndex();
          handleSelectStory(story);
        }}
      />

      {/* ABOUT THE LIVING LIBRARY OVERLAY */}
      <AboutOverlay
        isOpen={isAboutOpen}
        onClose={handleCloseAbout}
      />

      {/* TEMPORARY DIAGNOSTIC DEBUG PANEL */}
      <DebugPanel
        mode={mode}
        scrollY={currentScrollY}
        maxScroll={currentMaxScroll}
        progress={mode === 'story' ? storyProgress : archiveProgress}
        storySlug={selectedStory?.slug || null}
        lenisStatus={lenisStatus}
      />

      {/* MINIMAL LOADING GAUGE */}
      {isLoading && (
        <LoadingScreen onLoaded={() => setIsLoading(false)} />
      )}
    </div>
  );
}
