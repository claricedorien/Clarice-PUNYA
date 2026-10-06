/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Advanced Shaders for The Living Library (Phase V4)
 * - LivingCoverShader: Transforms static covers into breathing living portals with theme-specific internal motion,
 *   organic feathered edges, 2.5D parallax, chromatic aberration, and cursor ripple.
 * - FluidAtmosphereShader: Global fluid background with noise-driven motion energy.
 */

export const LivingCoverShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uHover;
    uniform float uVelocity;
    uniform float uTransition;
    uniform vec2 uPointer;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normal;

      vec3 pos = position;

      // Subtle breathing wave
      float wave = sin(pos.y * 3.0 + uTime * 1.8) * cos(pos.x * 2.5 + uTime * 1.4);
      pos.z += wave * (0.03 + uHover * 0.08 + abs(uVelocity) * 0.12);

      // Interactive cursor push / bulge
      vec2 pDist = pos.xy - (uPointer * vec2(1.1, 1.4));
      float pFactor = exp(-dot(pDist, pDist) * 1.5) * uHover;
      pos.z += pFactor * 0.22;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uHover;
    uniform float uVelocity;
    uniform float uMotionEnergy;
    uniform vec2 uPointer;
    uniform vec3 uAccent;
    uniform int uTheme; // 0: train, 1: rain, 2: city, 3: room, 4: letter, 5: sea
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    // Fast noise helpers
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }

    void main() {
      vec2 uv = vUv;

      // 1. Internal 2.5D Pointer Parallax
      vec2 parallax = uPointer * (0.035 + uHover * 0.045);
      vec2 sampleUv = uv - parallax * (1.0 - uv.y * 0.5);

      // Subtle dynamic fluid ripple from pointer + motion energy
      float ripple = sin(length(uv - 0.5 - uPointer * 0.2) * 18.0 - uTime * 3.5) * (0.004 + uMotionEnergy * 0.012 + uHover * 0.008);
      sampleUv += vec2(ripple);

      // Clamp UV to avoid edge repetition
      sampleUv = clamp(sampleUv, 0.005, 0.995);

      // 2. Base Texture Sampling with Chromatic Separation
      float chromAmt = 0.003 + uHover * 0.006 + uMotionEnergy * 0.008;
      float r = texture2D(uTexture, sampleUv + vec2(chromAmt, 0.0)).r;
      float g = texture2D(uTexture, sampleUv).g;
      float b = texture2D(uTexture, sampleUv - vec2(chromAmt, 0.0)).b;
      vec3 col = vec3(r, g, b);

      // 3. LIVING THEME-SPECIFIC PROCEDURAL OVERLAYS
      if (uTheme == 0) {
        // THE LAST TRAIN: Drifting misty fog bands + flickering distant train headlights
        float fogBand = noise(vec2(uv.x * 2.5 - uTime * 0.25, uv.y * 4.0 + sin(uTime * 0.4)));
        float fogBand2 = noise(vec2(uv.x * 4.0 + uTime * 0.15, uv.y * 6.0));
        float totalFog = (fogBand * 0.6 + fogBand2 * 0.4) * (0.25 + uHover * 0.2);
        col += vec3(totalFog * 0.85, totalFog * 0.75, totalFog * 0.65);

        // Headlight cone sweeping across the lower platform
        float lightCone = exp(-abs(uv.x - 0.5 - sin(uTime * 0.8) * 0.15) * 6.0) * smoothstep(0.8, 0.2, uv.y);
        float flicker = 0.8 + 0.2 * sin(uTime * 14.0) * hash(vec2(floor(uTime * 12.0), 1.0));
        col += vec3(1.0, 0.82, 0.48) * lightCone * flicker * 0.4;
      }
      else if (uTheme == 1) {
        // THE BOY WHO COLLECTED RAIN: Sliding raindrops + glass caustics
        vec2 rainUv = vec2(uv.x * 14.0, uv.y * 8.0 - uTime * 1.8);
        float drop = smoothstep(0.88, 0.98, noise(rainUv)) * smoothstep(0.9, 0.1, uv.y);
        col += vec3(0.55, 0.7, 0.85) * drop * 0.6;

        // Glass bottle refractive caustics
        float caustic = sin(uv.x * 24.0 + sin(uv.y * 18.0 + uTime)) * cos(uv.y * 22.0 - uTime * 1.2);
        col += vec3(0.4, 0.6, 0.75) * max(0.0, caustic) * (0.15 + uHover * 0.25);
      }
      else if (uTheme == 2) {
        // SEVEN MINUTES BEFORE MIDNIGHT: Blinking window grid + electric noise
        vec2 grid = floor(uv * vec2(32.0, 24.0));
        float winBlink = hash(grid) > (0.65 - uMotionEnergy * 0.2) ? 1.0 : 0.0;
        float scanline = sin(uv.y * 160.0 - uTime * 10.0) * 0.05;
        col += vec3(1.0, 0.9, 0.7) * winBlink * 0.25;
        col += scanline * uAccent;
      }
      else if (uTheme == 3) {
        // THE FORGOTTEN ROOM: Pulsing warm door light leak + drifting dust specs
        float doorCrack = smoothstep(0.48, 0.50, uv.x) * smoothstep(0.52, 0.50, uv.x) * smoothstep(0.9, 0.1, uv.y);
        float pulse = 0.6 + 0.4 * sin(uTime * 2.0);
        col += vec3(1.0, 0.78, 0.42) * doorCrack * pulse * 0.7;

        // Floating dust specks
        vec2 dustUv = vec2(uv.x * 28.0 + sin(uTime * 0.8), uv.y * 36.0 + cos(uTime * 0.6));
        float dust = step(0.97, hash(floor(dustUv))) * (0.3 + 0.7 * sin(uTime * 4.0 + uv.x * 20.0));
        col += vec3(1.0, 0.9, 0.7) * dust * 0.5;
      }
      else if (uTheme == 4) {
        // A LETTER FROM TOMORROW: Chronometer rotating rings + energy pulse
        vec2 cCenter = uv - vec2(0.5, 0.5);
        float rDist = length(cCenter);
        float ring1 = abs(sin(rDist * 38.0 - uTime * 2.5));
        float ring2 = abs(sin(rDist * 22.0 + uTime * 1.8));
        float ring = smoothstep(0.92, 0.99, ring1) * 0.3 + smoothstep(0.94, 0.99, ring2) * 0.25;
        col += vec3(0.5, 0.75, 1.0) * ring * (0.3 + uHover * 0.4);
      }
      else if (uTheme == 5) {
        // THE SEA THAT REMEMBERED: Bioluminescent ocean caustics + deep marine swell
        float caustic1 = sin(uv.x * 18.0 + uTime * 1.2) * cos(uv.y * 14.0 - uTime * 0.9);
        float caustic2 = sin(uv.x * 28.0 - uv.y * 16.0 + uTime * 1.5);
        float totalCaustic = max(0.0, (caustic1 + caustic2) * 0.5);
        col += vec3(0.15, 0.65, 0.85) * totalCaustic * (0.3 + uHover * 0.4);
      }

      // 4. ORGANIC PORTAL EDGE FEATHERING (NO HARSH RECTANGULAR CARDS!)
      // Soft alpha dissolve on the outer 9% perimeter
      float edgeX = smoothstep(0.0, 0.09, uv.x) * smoothstep(1.0, 0.91, uv.x);
      float edgeY = smoothstep(0.0, 0.09, uv.y) * smoothstep(1.0, 0.91, uv.y);
      float alphaMask = edgeX * edgeY;

      // Circular vignette to give a dreamy portal shape
      float centerDist = length((uv - 0.5) * vec2(1.0, 1.25));
      float portalVignette = smoothstep(0.68, 0.35, centerDist);
      alphaMask = min(alphaMask, portalVignette);

      // Soft illuminated glow leaking into the surrounding darkness
      vec3 ambientLeakingGlow = uAccent * (0.12 + uHover * 0.45 + uMotionEnergy * 0.25) * (1.0 - alphaMask * 0.6);
      col += ambientLeakingGlow;

      gl_FragColor = vec4(col, alphaMask);
    }
  `
};

export const BackgroundFluidShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uScrollProgress;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTransitionEnergy;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      float f = sin(uv.x * 4.0 + uTime * 0.2) * cos(uv.y * 4.0 - uTime * 0.15);
      vec3 col = mix(uColorA, uColorB, clamp(f * 0.5 + 0.5, 0.0, 1.0));
      gl_FragColor = vec4(col * 0.4, 1.0);
    }
  `
};

export const StoryArtworkShader = LivingCoverShader;
