import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Story, STORIES } from '../../data/stories';
import { sound } from '../../utils/audio';
import { cursorManager } from '../CustomCursor';
import { LivingCoverShader } from './shaders';

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

    // --- 1. THREE.JS SCENE & RENDERER SETUP ---
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x070707);
    scene.fog = new THREE.FogExp2(fogColor, 0.038);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.className = 'webgl-fixed';
    container.appendChild(renderer.domElement);

    // =========================================================================
    // GLOBAL FLUID MOTION & POINTER SIGNALS
    // =========================================================================
    const mouse = {
      normX: 0,
      normY: 0,
      targetX: 0,
      targetY: 0,
      lastX: 0,
      lastY: 0,
      speed: 0,
    };

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let motionEnergy = 0;

    // =========================================================================
    // GROUP A: ARCHIVE WORLD (PERSISTENT GROUP)
    // =========================================================================
    const archiveGroup = new THREE.Group();
    scene.add(archiveGroup);

    // Archive Lighting
    const archiveAmbient = new THREE.AmbientLight(0xffffff, 0.4);
    archiveGroup.add(archiveAmbient);

    const cursorFlashlight = new THREE.PointLight(0xc9a66b, 2.0, 7.0, 2.0);
    cursorFlashlight.position.set(0, 0, 3);
    archiveGroup.add(cursorFlashlight);

    // Monolithic architectural columns
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      metalness: 0.05,
    });
    const colGeom = new THREE.BoxGeometry(0.4, 16, 0.4);
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
      const col = new THREE.Mesh(colGeom, archMat);
      col.position.set(x, y, z);
      archiveGroup.add(col);
    });

    // Wipe wall between story 1 & 2
    const wipeWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 12, 0.4), archMat);
    wipeWall.position.set(-1.8, 0.5, 3.0);
    wipeWall.rotation.set(0, 0.35, 0);
    archiveGroup.add(wipeWall);

    // Doorway structure for story 4
    const doorTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.3), archMat);
    doorTop.position.set(-2.8, 0.9, -18.2);
    const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.4, 0.3), archMat);
    doorLeft.position.set(-3.95, -0.8, -18.2);
    const doorRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.4, 0.3), archMat);
    doorRight.position.set(-1.65, -0.8, -18.2);
    archiveGroup.add(doorTop, doorLeft, doorRight);

    // Skyline silhouettes for story 3
    const skyline1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 0.5), archMat);
    skyline1.position.set(2.2, -1.0, -14.0);
    const skyline2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 0.5), archMat);
    skyline2.position.set(-3.0, -1.5, -15.0);
    archiveGroup.add(skyline1, skyline2);

    // -------------------------------------------------------------------------
    // 6 LIVING COVERS (BORDERLESS PORTALS WITH PROCEDURAL SHADER WORLDS)
    // -------------------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();

    interface LivingCoverRig {
      story: Story;
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      light: THREE.PointLight;
      collider: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      hoverFactor: number;
      floatingOffset: number;
    }
    const coverRigs: LivingCoverRig[] = [];
    const collidersList: THREE.Mesh[] = [];

    STORIES.forEach((story, idx) => {
      const artGeom = new THREE.PlaneGeometry(2.2, 2.93, 32, 32);
      const texture = textureLoader.load(story.coverImage);
      texture.colorSpace = THREE.SRGBColorSpace;

      const coverShaderMat = new THREE.ShaderMaterial({
        vertexShader: LivingCoverShader.vertexShader,
        fragmentShader: LivingCoverShader.fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uVelocity: { value: 0 },
          uMotionEnergy: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uAccent: { value: new THREE.Color(story.accent) },
          uTheme: { value: idx },
          uTransition: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const artMesh = new THREE.Mesh(artGeom, coverShaderMat);
      artMesh.position.set(...story.position);
      artMesh.rotation.set(...story.rotation);
      archiveGroup.add(artMesh);

      // Localized point light tied to each portal
      const portalLight = new THREE.PointLight(new THREE.Color(story.accent), 1.6, 6.0, 1.8);
      portalLight.position.set(story.position[0], story.position[1], story.position[2] + 0.8);
      archiveGroup.add(portalLight);

      // Invisible raycast collider
      const colMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 3.4, 1.4),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      colMesh.position.copy(artMesh.position);
      colMesh.rotation.copy(artMesh.rotation);
      colMesh.userData = { storyId: story.id, index: idx };
      archiveGroup.add(colMesh);
      collidersList.push(colMesh);

      coverRigs.push({
        story,
        mesh: artMesh,
        material: coverShaderMat,
        light: portalLight,
        collider: colMesh,
        basePos: new THREE.Vector3(...story.position),
        baseRot: new THREE.Euler(...story.rotation),
        hoverFactor: 0,
        floatingOffset: idx * 1.5,
      });
    });

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(241, 238, 232, 1)');
    pGrad.addColorStop(0.3, 'rgba(201, 166, 107, 0.7)');
    pGrad.addColorStop(0.7, 'rgba(201, 166, 107, 0.15)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    // Archive Stardust
    const pCount = 900;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = -Math.random() * 55 + 10;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const archiveParticles = new THREE.Points(
      pGeom,
      new THREE.PointsMaterial({
        size: 0.08,
        map: pTex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    archiveGroup.add(archiveParticles);

    // =========================================================================
    // GROUP B: STORY WORLDS (DEDICATED 3D RIGS FOR ALL 6 STORIES)
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

    // Wet Reflective Ground
    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 60),
      new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.28, metalness: 0.45 })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.set(0, -0.05, -5);
    worldTrain.add(groundPlane);

    // Platform & Rails
    const trainPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.35, 55),
      new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.5, metalness: 0.1 })
    );
    trainPlatform.position.set(3.5, 0.12, -5);
    worldTrain.add(trainPlatform);

    const curbStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 55),
      new THREE.MeshStandardMaterial({ color: 0xc9a66b, roughness: 0.4, emissive: 0xc9a66b, emissiveIntensity: 0.15 })
    );
    curbStrip.position.set(0.65, 0.31, -5);
    worldTrain.add(curbStrip);

    const railGeom = new THREE.BoxGeometry(0.06, 0.12, 55);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3a404a, metalness: 0.92, roughness: 0.18 });
    const rLeft = new THREE.Mesh(railGeom, railMat);
    rLeft.position.set(-1.8, 0.05, -5);
    const rRight = new THREE.Mesh(railGeom, railMat);
    rRight.position.set(-0.4, 0.05, -5);
    worldTrain.add(rLeft, rRight);

    // Train Carriage with lit windows
    const trainCarriage = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 3.4, 38),
      new THREE.MeshStandardMaterial({ color: 0x08090b, metalness: 0.5, roughness: 0.75 })
    );
    trainCarriage.position.set(-2.0, 1.85, -8);
    worldTrain.add(trainCarriage);

    const winMat = new THREE.MeshStandardMaterial({ color: 0xffd27d, emissive: 0xe8c17a, emissiveIntensity: 1.4, roughness: 0.2 });
    const winZList = [6, 2, -6, -10, -14, -18];
    winZList.forEach((wz) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), winMat);
      win.position.set(-0.84, 2.1, wz);
      win.rotation.y = Math.PI / 2;
      worldTrain.add(win);
    });

    // Sliding Train Doors
    const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x14161a, metalness: 0.8, roughness: 0.4 });
    const doorLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.3, 0.7), doorLeafMat);
    doorLeftMesh.position.set(-0.84, 1.35, -2.36);
    const doorRightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.3, 0.7), doorLeafMat);
    doorRightMesh.position.set(-0.84, 1.35, -1.64);
    worldTrain.add(doorLeftMesh, doorRightMesh);

    const doorLight = new THREE.PointLight(0xc9a66b, 0.1, 6, 2);
    doorLight.position.set(-1.4, 1.4, -2.0);
    worldTrain.add(doorLight);

    // --- FIGURE 01: THE GIRL ON PLATFORM THREE (EMERGES 50% - 72%) ---
    const girlGroup = new THREE.Group();
    girlGroup.position.set(1.4, 0.35, -12);
    worldTrain.add(girlGroup);

    const girlMat = new THREE.MeshStandardMaterial({
      color: 0x06080c,
      roughness: 0.65,
      transparent: true,
      opacity: 0,
    });
    const girlBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 1.35, 16), girlMat);
    girlBody.position.y = 0.68;
    const girlHead = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), girlMat);
    girlHead.position.y = 1.46;
    const girlArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65), girlMat);
    girlArmL.position.set(-0.18, 0.8, 0);
    const girlArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65), girlMat);
    girlArmR.position.set(0.18, 0.8, 0);
    girlGroup.add(girlBody, girlHead, girlArmL, girlArmR);

    // Dedicated amber backlight rim for the girl
    const girlRimLight = new THREE.PointLight(0xffdf90, 0, 8, 1.8);
    girlRimLight.position.set(1.4, 2.0, -13.5);
    worldTrain.add(girlRimLight);

    // -------------------------------------------------------------------------
    // WORLD 02: THE BOY WHO COLLECTED RAIN
    // -------------------------------------------------------------------------
    const worldRain = new THREE.Group();
    worldRain.visible = false;
    storyGroup.add(worldRain);

    const rainAmbient = new THREE.AmbientLight(0x16202c, 0.8);
    worldRain.add(rainAmbient);

    // Suspended Glowing Apothecary Bottles
    const bottleGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.5, 16);
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: 0x8798a5,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      transmission: 0.85,
      emissive: 0x8798a5,
      emissiveIntensity: 0.3,
    });
    const bottleRigs: { mesh: THREE.Mesh; basePos: THREE.Vector3; offset: number }[] = [];
    const bottlePositions = [
      [0.8, 1.8, 4.0],
      [-1.2, 2.2, 1.0],
      [1.4, 1.5, -2.0],
      [-0.8, 1.9, -6.0],
      [1.1, 2.0, -10.0],
    ];
    bottlePositions.forEach(([bx, by, bz], i) => {
      const bMesh = new THREE.Mesh(bottleGeom, bottleMat);
      bMesh.position.set(bx, by, bz);
      worldRain.add(bMesh);
      bottleRigs.push({ mesh: bMesh, basePos: new THREE.Vector3(bx, by, bz), offset: i * 1.3 });
    });

    // Falling / Reversing Rain Droplet System
    const rainCount = 650;
    const rainGeom = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 12;
      rainPos[i * 3 + 1] = Math.random() * 8 - 1;
      rainPos[i * 3 + 2] = -Math.random() * 32 + 10;
    }
    rainGeom.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMatParticles = new THREE.PointsMaterial({
      size: 0.08,
      map: pTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x8798a5,
    });
    const rainParticles = new THREE.Points(rainGeom, rainMatParticles);
    worldRain.add(rainParticles);

    // --- FIGURE 02: NOAH RAISING APOTHECARY VIAL (EMERGES 48% - 70%) ---
    const boyGroup = new THREE.Group();
    boyGroup.position.set(0.6, 0.3, -9.5);
    worldRain.add(boyGroup);

    const boyMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const boyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 1.0, 16), boyMat);
    boyBody.position.y = 0.5;
    const boyHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), boyMat);
    boyHead.position.y = 1.12;
    const boyArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45), boyMat);
    boyArm.position.set(0.2, 0.7, 0.15);
    boyArm.rotation.x = -0.3;
    const boyLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45), boyMat);
    boyLeftArm.position.set(-0.2, 0.65, 0.0);
    const heldBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25), bottleMat);
    heldBottle.position.set(0.2, 0.9, 0.3);
    boyGroup.add(boyBody, boyHead, boyArm, boyLeftArm, heldBottle);

    const boyRimLight = new THREE.PointLight(0xaad0f0, 0, 7, 2.0);
    boyRimLight.position.set(0.6, 2.0, -11.0);
    worldRain.add(boyRimLight);

    // -------------------------------------------------------------------------
    // WORLD 03: SEVEN MINUTES BEFORE MIDNIGHT
    // -------------------------------------------------------------------------
    const worldCity = new THREE.Group();
    worldCity.visible = false;
    storyGroup.add(worldCity);

    const cityAmbient = new THREE.AmbientLight(0x181518, 0.65);
    worldCity.add(cityAmbient);

    // Skyscraper Monoliths
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x060608, roughness: 0.85 });
    const towerCoords = [
      [-3.2, 4, -4, 2.2, 12, 2.2],
      [3.0, 5, -8, 2.5, 14, 2.5],
      [-2.8, 6, -14, 3.0, 16, 3.0],
      [2.6, 7, -18, 2.8, 18, 2.8],
      [0.0, 8, -25, 4.0, 22, 4.0],
    ];
    towerCoords.forEach(([tx, ty, tz, sx, sy, sz]) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), towerMat);
      tower.position.set(tx, ty, tz);
      worldCity.add(tower);
    });

    // Window Light Arrays (for blackout cascade)
    const windowClusters: THREE.Mesh[] = [];
    const winCityMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });
    for (let i = 0; i < 40; i++) {
      const wMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.2), winCityMat);
      const side = i % 2 === 0 ? -1.8 : 1.6;
      wMesh.position.set(side, 1.0 + (i % 8) * 0.5, -4 - Math.floor(i / 8) * 4);
      worldCity.add(wMesh);
      windowClusters.push(wMesh);
    }

    // Solitary 40th Floor Window
    const solitaryWin = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.6),
      new THREE.MeshBasicMaterial({ color: 0xffe28a })
    );
    solitaryWin.position.set(0.0, 4.2, -22.9);
    worldCity.add(solitaryWin);

    // --- FIGURE 03: THE ROOFTOP WATCHER (EMERGES 52% - 72%) ---
    const cityFigure = new THREE.Group();
    cityFigure.position.set(-1.8, 3.2, -9.0);
    worldCity.add(cityFigure);

    const cityFigMat = new THREE.MeshStandardMaterial({
      color: 0x080608,
      roughness: 0.65,
      transparent: true,
      opacity: 0,
    });
    const cityFigBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.26, 1.35, 16), cityFigMat);
    cityFigBody.position.y = 0.68;
    const cityFigHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), cityFigMat);
    cityFigHead.position.y = 1.45;
    const coatTails = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.6), cityFigMat);
    coatTails.position.set(0, 0.35, -0.15);
    cityFigure.add(cityFigBody, cityFigHead, coatTails);

    const cityFigRimLight = new THREE.PointLight(0xe8e1d5, 0, 7, 1.8);
    cityFigRimLight.position.set(-1.8, 4.4, -10.5);
    worldCity.add(cityFigRimLight);

    // -------------------------------------------------------------------------
    // WORLD 04: THE FORGOTTEN ROOM
    // -------------------------------------------------------------------------
    const worldRoom = new THREE.Group();
    worldRoom.visible = false;
    storyGroup.add(worldRoom);

    const roomAmbient = new THREE.AmbientLight(0x181410, 0.7);
    worldRoom.add(roomAmbient);

    // Corridor Floor & Walls
    const roomFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 40),
      new THREE.MeshStandardMaterial({ color: 0x080706, roughness: 0.35, metalness: 0.2 })
    );
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.position.set(0, 0, -8);
    worldRoom.add(roomFloor);

    // Ebon Door Structure at z = -6
    const ebonDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.0, 0.2), archMat);
    ebonDoorFrame.position.set(0, 2.0, -6.1);
    const ebonDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0d0c0a, roughness: 0.6, metalness: 0.2 })
    );
    ebonDoor.position.set(-0.8, 1.8, -6.0);
    worldRoom.add(ebonDoorFrame, ebonDoor);

    // Golden Light Wedge spilling from door seam
    const doorLightWedge = new THREE.PointLight(0xc9a66b, 0.3, 10, 1.8);
    doorLightWedge.position.set(0.2, 1.0, -6.5);
    worldRoom.add(doorLightWedge);

    // Armchair
    const chairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.8), archMat);
    chairMesh.position.set(1.2, 0.45, -9.0);
    worldRoom.add(chairMesh);

    // --- FIGURE 04: THE UNSEEN RESIDENT (EMERGES 50% - 72%) ---
    const shadowFigGroup = new THREE.Group();
    shadowFigGroup.position.set(0.3, 0.1, -8.5);
    worldRoom.add(shadowFigGroup);

    const roomFigMat = new THREE.MeshStandardMaterial({
      color: 0x0a0907,
      roughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const shadowFigBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.24, 1.45, 16), roomFigMat);
    shadowFigBody.position.y = 0.72;
    const shadowFigHead = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), roomFigMat);
    shadowFigHead.position.y = 1.52;
    shadowFigGroup.add(shadowFigBody, shadowFigHead);

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

    // 18 Floating Translucent Paper Shards
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

    // Chronometer Ring Halo
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8798a5, transparent: true, opacity: 0.4, wireframe: true });
    const chronoRing = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.02, 16, 64), ringMat);
    chronoRing.position.set(0, 1.8, -8);
    worldLetter.add(chronoRing);

    // --- FIGURE 05: THE CHRONO-MESSENGER (EMERGES 50% - 72%) ---
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

    // Basalt Pedestal & Conch Shell Vitrine
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x060f14, roughness: 0.9 })
    );
    pedestal.position.set(0, 0.6, -7.0);
    const vitrine = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.9, 0.8),
      bottleMat
    );
    vitrine.position.set(0, 1.6, -7.0);
    worldSea.add(pedestal, vitrine);

    // Submerged Marine Particles
    const seaPCount = 500;
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

    // --- FIGURE 06: THE SUBMERGED VOICE (EMERGES 50% - 72%) ---
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
    // CAMERA JOURNEYS & INTERPOLATORS
    // =========================================================================
    const archiveCamSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 11),
      new THREE.Vector3(0, 0, 7.2),
      new THREE.Vector3(-2.8, 0.8, 2.0),
      new THREE.Vector3(2.5, -0.5, -4.0),
      new THREE.Vector3(0, 1.2, -10.0),
      new THREE.Vector3(-3.0, -1.0, -16.0),
      new THREE.Vector3(3.0, 0.5, -22.0),
      new THREE.Vector3(0, 0, -30.0),
      new THREE.Vector3(0, 0.2, -34.5),
      new THREE.Vector3(0, 1.0, -38.5),
    ]);

    const archiveLookAtSpline = new THREE.CatmullRomCurve3([
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

    // Story 3D Camera Keyframes (Strictly per user specification!)
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
    // POINTER & RAYCAST INTERACTION
    // =========================================================================
    let hoveredRig: LivingCoverRig | null = null;
    const raycaster = new THREE.Raycaster();
    const rayVector = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Pointer speed calculation
      const dx = mouse.normX - mouse.lastX;
      const dy = mouse.normY - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.lastX = mouse.normX;
      mouse.lastY = mouse.normY;

      // Soft 3D flashlight in archive
      cursorFlashlight.position.x = camera.position.x + mouse.normX * 3.5;
      cursorFlashlight.position.y = camera.position.y + mouse.normY * 2.5;
      cursorFlashlight.position.z = camera.position.z - 3.2;

      if (modeRef.current === 'story') {
        // Pointer influence on story worlds
        stationLamp.position.x = 1.6 + mouse.normX * 0.4;
        stationLamp.position.y = 2.5 + mouse.normY * 0.3;
        lampBulb.position.copy(stationLamp.position);
        return;
      }

      // Raycast against living cover colliders
      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = coverRigs[hits[0].object.userData.index];
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

    const onPointerUp = () => {
      if (modeRef.current !== 'archive') return;
      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = coverRigs[hits[0].object.userData.index];
        if (hitRig) {
          sound.playBookOpen();
          onSelectStoryRef.current(hitRig.story);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 60 FPS RENDER LOOP WITH FLUID SIGNAL & NARRATIVE CHARACTER REVEALS
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    const currentLookAt = new THREE.Vector3(0, 0, 2);

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;
      const currentStory = selectedStoryRef.current;

      // Calculate global fluid motion energy
      const currentY = window.scrollY;
      scrollVelocity = (currentY - lastScrollY) * 0.005;
      lastScrollY = currentY;

      const instantEnergy = Math.min(1.0, Math.abs(scrollVelocity) * 2.5 + mouse.speed * 4.0);
      motionEnergy += (instantEnergy - motionEnergy) * 0.08;

      // Smooth pointer parallax
      mouse.targetX += (mouse.normX * 0.18 - mouse.targetX) * 0.06;
      mouse.targetY += (mouse.normY * 0.10 - mouse.targetY) * 0.06;

      if (currentMode === 'archive') {
        // --- ARCHIVE MODE ---
        archiveGroup.visible = true;
        storyGroup.visible = false;

        const aProg = Math.max(0, Math.min(1, archiveProgRef.current));
        const baseCam = archiveCamSpline.getPointAt(aProg);
        const baseLook = archiveLookAtSpline.getPointAt(aProg);

        // Add smooth pointer parallax
        const targetCamX = baseCam.x + mouse.targetX;
        const targetCamY = baseCam.y + mouse.targetY;
        const targetCamZ = baseCam.z;

        camera.position.x += (targetCamX - camera.position.x) * 0.055;
        camera.position.y += (targetCamY - camera.position.y) * 0.055;
        camera.position.z += (targetCamZ - camera.position.z) * 0.055;

        const targetLookX = baseLook.x + mouse.targetX * 0.4;
        const targetLookY = baseLook.y + mouse.targetY * 0.4;
        const targetLookZ = baseLook.z;

        currentLookAt.x += (targetLookX - currentLookAt.x) * 0.055;
        currentLookAt.y += (targetLookY - currentLookAt.y) * 0.055;
        currentLookAt.z += (targetLookZ - currentLookAt.z) * 0.055;
        camera.lookAt(currentLookAt);

        // Fluid particle drift based on motion energy
        archiveParticles.rotation.y = elapsed * (0.012 + motionEnergy * 0.035);

        // Update Living Covers
        coverRigs.forEach((rig) => {
          const isHov = hoveredRig === rig;
          const targetHover = isHov ? 1.0 : 0.0;
          rig.hoverFactor += (targetHover - rig.hoverFactor) * 0.1;

          // Update Living Cover Shader Uniforms
          rig.material.uniforms.uTime.value = elapsed;
          rig.material.uniforms.uHover.value = rig.hoverFactor;
          rig.material.uniforms.uVelocity.value = scrollVelocity;
          rig.material.uniforms.uMotionEnergy.value = motionEnergy;
          rig.material.uniforms.uPointer.value.set(mouse.normX, mouse.normY);

          // Gentle breathing float & hover position
          const levY = Math.sin(elapsed * 0.8 + rig.floatingOffset) * 0.07;
          rig.mesh.position.y = rig.basePos.y + levY;
          if (isHov) {
            rig.mesh.position.z = rig.basePos.z + 0.55;
            rig.light.intensity = 3.2;
          } else {
            rig.mesh.position.z = rig.basePos.z;
            rig.light.intensity = 1.4 + Math.sin(elapsed * 1.5 + rig.floatingOffset) * 0.3;
          }
          rig.light.position.y = rig.mesh.position.y;
          rig.collider.position.copy(rig.mesh.position);
        });
      } else {
        // --- STORY MODE (PER-STORY WORLDS & INTERACTIONS) ---
        archiveGroup.visible = false;
        storyGroup.visible = true;

        // Activate matching story sub-world
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
          // Train doors slide open strictly mapped to progress (32% - 48%)
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

          // Station lamp soft flicker at 96% - 100%
          stationLamp.intensity = sProg >= 0.95 && Math.sin(elapsed * 28) > 0.4 ? 1.0 : 3.8;

          // THE GIRL REVEAL & CINEMATIC MICRO-MOTION
          girlMat.opacity = figureRevealT;
          girlRimLight.intensity = figureRevealT * 3.6;

          if (sProg >= 0.68) {
            // Head turns directly toward viewer as camera approaches
            const turnT = Math.min(1.0, (sProg - 0.68) / 0.16);
            girlHead.rotation.y = turnT * 0.35 + Math.sin(elapsed * 1.2) * 0.04;
            girlHead.rotation.x = turnT * 0.08;

            // Stance shift forward at climax (85% - 100%)
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
          // Floating bottles gentle bobbing
          bottleRigs.forEach((b) => {
            b.mesh.position.y = b.basePos.y + Math.sin(elapsed * 1.5 + b.offset) * 0.08;
            b.mesh.rotation.y = elapsed * 0.3 + b.offset;
          });

          // Falling vs Reversing rain
          const positions = rainGeom.attributes.position.array as Float32Array;
          const isReversing = sProg >= 0.85; // Final chapter emotional reversal!
          const rSpeed = isReversing ? 0.12 : -0.15;

          for (let i = 0; i < rainCount; i++) {
            positions[i * 3 + 1] += rSpeed;
            positions[i * 3] += mouse.normX * mouse.speed * 0.05;

            if (!isReversing && positions[i * 3 + 1] < -1.0) {
              positions[i * 3 + 1] = 7.0;
            } else if (isReversing && positions[i * 3 + 1] > 7.0) {
              positions[i * 3 + 1] = -1.0;
            }
          }
          rainGeom.attributes.position.needsUpdate = true;

          // NOAH REVEAL & CINEMATIC MICRO-MOTION
          boyMat.opacity = figureRevealT;
          boyRimLight.intensity = figureRevealT * 3.0;

          if (sProg >= 0.65) {
            // Boy raises bottle upward toward sky
            const liftT = Math.min(1.0, (sProg - 0.65) / 0.20);
            boyArm.rotation.x = -0.3 - liftT * 0.95;
            heldBottle.position.y = 0.9 + liftT * 0.42;
            heldBottle.rotation.z = liftT * 0.2;

            // Reversal awe: left arm extends and head looks up at rising rain
            if (sProg >= 0.85) {
              const revT = (sProg - 0.85) / 0.15;
              boyLeftArm.rotation.x = -revT * 0.6;
              boyHead.rotation.x = -revT * 0.35;
            }
          }
        }

        // --- STORY 03: SEVEN MINUTES BEFORE MIDNIGHT ---
        else if (sId === 'story-03') {
          // Window blackout cascade (30% to 70%)
          windowClusters.forEach((w, idx) => {
            const threshold = 0.30 + (idx / windowClusters.length) * 0.42;
            w.visible = sProg < threshold;
          });

          solitaryWin.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.08);

          // ROOFTOP WATCHER REVEAL & CINEMATIC MICRO-MOTION
          cityFigMat.opacity = figureRevealT;
          cityFigRimLight.intensity = figureRevealT * 3.2;

          if (sProg >= 0.68) {
            // Steps toward parapet edge, coat flutters in the wind
            const stepT = Math.min(1.0, (sProg - 0.68) / 0.18);
            cityFigure.position.z = -9.0 + stepT * 0.35;
            coatTails.rotation.y = Math.sin(elapsed * 4.5) * 0.18;

            // Head tilts upward toward celestial stars
            cityFigHead.rotation.x = -stepT * 0.45;
          }
        }

        // --- STORY 04: THE FORGOTTEN ROOM ---
        else if (sId === 'story-04') {
          // Door swings open wider as scroll progresses
          const doorAngle = Math.min(0.85, sProg * 1.1);
          ebonDoor.rotation.y = -doorAngle;
          doorLightWedge.intensity = 0.3 + doorAngle * 3.5;

          // THE UNSEEN RESIDENT REVEAL & CINEMATIC MICRO-MOTION
          roomFigMat.opacity = figureRevealT;
          roomFigLight.intensity = figureRevealT * 3.4;

          if (sProg >= 0.65) {
            // Steps gently into warm light beam
            const stepT = Math.min(1.0, (sProg - 0.65) / 0.20);
            shadowFigGroup.position.x = 0.3 + stepT * 0.45;

            // Head turns welcomingly toward entrance
            shadowFigHead.rotation.y = -stepT * 0.38 + Math.sin(elapsed * 1.0) * 0.04;
          }
        }

        // --- STORY 05: A LETTER FROM TOMORROW ---
        else if (sId === 'story-05') {
          // Floating paper shards rotating & cursor repulsion
          paperShards.forEach((p) => {
            p.mesh.rotation.x += p.rotSpeed.x;
            p.mesh.rotation.y += p.rotSpeed.y;

            const dX = p.mesh.position.x - mouse.targetX * 2.5;
            const dY = p.mesh.position.y - mouse.targetY * 2.0;
            const dist = Math.sqrt(dX * dX + dY * dY);
            if (dist < 1.8) {
              p.mesh.position.x += (dX / dist) * 0.035;
              p.mesh.position.y += (dY / dist) * 0.035;
            } else {
              p.mesh.position.x += (p.basePos.x - p.mesh.position.x) * 0.04;
              p.mesh.position.y += (p.basePos.y - p.mesh.position.y) * 0.04;
            }
          });

          chronoRing.rotation.z = elapsed * 0.4;
          chronoRing.rotation.x = Math.sin(elapsed * 0.3) * 0.2;

          // THE CHRONO-MESSENGER REVEAL & CINEMATIC MICRO-MOTION
          messengerMat.opacity = figureRevealT;
          messengerRimLight.intensity = figureRevealT * 3.2;

          if (sProg >= 0.65) {
            // Extends arm presenting the glowing chronometer seal
            const extT = Math.min(1.0, (sProg - 0.65) / 0.20);
            messengerArm.rotation.x = -0.4 - extT * 0.65;
            messengerArm.position.z = 0.2 + extT * 0.35;
            mLetter.position.z = 0.4 + extT * 0.45;
            mLetter.scale.setScalar(1.0 + Math.sin(elapsed * 4.5) * 0.22);
            messengerFig.position.z = -10.0 + extT * 0.5;
          }
        }

        // --- STORY 06: THE SEA THAT REMEMBERED ---
        else if (sId === 'story-06') {
          vitrine.position.y = 1.6 + Math.sin(elapsed * 1.8) * 0.05;

          // Buoyant marine particles drifting upward
          const sPos = seaPGeom.attributes.position.array as Float32Array;
          for (let i = 0; i < seaPCount; i++) {
            sPos[i * 3 + 1] += 0.015;
            sPos[i * 3] += Math.sin(elapsed + i) * 0.003;
            if (sPos[i * 3 + 1] > 6.0) sPos[i * 3 + 1] = 0.0;
          }
          seaPGeom.attributes.position.needsUpdate = true;

          // THE SUBMERGED VOICE REVEAL & CINEMATIC MICRO-MOTION
          seaFigMat.opacity = figureRevealT;
          seaFigRimLight.intensity = figureRevealT * 3.5;

          if (sProg >= 0.65) {
            // Weightless sinusoidal buoyancy & arm swell drift
            seaFigure.position.y = 1.6 + Math.sin(elapsed * 1.4) * 0.16;
            seaFigure.rotation.z = 0.15 + Math.sin(elapsed * 0.9) * 0.08;

            seaArmL.rotation.z = Math.sin(elapsed * 1.2) * 0.22;
            seaArmR.rotation.z = -Math.sin(elapsed * 1.2) * 0.22;
            seaDrapery.rotation.x = Math.sin(elapsed * 1.5) * 0.28;
          }
        }
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
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
      className="webgl-fixed pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
};
