import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Story, STORIES } from '../../data/stories';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';

interface ArchiveEnvironmentProps {
  mode: 'archive' | 'story' | 'exitingStory';
  archiveProgress: number; // 0.0 to 1.0
  storyProgress: number;   // 0.0 to 1.0
  selectedStory: Story | null;
  onSelectStory: (story: Story) => void;
}

export const ArchiveEnvironment: React.FC<ArchiveEnvironmentProps> = ({
  mode,
  archiveProgress,
  storyProgress,
  selectedStory,
  onSelectStory,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for 60fps render loop
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const archiveProgRef = useRef(archiveProgress);
  archiveProgRef.current = archiveProgress;

  const storyProgRef = useRef(storyProgress);
  storyProgRef.current = storyProgress;

  const selectedStoryRef = useRef(selectedStory);
  selectedStoryRef.current = selectedStory;

  const onSelectStoryRef = useRef(onSelectStory);
  onSelectStoryRef.current = onSelectStory;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // --- 1. THREE.JS SCENE & RENDERER SETUP ---
    const scene = new THREE.Scene();
    const baseBgColor = new THREE.Color(0x070707);
    scene.background = baseBgColor.clone();
    scene.fog = new THREE.FogExp2(0x070707, 0.026);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.25 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.className = 'webgl-fixed';
    renderer.domElement.style.touchAction = 'pan-y'; // Crucial: allows vertical scrolling on mobile
    container.appendChild(renderer.domElement);

    // =========================================================================
    // GLOBAL FLUID MOTION & POINTER SIGNALS
    // =========================================================================
    const mouse = {
      normX: 0,
      normY: 0,
      targetX: 0,
      targetY: 0,
      springX: 0,
      springY: 0,
      lastX: 0,
      lastY: 0,
      speed: 0,
    };

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let motionEnergy = 0;

    // =========================================================================
    // GROUP A: ARCHIVE WORLD (SPATIAL ARCHIVE FOLDERS & ORGANIC FLUID STREAM)
    // =========================================================================
    const archiveGroup = new THREE.Group();
    archiveGroup.visible = true;
    scene.add(archiveGroup);

    // 1. SCENIC ARCHIVE LIGHTING
    const archiveAmbient = new THREE.AmbientLight(0xffffff, 0.9);
    archiveGroup.add(archiveAmbient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    dirLight.position.set(6, 12, 10);
    archiveGroup.add(dirLight);

    const cursorFlashlight = new THREE.PointLight(0xc9a66b, 2.5, 16, 1.6);
    cursorFlashlight.position.set(0, 0, 4);
    archiveGroup.add(cursorFlashlight);

    // Archival beacon sweeps highlights across space
    const archiveBeacon = new THREE.PointLight(0xffe4b5, 2.2, 24, 1.6);
    archiveBeacon.position.set(0, 4.5, 0);
    archiveGroup.add(archiveBeacon);

    // 2. CONTINUOUS OBSIDIAN FLOOR WITH RESTRAINED PERSPECTIVE SEAMS
    const floorGeom = new THREE.PlaneGeometry(28, 76);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.35,
      metalness: 0.45,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -3.2, -10.0);
    archiveGroup.add(floorMesh);

    // Subtle brass perspective seams along the floor
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc9a66b,
      roughness: 0.35,
      metalness: 0.85,
    });
    [-3.2, -1.0, 1.0, 3.2].forEach((rx) => {
      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 74), brassTrimMat);
      railMesh.position.set(rx, -3.18, -10.0);
      archiveGroup.add(railMesh);
    });

    // 3. BACKGROUND ARCHITECTURAL MONOLITHS (DEEP PERSPECTIVE REPOSITORY)
    const megalithGeom = new THREE.BoxGeometry(3.0, 20.0, 1.4);
    const megalithMat = new THREE.MeshStandardMaterial({
      color: 0x040507,
      roughness: 0.9,
      metalness: 0.1,
    });
    const megalithCoords = [
      [-8.5, 5.0, -36.0],
      [8.0, 6.0, -40.0],
      [-5.0, 7.0, -44.0],
      [5.5, 5.5, -46.0],
      [-9.5, 6.5, -50.0],
      [9.0, 7.5, -52.0],
    ];
    megalithCoords.forEach(([mx, my, mz]) => {
      const mMesh = new THREE.Mesh(megalithGeom, megalithMat);
      mMesh.position.set(mx, my, mz);
      archiveGroup.add(mMesh);
    });

    // 4. HIGH-PARALLAX FOREGROUND SILHOUETTES (SUBTLE FRAMING & DEPTH)
    const fgObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x030304,
      roughness: 0.95,
      metalness: 0.05,
    });
    const fgPylon1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 12, 0.6), fgObsidianMat);
    fgPylon1.position.set(-3.2, 0.8, 8.5);
    const fgPrism2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.25, 3.0, 4), brassTrimMat);
    fgPrism2.position.set(3.0, 0.4, 3.5);
    fgPrism2.rotation.set(0.2, 0.4, 0.15);
    const fgTransom3 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 0.4), fgObsidianMat);
    fgTransom3.position.set(-1.0, 2.2, -2.5);
    const fgBlade4 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 12, 0.45), fgObsidianMat);
    fgBlade4.position.set(2.8, 0.2, -8.5);
    const fgJamb5 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 0.55), fgObsidianMat);
    fgJamb5.position.set(-3.0, 0.5, -16.5);
    const fgShard6 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), brassTrimMat);
    fgShard6.position.set(2.8, 0.8, -23.5);
    fgShard6.rotation.set(-0.25, 0.35, 0.1);

    const fgObjects = [fgPylon1, fgPrism2, fgTransom3, fgBlade4, fgJamb5, fgShard6];
    fgObjects.forEach((obj) => archiveGroup.add(obj));

    // =========================================================================
    // 5. ORGANIC FLUID WEBGL STRUCTURE (FLOWING MEMORY STREAM)
    // =========================================================================
    // A 3D spatial ribbon path weaving continuously through the folders
    const fluidStreamSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 1.6, 12.0),
      new THREE.Vector3(-1.8, 0.8, 6.0),
      new THREE.Vector3(1.6, -0.4, 0.0),
      new THREE.Vector3(-1.2, 0.9, -6.5),
      new THREE.Vector3(1.8, -0.6, -13.0),
      new THREE.Vector3(-1.6, 0.6, -19.5),
      new THREE.Vector3(1.2, -0.2, -26.0),
      new THREE.Vector3(0.0, 0.4, -34.0),
    ]);

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.3, 'rgba(201, 166, 107, 0.8)');
    pGrad.addColorStop(0.7, 'rgba(135, 152, 165, 0.2)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const fluidParticleCount = isTouch ? 900 : 1800;
    const fluidGeom = new THREE.BufferGeometry();
    const fluidPositions = new Float32Array(fluidParticleCount * 3);
    const fluidColors = new Float32Array(fluidParticleCount * 3);
    const fluidSeeds: {
      t: number;
      speed: number;
      radius: number;
      theta: number;
      phase: number;
    }[] = [];

    // Thematic zone colors for iridescent color interpolation along spline
    const zoneColors = [
      new THREE.Color('#C9A66B'), // Amber
      new THREE.Color('#7899AC'), // Steel blue
      new THREE.Color('#5E9BAE'), // Cyan
      new THREE.Color('#D89278'), // Warm orange
      new THREE.Color('#9C8AB4'), // Lavender violet
      new THREE.Color('#4DA8A8'), // Deep teal
    ];

    for (let i = 0; i < fluidParticleCount; i++) {
      const t = i / fluidParticleCount;
      const speed = 0.015 + Math.random() * 0.02;
      const radius = 0.35 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phase = Math.random() * Math.PI * 2;

      fluidSeeds.push({ t, speed, radius, theta, phase });

      const pt = fluidStreamSpline.getPointAt(t);
      fluidPositions[i * 3] = pt.x + Math.cos(theta) * radius;
      fluidPositions[i * 3 + 1] = pt.y + Math.sin(theta) * radius;
      fluidPositions[i * 3 + 2] = pt.z;

      // Color based on position along stream
      const cIdx = Math.floor(t * (zoneColors.length - 1));
      const col = zoneColors[cIdx] || zoneColors[0];
      fluidColors[i * 3] = col.r;
      fluidColors[i * 3 + 1] = col.g;
      fluidColors[i * 3 + 2] = col.b;
    }

    fluidGeom.setAttribute('position', new THREE.BufferAttribute(fluidPositions, 3));
    fluidGeom.setAttribute('color', new THREE.BufferAttribute(fluidColors, 3));

    const fluidParticleMat = new THREE.PointsMaterial({
      size: 0.10,
      map: pTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fluidStreamMesh = new THREE.Points(fluidGeom, fluidParticleMat);
    archiveGroup.add(fluidStreamMesh);

    // =========================================================================
    // 6. SPATIAL ARCHIVE FOLDERS / STORY PORTALS (PHYSICAL 3D REFINED RECORDS)
    // =========================================================================
    interface ArchiveFolderRig {
      story: Story;
      folderGroup: THREE.Group;
      chassisMesh: THREE.Mesh;
      bezelMesh: THREE.Mesh;
      tabMesh: THREE.Mesh;
      canvasMesh: THREE.Mesh;
      canvasTexture: THREE.CanvasTexture;
      canvasElement: HTMLCanvasElement;
      canvasCtx: CanvasRenderingContext2D;
      bgGlowMesh: THREE.Mesh;
      fgGlassMesh: THREE.Mesh;
      edgeParticles: THREE.Points;
      light: THREE.PointLight;
      collider: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      targetScale: number;
      hoverFactor: number;
      floatPhase: number;
      activeCenter: number;
    }

    const folderRigs: ArchiveFolderRig[] = [];
    const collidersList: THREE.Mesh[] = [];

    // Coordinates designed for continuous spatial rhythm:
    // Left side of camera contains negative space for metadata;
    // Primary folder is in center-right sweet spot;
    // Next folder is visible in background depth.
    const folderPositions: [number, number, number][] = [
      [0.6, 0.2, 1.8],    // Story 1: The Last Train
      [-0.5, -0.1, -3.8], // Story 2: The Boy Who Collected Rain
      [0.7, 0.4, -9.8],   // Story 3: Seven Minutes Before Midnight
      [-0.6, -0.3, -15.8],// Story 4: The Forgotten Room
      [0.8, 0.3, -21.8],  // Story 5: A Letter From Tomorrow
      [-0.2, 0.0, -28.8], // Story 6: The Sea That Remembered
    ];

    const folderRotations: [number, number, number][] = [
      [0.02, -0.18, 0.01],
      [-0.02, 0.16, -0.01],
      [0.01, -0.15, 0.02],
      [-0.01, 0.18, -0.01],
      [0.02, -0.16, 0.01],
      [0.0, 0.08, 0.0],
    ];

    const folderActiveCenters = [0.22, 0.37, 0.52, 0.66, 0.79, 0.90];

    // Shared physical materials for the digital spatial folder
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x090b0e,
      roughness: 0.65,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92,
    });

    const fgGlassMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
    });

    STORIES.forEach((story, idx) => {
      const fGroup = new THREE.Group();
      const pos = folderPositions[idx] || [0, 0, 0];
      const rot = folderRotations[idx] || [0, 0, 0];
      fGroup.position.set(...pos);
      fGroup.rotation.set(...rot);
      archiveGroup.add(fGroup);

      // --- LAYER 1: REAR FOLDER CHASSIS (WITH REFINED DEPTH 0.08) ---
      // Dimension: 2.36 x 3.16 x 0.08 (folder-like aspect ratio)
      const chassisGeom = new THREE.BoxGeometry(2.36, 3.16, 0.08);
      const chassisMesh = new THREE.Mesh(chassisGeom, chassisMat);
      chassisMesh.position.z = -0.02;
      fGroup.add(chassisMesh);

      // Top Index Tab Ear at top right: 0.70 x 0.16 x 0.07
      const tabGeom = new THREE.BoxGeometry(0.72, 0.16, 0.07);
      const tabMat = new THREE.MeshStandardMaterial({
        color: 0x12161c,
        roughness: 0.55,
        metalness: 0.35,
      });
      const tabMesh = new THREE.Mesh(tabGeom, tabMat);
      tabMesh.position.set(0.74, 1.62, -0.02);
      fGroup.add(tabMesh);

      // --- LAYER 2: OUTER BEVELED METALLIC FRAMING BEZEL ---
      const bezelGeom = new THREE.BoxGeometry(2.42, 3.22, 0.03);
      const bezelTrim = new THREE.MeshStandardMaterial({
        color: new THREE.Color(story.accent),
        roughness: 0.35,
        metalness: 0.85,
        emissive: new THREE.Color(story.accent),
        emissiveIntensity: 0.15,
      });
      const bezelMesh = new THREE.Mesh(bezelGeom, bezelTrim);
      bezelMesh.position.z = 0.01;
      fGroup.add(bezelMesh);

      // --- LAYER 3: INNER LIVING ANIMATED CANVAS VISUAL (Z = 0.02) ---
      // Dynamic HTML canvas texture for living internal world animations
      const cCanvas = document.createElement('canvas');
      cCanvas.width = 512;
      cCanvas.height = 680;
      const cCtx = cCanvas.getContext('2d')!;

      // Load base cover art onto canvas
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      baseImg.src = story.coverImage;
      baseImg.onload = () => {
        cCtx.drawImage(baseImg, 0, 0, cCanvas.width, cCanvas.height);
        cTex.needsUpdate = true;
      };

      const cTex = new THREE.CanvasTexture(cCanvas);
      cTex.colorSpace = THREE.SRGBColorSpace;

      const canvasPlaneGeom = new THREE.PlaneGeometry(2.28, 3.08);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: cTex,
        roughness: 0.45,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });
      const canvasMesh = new THREE.Mesh(canvasPlaneGeom, canvasMat);
      canvasMesh.position.z = 0.02;
      fGroup.add(canvasMesh);

      // --- LAYER 4: FRONT OPTICAL GLASS SHEET (Z = 0.05) ---
      const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.32, 3.12), fgGlassMat);
      glassMesh.position.z = 0.05;
      fGroup.add(glassMesh);

      // --- LAYER 5: REAR AMBIENT ACCENT GLOW (Z = -0.06) ---
      const bgGlowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(story.accent),
        transparent: true,
        opacity: 0.18,
      });
      const bgGlowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 3.45), bgGlowMat);
      bgGlowMesh.position.z = -0.06;
      fGroup.add(bgGlowMesh);

      // --- LAYER 6: DELICATE ORBITAL EDGE PARTICLES ---
      const edgePCount = 20;
      const edgePGeom = new THREE.BufferGeometry();
      const edgePPos = new Float32Array(edgePCount * 3);
      for (let ep = 0; ep < edgePCount; ep++) {
        const angle = (ep / edgePCount) * Math.PI * 2;
        edgePPos[ep * 3] = Math.cos(angle) * 1.25;
        edgePPos[ep * 3 + 1] = Math.sin(angle) * 1.65;
        edgePPos[ep * 3 + 2] = 0.02;
      }
      edgePGeom.setAttribute('position', new THREE.BufferAttribute(edgePPos, 3));
      const edgePoints = new THREE.Points(
        edgePGeom,
        new THREE.PointsMaterial({
          size: 0.06,
          map: pTex,
          transparent: true,
          opacity: 0.45,
          color: new THREE.Color(story.accent),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      fGroup.add(edgePoints);

      // Local localized light
      const pLight = new THREE.PointLight(new THREE.Color(story.accent), 1.8, 6.0, 2.0);
      pLight.position.set(0, 0, 0.8);
      fGroup.add(pLight);

      // Raycast collider for desktop hover & click
      const colMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 3.4, 0.8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      colMesh.position.copy(fGroup.position);
      colMesh.rotation.copy(fGroup.rotation);
      colMesh.userData = { storyId: story.id, index: idx };
      archiveGroup.add(colMesh);
      collidersList.push(colMesh);

      folderRigs.push({
        story,
        folderGroup: fGroup,
        chassisMesh,
        bezelMesh,
        tabMesh,
        canvasMesh,
        canvasTexture: cTex,
        canvasElement: cCanvas,
        canvasCtx: cCtx,
        bgGlowMesh,
        fgGlassMesh: glassMesh,
        edgeParticles: edgePoints,
        light: pLight,
        collider: colMesh,
        basePos: new THREE.Vector3(...pos),
        baseRot: new THREE.Euler(...rot),
        targetScale: 1.0,
        hoverFactor: 0,
        floatPhase: idx * 1.2,
        activeCenter: folderActiveCenters[idx] ?? 0.5,
      });
    });

    // =========================================================================
    // GROUP B: STORY WORLDS (DEDICATED 3D RIGS FOR ALL 6 STORIES)
    // PRESERVE INTACT FOR SEAMLESS STORY READING EXPERIENCE
    // =========================================================================
    const storyGroup = new THREE.Group();
    storyGroup.visible = false;
    scene.add(storyGroup);

    // -------------------------------------------------------------------------
    // WORLD 01: THE LAST TRAIN
    // -------------------------------------------------------------------------
    const worldTrain = new THREE.Group();
    storyGroup.add(worldTrain);

    const trainAmbient = new THREE.AmbientLight(0x0e1118, 0.7);
    worldTrain.add(trainAmbient);

    const stationLamp = new THREE.PointLight(0xc9a66b, 3.8, 16, 1.8);
    stationLamp.position.set(1.6, 2.5, 4.0);
    worldTrain.add(stationLamp);

    const lampBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd27d })
    );
    lampBulb.position.copy(stationLamp.position);
    worldTrain.add(lampBulb);

    const carriageGeom = new THREE.BoxGeometry(3.6, 3.2, 16);
    const carriageMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.6,
      metalness: 0.4,
    });
    const carriage = new THREE.Mesh(carriageGeom, carriageMat);
    carriage.position.set(-2.0, 1.4, -2.0);
    worldTrain.add(carriage);

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      roughness: 0.4,
      metalness: 0.6,
    });
    const doorLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.7), doorMat);
    doorLeftMesh.position.set(-0.16, 1.1, -2.36);
    const doorRightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.7), doorMat);
    doorRightMesh.position.set(-0.16, 1.1, -1.64);
    worldTrain.add(doorLeftMesh, doorRightMesh);

    const doorLight = new THREE.PointLight(0xffeedd, 0.2, 8, 2);
    doorLight.position.set(0.2, 1.6, -2.0);
    worldTrain.add(doorLight);

    const girlGroup = new THREE.Group();
    girlGroup.position.set(0.4, 0.2, -12.0);
    worldTrain.add(girlGroup);

    const girlMat = new THREE.MeshStandardMaterial({
      color: 0x080b10,
      roughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const girlBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, 1.4, 16), girlMat);
    girlBody.position.y = 0.7;
    const girlHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), girlMat);
    girlHead.position.y = 1.5;
    const girlArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), girlMat);
    girlArmR.position.set(0.25, 0.9, 0);
    girlGroup.add(girlBody, girlHead, girlArmR);

    const girlRimLight = new THREE.PointLight(0xc9a66b, 0, 8, 1.8);
    girlRimLight.position.set(0.8, 2.2, -13.5);
    worldTrain.add(girlRimLight);

    // -------------------------------------------------------------------------
    // WORLD 02: THE BOY WHO COLLECTED RAIN
    // -------------------------------------------------------------------------
    const worldRain = new THREE.Group();
    worldRain.visible = false;
    storyGroup.add(worldRain);

    const rainAmbient = new THREE.AmbientLight(0x0c131a, 0.85);
    worldRain.add(rainAmbient);

    const bottleRigs: { mesh: THREE.Mesh; basePos: THREE.Vector3; offset: number }[] = [];
    const bottleGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.55, 16);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x8798a5,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
    });
    for (let i = 0; i < 16; i++) {
      const bMesh = new THREE.Mesh(bottleGeom, bottleMat);
      const bPos = new THREE.Vector3(
        (Math.random() - 0.5) * 5.5,
        Math.random() * 2.5 + 0.6,
        -Math.random() * 20 + 2
      );
      bMesh.position.copy(bPos);
      worldRain.add(bMesh);
      bottleRigs.push({ mesh: bMesh, basePos: bPos, offset: i * 0.4 });
    }

    const rainCount = isTouch ? 400 : 800;
    const rainGeom = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 12;
      rainPos[i * 3 + 1] = Math.random() * 8;
      rainPos[i * 3 + 2] = -Math.random() * 28 + 4;
    }
    rainGeom.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      size: 0.05,
      map: pTex,
      transparent: true,
      opacity: 0.6,
      color: 0x8798a5,
      blending: THREE.AdditiveBlending,
    });
    const rainMesh = new THREE.Points(rainGeom, rainMat);
    worldRain.add(rainMesh);

    const noahGroup = new THREE.Group();
    noahGroup.position.set(-0.3, 0.3, -11.0);
    worldRain.add(noahGroup);

    const noahMat = new THREE.MeshStandardMaterial({
      color: 0x091016,
      roughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const noahBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 1.35, 16), noahMat);
    noahBody.position.y = 0.68;
    const noahHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), noahMat);
    noahHead.position.y = 1.45;
    const noahArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55), noahMat);
    noahArmR.position.set(0.22, 0.9, 0.15);
    noahArmR.rotation.x = -0.5;
    const noahBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 12), bottleMat);
    noahBottle.position.set(0.24, 1.1, 0.35);
    noahGroup.add(noahBody, noahHead, noahArmR, noahBottle);

    const noahRimLight = new THREE.PointLight(0x87c5eb, 0, 8, 1.8);
    noahRimLight.position.set(0.2, 2.2, -12.5);
    worldRain.add(noahRimLight);

    // -------------------------------------------------------------------------
    // WORLD 03: SEVEN MINUTES BEFORE MIDNIGHT
    // -------------------------------------------------------------------------
    const worldCity = new THREE.Group();
    worldCity.visible = false;
    storyGroup.add(worldCity);

    const cityAmbient = new THREE.AmbientLight(0x0a0c14, 0.7);
    worldCity.add(cityAmbient);

    const cityMat = new THREE.MeshStandardMaterial({ color: 0x0c0f16, roughness: 0.8 });
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });
    const winMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 28; i++) {
      const bH = Math.random() * 8 + 4;
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(1.6, bH, 1.6), cityMat);
      bldg.position.set(
        (Math.random() - 0.5) * 14,
        bH / 2 - 2,
        -Math.random() * 26 + 2
      );
      worldCity.add(bldg);

      for (let w = 0; w < 4; w++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), winMat);
        win.position.set(
          bldg.position.x + (Math.random() - 0.5) * 1.2,
          Math.random() * (bH - 1),
          bldg.position.z + 0.82
        );
        worldCity.add(win);
        winMeshes.push(win);
      }
    }

    const archivistFig = new THREE.Group();
    archivistFig.position.set(-0.2, 0.4, -11.5);
    worldCity.add(archivistFig);

    const archivistMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      roughness: 0.6,
      transparent: true,
      opacity: 0,
    });
    const aBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.28, 1.45, 16), archivistMat);
    aBody.position.y = 0.72;
    const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), archivistMat);
    aHead.position.y = 1.52;
    archivistFig.add(aBody, aHead);

    const archivistRimLight = new THREE.PointLight(0xffe099, 0, 8, 1.8);
    archivistRimLight.position.set(-0.2, 2.2, -13.0);
    worldCity.add(archivistRimLight);

    // -------------------------------------------------------------------------
    // WORLD 04: THE FORGOTTEN ROOM
    // -------------------------------------------------------------------------
    const worldRoom = new THREE.Group();
    worldRoom.visible = false;
    storyGroup.add(worldRoom);

    const roomAmbient = new THREE.AmbientLight(0x0e0d0a, 0.75);
    worldRoom.add(roomAmbient);

    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 3.8, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x1e1810, roughness: 0.6 })
    );
    doorFrame.position.set(0, 1.9, -6);
    const doorVoid = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 3.4),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    doorVoid.position.set(0, 1.9, -5.88);
    worldRoom.add(doorFrame, doorVoid);

    const roomFigure = new THREE.Group();
    roomFigure.position.set(0.4, 0.3, -8.5);
    worldRoom.add(roomFigure);

    const roomFigMat = new THREE.MeshStandardMaterial({
      color: 0x120d08,
      roughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const rBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.27, 1.4, 16), roomFigMat);
    rBody.position.y = 0.7;
    const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), roomFigMat);
    rHead.position.y = 1.48;
    roomFigure.add(rBody, rHead);

    const roomFigLight = new THREE.PointLight(0xc9a66b, 0, 8, 1.8);
    roomFigLight.position.set(0.4, 2.2, -9.5);
    worldRoom.add(roomFigLight);

    // -------------------------------------------------------------------------
    // WORLD 05: A LETTER FROM TOMORROW
    // -------------------------------------------------------------------------
    const worldLetter = new THREE.Group();
    worldLetter.visible = false;
    storyGroup.add(worldLetter);

    const letterAmbient = new THREE.AmbientLight(0x121c26, 0.8);
    worldLetter.add(letterAmbient);

    const paperShards: { mesh: THREE.Mesh; basePos: THREE.Vector3; rotSpeed: THREE.Vector3 }[] = [];
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x9fbcd4,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      emissive: 0x8798a5,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 18; i++) {
      const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), shardMat);
      const spos = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 3 + 0.5,
        -Math.random() * 22 + 4
      );
      sMesh.position.copy(spos);
      worldLetter.add(sMesh);
      paperShards.push({
        mesh: sMesh,
        basePos: spos,
        rotSpeed: new THREE.Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.01),
      });
    }

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8798a5, transparent: true, opacity: 0.4, wireframe: true });
    const chronoRing = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.02, 16, 64), ringMat);
    chronoRing.position.set(0, 1.8, -8);
    worldLetter.add(chronoRing);

    const messengerFig = new THREE.Group();
    messengerFig.position.set(0.6, 0.3, -10.0);
    worldLetter.add(messengerFig);

    const messengerMat = new THREE.MeshStandardMaterial({
      color: 0x081016,
      roughness: 0.6,
      transparent: true,
      opacity: 0,
    });
    const mBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 1.4, 16), messengerMat);
    mBody.position.y = 0.7;
    const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), messengerMat);
    mHead.position.y = 1.48;
    const messengerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), messengerMat);
    messengerArm.position.set(-0.25, 0.8, 0.2);
    messengerArm.rotation.x = -0.4;
    const mLetter = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.02), winMat);
    mLetter.position.set(-0.25, 0.95, 0.4);
    messengerFig.add(mBody, mHead, messengerArm, mLetter);

    const messengerRimLight = new THREE.PointLight(0x87c5eb, 0, 8, 1.8);
    messengerRimLight.position.set(0.8, 2.2, -12.0);
    worldLetter.add(messengerRimLight);

    // -------------------------------------------------------------------------
    // WORLD 06: THE SEA THAT REMEMBERED
    // -------------------------------------------------------------------------
    const worldSea = new THREE.Group();
    worldSea.visible = false;
    storyGroup.add(worldSea);

    const seaAmbient = new THREE.AmbientLight(0x0a1d26, 0.9);
    worldSea.add(seaAmbient);

    const pedestalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x060f14, roughness: 0.9 })
    );
    pedestalMesh.position.set(0, 0.6, -7.0);
    const vitrine = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.9, 0.8),
      bottleMat
    );
    vitrine.position.set(0, 1.6, -7.0);
    worldSea.add(pedestalMesh, vitrine);

    const seaPCount = isTouch ? 300 : 500;
    const seaPGeom = new THREE.BufferGeometry();
    const seaPPos = new Float32Array(seaPCount * 3);
    for (let i = 0; i < seaPCount; i++) {
      seaPPos[i * 3] = (Math.random() - 0.5) * 12;
      seaPPos[i * 3 + 1] = Math.random() * 6;
      seaPPos[i * 3 + 2] = -Math.random() * 30 + 8;
    }
    seaPGeom.setAttribute('position', new THREE.BufferAttribute(seaPPos, 3));
    const seaParticles = new THREE.Points(
      seaPGeom,
      new THREE.PointsMaterial({
        size: 0.09,
        map: pTex,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        color: 0x48a8b8,
      })
    );
    worldSea.add(seaParticles);

    const seaFigure = new THREE.Group();
    seaFigure.position.set(1.0, 1.6, -9.5);
    worldSea.add(seaFigure);

    const seaFigMat = new THREE.MeshStandardMaterial({
      color: 0x05141c,
      roughness: 0.55,
      transparent: true,
      opacity: 0,
    });
    const seaBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.22, 1.35, 16), seaFigMat);
    const seaHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), seaFigMat);
    seaHead.position.y = 0.78;
    const seaArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6), seaFigMat);
    seaArmL.position.set(-0.24, 0.2, 0);
    const seaArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6), seaFigMat);
    seaArmR.position.set(0.24, 0.2, 0);
    const seaDrapery = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.1), seaFigMat);
    seaDrapery.position.set(0, -0.6, -0.1);
    seaFigure.add(seaBody, seaHead, seaArmL, seaArmR, seaDrapery);

    const seaFigRimLight = new THREE.PointLight(0x48c8d8, 0, 8, 1.8);
    seaFigRimLight.position.set(1.0, 2.5, -11.5);
    worldSea.add(seaFigRimLight);

    // =========================================================================
    // CAMERA SPLINES & INTERPOLATORS
    // =========================================================================
    // Archive continuous camera spline according to user rhythm:
    // start: [0, 0, 10]
    // story 01: [-2.0, 0.4, 5.0]
    // story 02: [2.0, -0.2, 0.0]
    // story 03: [-1.5, 0.8, -6.0]
    // story 04: [2.5, -0.5, -12.0]
    // story 05: [-2.0, 0.5, -18.0]
    // story 06: [1.0, 0.0, -25.0]
    // end: [0.0, 0.5, -32.0]
    const archiveCamPoints = [
      new THREE.Vector3(0.0, 0.0, 10.0),
      new THREE.Vector3(-2.0, 0.4, 5.0),
      new THREE.Vector3(2.0, -0.2, 0.0),
      new THREE.Vector3(-1.5, 0.8, -6.0),
      new THREE.Vector3(2.5, -0.5, -12.0),
      new THREE.Vector3(-2.0, 0.5, -18.0),
      new THREE.Vector3(1.0, 0.0, -25.0),
      new THREE.Vector3(0.0, 0.5, -32.0),
      new THREE.Vector3(0.0, 0.6, -36.0),
    ];
    const archiveCamSpline = new THREE.CatmullRomCurve3(archiveCamPoints);

    // Look-At target spline that frames each folder in center-right
    const archiveLookAtPoints = [
      new THREE.Vector3(0.2, 0.1, 4.0),
      new THREE.Vector3(0.6, 0.2, 1.8),
      new THREE.Vector3(-0.5, -0.1, -3.8),
      new THREE.Vector3(0.7, 0.4, -9.8),
      new THREE.Vector3(-0.6, -0.3, -15.8),
      new THREE.Vector3(0.8, 0.3, -21.8),
      new THREE.Vector3(-0.2, 0.0, -28.8),
      new THREE.Vector3(0.0, 0.2, -35.0),
      new THREE.Vector3(0.0, 0.5, -40.0),
    ];
    const archiveLookAtSpline = new THREE.CatmullRomCurve3(archiveLookAtPoints);

    // Story mode camera path
    const storyCamPoints = [
      new THREE.Vector3(0, 1.5, 10),
      new THREE.Vector3(0, 1.3, 6),
      new THREE.Vector3(-1.5, 1.2, 2),
      new THREE.Vector3(-0.5, 1.0, -2),
      new THREE.Vector3(1.2, 1.1, -6),
      new THREE.Vector3(0.4, 1.2, -10),
      new THREE.Vector3(0, 1.4, -13),
    ];
    const storyCamSpline = new THREE.CatmullRomCurve3(storyCamPoints);

    const storyLookAtSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.2, 4),
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(-1.5, 1.2, -1.8),
      new THREE.Vector3(-1.0, 1.2, -2.0),
      new THREE.Vector3(1.4, 1.2, -10),
      new THREE.Vector3(1.4, 1.1, -12),
      new THREE.Vector3(1.4, 1.1, -15),
    ]);

    // =========================================================================
    // POINTER & TOUCH HANDLING (MOBILE SWIPE-FIRST & ZERO DIRECT ACCIDENTAL ENTRY)
    // =========================================================================
    let hoveredRig: ArchiveFolderRig | null = null;
    const raycaster = new THREE.Raycaster();
    const rayVector = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      // Coarse pointer devices (touchscreens) ignore hover raycasting
      if (isTouch) return;

      mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;

      const dx = mouse.normX - mouse.lastX;
      const dy = mouse.normY - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.lastX = mouse.normX;
      mouse.lastY = mouse.normY;

      cursorFlashlight.position.x = camera.position.x + mouse.normX * 3.5;
      cursorFlashlight.position.y = camera.position.y + mouse.normY * 2.5;
      cursorFlashlight.position.z = camera.position.z - 3.2;

      if (modeRef.current === 'story') {
        stationLamp.position.x = 1.6 + mouse.normX * 0.4;
        stationLamp.position.y = 2.5 + mouse.normY * 0.3;
        lampBulb.position.copy(stationLamp.position);
        return;
      }

      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = folderRigs[hits[0].object.userData.index];
        if (hitRig && hoveredRig !== hitRig) {
          hoveredRig = hitRig;
          sound.playBookHover();
          cursorManager.setMode('hover-story', 'ENTER');
        }
      } else {
        if (hoveredRig !== null) {
          hoveredRig = null;
          cursorManager.setMode('default');
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      // Fine desktop pointers (mouse) can click directly on the folder to enter
      if (e.pointerType === 'mouse' && !isTouch && modeRef.current === 'archive') {
        rayVector.set(mouse.normX, mouse.normY);
        raycaster.setFromCamera(rayVector, camera);
        const hits = raycaster.intersectObjects(collidersList, false);

        if (hits.length > 0) {
          const hitRig = folderRigs[hits[0].object.userData.index];
          if (hitRig) {
            sound.playBookOpen();
            onSelectStoryRef.current(hitRig.story);
          }
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 60 FPS RENDER LOOP (ORGANIC FLUID MOTION & LIVING FOLDERS)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    const currentLookAt = new THREE.Vector3(0, 0, 2);

    let frameCount = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      frameCount++;
      const currentMode = modeRef.current;
      const currentStory = selectedStoryRef.current;

      // Scroll velocity calculation
      const currentY = window.scrollY;
      scrollVelocity = (currentY - lastScrollY) * 0.005;
      lastScrollY = currentY;

      const instantEnergy = Math.min(1.0, Math.abs(scrollVelocity) * 2.5 + mouse.speed * 4.0);
      motionEnergy += (instantEnergy - motionEnergy) * 0.08;

      // Smooth pointer parallax with spring lag
      const pScaleX = isTouch ? 0.03 : 0.16;
      const pScaleY = isTouch ? 0.02 : 0.10;
      mouse.targetX += (mouse.normX * pScaleX - mouse.targetX) * 0.06;
      mouse.targetY += (mouse.normY * pScaleY - mouse.targetY) * 0.06;

      // Spring lag specifically for organic fluid particles
      mouse.springX += (mouse.normX - mouse.springX) * 0.035;
      mouse.springY += (mouse.normY - mouse.springY) * 0.035;

      // Gentle FOV expansion during fast scroll
      const targetFov = 42 + Math.min(4.0, Math.abs(scrollVelocity) * 10);
      camera.fov += (targetFov - camera.fov) * 0.1;
      camera.updateProjectionMatrix();

      if (currentMode === 'archive') {
        // --- ARCHIVE MODE ---
        archiveGroup.visible = true;
        storyGroup.visible = false;

        const aProg = Math.max(0, Math.min(1, archiveProgRef.current));
        const baseCam = archiveCamSpline.getPointAt(aProg);
        const baseLook = archiveLookAtSpline.getPointAt(aProg);

        // Mobile camera adjustment: reduce lateral X displacement by 40% for centered portrait view
        const lateralMultiplier = isTouch ? 0.6 : 1.0;
        const targetCamX = baseCam.x * lateralMultiplier + mouse.targetX;
        const targetCamY = baseCam.y + mouse.targetY;
        const targetCamZ = baseCam.z;

        camera.position.x += (targetCamX - camera.position.x) * 0.055;
        camera.position.y += (targetCamY - camera.position.y) * 0.055;
        camera.position.z += (targetCamZ - camera.position.z) * 0.055;

        const targetLookX = baseLook.x * lateralMultiplier + mouse.targetX * 0.4;
        const targetLookY = baseLook.y + mouse.targetY * 0.4;
        const targetLookZ = baseLook.z;

        currentLookAt.x += (targetLookX - currentLookAt.x) * 0.055;
        currentLookAt.y += (targetLookY - currentLookAt.y) * 0.055;
        currentLookAt.z += (targetLookZ - currentLookAt.z) * 0.055;
        camera.lookAt(currentLookAt);

        // Gentle camera banking
        camera.rotation.z = -mouse.targetX * 0.03;

        // 1. Moving Archival Beacon sweep
        archiveBeacon.position.x = Math.sin(elapsed * 0.35) * 3.5;
        archiveBeacon.position.y = 3.2 + Math.cos(elapsed * 0.45) * 1.4;
        archiveBeacon.position.z = -14.0 + Math.sin(elapsed * 0.25) * 18.0;

        // 2. Foreground silhouettes parallax drift
        fgObjects.forEach((obj, i) => {
          obj.rotation.y = (i % 2 === 0 ? 0.04 : -0.04) + Math.sin(elapsed * 0.6 + i) * 0.03;
        });

        // 3. Dynamic atmospheric fog & lighting color transition across 6 zones
        // Story 01: amber / steel blue
        // Story 02: cyan / silver
        // Story 03: navy / magenta / warm yellow
        // Story 04: dirty cream / amber / muted green
        // Story 05: cyan / violet
        // Story 06: teal / deep blue
        const zoneFogColors = [
          new THREE.Color(0x070707),
          new THREE.Color(0x0a0b10),
          new THREE.Color(0x070c10),
          new THREE.Color(0x090710),
          new THREE.Color(0x090a07),
          new THREE.Color(0x060b12),
          new THREE.Color(0x040d12),
        ];
        const currentZoneProgress = aProg * (zoneFogColors.length - 1);
        const zIdxA = Math.min(zoneFogColors.length - 2, Math.floor(currentZoneProgress));
        const zFraction = currentZoneProgress - zIdxA;
        const targetFogColor = zoneFogColors[zIdxA].clone().lerp(zoneFogColors[zIdxA + 1], zFraction);
        if (scene.fog) {
          scene.fog.color.lerp(targetFogColor, 0.05);
          scene.background = scene.fog.color;
        }

        // 4. Update Organic Fluid Memory Stream
        const posAttr = fluidGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        // Speed increases with scroll velocity
        const flowVelocity = 0.012 + Math.abs(scrollVelocity) * 0.08 + motionEnergy * 0.02;

        for (let i = 0; i < fluidParticleCount; i++) {
          const s = fluidSeeds[i];
          s.t = (s.t + flowVelocity * s.speed + 1.0) % 1.0;

          const pt = fluidStreamSpline.getPointAt(s.t);

          // Harmonic sinusoidal displacement along cross section
          const trailStretch = 1.0 + Math.abs(scrollVelocity) * 2.4;
          const radialDisp = s.radius * (0.85 + 0.15 * Math.sin(elapsed * 1.4 + s.phase));
          const pAngle = s.theta + elapsed * 0.3;

          // Pointer deflection with lag
          const pointerPull = (1.0 - Math.min(1.0, Math.abs(pt.z - camera.position.z) / 12.0)) * 0.6;
          const dx = Math.cos(pAngle) * radialDisp + mouse.springX * pointerPull;
          const dy = Math.sin(pAngle) * radialDisp + mouse.springY * pointerPull;
          const dz = Math.sin(elapsed * 1.8 + s.phase) * 0.25 * trailStretch;

          posArr[i * 3] = pt.x + dx;
          posArr[i * 3 + 1] = pt.y + dy;
          posArr[i * 3 + 2] = pt.z + dz;
        }
        posAttr.needsUpdate = true;

        // 5. Update Spatial Archive Folders with Depth Choreography
        folderRigs.forEach((rig, idx) => {
          // Distance from this folder's active scroll center
          const distFromActive = Math.abs(aProg - rig.activeCenter);

          // Depth Choreography: Only 1-2 folders dominate at any scroll position
          // Approaching: scales up, illuminates
          // Active: full size (1.0), full opacity
          // Leaving: drifts beside camera, fades into fog
          const isNearby = distFromActive < 0.22;
          rig.folderGroup.visible = isNearby;

          if (isNearby) {
            // Normalized presence (1.0 at center, 0.0 at edge)
            const presence = Math.max(0, 1.0 - distFromActive / 0.20);
            const targetScale = 0.76 + presence * 0.24;
            rig.folderGroup.scale.setScalar(targetScale);

            const isHov = hoveredRig === rig;
            const targetHover = isHov ? 1.0 : 0.0;
            rig.hoverFactor += (targetHover - rig.hoverFactor) * 0.12;

            // Idle organic float (low frequency, no flicker)
            const floatY = Math.sin(elapsed * 0.7 + rig.floatPhase) * 0.04;
            const floatRotY = Math.sin(elapsed * 0.5 + rig.floatPhase) * 0.018;
            const floatRotX = Math.cos(elapsed * 0.6 + rig.floatPhase) * 0.008;

            rig.folderGroup.position.y = rig.basePos.y + floatY;

            // Interactive desktop tilt toward cursor on hover
            if (isHov && !isTouch) {
              rig.folderGroup.position.z = rig.basePos.z + 0.35;
              rig.folderGroup.rotation.y = rig.baseRot.y + mouse.targetX * 0.12;
              rig.folderGroup.rotation.x = rig.baseRot.x - mouse.targetY * 0.08;
              rig.light.intensity = 2.8;
              (rig.bgGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
            } else {
              rig.folderGroup.position.z = rig.basePos.z;
              rig.folderGroup.rotation.y = rig.baseRot.y + floatRotY;
              rig.folderGroup.rotation.x = rig.baseRot.x + floatRotX;
              rig.light.intensity = 1.4 + presence * 0.8;
              (rig.bgGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0.14 + presence * 0.12;
            }

            rig.collider.position.copy(rig.folderGroup.position);

            // Subtle rotation of orbital edge particles
            rig.edgeParticles.rotation.z = elapsed * 0.3 + idx;

            // Living Internal Canvas Scene Animation (throttled every 2 frames for 30fps silky rendering)
            if (frameCount % 2 === 0) {
              const ctx = rig.canvasCtx;
              const w = rig.canvasElement.width;
              const h = rig.canvasElement.height;

              // Render living atmospheric motion over the base cover artwork
              if (idx === 0) {
                // THE LAST TRAIN: Moving fog bands + approaching warm train headlight cone
                ctx.save();
                ctx.fillStyle = 'rgba(7, 10, 16, 0.08)';
                ctx.fillRect(0, 0, w, h);

                // Golden train headlight beam sweeping across rails
                const trainX = w * 0.5 + Math.sin(elapsed * 0.8) * 40;
                const trainY = h * 0.62;
                const headGrad = ctx.createRadialGradient(trainX, trainY, 4, trainX, trainY, 180);
                headGrad.addColorStop(0, 'rgba(255, 235, 175, 0.45)');
                headGrad.addColorStop(0.5, 'rgba(201, 166, 107, 0.15)');
                headGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = headGrad;
                ctx.fillRect(0, 0, w, h);

                // Drifting horizontal mist ribbons
                ctx.fillStyle = 'rgba(220, 225, 235, 0.04)';
                for (let b = 0; b < 3; b++) {
                  const my = h * (0.45 + b * 0.18) + Math.sin(elapsed * 0.5 + b) * 15;
                  const mx = ((elapsed * 25 * (b + 1)) % (w * 1.5)) - w * 0.25;
                  ctx.fillRect(mx, my, w * 0.6, 28);
                }
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              } else if (idx === 1) {
                // THE BOY WHO COLLECTED RAIN: Sliding rain streaks & droplet glints
                ctx.save();
                ctx.fillStyle = 'rgba(8, 14, 20, 0.06)';
                ctx.fillRect(0, 0, w, h);

                // Rain streaks running down glass
                ctx.strokeStyle = 'rgba(165, 195, 215, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let r = 0; r < 8; r++) {
                  const rx = (r * 64 + (r * 17)) % w;
                  const ry = (elapsed * (140 + r * 30)) % h;
                  ctx.moveTo(rx, ry);
                  ctx.lineTo(rx - 2, ry + 22);
                }
                ctx.stroke();

                // Soft glowing bottle reflection
                const bGrad = ctx.createRadialGradient(w * 0.65, h * 0.7, 5, w * 0.65, h * 0.7, 75);
                bGrad.addColorStop(0, 'rgba(135, 175, 205, 0.3)');
                bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = bGrad;
                ctx.fillRect(0, 0, w, h);
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              } else if (idx === 2) {
                // SEVEN MINUTES BEFORE MIDNIGHT: Sequential glowing windows & clock glow
                ctx.save();
                ctx.fillStyle = 'rgba(6, 8, 14, 0.06)';
                ctx.fillRect(0, 0, w, h);

                // Windows illuminating in sequence
                for (let wx = 0; wx < 5; wx++) {
                  for (let wy = 0; wy < 4; wy++) {
                    const isLit = Math.sin(elapsed * 1.2 + wx * 1.5 + wy * 2.1) > 0.1;
                    if (isLit) {
                      ctx.fillStyle = 'rgba(255, 220, 140, 0.35)';
                      ctx.fillRect(w * 0.25 + wx * 38, h * 0.35 + wy * 32, 12, 12);
                    }
                  }
                }

                // Amber clock glow
                const clockGrad = ctx.createRadialGradient(w * 0.5, h * 0.28, 6, w * 0.5, h * 0.28, 60);
                clockGrad.addColorStop(0, 'rgba(255, 210, 120, 0.4)');
                clockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = clockGrad;
                ctx.fillRect(0, 0, w, h);
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              } else if (idx === 3) {
                // THE FORGOTTEN ROOM: Warm doorway sunlight shaft & floating dust motes
                ctx.save();
                ctx.fillStyle = 'rgba(14, 12, 8, 0.06)';
                ctx.fillRect(0, 0, w, h);

                // Angular doorway light shaft
                ctx.fillStyle = 'rgba(235, 195, 125, 0.12)';
                ctx.beginPath();
                ctx.moveTo(w * 0.35, h * 0.3);
                ctx.lineTo(w * 0.65, h * 0.3);
                ctx.lineTo(w * 0.85, h);
                ctx.lineTo(w * 0.15, h);
                ctx.closePath();
                ctx.fill();

                // Floating dust motes
                ctx.fillStyle = 'rgba(255, 235, 190, 0.5)';
                for (let d = 0; d < 10; d++) {
                  const dx = (w * 0.4 + Math.sin(elapsed * 0.8 + d) * 70);
                  const dy = (h * 0.35 + (elapsed * 18 + d * 40) % (h * 0.5));
                  ctx.beginPath();
                  ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              } else if (idx === 4) {
                // A LETTER FROM TOMORROW: Floating paper shards & cyan/violet pulse
                ctx.save();
                ctx.fillStyle = 'rgba(10, 14, 22, 0.06)';
                ctx.fillRect(0, 0, w, h);

                // Cyan/violet horizontal chronometric waveform pulse
                const pulseY = (elapsed * 60) % h;
                const pGrad = ctx.createLinearGradient(0, pulseY - 20, 0, pulseY + 20);
                pGrad.addColorStop(0, 'rgba(107, 79, 168, 0)');
                pGrad.addColorStop(0.5, 'rgba(79, 168, 200, 0.35)');
                pGrad.addColorStop(1, 'rgba(107, 79, 168, 0)');
                ctx.fillStyle = pGrad;
                ctx.fillRect(0, pulseY - 20, w, 40);

                // Drifting parchment shards
                ctx.fillStyle = 'rgba(205, 225, 240, 0.3)';
                for (let ps = 0; ps < 5; ps++) {
                  const px = w * 0.3 + Math.sin(elapsed + ps * 1.5) * 80;
                  const py = (elapsed * 25 + ps * 90) % h;
                  ctx.fillRect(px, py, 24, 16);
                }
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              } else if (idx === 5) {
                // THE SEA THAT REMEMBERED: Sine wave caustics & rising bubbles
                ctx.save();
                ctx.fillStyle = 'rgba(4, 14, 20, 0.06)';
                ctx.fillRect(0, 0, w, h);

                // Caustic ripples
                ctx.strokeStyle = 'rgba(77, 168, 168, 0.3)';
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                for (let c = 0; c < 4; c++) {
                  const cy = h * 0.5 + c * 35;
                  for (let cx = 0; cx < w; cx += 20) {
                    const waveY = cy + Math.sin(cx * 0.04 + elapsed * 2.0 + c) * 8;
                    if (cx === 0) ctx.moveTo(cx, waveY);
                    else ctx.lineTo(cx, waveY);
                  }
                }
                ctx.stroke();

                // Rising bubbles
                ctx.fillStyle = 'rgba(120, 220, 230, 0.45)';
                for (let b = 0; b < 8; b++) {
                  const bx = w * 0.25 + (b * 45) + Math.sin(elapsed * 1.5 + b) * 12;
                  const by = h - ((elapsed * 45 + b * 70) % h);
                  ctx.beginPath();
                  ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.restore();
                rig.canvasTexture.needsUpdate = true;
              }
            }
          }
        });
      } else {
        // --- STORY MODE (PER-STORY WORLDS & CINEMATIC READERS) ---
        archiveGroup.visible = false;
        storyGroup.visible = true;

        const sId = currentStory?.id || 'story-01';
        worldTrain.visible = sId === 'story-01';
        worldRain.visible = sId === 'story-02';
        worldCity.visible = sId === 'story-03';
        worldRoom.visible = sId === 'story-04';
        worldLetter.visible = sId === 'story-05';
        worldSea.visible = sId === 'story-06';

        const sProg = Math.max(0, Math.min(1, storyProgRef.current));
        const baseCam = storyCamSpline.getPointAt(sProg);
        const baseLook = storyLookAtSpline.getPointAt(sProg);

        // Camera path with smooth pointer parallax
        const targetCamX = baseCam.x + mouse.targetX;
        const targetCamY = baseCam.y + mouse.targetY;
        const targetCamZ = baseCam.z;

        camera.position.x += (targetCamX - camera.position.x) * 0.075;
        camera.position.y += (targetCamY - camera.position.y) * 0.075;
        camera.position.z += (targetCamZ - camera.position.z) * 0.075;

        const targetLookX = baseLook.x + mouse.targetX * 0.5;
        const targetLookY = baseLook.y + mouse.targetY * 0.5;
        const targetLookZ = baseLook.z;

        currentLookAt.x += (targetLookX - currentLookAt.x) * 0.075;
        currentLookAt.y += (targetLookY - currentLookAt.y) * 0.075;
        currentLookAt.z += (targetLookZ - currentLookAt.z) * 0.075;
        camera.lookAt(currentLookAt);

        // Common gradual emergence factor (between 48% and 72% scroll)
        const figureRevealT = Math.max(0, Math.min(1, (sProg - 0.48) / 0.22));

        // --- STORY 01: THE LAST TRAIN ---
        if (sId === 'story-01') {
          if (sProg < 0.32) {
            doorLeftMesh.position.z = -2.36;
            doorRightMesh.position.z = -1.64;
            doorLight.intensity = 0.1;
          } else if (sProg <= 0.48) {
            const doorT = (sProg - 0.32) / (0.48 - 0.32);
            doorLeftMesh.position.z = -2.36 - doorT * 0.65;
            doorRightMesh.position.z = -1.64 + doorT * 0.65;
            doorLight.intensity = 0.2 + doorT * 2.2;
          } else {
            doorLeftMesh.position.z = -3.01;
            doorRightMesh.position.z = -0.99;
            doorLight.intensity = 2.4;
          }

          stationLamp.intensity = sProg >= 0.95 && Math.sin(elapsed * 28) > 0.4 ? 1.0 : 3.8;

          if (isTouch) {
            stationLamp.position.x = 1.6 + scrollVelocity * 0.8;
          }

          // THE GIRL REVEAL & CINEMATIC MOTION
          girlMat.opacity = figureRevealT;
          girlRimLight.intensity = figureRevealT * 3.6;

          if (sProg >= 0.68) {
            const turnT = Math.min(1.0, (sProg - 0.68) / 0.16);
            girlHead.rotation.y = turnT * 0.35 + Math.sin(elapsed * 1.2) * 0.04;
            girlHead.rotation.x = turnT * 0.08;

            if (sProg >= 0.85) {
              const climaxT = (sProg - 0.85) / 0.15;
              girlGroup.position.z = -12.0 + climaxT * 0.45;
              girlHead.rotation.z = -0.06;
              girlArmR.rotation.x = -climaxT * 0.15;
            }
          }
        }

        // --- STORY 02: THE BOY WHO COLLECTED RAIN ---
        else if (sId === 'story-02') {
          bottleRigs.forEach((b) => {
            b.mesh.position.y = b.basePos.y + Math.sin(elapsed * 1.5 + b.offset) * 0.08;
            b.mesh.rotation.y = elapsed * 0.3 + b.offset;
          });

          const positions = rainGeom.attributes.position.array as Float32Array;
          const isReversing = sProg >= 0.85;
          const rSpeed = isReversing ? 0.12 : -0.15;

          for (let i = 0; i < rainCount; i++) {
            positions[i * 3 + 1] += rSpeed;
            const bendFactor = isTouch ? scrollVelocity * 0.1 : mouse.normX * mouse.speed * 0.05;
            positions[i * 3] += bendFactor;

            if (positions[i * 3 + 1] < -0.5) positions[i * 3 + 1] = 7.5;
            if (positions[i * 3 + 1] > 8.0) positions[i * 3 + 1] = 0.0;
          }
          rainGeom.attributes.position.needsUpdate = true;

          noahMat.opacity = figureRevealT;
          noahRimLight.intensity = figureRevealT * 3.4;

          if (sProg >= 0.65) {
            const armLiftT = Math.min(1.0, (sProg - 0.65) / 0.18);
            noahArmR.rotation.x = -0.5 - armLiftT * 0.55;
            noahBottle.position.y = 1.1 + armLiftT * 0.22;
            noahBottle.position.z = 0.35 + armLiftT * 0.15;
            noahHead.rotation.x = -armLiftT * 0.15;
          }
        }

        // --- STORY 03: SEVEN MINUTES BEFORE MIDNIGHT ---
        else if (sId === 'story-03') {
          const blackoutProg = Math.max(0, Math.min(1, sProg * 1.3));
          const totalWins = winMeshes.length;
          const litCount = Math.floor(totalWins * (1 - blackoutProg));

          winMeshes.forEach((w, idx) => {
            w.visible = idx < litCount;
          });

          cityAmbient.intensity = 0.7 * (1 - blackoutProg * 0.65);

          archivistMat.opacity = figureRevealT;
          archivistRimLight.intensity = figureRevealT * 4.0;

          if (sProg >= 0.65) {
            const penShiftT = Math.min(1.0, (sProg - 0.65) / 0.18);
            aHead.rotation.x = penShiftT * 0.12 + Math.sin(elapsed * 1.5) * 0.03;
            aHead.rotation.y = Math.sin(elapsed * 0.8) * 0.05;
          }
        }

        // --- STORY 04: THE FORGOTTEN ROOM ---
        else if (sId === 'story-04') {
          doorVoid.position.z = -5.88 + Math.sin(elapsed * 0.8) * 0.05;

          roomFigMat.opacity = figureRevealT;
          roomFigLight.intensity = figureRevealT * 3.6;

          if (sProg >= 0.66) {
            const stepT = Math.min(1.0, (sProg - 0.66) / 0.18);
            roomFigure.position.z = -8.5 + stepT * 0.85;
            rHead.rotation.y = stepT * 0.22 + Math.sin(elapsed * 0.9) * 0.04;
          }
        }

        // --- STORY 05: A LETTER FROM TOMORROW ---
        else if (sId === 'story-05') {
          paperShards.forEach((s) => {
            s.mesh.rotation.x += s.rotSpeed.x;
            s.mesh.rotation.y += s.rotSpeed.y;
            s.mesh.rotation.z += s.rotSpeed.z;
            s.mesh.position.y = s.basePos.y + Math.sin(elapsed * 1.2 + s.basePos.x) * 0.15;
          });

          chronoRing.rotation.z = elapsed * 0.2;
          chronoRing.rotation.x = Math.sin(elapsed * 0.15) * 0.2;

          messengerMat.opacity = figureRevealT;
          messengerRimLight.intensity = figureRevealT * 3.5;

          if (sProg >= 0.68) {
            const handT = Math.min(1.0, (sProg - 0.68) / 0.16);
            messengerArm.rotation.x = -0.4 - handT * 0.45;
            mLetter.position.z = 0.4 + handT * 0.35;
            mHead.rotation.y = -handT * 0.18;
          }
        }

        // --- STORY 06: THE SEA THAT REMEMBERED ---
        else if (sId === 'story-06') {
          const sPositions = seaPGeom.attributes.position.array as Float32Array;
          for (let i = 0; i < seaPCount; i++) {
            sPositions[i * 3 + 1] += 0.015;
            sPositions[i * 3] += Math.sin(elapsed + i) * 0.005;
            if (sPositions[i * 3 + 1] > 6.0) sPositions[i * 3 + 1] = 0.0;
          }
          seaPGeom.attributes.position.needsUpdate = true;

          seaFigMat.opacity = figureRevealT;
          seaFigRimLight.intensity = figureRevealT * 3.8;

          if (sProg >= 0.66) {
            const swayT = Math.min(1.0, (sProg - 0.66) / 0.18);
            seaFigure.position.y = 1.6 + Math.sin(elapsed * 0.9) * 0.08;
            seaHead.rotation.z = Math.sin(elapsed * 0.7) * 0.06;
            seaArmL.rotation.z = 0.2 + swayT * 0.35;
            seaArmR.rotation.z = -0.2 - swayT * 0.35;
            seaDrapery.rotation.z = Math.sin(elapsed * 1.1) * 0.04;
          }
        }
      }

      renderer.render(scene, camera);
    };

    render();

    // =========================================================================
    // CLEANUP
    // =========================================================================
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full pointer-events-auto" />;
};
