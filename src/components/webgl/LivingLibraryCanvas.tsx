import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Story, STORIES } from '../../data/stories';
import { BackgroundFluidShader, StoryArtworkShader } from './shaders';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

export type CanvasMode = 'archive' | 'entering_story' | 'story' | 'exiting_story';

interface LivingLibraryCanvasProps {
  mode: CanvasMode;
  archiveProgress: number; // 0 to 1
  storyProgress: number;   // 0 to 1
  scrollVelocity: number;
  activeStory: Story | null;
  onEnterStoryComplete: () => void;
  onExitStoryComplete: () => void;
  onHoverStoryChange: (story: Story | null) => void;
  previewPaletteStoryId: string | null; // for Index hover
}

export const LivingLibraryCanvas: React.FC<LivingLibraryCanvasProps> = ({
  mode,
  archiveProgress,
  storyProgress,
  scrollVelocity,
  activeStory,
  onEnterStoryComplete,
  onExitStoryComplete,
  onHoverStoryChange,
  previewPaletteStoryId,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for the 60 FPS animation loop
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const archiveProgRef = useRef(archiveProgress);
  archiveProgRef.current = archiveProgress;

  const storyProgRef = useRef(storyProgress);
  storyProgRef.current = storyProgress;

  const velocityRef = useRef(scrollVelocity);
  velocityRef.current = scrollVelocity;

  const activeStoryRef = useRef(activeStory);
  activeStoryRef.current = activeStory;

  const onEnterCompleteRef = useRef(onEnterStoryComplete);
  onEnterCompleteRef.current = onEnterStoryComplete;

  const onExitCompleteRef = useRef(onExitStoryComplete);
  onExitCompleteRef.current = onExitStoryComplete;

  const previewPaletteRef = useRef(previewPaletteStoryId);
  previewPaletteRef.current = previewPaletteStoryId;

  const onHoverStoryChangeRef = useRef(onHoverStoryChange);
  onHoverStoryChangeRef.current = onHoverStoryChange;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- THREE.JS PERSISTENT SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707, 0.032);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- FULLSCREEN FLUID BACKGROUND LAYER ---
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgScene = new THREE.Scene();
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: BackgroundFluidShader.vertexShader,
      fragmentShader: BackgroundFluidShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uScrollProgress: { value: 0 },
        uColorA: { value: new THREE.Color(0x070709) },
        uColorB: { value: new THREE.Color(0x1a1510) },
        uTransitionEnergy: { value: 0 },
      },
      depthWrite: false,
      depthTest: false,
    });
    const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
    bgScene.add(bgQuad);

    // --- DYNAMIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const cursorFlashlight = new THREE.PointLight(0xc9a66b, 2.0, 7.5, 2.0);
    scene.add(cursorFlashlight);

    // Localized accent lights for each story zone
    const storyLights: THREE.PointLight[] = [
      new THREE.PointLight(0xd97706, 2.8, 12, 1.8), // Story 1 (Warm low amber)
      new THREE.PointLight(0x22d3ee, 2.6, 12, 1.8), // Story 2 (Cool cyan)
      new THREE.PointLight(0x3b82f6, 2.4, 12, 2.0), // Story 3 (Cobalt midnight)
      new THREE.PointLight(0xb45309, 2.6, 10, 1.8), // Story 4 (Dim amber doorway)
      new THREE.PointLight(0xa855f7, 2.4, 12, 1.8), // Story 5 (Violet starlight)
      new THREE.PointLight(0x0d9488, 2.6, 12, 1.8), // Story 6 (Saline ocean teal)
    ];

    const lightPositions: [number, number, number][] = [
      [0.6, -1.0, 3.0],
      [2.2, 1.8, -4.0],
      [-0.4, 2.0, -11.5],
      [-2.8, -0.6, -19.5],
      [2.5, 1.2, -24.0],
      [0.0, -1.2, -32.0],
    ];

    storyLights.forEach((light, i) => {
      light.position.set(...lightPositions[i]);
      scene.add(light);
    });

    // --- ARCHITECTURAL MONOLITHS & SECTOR FRAMING ---
    const archGroup = new THREE.Group();
    scene.add(archGroup);

    const archMaterial = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Natural Wipe Wall between Story 1 and Story 2
    const wipeWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 14, 0.5), archMaterial);
    wipeWall.position.set(-1.8, 0.5, 3.2);
    wipeWall.rotation.set(0, 0.35, 0);
    archGroup.add(wipeWall);

    // Vertical monolith columns along the path
    const columnGeom = new THREE.BoxGeometry(0.45, 18, 0.45);
    const colCoords = [
      [3.8, 0, 4.5],
      [-4.2, 0, -2.0],
      [4.5, 0, -8.0],
      [-3.6, 0, -13.0],
      [3.9, 0, -19.0],
      [-4.0, 0, -27.0],
      [4.0, 0, -35.0],
    ];
    colCoords.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(columnGeom, archMaterial);
      col.position.set(x, y, z);
      archGroup.add(col);
    });

    // Doorway Architecture for Story 04 (The Forgotten Room)
    const doorTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.35), archMaterial);
    doorTop.position.set(-2.8, 0.95, -18.2);
    const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.35), archMaterial);
    doorLeft.position.set(-4.0, -0.85, -18.2);
    const doorRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.35), archMaterial);
    doorRight.position.set(-1.6, -0.85, -18.2);
    archGroup.add(doorTop, doorLeft, doorRight);

    // --- MULTI-TIER PARTICLES ---
    // 1. Archive Ambient Dust
    const dustCount = 800;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 22;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      dustPos[i * 3 + 2] = -Math.random() * 50 + 10;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(241, 238, 232, 1)');
    pGrad.addColorStop(0.3, 'rgba(201, 166, 107, 0.6)');
    pGrad.addColorStop(0.7, 'rgba(201, 166, 107, 0.1)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTex,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeom, dustMaterial);
    scene.add(dustPoints);

    // 2. Story Mode: Interactive Rain Droplets System (for The Boy Who Collected Rain)
    const rainCount = 650;
    const rainGeom = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    const rainVelocity = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 16;
      rainPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      rainVelocity[i] = Math.random() * 0.15 + 0.12;
    }
    rainGeom.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTex,
      color: new THREE.Color(0x8798a5),
      transparent: true,
      opacity: 0.0, // starts invisible until in story mode
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const rainPoints = new THREE.Points(rainGeom, rainMaterial);
    scene.add(rainPoints);

    // 3. Story Mode 3D Objects: Suspended Glass Bottles & Droplet (for Story 02)
    const storyObjectsGroup = new THREE.Group();
    scene.add(storyObjectsGroup);

    // Large main droplet (Chapter 1)
    const dropletGeom = new THREE.SphereGeometry(0.85, 32, 32);
    dropletGeom.scale(1.0, 1.45, 1.0);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8798a5,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
      thickness: 0.6,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
    });
    const mainDroplet = new THREE.Mesh(dropletGeom, glassMaterial);
    mainDroplet.position.set(0.0, 0.2, 0.0);
    mainDroplet.visible = false;
    storyObjectsGroup.add(mainDroplet);

    // Constellation of Apothecary Bottles (Chapters 2-5)
    const bottleGeom = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 24);
    const bottleNeck = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 24);
    const bottleCork = new THREE.CylinderGeometry(0.13, 0.13, 0.18, 16);
    const corkMat = new THREE.MeshStandardMaterial({ color: 0x8c6239, roughness: 0.8 });

    const bottleMeshes: THREE.Group[] = [];
    const bottleCoords = [
      [-1.8, 0.4, -2.5],
      [1.6, -0.3, -3.2],
      [-0.8, -0.6, -4.5],
      [2.2, 0.8, -5.8],
      [0.0, 0.1, -7.5], // Centered bottle for Chapter 3 & 6
    ];

    bottleCoords.forEach(([bx, by, bz], bi) => {
      const bGroup = new THREE.Group();
      const body = new THREE.Mesh(bottleGeom, glassMaterial);
      const neck = new THREE.Mesh(bottleNeck, glassMaterial);
      neck.position.y = 0.75;
      const cork = new THREE.Mesh(bottleCork, corkMat);
      cork.position.y = 0.95;

      // Tiny warm stardust light inside each bottle
      const bottleLight = new THREE.PointLight(0xffeedd, 1.5, 3.5, 2.0);
      bottleLight.position.set(0, 0, 0);

      bGroup.add(body, neck, cork, bottleLight);
      bGroup.position.set(bx, by, bz);
      bGroup.visible = false;
      storyObjectsGroup.add(bGroup);
      bottleMeshes.push(bGroup);
    });

    // --- ORGANIC SHADER-DRIVEN STORY ARTWORKS ---
    // NO VISIBLE RECTANGULAR BACKING PANES!
    const textureLoader = new THREE.TextureLoader();

    interface StoryRig {
      story: Story;
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      collider: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      targetPos: THREE.Vector3;
      targetRot: THREE.Euler;
      floatingOffset: number;
    }

    const storyRigs: StoryRig[] = [];
    const collidersList: THREE.Mesh[] = [];

    STORIES.forEach((story, idx) => {
      const texture = textureLoader.load(story.coverImage);
      texture.colorSpace = THREE.SRGBColorSpace;

      const artMaterial = new THREE.ShaderMaterial({
        vertexShader: StoryArtworkShader.vertexShader,
        fragmentShader: StoryArtworkShader.fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uVelocity: { value: 0 },
          uTransition: { value: 0 },
          uAccent: { value: new THREE.Color(story.accent) },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });

      const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.93, 24, 24), artMaterial);
      artMesh.position.set(...story.position);
      artMesh.rotation.set(...story.rotation);
      scene.add(artMesh);

      // Invisible collider for hover raycasting (NEVER RENDERED)
      const collider = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 3.0, 1.2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      collider.position.copy(artMesh.position);
      collider.rotation.copy(artMesh.rotation);
      collider.userData = { index: idx, story };
      scene.add(collider);
      collidersList.push(collider);

      storyRigs.push({
        story,
        mesh: artMesh,
        material: artMaterial,
        collider,
        basePos: new THREE.Vector3(...story.position),
        baseRot: new THREE.Euler(...story.rotation),
        targetPos: new THREE.Vector3(...story.position),
        targetRot: new THREE.Euler(...story.rotation),
        floatingOffset: idx * 1.45,
      });
    });

    // --- CATMULL-ROM CAMERA JOURNEY SPLINES ---
    const cameraSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 11),        // 0: Start / Intro
      new THREE.Vector3(0, 0, 7.2),       // 1: Story 01 (The Last Train)
      new THREE.Vector3(-2.8, 0.8, 2.0),  // 2: Wipe wall curve
      new THREE.Vector3(2.5, -0.5, -4.0), // 3: Story 02 (Collected Rain)
      new THREE.Vector3(0, 1.2, -10.0),   // 4: Story 03 (Midnight Clock)
      new THREE.Vector3(-3.0, -1.0, -16.0),// 5: Story 04 (Forgotten Room)
      new THREE.Vector3(3.0, 0.5, -22.0), // 6: Story 05 (Letter from Tomorrow)
      new THREE.Vector3(0, 0, -30.0),     // 7: Story 06 (The Sea)
      new THREE.Vector3(0, 0.2, -34.5),   // 8: Random Oracle Chamber
      new THREE.Vector3(0, 1.0, -38.5),   // 9: Sanctuary Terminus
    ]);

    const lookAtSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 2),
      new THREE.Vector3(0.6, 0.0, 2.2),
      new THREE.Vector3(-0.5, 0.2, -2.0),
      new THREE.Vector3(2.2, -0.4, -4.5),
      new THREE.Vector3(-0.4, 1.1, -12.0),
      new THREE.Vector3(-2.8, -0.8, -18.5),
      new THREE.Vector3(2.5, 0.5, -24.5),
      new THREE.Vector3(0.0, -0.1, -32.5),
      new THREE.Vector3(0.0, 0.0, -36.0),
      new THREE.Vector3(0.0, 0.5, -42.0),
    ]);

    // Story Mode Camera Path for "The Boy Who Collected Rain" (6 Chapters)
    const storyCameraSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 3.5),     // Ch 1: Droplet front
      new THREE.Vector3(0.5, 0.4, 0.8),    // Ch 2: Drifting into bottles
      new THREE.Vector3(0.0, 0.1, -4.8),   // Ch 3: Close to single bottle
      new THREE.Vector3(-1.8, 0.2, -6.0),  // Ch 4: Translucent sideways pass
      new THREE.Vector3(0.4, 0.5, -6.8),   // Ch 5: Constellation view
      new THREE.Vector3(0.0, 0.1, -6.2),   // Ch 6: Final bottle approach
    ]);

    // --- INTERACTION & POINTER EVENTS ---
    const mouse = {
      normX: 0,
      normY: 0,
      smoothX: 0,
      smoothY: 0,
    };

    let hoveredRig: StoryRig | null = null;
    let transitionProgress = 0; // 0 to 1

    const raycaster = new THREE.Raycaster();
    const rayVector = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Soft cursor flashlight tracks mouse in 3D
      cursorFlashlight.position.x = camera.position.x + mouse.normX * 3.5;
      cursorFlashlight.position.y = camera.position.y + mouse.normY * 2.5;
      cursorFlashlight.position.z = camera.position.z - 3.0;

      if (modeRef.current !== 'archive') return;

      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = storyRigs[hits[0].object.userData.index];
        if (hitRig && hoveredRig !== hitRig) {
          hoveredRig = hitRig;
          sound.playBookHover();
          cursorManager.setMode('hover-story', 'ENTER');
          onHoverStoryChangeRef.current(hitRig.story);
        }
      } else {
        if (hoveredRig !== null) {
          hoveredRig = null;
          cursorManager.setMode('default');
          onHoverStoryChangeRef.current(null);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- COLOR SCRIPT INTERPOLATION ENGINE ---
    // Smoothly blends atmosphere, fog, background shader based on progress
    const colorStops = [
      { p: 0.0, colA: new THREE.Color(0x070709), colB: new THREE.Color(0x12100d), fog: new THREE.Color(0x070707) },
      { p: 0.2, colA: new THREE.Color(0x181009), colB: new THREE.Color(0x28180c), fog: new THREE.Color(0x120c08) }, // Story 1 Amber
      { p: 0.36, colA: new THREE.Color(0x08131a), colB: new THREE.Color(0x102533), fog: new THREE.Color(0x09141b) }, // Story 2 Cyan
      { p: 0.52, colA: new THREE.Color(0x070b1a), colB: new THREE.Color(0x0f1833), fog: new THREE.Color(0x080c1a) }, // Story 3 Midnight
      { p: 0.68, colA: new THREE.Color(0x14100b), colB: new THREE.Color(0x241a12), fog: new THREE.Color(0x120e0a) }, // Story 4 Dim Amber
      { p: 0.80, colA: new THREE.Color(0x0d0a1c), colB: new THREE.Color(0x1a1233), fog: new THREE.Color(0x0c091a) }, // Story 5 Violet
      { p: 0.90, colA: new THREE.Color(0x051318), colB: new THREE.Color(0x092630), fog: new THREE.Color(0x06141a) }, // Story 6 Ocean Teal
      { p: 1.0, colA: new THREE.Color(0x070709), colB: new THREE.Color(0x181510), fog: new THREE.Color(0x070707) },
    ];

    const getInterpolatedColors = (prog: number) => {
      let idx = 0;
      for (let i = 0; i < colorStops.length - 1; i++) {
        if (prog >= colorStops[i].p && prog <= colorStops[i + 1].p) {
          idx = i;
          break;
        }
      }
      const s0 = colorStops[idx];
      const s1 = colorStops[idx + 1] || s0;
      const t = s1.p > s0.p ? (prog - s0.p) / (s1.p - s0.p) : 0;

      return {
        colA: s0.colA.clone().lerp(s1.colA, t),
        colB: s0.colB.clone().lerp(s1.colB, t),
        fog: s0.fog.clone().lerp(s1.fog, t),
      };
    };

    // --- ANIMATION LOOP (60 FPS) ---
    let animId: number;
    let clock = new THREE.Clock();
    let currentLookAt = new THREE.Vector3(0, 0, 2);

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;
      const v = velocityRef.current;

      // Pointer smoothing
      mouse.smoothX += (mouse.normX * 0.18 - mouse.smoothX) * 0.06;
      mouse.smoothY += (mouse.normY * 0.12 - mouse.smoothY) * 0.06;

      // 1. Color script interpolation
      const colors = getInterpolatedColors(archiveProgRef.current);
      bgMaterial.uniforms.uTime.value = elapsed;
      bgMaterial.uniforms.uPointer.value.set(mouse.normX, mouse.normY);
      bgMaterial.uniforms.uColorA.value.lerp(colors.colA, 0.05);
      bgMaterial.uniforms.uColorB.value.lerp(colors.colB, 0.05);
      (scene.fog as THREE.FogExp2).color.lerp(colors.fog, 0.05);

      // Render fluid background
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(bgScene, bgCamera);

      // 2. Camera journey & banking
      if (currentMode === 'archive') {
        const prog = Math.max(0, Math.min(1, archiveProgRef.current));
        const baseCam = cameraSpline.getPointAt(prog);
        const baseLookAt = lookAtSpline.getPointAt(prog);

        // Add subtle mouse parallax
        const targetCamX = baseCam.x + mouse.smoothX;
        const targetCamY = baseCam.y + mouse.smoothY;
        const targetCamZ = baseCam.z;

        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;

        currentLookAt.x += (baseLookAt.x + mouse.smoothX * 0.4 - currentLookAt.x) * 0.06;
        currentLookAt.y += (baseLookAt.y + mouse.smoothY * 0.4 - currentLookAt.y) * 0.06;
        currentLookAt.z += (baseLookAt.z - currentLookAt.z) * 0.06;

        camera.lookAt(currentLookAt);

        // Camera banking based on curvature and velocity (max ±1.5 deg)
        const bankTarget = -v * 0.025;
        camera.rotation.z += (bankTarget - camera.rotation.z) * 0.08;

        // Dynamic FOV on velocity (base 42 up to 45)
        const targetFov = 42 + Math.min(3.0, Math.abs(v) * 0.6);
        camera.fov += (targetFov - camera.fov) * 0.08;
        camera.updateProjectionMatrix();

        // Story mode 3D objects hidden in archive mode
        mainDroplet.visible = false;
        bottleMeshes.forEach(b => b.visible = false);
        rainMaterial.opacity = 0.0;
        archGroup.visible = true;

      } else if (currentMode === 'entering_story') {
        // --- PORTAL TRANSITION IN ---
        transitionProgress += 0.025;
        const t = Math.min(1.0, transitionProgress);
        bgMaterial.uniforms.uTransitionEnergy.value = t;

        const targetStory = activeStoryRef.current;
        const targetRig = storyRigs.find(r => r.story.id === targetStory?.id) || storyRigs[0];

        // Camera accelerates directly into the artwork
        const artP = targetRig.mesh.position;
        camera.position.x += (artP.x - camera.position.x) * 0.09;
        camera.position.y += (artP.y - camera.position.y) * 0.09;
        camera.position.z += (artP.z + 0.95 - camera.position.z) * 0.09;
        camera.lookAt(artP.x, artP.y, artP.z);

        targetRig.material.uniforms.uTransition.value = t;

        if (t >= 0.98) {
          transitionProgress = 0;
          onEnterCompleteRef.current();
        }

      } else if (currentMode === 'story') {
        // --- SCROLLYTELLING INSIDE THE STORY WORLD ---
        bgMaterial.uniforms.uTransitionEnergy.value = 0;
        const sp = Math.max(0, Math.min(1, storyProgRef.current));

        // Activate Story Mode 3D Objects & Rain
        mainDroplet.visible = true;
        bottleMeshes.forEach(b => b.visible = true);
        rainMaterial.opacity = THREE.MathUtils.lerp(rainMaterial.opacity, 0.75, 0.08);
        archGroup.visible = false;

        // Camera travels through the 6 chapters inside the story spline
        const storyCam = storyCameraSpline.getPointAt(sp);
        camera.position.x += (storyCam.x + mouse.smoothX * 0.6 - camera.position.x) * 0.07;
        camera.position.y += (storyCam.y + mouse.smoothY * 0.5 - camera.position.y) * 0.07;
        camera.position.z += (storyCam.z - camera.position.z) * 0.07;

        camera.lookAt(0, 0, storyCam.z - 3.5);

        // Animate Story 3D Objects (Droplet & Bottles)
        mainDroplet.rotation.y = elapsed * 0.4 + mouse.smoothX * 1.5;
        mainDroplet.rotation.x = Math.sin(elapsed * 0.6) * 0.15;

        bottleMeshes.forEach((b, idx) => {
          b.rotation.y = Math.sin(elapsed * 0.5 + idx) * 0.2 + mouse.smoothX * 0.4;
          b.position.y += Math.sin(elapsed * 0.8 + idx) * 0.002;
        });

        // Interactive Rain Particles
        const rPos = rainGeom.attributes.position.array as Float32Array;
        const isChapter6 = sp > 0.82; // Rain reverses upward in Chapter 6 per spec!

        for (let i = 0; i < rainCount; i++) {
          const idx = i * 3;
          if (isChapter6) {
            // Reverse rain upward!
            rPos[idx + 1] += rainVelocity[i] * 1.2;
            if (rPos[idx + 1] > 7.0) rPos[idx + 1] = -7.0;
          } else {
            // Normal rain downward
            rPos[idx + 1] -= rainVelocity[i];
            if (rPos[idx + 1] < -7.0) rPos[idx + 1] = 7.0;
          }

          // Mouse bends rain slightly
          rPos[idx] += mouse.smoothX * 0.02;
        }
        rainGeom.attributes.position.needsUpdate = true;

      } else if (currentMode === 'exiting_story') {
        // --- PORTAL TRANSITION OUT (REVERSE) ---
        transitionProgress += 0.028;
        const t = Math.min(1.0, transitionProgress);

        const prog = Math.max(0, Math.min(1, archiveProgRef.current));
        const archiveCam = cameraSpline.getPointAt(prog);
        const archiveLookAt = lookAtSpline.getPointAt(prog);

        camera.position.lerp(archiveCam, 0.1);
        currentLookAt.lerp(archiveLookAt, 0.1);
        camera.lookAt(currentLookAt);

        rainMaterial.opacity = THREE.MathUtils.lerp(rainMaterial.opacity, 0.0, 0.15);

        if (t >= 0.98) {
          transitionProgress = 0;
          onExitCompleteRef.current();
        }
      }

      // 3. Animate story artwork shaders
      storyRigs.forEach((rig) => {
        const isHovered = hoveredRig === rig;
        rig.material.uniforms.uTime.value = elapsed;
        rig.material.uniforms.uVelocity.value = v;

        // Hover uniform lerp
        const targetHover = isHovered ? 1.0 : 0.0;
        rig.material.uniforms.uHover.value +=
          (targetHover - rig.material.uniforms.uHover.value) * 0.08;

        if (currentMode === 'archive') {
          // Subtle organic floating
          const levY = Math.sin(elapsed * 0.7 + rig.floatingOffset) * 0.05;
          rig.targetPos.y = rig.basePos.y + levY;
          if (isHovered) {
            rig.targetPos.z = rig.basePos.z + 0.55;
          } else {
            rig.targetPos.z = rig.basePos.z;
          }

          rig.mesh.position.x += (rig.targetPos.x - rig.mesh.position.x) * 0.07;
          rig.mesh.position.y += (rig.targetPos.y - rig.mesh.position.y) * 0.07;
          rig.mesh.position.z += (rig.targetPos.z - rig.mesh.position.z) * 0.07;
          rig.collider.position.copy(rig.mesh.position);
        }
      });

      // Render 3D Scene
      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 w-screen h-screen pointer-events-auto overflow-hidden select-none"
    />
  );
};
