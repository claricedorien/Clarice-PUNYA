import React from 'react';
import { ArrowDown, Sliders, Sparkles, RotateCcw, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface SceneOverlaysProps {
  scrollProgress: number; // 0 to 4
  activeScene: number; // 0 to 4
  onNavigateScene: (index: number) => void;
  interactiveDeformation: number;
  setInteractiveDeformation: (v: number) => void;
  interactiveWireframe: boolean;
  setInteractiveWireframe: (v: boolean) => void;
  interactiveSpeed: number;
  setInteractiveSpeed: (v: number) => void;
  onShockwave: () => void;
}

export const SceneOverlays: React.FC<SceneOverlaysProps> = ({
  scrollProgress,
  activeScene,
  onNavigateScene,
  interactiveDeformation,
  setInteractiveDeformation,
  interactiveWireframe,
  setInteractiveWireframe,
  interactiveSpeed,
  setInteractiveSpeed,
  onShockwave,
}) => {
  // Horizontal drift factor for editorial titles
  const horizontalShift1 = (scrollProgress - 0) * 120;
  const horizontalShift2 = (scrollProgress - 1) * -140;
  const horizontalShift3 = (scrollProgress - 2) * 110;

  return (
    <div className="relative z-10 pointer-events-none">
      {/* =========================================================================
          SCENE 01 — INTRO: GENESIS
          ========================================================================= */}
      <section
        id="scene-0"
        className="min-h-screen flex flex-col justify-between p-6 sm:p-14 max-w-7xl mx-auto"
      >
        <div className="pt-20">
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4">
            <span className="text-white font-semibold">PHASE 01</span>
            <span aria-hidden="true">·</span>
            <span>GENESIS</span>
            <span aria-hidden="true">·</span>
            <span>OBSIDIAN REFLECTION</span>
          </div>

          <div
            className="transition-transform duration-300"
            style={{ transform: `translate3d(${horizontalShift1}px, 0, 0)` }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif-display font-normal text-white tracking-tight leading-[0.95]" style={{ textWrap: 'balance' }}>
              The Monolith
            </h1>
          </div>
        </div>

        <div className="max-w-xl space-y-6 pointer-events-auto">
          <p className="text-lg sm:text-2xl text-neutral-300 font-light leading-relaxed">
            In the space between matter and perception, form awakens. A living sculpture rendered through volumetric shadow and crystalline math.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <button
              onClick={() => onNavigateScene(1)}
              data-magnetic="true"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95"
            >
              <span>Descend to Phase 02</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
              SCROLL TO FLY THROUGH DEPTH
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 02 — IMMERSION: RESONANCE
          ========================================================================= */}
      <section
        id="scene-1"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-14 max-w-7xl mx-auto"
      >
        <div className="max-w-4xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 uppercase tracking-widest">
            <span className="text-white font-semibold">PHASE 02</span>
            <span aria-hidden="true">·</span>
            <span>RESONANCE</span>
            <span aria-hidden="true">·</span>
            <span>VOLUMETRIC ORBIT</span>
          </div>

          <div
            className="transition-transform duration-300"
            style={{ transform: `translate3d(${horizontalShift2}px, 0, 0)` }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-normal text-white tracking-tight leading-[1.0]" style={{ textWrap: 'balance' }}>
              Geometry in Vibration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-400 font-light leading-relaxed text-sm sm:text-base">
            <p>
              Form is never static. It is a continuous vibration across temporal axes. As the camera dives into the particle matrix, the manifold unfolds into dual orbital shells.
            </p>
            <p>
              Light bends across mercury contours. The mathematical torus knot balances harmonic equilibrium against the void.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-neutral-400">
            <div>ORBITAL SHELLS: 1,600 NODES</div>
            <div aria-hidden="true">/</div>
            <div>SPECULARITY: 0.95 IOR</div>
            <div aria-hidden="true">/</div>
            <div>ATMOSPHERIC FOG: 0.05 DENSITY</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 03 — TRANSFORMATION: MORPHIC PHASE
          ========================================================================= */}
      <section
        id="scene-2"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-14 max-w-7xl mx-auto"
      >
        <div className="max-w-4xl space-y-8 ml-auto text-right">
          <div className="flex items-center justify-end gap-3 text-xs font-mono text-neutral-400 uppercase tracking-widest">
            <span className="text-white font-semibold">PHASE 03</span>
            <span aria-hidden="true">·</span>
            <span>THE MORPHIC PHASE</span>
            <span aria-hidden="true">·</span>
            <span>PERMEABLE BOUNDARIES</span>
          </div>

          <div
            className="transition-transform duration-300"
            style={{ transform: `translate3d(${horizontalShift3}px, 0, 0)` }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-normal text-white tracking-tight leading-[1.0]" style={{ textWrap: 'balance' }}>
              Topological Shift
            </h2>
          </div>

          <p className="text-base sm:text-xl text-neutral-300 font-light max-w-2xl ml-auto leading-relaxed">
            Every boundary is permeable. What seems solid is merely velocity slowed to human observation. Procedural noise weaves through each vertex, morphing the skin from monolithic obsidian into liquid refraction.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigateScene(3)}
              data-magnetic="true"
              className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95"
            >
              <span>Engage Interaction</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 04 — INTERACTION: DIRECT SYNTHESIS & ORBIT
          ========================================================================= */}
      <section
        id="scene-3"
        className="min-h-screen flex flex-col justify-center p-6 sm:p-14 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 uppercase tracking-widest">
              <span className="text-white font-semibold">PHASE 04</span>
              <span aria-hidden="true">·</span>
              <span>SYNTHESIS</span>
              <span aria-hidden="true">·</span>
              <span>KINETIC ORBIT</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif-display font-normal text-white tracking-tight leading-[1.05]" style={{ textWrap: 'balance' }}>
              Direct Synthesis
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              You are not a passive observer. Touch the 3D artifact to orbit its geometry in 360° space. Tweak computational deformation and trigger acoustic shockwaves.
            </p>

            <div className="pointer-events-auto pt-2">
              <button
                onClick={() => {
                  sound.playChime(660);
                  onShockwave();
                }}
                data-magnetic="true"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/30 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono tracking-widest uppercase transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trigger Particle Shockwave</span>
              </button>
            </div>
          </div>

          {/* Right Interactive Control Matrix */}
          <div className="lg:col-span-6 pointer-events-auto">
            <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-white font-medium">
                  <Sliders className="w-4 h-4 text-white" />
                  <span>ARTIFACT MODULATION MATRIX</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">REALTIME WEBGL</span>
              </div>

              {/* Slider 1: Morph Deformation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Surface Deformation:</span>
                  <span className="text-white tabular-nums">
                    {(interactiveDeformation * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={interactiveDeformation}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setInteractiveDeformation(val);
                    sound.playClick(400 + val * 200);
                  }}
                  className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 2: Orbit Velocity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Temporal Speed:</span>
                  <span className="text-white tabular-nums">
                    {interactiveSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={interactiveSpeed}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setInteractiveSpeed(val);
                    sound.playClick(350 + val * 150);
                  }}
                  className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Toggle 3: Wireframe Lattice Core */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-neutral-300">Inner Lattice Wireframe:</span>
                <button
                  onClick={() => {
                    sound.playClick(580);
                    setInteractiveWireframe(!interactiveWireframe);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    interactiveWireframe
                      ? 'bg-white text-black font-semibold'
                      : 'border border-white/20 text-neutral-400 hover:text-white'
                  }`}
                >
                  {interactiveWireframe ? 'ACTIVE' : 'DORMANT'}
                </button>
              </div>

              <div className="pt-2 text-[11px] font-mono text-neutral-400 border-t border-white/[0.08]">
                CLICK &amp; DRAG ANYWHERE ON SCREEN TO ROTATE SCULPTURE IN 3D
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 05 — FINALE: CELESTIAL DISPERSION & MANIFESTO
          ========================================================================= */}
      <section
        id="scene-4"
        className="min-h-screen flex flex-col justify-between p-6 sm:p-14 max-w-7xl mx-auto pt-28 pb-16"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 uppercase tracking-widest">
            <span className="text-white font-semibold">PHASE 05</span>
            <span aria-hidden="true">·</span>
            <span>FINALE</span>
            <span aria-hidden="true">·</span>
            <span>CELESTIAL DISPERSION</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-normal text-white tracking-tight leading-[1.0]" style={{ textWrap: 'balance' }}>
            We Construct Spaces Where Art &amp; Light Converge.
          </h2>

          <p className="text-base sm:text-xl text-neutral-400 font-light max-w-2xl leading-relaxed">
            The monolith dissolves into an expansive nebula of digital light. Every interaction leaves an imprint on the continuum.
          </p>
        </div>

        {/* Studio Manifesto & Connection Hub */}
        <div className="pointer-events-auto py-12 border-t border-b border-white/[0.08] my-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
          <div className="space-y-2">
            <div className="text-neutral-400 uppercase">STUDIO PHILOSOPHY</div>
            <p className="text-neutral-300 font-sans text-sm leading-relaxed">
              We reject homogeneous web templates in favor of cinematic digital worlds engineered with bare-metal WebGL shaders.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-neutral-400 uppercase">COLLABORATIONS &amp; INQUIRIES</div>
            <div className="space-y-1 text-sm font-mono text-white">
              <a
                href="mailto:curator@aetheria.art"
                className="hover:underline flex items-center gap-1 group"
              >
                <span>curator@aetheria.art</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <div className="text-xs text-neutral-400">LOS ANGELES · TOKYO · AMSTERDAM</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-neutral-400 uppercase">CONTINUUM CONTROLS</div>
            <button
              onClick={() => {
                sound.playChime(520);
                onNavigateScene(0);
              }}
              data-magnetic="true"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white text-xs font-mono transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-enter Genesis (Loop)</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer Credits */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div>&copy; {new Date().getFullYear()} AETHERIA · ALL RIGHTS RESERVED</div>
          <div>CRAFTED WITH THREE.JS · GPU-ACCELERATED SHADERS</div>
        </div>
      </section>
    </div>
  );
};
