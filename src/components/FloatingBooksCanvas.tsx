import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Book, BOOKS } from '../data/books';
import { sound } from '../utils/audio';
import { cursorManager } from './CustomCursor';

interface FloatingBooksCanvasProps {
  books: Book[];
  activeCategory: string;
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
  ambientTheme: 'astral' | 'golden' | 'emerald';
  onPortalComplete: (book: Book) => void;
}

export const FloatingBooksCanvas: React.FC<FloatingBooksCanvasProps> = ({
  books,
  activeCategory,
  selectedBook,
  onSelectBook,
  ambientTheme,
  onPortalComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References to avoid React state re-renders
  const selectedBookRef = useRef<Book | null>(selectedBook);
  selectedBookRef.current = selectedBook;

  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  const ambientThemeRef = useRef(ambientTheme);
  ambientThemeRef.current = ambientTheme;

  const onSelectBookRef = useRef(onSelectBook);
  onSelectBookRef.current = onSelectBook;

  const onPortalCompleteRef = useRef(onPortalComplete);
  onPortalCompleteRef.current = onPortalComplete;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.04);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- LIGHTING RIG ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.6);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70a5f8, 1.8);
    rimLight.position.set(-7, -4, -4);
    scene.add(rimLight);

    // Interactive 3D Cursor PointLight (directly illuminates objects near mouse)
    const cursorPointLight = new THREE.PointLight(0xffdf9e, 3.2, 8, 1.4);
    cursorPointLight.position.set(0, 0, 3);
    scene.add(cursorPointLight);

    // Deep ambient void light
    const voidLight = new THREE.PointLight(0x38bdf8, 1.5, 14, 2.0);
    voidLight.position.set(0, -3, -5);
    scene.add(voidLight);

    // --- MAIN 3D UNIVERSE GROUP ---
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // --- MULTI-LAYER VOLUMETRIC PARTICLE SYSTEMS ---
    // 1. Foreground Bokeh Particles (Z: 1.5 to 5.5, larger, soft depth)
    const fgCount = 180;
    const fgGeom = new THREE.BufferGeometry();
    const fgPositions = new Float32Array(fgCount * 3);
    for (let i = 0; i < fgCount; i++) {
      fgPositions[i * 3] = (Math.random() - 0.5) * 14;
      fgPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      fgPositions[i * 3 + 2] = Math.random() * 4 + 1.5;
    }
    fgGeom.setAttribute('position', new THREE.BufferAttribute(fgPositions, 3));

    // Particle Canvas Sprite
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d')!;
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(255, 235, 180, 0.85)');
      grad.addColorStop(0.65, 'rgba(255, 200, 120, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleTexture = createParticleTexture();

    const fgMaterial = new THREE.PointsMaterial({
      size: 0.22,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fgParticles = new THREE.Points(fgGeom, fgMaterial);
    universeGroup.add(fgParticles);

    // 2. Midground Stardust Particles (Z: -2.5 to 2.0)
    const mgCount = 1200;
    const mgGeom = new THREE.BufferGeometry();
    const mgPositions = new Float32Array(mgCount * 3);
    for (let i = 0; i < mgCount; i++) {
      mgPositions[i * 3] = (Math.random() - 0.5) * 20;
      mgPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      mgPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    mgGeom.setAttribute('position', new THREE.BufferAttribute(mgPositions, 3));
    const mgMaterial = new THREE.PointsMaterial({
      size: 0.09,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mgParticles = new THREE.Points(mgGeom, mgMaterial);
    universeGroup.add(mgParticles);

    // 3. Far Background Nebular Particles (Z: -14 to -3.5)
    const bgCount = 2400;
    const bgGeom = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      bgPositions[i * 3] = (Math.random() - 0.5) * 32;
      bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      bgPositions[i * 3 + 2] = -Math.random() * 11 - 3.5;
    }
    bgGeom.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    const bgMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: particleTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bgParticles = new THREE.Points(bgGeom, bgMaterial);
    universeGroup.add(bgParticles);

    // --- 3D FLOATING TYPOGRAPHY IN ENVIRONMENT ---
    // "STORIES BEYOND THE PAGE"
    const createTitlePlane = () => {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = 1024;
      tCanvas.height = 512;
      const tCtx = tCanvas.getContext('2d')!;

      // Eyebrow
      tCtx.fillStyle = 'rgba(226, 180, 94, 0.85)';
      tCtx.font = '600 20px "Cinzel", serif';
      tCtx.textAlign = 'center';
      tCtx.letterSpacing = '10px';
      tCtx.fillText('✦  A E T H E R I A   A R C H I V E S  ✦', 512, 110);

      // Main Monumental Title
      tCtx.fillStyle = '#ffffff';
      tCtx.font = '700 78px "Cinzel", "Playfair Display", serif';
      tCtx.letterSpacing = '8px';
      tCtx.shadowColor = 'rgba(0,0,0,0.9)';
      tCtx.shadowBlur = 20;
      tCtx.fillText('STORIES', 512, 210);

      tCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      tCtx.font = 'italic 300 74px "Playfair Display", Georgia, serif';
      tCtx.fillText('Beyond The Page', 512, 295);

      // Subtitle
      tCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      tCtx.font = '400 18px "Inter", sans-serif';
      tCtx.letterSpacing = '4px';
      tCtx.shadowBlur = 0;
      tCtx.fillText('EXPLORE ZERO-GRAVITY CODICES & INTERACTIVE TALES', 512, 370);

      const tTex = new THREE.CanvasTexture(tCanvas);
      tTex.colorSpace = THREE.SRGBColorSpace;

      const tGeom = new THREE.PlaneGeometry(5.4, 2.7);
      const tMat = new THREE.MeshBasicMaterial({
        map: tTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const tMesh = new THREE.Mesh(tGeom, tMat);
      tMesh.position.set(0, 0.8, -1.8);
      return tMesh;
    };

    const titleMesh = createTitlePlane();
    universeGroup.add(titleMesh);

    // --- PROCEDURAL BOOK TEXTURES & PAPER GENERATOR ---
    const createPagesTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f3ede1';
      ctx.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y += 3) {
        const shade = Math.random() * 20 - 10;
        ctx.fillStyle = `rgb(${228 + shade}, ${220 + shade}, ${208 + shade})`;
        ctx.fillRect(0, y, 256, 1.5);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    };
    const pagesTexture = createPagesTexture();

    const createCoverTexture = (book: Book): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      const bgGrad = ctx.createLinearGradient(0, 0, 768, 1080);
      bgGrad.addColorStop(0, '#0c0b10');
      bgGrad.addColorStop(0.5, '#050508');
      bgGrad.addColorStop(1, '#020204');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 768, 1080);

      const img = new Image();
      img.src = book.coverImage;
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(54, 110, 660, 680);
        ctx.clip();
        ctx.drawImage(img, 54, 110, 660, 680);

        const imgVignette = ctx.createRadialGradient(384, 450, 180, 384, 450, 420);
        imgVignette.addColorStop(0, 'rgba(0,0,0,0)');
        imgVignette.addColorStop(1, 'rgba(5,5,8,0.85)');
        ctx.fillStyle = imgVignette;
        ctx.fillRect(54, 110, 660, 680);
        ctx.restore();

        renderTypography();
        tex.needsUpdate = true;
      };

      const renderTypography = () => {
        ctx.strokeStyle = book.accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(32, 32, 704, 1016);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, 688, 1000);

        ctx.fillStyle = book.accentColor;
        ctx.font = '500 20px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '6px';
        ctx.fillText('✦  A E T H E R I A   A R C H I V E S  ✦', 384, 76);

        const panelGrad = ctx.createLinearGradient(0, 780, 0, 1040);
        panelGrad.addColorStop(0, 'rgba(8, 8, 12, 0.95)');
        panelGrad.addColorStop(1, 'rgba(4, 4, 6, 1)');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(48, 790, 672, 240);

        ctx.strokeStyle = book.accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(120, 810);
        ctx.lineTo(648, 810);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 48px "Cinzel", "Playfair Display", serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '2px';
        ctx.fillText(book.title.toUpperCase(), 384, 875);

        ctx.fillStyle = book.accentColor;
        ctx.font = '400 20px "Inter", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText(book.subtitle.toUpperCase(), 384, 915);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '300 16px "JetBrains Mono", monospace';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${book.category.toUpperCase()} · ${book.readingTime.toUpperCase()}`, 384, 970);
      };

      renderTypography();
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // --- CREATE 3D HINGED FLOATING BOOKS RIG ---
    // Realistic multi-depth layout
    const depthLayoutPositions: [number, number, number][] = [
      [-1.85, -0.25, 1.35], // Book 1 (Cinderella): Foreground / left
      [2.25, 0.45, -0.35],  // Book 2 (Briar): Midground / right
      [0.05, 1.45, -2.1],   // Book 3 (Glass Rose): Background / center
      [-3.1, 1.15, -3.6],   // Book 4 (Astral): Far background / left
      [2.0, -1.05, 1.05],   // Book 5 (Obsidian): Foreground / right
      [-2.6, -0.75, -1.35], // Book 6 (Alchemist): Midground / left
      [2.9, -0.35, -3.1],   // Book 7 (Nebula): Far background / right
    ];

    interface BookRig {
      book: Book;
      rootGroup: THREE.Group;
      hingeGroup: THREE.Group; // swings open like a real book cover!
      frontCoverMesh: THREE.Mesh;
      bodyMesh: THREE.Mesh;
      glowMesh: THREE.Mesh;
      collider: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      floatingPhase: number;
      floatingSpeed: number;
      targetPos: THREE.Vector3;
      targetRot: THREE.Euler;
      coverOpenAngle: number;
      targetCoverOpenAngle: number;
      opacity: number;
    }

    const bookRigs: BookRig[] = [];
    const collidersList: THREE.Mesh[] = [];

    const bookWidth = 1.35;
    const bookHeight = 1.9;
    const bookDepth = 0.26;

    books.forEach((book, idx) => {
      const rootGroup = new THREE.Group();
      const pos = depthLayoutPositions[idx] || book.position;
      rootGroup.position.set(...pos);
      rootGroup.rotation.set(...book.rotation);

      const coverTexture = createCoverTexture(book);

      // Spine & Back Texture
      const spineCanvas = document.createElement('canvas');
      spineCanvas.width = 128;
      spineCanvas.height = 1024;
      const sCtx = spineCanvas.getContext('2d')!;
      sCtx.fillStyle = '#0a0a0f';
      sCtx.fillRect(0, 0, 128, 1024);
      sCtx.strokeStyle = book.accentColor;
      sCtx.strokeRect(10, 10, 108, 1004);
      sCtx.save();
      sCtx.translate(64, 512);
      sCtx.rotate(-Math.PI / 2);
      sCtx.fillStyle = '#ffffff';
      sCtx.font = '600 32px "Cinzel", serif';
      sCtx.textAlign = 'center';
      sCtx.letterSpacing = '4px';
      sCtx.fillText(book.title.toUpperCase(), 0, 10);
      sCtx.restore();
      const spineTexture = new THREE.CanvasTexture(spineCanvas);

      // 1. Main Book Body (pages + back cover + spine)
      const bodyMaterials: THREE.Material[] = [
        new THREE.MeshStandardMaterial({ map: pagesTexture, roughness: 0.8 }), // Right (pages)
        new THREE.MeshStandardMaterial({ map: spineTexture, roughness: 0.4, metalness: 0.2 }), // Left (spine)
        new THREE.MeshStandardMaterial({ map: pagesTexture, roughness: 0.8 }), // Top (pages)
        new THREE.MeshStandardMaterial({ map: pagesTexture, roughness: 0.8 }), // Bottom (pages)
        new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.9 }), // Inside front facing page
        new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.5 }), // Back cover
      ];
      const bodyGeom = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterials);
      rootGroup.add(bodyMesh);

      // 2. Hinged Front Cover Group (Spine hinge at x: -bookWidth/2)
      const hingeGroup = new THREE.Group();
      hingeGroup.position.set(-bookWidth / 2, 0, bookDepth / 2 + 0.005);

      const frontCoverGeom = new THREE.PlaneGeometry(bookWidth, bookHeight);
      const frontCoverMat = new THREE.MeshStandardMaterial({
        map: coverTexture,
        roughness: 0.35,
        metalness: 0.25,
        side: THREE.DoubleSide,
      });
      const frontCoverMesh = new THREE.Mesh(frontCoverGeom, frontCoverMat);
      frontCoverMesh.position.set(bookWidth / 2, 0, 0); // offset so pivot is at hinge
      hingeGroup.add(frontCoverMesh);
      rootGroup.add(hingeGroup);

      // 3. Ribbon bookmark hanging below
      const ribbonCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, -bookHeight * 0.45, 0),
        new THREE.Vector3(0.12, -bookHeight * 0.6, 0.05),
        new THREE.Vector3(0.1, -bookHeight * 0.78, 0.08),
        new THREE.Vector3(0.15, -bookHeight * 0.95, 0.04),
      ]);
      const ribbonGeom = new THREE.TubeGeometry(ribbonCurve, 20, 0.025, 8, false);
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(book.accentColor),
        roughness: 0.35,
        metalness: 0.4,
      });
      const ribbonMesh = new THREE.Mesh(ribbonGeom, ribbonMat);
      rootGroup.add(ribbonMesh);

      // 4. Glow Halo Quad
      const glowGeom = new THREE.PlaneGeometry(bookWidth * 1.9, bookHeight * 1.9);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(book.glowColor),
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const glowMesh = new THREE.Mesh(glowGeom, glowMat);
      glowMesh.position.set(0, 0, -0.05);
      rootGroup.add(glowMesh);

      // 5. Invisible Collider
      const colliderGeom = new THREE.BoxGeometry(bookWidth * 1.25, bookHeight * 1.2, bookDepth * 2.4);
      const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
      const collider = new THREE.Mesh(colliderGeom, colliderMat);
      collider.userData = { bookId: book.id, index: idx };
      rootGroup.add(collider);
      collidersList.push(collider);

      universeGroup.add(rootGroup);

      bookRigs.push({
        book,
        rootGroup,
        hingeGroup,
        frontCoverMesh,
        bodyMesh,
        glowMesh,
        collider,
        basePos: new THREE.Vector3(...pos),
        baseRot: new THREE.Euler(...book.rotation),
        floatingPhase: idx * 1.37 + Math.random() * 0.5,
        floatingSpeed: 0.6 + (idx % 3) * 0.15,
        targetPos: new THREE.Vector3(...pos),
        targetRot: new THREE.Euler(...book.rotation),
        coverOpenAngle: 0,
        targetCoverOpenAngle: 0,
        opacity: 1,
      });
    });

    // --- INTERACTIVE STATE (IN REFS ONLY, ZERO REACT RE-RENDERS) ---
    const mouse = {
      x: 0,
      y: 0,
      rawX: 0,
      rawY: 0,
      normX: 0,
      normY: 0,
      isDown: false,
      lastX: 0,
      lastY: 0,
    };

    const cameraControl = {
      baseZ: 7.5,
      scrollZ: 0,
      targetCamX: 0,
      targetCamY: 0,
      camX: 0,
      camY: 0,
      lookAtX: 0,
      lookAtY: 0,
      targetLookAtX: 0,
      targetLookAtY: 0,
    };

    let hoveredRig: BookRig | null = null;
    let portalRig: BookRig | null = null;
    let portalProgress = 0; // 0 to 1
    let isPortalActive = false;

    // --- RAYCASTING & POINTER LISTENERS ---
    const raycaster = new THREE.Raycaster();
    const rayVector = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      mouse.rawX = e.clientX;
      mouse.rawY = e.clientY;
      mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Heavy cinematic camera influence
      cameraControl.targetCamX = mouse.normX * 0.42;
      cameraControl.targetCamY = mouse.normY * 0.28;
      cameraControl.targetLookAtX = mouse.normX * 0.15;
      cameraControl.targetLookAtY = mouse.normY * 0.1;

      // Update 3D PointLight position to follow cursor with depth
      cursorPointLight.position.x = mouse.normX * 4.2;
      cursorPointLight.position.y = mouse.normY * 3.0;
      cursorPointLight.position.z = 2.4;

      if (isPortalActive) return;

      // Check Hover Raycasting
      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = bookRigs[hits[0].object.userData.index];
        if (hitRig && hoveredRig !== hitRig) {
          hoveredRig = hitRig;
          sound.playBookHover();
          cursorManager.setMode('hover-book', 'OPEN');
        }
      } else {
        if (hoveredRig !== null) {
          hoveredRig = null;
          cursorManager.setMode('default');
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      mouse.isDown = true;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      mouse.isDown = false;
      if (isPortalActive) return;

      // Check Click on Book
      rayVector.set(mouse.normX, mouse.normY);
      raycaster.setFromCamera(rayVector, camera);
      const hits = raycaster.intersectObjects(collidersList, false);

      if (hits.length > 0) {
        const hitRig = bookRigs[hits[0].object.userData.index];
        if (hitRig) {
          // Trigger WebGL Portal Sequence!
          triggerPortalTransition(hitRig);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      cameraControl.scrollZ += e.deltaY * 0.0035;
      cameraControl.scrollZ = Math.max(-1.5, Math.min(2.5, cameraControl.scrollZ));
    };

    const triggerPortalTransition = (rig: BookRig) => {
      portalRig = rig;
      isPortalActive = true;
      portalProgress = 0;
      sound.playBookOpen();
      cursorManager.setMode('hidden');
      onSelectBookRef.current(rig.book);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // --- 60 FPS ANIMATION LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // 1. Heavy cinematic camera interpolation
      cameraControl.camX += (cameraControl.targetCamX - cameraControl.camX) * 0.038;
      cameraControl.camY += (cameraControl.targetCamY - cameraControl.camY) * 0.038;
      cameraControl.lookAtX += (cameraControl.targetLookAtX - cameraControl.lookAtX) * 0.038;
      cameraControl.lookAtY += (cameraControl.targetLookAtY - cameraControl.lookAtY) * 0.038;

      // Subtle idle breathing
      const idleBreathingX = Math.sin(elapsed * 0.35) * 0.08;
      const idleBreathingY = Math.cos(elapsed * 0.28) * 0.06;

      if (!isPortalActive) {
        camera.position.x = cameraControl.camX + idleBreathingX;
        camera.position.y = cameraControl.camY + idleBreathingY;
        camera.position.z = cameraControl.baseZ + cameraControl.scrollZ;
        camera.lookAt(cameraControl.lookAtX, cameraControl.lookAtY, 0);
      } else if (portalRig) {
        // --- WEBGL PORTAL TRANSITION SEQUENCE ---
        // Book expands, camera flies into book, front cover swings open
        portalProgress += 0.016;
        const t = Math.min(1.0, portalProgress);

        // Smooth cubic in-out
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Camera rushes toward book
        const bookCenter = portalRig.rootGroup.position;
        camera.position.x += (bookCenter.x - camera.position.x) * 0.08;
        camera.position.y += (bookCenter.y - camera.position.y) * 0.08;
        camera.position.z += (bookCenter.z + 1.2 - camera.position.z) * 0.08;
        camera.lookAt(bookCenter.x, bookCenter.y, bookCenter.z);

        // Book rotates to perfectly face camera
        portalRig.targetRot.set(0, 0, 0);

        // Front cover swings open on its hinge (0 to -145 degrees)
        if (t > 0.3) {
          portalRig.targetCoverOpenAngle = -Math.PI * 0.8;
        }

        // Dissolve other books into the deep void
        bookRigs.forEach((r) => {
          if (r !== portalRig) {
            r.targetPos.z -= 0.08;
            r.opacity = Math.max(0, 1 - t * 2.2);
            r.glowMesh.scale.multiplyScalar(0.96);
          }
        });

        // Background particles warp forward
        fgParticles.position.z += 0.08;
        mgParticles.position.z += 0.05;

        // Trigger story reader modal when camera reaches threshold
        if (t >= 0.95) {
          onPortalCompleteRef.current(portalRig.book);
        }
      }

      // 2. Animate Multi-Layer Particles (Parallax drift)
      fgParticles.rotation.y = elapsed * 0.02 + mouse.normX * 0.04;
      fgParticles.rotation.x = Math.sin(elapsed * 0.015) * 0.03;

      mgParticles.rotation.y = elapsed * 0.01 + mouse.normX * 0.02;
      mgParticles.rotation.x = Math.cos(elapsed * 0.012) * 0.02;

      bgParticles.rotation.y = elapsed * 0.005;

      // 3. Floating 3D Typography Subtle Drift & Tilt
      titleMesh.position.y = 0.8 + Math.sin(elapsed * 0.6) * 0.06;
      titleMesh.position.x = Math.sin(elapsed * 0.4) * 0.04;
      titleMesh.rotation.y = mouse.normX * 0.05;
      titleMesh.rotation.x = -mouse.normY * 0.04;

      // 4. Update Ambient Colors based on Theme
      const currentTheme = ambientThemeRef.current;
      if (currentTheme === 'golden') {
        cursorPointLight.color.setHex(0xf59e0b);
        keyLight.color.setHex(0xfef3c7);
        rimLight.color.setHex(0xd97706);
      } else if (currentTheme === 'emerald') {
        cursorPointLight.color.setHex(0x10b981);
        keyLight.color.setHex(0xd1fae5);
        rimLight.color.setHex(0x059669);
      } else {
        cursorPointLight.color.setHex(0x38bdf8);
        keyLight.color.setHex(0xfff6ea);
        rimLight.color.setHex(0x818cf8);
      }

      // 5. Update Each Floating Book Rig
      const currentCat = activeCategoryRef.current;
      const isPortal = isPortalActive;

      bookRigs.forEach((rig) => {
        const isHovered = hoveredRig === rig;
        const matchesCategory =
          currentCat === 'All Codices' || rig.book.category === currentCat;

        if (!isPortal) {
          // Continuous Organic Floating Motion with independent phase & frequencies
          const levY = Math.sin(elapsed * rig.floatingSpeed + rig.floatingPhase) * 0.14;
          const levX = Math.cos(elapsed * (rig.floatingSpeed * 0.7) + rig.floatingPhase) * 0.06;
          const levZ = Math.sin(elapsed * (rig.floatingSpeed * 0.8) + rig.floatingPhase) * 0.08;

          const wobblePitch = Math.cos(elapsed * 0.5 + rig.floatingPhase) * 0.04;
          const wobbleRoll = Math.sin(elapsed * 0.6 + rig.floatingPhase) * 0.035;

          rig.targetPos.x = rig.basePos.x + levX;
          rig.targetPos.y = rig.basePos.y + levY;
          rig.targetPos.z = rig.basePos.z + levZ;

          rig.targetRot.x = rig.baseRot.x + wobblePitch;
          rig.targetRot.y = rig.baseRot.y;
          rig.targetRot.z = rig.baseRot.z + wobbleRoll;

          // Book Hover Effect: floats toward camera, turns to face viewer, rim light intensifies
          if (isHovered) {
            rig.targetPos.z += 0.85; // moves toward camera
            rig.targetPos.y += 0.1;
            rig.targetRot.y = 0.08; // faces user
            rig.targetRot.x = 0;
            rig.glowMesh.scale.set(1.4, 1.4, 1);
            (rig.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.75;
          } else {
            // Other books move slightly back if one is hovered
            if (hoveredRig !== null) {
              rig.targetPos.z -= 0.35;
            }
            rig.glowMesh.scale.set(1, 1, 1);
            (rig.glowMesh.material as THREE.MeshBasicMaterial).opacity = matchesCategory
              ? 0.16 + Math.sin(elapsed * 1.5 + rig.floatingPhase) * 0.07
              : 0.03;
          }

          // Category filter
          if (!matchesCategory) {
            rig.targetPos.z -= 1.2;
            rig.rootGroup.scale.setScalar(0.85);
          } else {
            rig.rootGroup.scale.setScalar(isHovered ? 1.08 : 1.0);
          }
        }

        // Smooth spring-like lerp to target position & rotation
        rig.rootGroup.position.x += (rig.targetPos.x - rig.rootGroup.position.x) * 0.065;
        rig.rootGroup.position.y += (rig.targetPos.y - rig.rootGroup.position.y) * 0.065;
        rig.rootGroup.position.z += (rig.targetPos.z - rig.rootGroup.position.z) * 0.065;

        rig.rootGroup.rotation.x += (rig.targetRot.x - rig.rootGroup.rotation.x) * 0.065;
        rig.rootGroup.rotation.y += (rig.targetRot.y - rig.rootGroup.rotation.y) * 0.065;
        rig.rootGroup.rotation.z += (rig.targetRot.z - rig.rootGroup.rotation.z) * 0.065;

        // Front Cover Hinge Rotation (opens like a real book)
        rig.coverOpenAngle += (rig.targetCoverOpenAngle - rig.coverOpenAngle) * 0.08;
        rig.hingeGroup.rotation.y = rig.coverOpenAngle;
      });

      renderer.render(scene, camera);
    };

    render();

    // Reset portal state when reader modal closes
    const checkModalReset = () => {
      if (selectedBookRef.current === null && isPortalActive) {
        isPortalActive = false;
        portalRig = null;
        portalProgress = 0;
        cursorManager.setMode('default');
        // Reset positions
        bookRigs.forEach((r) => {
          r.targetPos.copy(r.basePos);
          r.targetRot.copy(r.baseRot);
          r.targetCoverOpenAngle = 0;
          r.opacity = 1;
        });
      }
    };

    const resetInterval = setInterval(checkModalReset, 200);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(resetInterval);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [books]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 w-full h-full overflow-hidden"
    />
  );
};
