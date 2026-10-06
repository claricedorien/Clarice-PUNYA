import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavigationHUDProps {
  activeScene: number;
  scrollProgress: number;
  onNavigateScene: (index: number) => void;
  onSoundToggle: () => boolean;
  soundEnabled: boolean;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  activeScene,
  scrollProgress,
  onNavigateScene,
  onSoundToggle,
  soundEnabled,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scenes = [
    { num: '01', title: 'Genesis', subtitle: 'The Monolith Awakens' },
    { num: '02', title: 'Resonance', subtitle: 'Volumetric Depth' },
    { num: '03', title: 'Morphic Phase', subtitle: 'Topological Shift' },
    { num: '04', title: 'Synthesis', subtitle: 'Direct Interaction' },
    { num: '05', title: 'Finale', subtitle: 'Celestial Dispersion' },
  ];

  return (
    <>
      {/* Top Fixed Minimalist Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-6 flex items-center justify-between pointer-events-none">
        {/* Wordmark */}
        <div className="pointer-events-auto">
          <button
            onClick={() => onNavigateScene(0)}
            data-magnetic="true"
            className="text-sm font-serif-display font-medium tracking-[0.25em] text-white uppercase hover:text-neutral-300 transition-colors"
          >
            AETHERIA
          </button>
        </div>

        {/* Center Scene Indicator Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[11px] font-mono text-neutral-300 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white font-medium">SCENE {scenes[activeScene].num}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400 uppercase">{scenes[activeScene].title}</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playClick(640);
              onSoundToggle();
            }}
            data-magnetic="true"
            title={soundEnabled ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 backdrop-blur-md ${
              soundEnabled
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/25'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">SOUND: ON</span>
                <span className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 h-1.5 bg-white animate-pulse" />
                  <span className="w-0.5 h-2.5 bg-white animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-white animate-pulse delay-150" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">SOUND: OFF</span>
              </>
            )}
          </button>

          {/* Menu Drawer Button */}
          <button
            onClick={() => {
              sound.playClick(520);
              setMenuOpen(!menuOpen);
            }}
            data-magnetic="true"
            className="p-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-neutral-300 hover:text-white hover:border-white/25 transition-all"
            aria-label="Toggle Project Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Side Vertical Progress Line & Scene Anchors */}
      <nav
        aria-label="Scene Navigation"
        className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-5 pointer-events-none"
      >
        {scenes.map((scene, idx) => {
          const isActive = activeScene === idx;
          return (
            <button
              key={scene.num}
              onClick={() => onNavigateScene(idx)}
              data-magnetic="true"
              className="group pointer-events-auto flex items-center gap-3 text-right"
            >
              <span
                className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-white opacity-100 translate-x-0'
                    : 'text-neutral-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                }`}
              >
                {scene.title}
              </span>
              <div
                className={`transition-all duration-500 rounded-full ${
                  isActive
                    ? 'w-2.5 h-2.5 bg-white shadow-lg shadow-white/50'
                    : 'w-1.5 h-1.5 bg-neutral-600 group-hover:bg-neutral-300'
                }`}
              />
            </button>
          );
        })}

        {/* Global Progress Bar */}
        <div className="w-[1px] h-28 bg-neutral-800 relative mt-2 mr-[3px]">
          <div
            className="w-full bg-white transition-all duration-200"
            style={{ height: `${(scrollProgress / 4) * 100}%` }}
          />
        </div>
      </nav>

      {/* Curated Overlay Manifesto & Scene Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#030305]/95 backdrop-blur-2xl flex flex-col justify-between p-8 sm:p-16 transition-all duration-500">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
            <span className="text-sm font-serif-display tracking-widest text-white uppercase">
              AETHERIA // INDEX
            </span>
            <button
              onClick={() => {
                sound.playClick(440);
                setMenuOpen(false);
              }}
              data-magnetic="true"
              className="p-2 rounded-full border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chapter Navigation List */}
          <div className="my-auto max-w-4xl space-y-4 sm:space-y-6">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-6">
              SELECT CONTINUUM PHASE
            </div>
            {scenes.map((scene, idx) => (
              <button
                key={scene.num}
                onClick={() => {
                  sound.playClick(600 + idx * 40);
                  onNavigateScene(idx);
                  setMenuOpen(false);
                }}
                className="group w-full flex items-center justify-between text-left py-2 border-b border-white/[0.06] hover:border-white/30 transition-colors"
              >
                <div className="flex items-baseline gap-6 sm:gap-10">
                  <span className="text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                    {scene.num}
                  </span>
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-serif-display font-normal text-neutral-200 group-hover:text-white group-hover:translate-x-2 transition-all">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-mono">{scene.subtitle}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            ))}
          </div>

          {/* Footer of Drawer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-neutral-400 pt-6 border-t border-white/[0.08]">
            <div>PRODUCED BY CREATIVE ENGINEERING LABS</div>
            <div>SHADERS · PROCEDURAL AUDIO · THREE.JS</div>
          </div>
        </div>
      )}
    </>
  );
};
