import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AtmosphericCanvasProps {
  scrollProgress: number; // 0 to 4 (representing 5 scenes)
  activeScene: number; // 0 to 4
  interactiveDeformation: number;
  interactiveWireframe: boolean;
  interactiveSpeed: number;
  onHover3D: (hovering: boolean) => void;
  onShockwave: () => void;
}

export const AtmosphericCanvas: React.FC<AtmosphericCanvasProps> = ({
  scrollProgress,
  activeScene,
  interactiveDeformation,
  interactiveWireframe,
  interactiveSpeed,
  onHover3D,
  onShockwave,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction refs
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const userRotationRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const shockwaveTriggerRef = useRef<number | null>(null);

  // Internal state mirrors for rAF loop
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const deformationRef = useRef(interactiveDeformation);
  deformationRef.current = interactiveDeformation;

  const wireframeRef = useRef(interactiveWireframe);
  wireframeRef.current = interactiveWireframe;

  const speedRef = useRef(interactiveSpeed);
  speedRef.current = interactiveSpeed;

  const activeSceneRef = useRef(activeScene);
  activeSceneRef.current = activeScene;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030305, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- LIGHTING RIG ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key Light (Silver)
    const keyLight = new THREE.DirectionalLight(0xe8edf2, 2.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Rim Light (Cool Mercury)
    const rimLight = new THREE.DirectionalLight(0x8fa4b8, 2.0);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Moving dynamic PointLight
    const orbitLight = new THREE.PointLight(0xfff5e6, 3.5, 12, 1.8);
    orbitLight.position.set(0, 2, 2);
    scene.add(orbitLight);

    // --- SCULPTURE CENTERPIECE ---
    // Custom Torus Knot with rich geometric subdivisions
    const baseGeometry = new THREE.TorusKnotGeometry(1.0, 0.32, 160, 36, 2, 3);
    const posAttr = baseGeometry.attributes.position;
    const initialPositions = posAttr.array.slice() as Float32Array;

    // Material 1: Physical Reflective Glass/Chrome Shell
    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111116,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95,
      ior: 1.52,
      wireframe: false,
    });

    const sculptureMesh = new THREE.Mesh(baseGeometry, sculptureMaterial);
    scene.add(sculptureMesh);

    // Material 2: Inner Ethereal Wireframe Lattice Core
    const wireframeGeo = new THREE.IcosahedronGeometry(0.85, 3);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x8fa4b8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const innerLattice = new THREE.Mesh(wireframeGeo, wireframeMat);
    sculptureMesh.add(innerLattice);

    // --- VOLUMETRIC PARTICLE SYSTEM ---
    const particleCount = window.innerWidth < 768 ? 700 : 1600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleBasePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 4.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleBasePositions[i * 3] = x;
      particleBasePositions[i * 3 + 1] = y;
      particleBasePositions[i * 3 + 2] = z;

      particleScales[i] = Math.random() * 0.03 + 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture generator (soft circular gaussian gradient)
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(210, 225, 245, 0.6)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // --- MOUSE & GESTURE LISTENERS ---
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        userRotationRef.current.vx = deltaX * 0.005;
        userRotationRef.current.vy = deltaY * 0.005;
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // In scene 4 or on canvas, enable direct drag
      if (activeSceneRef.current === 3) {
        isDraggingRef.current = true;
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
      // Click shockwave
      shockwaveTriggerRef.current = performance.now();
      onShockwave();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    // --- ANIMATION / RENDER LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      const spd = speedRef.current;

      // Mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Scroll parameter (0 to 4)
      const p = scrollRef.current;

      // 1. DYNAMIC CAMERA CHOREOGRAPHY ACROSS 5 SCENES
      // Scene 0: Genesis [0, 0, 5.2]
      // Scene 1: Resonance [0.9, -0.3, 3.8]
      // Scene 2: Morphic Phase [-1.1, 0.5, 3.0]
      // Scene 3: Synthesis / Interaction [0, 0, 4.0]
      // Scene 4: Finale [0, 0.7, 7.8]
      let camX = 0;
      let camY = 0;
      let camZ = 5.2;

      if (p <= 1) {
        const t = p;
        camX = THREE.MathUtils.lerp(0, 0.9, t);
        camY = THREE.MathUtils.lerp(0, -0.3, t);
        camZ = THREE.MathUtils.lerp(5.2, 3.8, t);
      } else if (p <= 2) {
        const t = p - 1;
        camX = THREE.MathUtils.lerp(0.9, -1.1, t);
        camY = THREE.MathUtils.lerp(-0.3, 0.5, t);
        camZ = THREE.MathUtils.lerp(3.8, 3.0, t);
      } else if (p <= 3) {
        const t = p - 2;
        camX = THREE.MathUtils.lerp(-1.1, 0, t);
        camY = THREE.MathUtils.lerp(0.5, 0, t);
        camZ = THREE.MathUtils.lerp(3.0, 4.0, t);
      } else {
        const t = p - 3;
        camX = THREE.MathUtils.lerp(0, 0, t);
        camY = THREE.MathUtils.lerp(0, 0.7, t);
        camZ = THREE.MathUtils.lerp(4.0, 7.8, t);
      }

      // Autonomous breathing camera sway + subtle mouse parallax
      const idleSwayX = Math.sin(elapsed * 0.4) * 0.15;
      const idleSwayY = Math.cos(elapsed * 0.3) * 0.12;

      camera.position.x = camX + idleSwayX + mx * 0.45;
      camera.position.y = camY + idleSwayY + my * 0.35;
      camera.position.z = camZ;
      camera.lookAt(0, 0, 0);

      // 2. ORBIT LIGHT MOVEMENT
      orbitLight.position.x = Math.sin(elapsed * 0.8 * spd) * 3.5;
      orbitLight.position.y = Math.cos(elapsed * 0.6 * spd) * 2.8;
      orbitLight.position.z = Math.sin(elapsed * 0.5) * 2.5 + 1.5;

      // 3. USER INTERACTION INERTIAL ROTATION (Scene 4)
      userRotationRef.current.x += userRotationRef.current.vx;
      userRotationRef.current.y += userRotationRef.current.vy;
      userRotationRef.current.vx *= 0.92;
      userRotationRef.current.vy *= 0.92;

      // 4. SCULPTURE ROTATION & DEFORMATION
      const autoRotY = elapsed * 0.25 * spd;
      const autoRotX = Math.sin(elapsed * 0.15 * spd) * 0.3;

      sculptureMesh.rotation.y = autoRotY + userRotationRef.current.x + p * 1.5;
      sculptureMesh.rotation.x = autoRotX + userRotationRef.current.y + p * 0.6;
      sculptureMesh.rotation.z = Math.cos(elapsed * 0.2) * 0.15;

      // Inner lattice counter-rotation
      innerLattice.rotation.y = -elapsed * 0.4;
      innerLattice.rotation.x = elapsed * 0.25;

      // Wireframe toggle & opacity modulation
      wireframeMat.opacity = wireframeRef.current ? 0.7 : 0.22;
      sculptureMaterial.wireframe = wireframeRef.current && activeSceneRef.current === 3;

      // Morphing vertex displacement calculation
      const deformationScale = deformationRef.current * (0.12 + Math.sin(p * Math.PI) * 0.18);
      const currentPos = posAttr.array as Float32Array;

      for (let i = 0; i < currentPos.length; i += 3) {
        const ox = initialPositions[i];
        const oy = initialPositions[i + 1];
        const oz = initialPositions[i + 2];

        // Procedural noise approximation wave
        const wave =
          Math.sin(ox * 3.0 + elapsed * 1.8 * spd) *
          Math.cos(oy * 3.0 + elapsed * 1.4 * spd) *
          Math.sin(oz * 2.5 + elapsed * 0.9);

        const displacement = 1 + wave * deformationScale;
        currentPos[i] = ox * displacement;
        currentPos[i + 1] = oy * displacement;
        currentPos[i + 2] = oz * displacement;
      }
      posAttr.needsUpdate = true;
      baseGeometry.computeVertexNormals();

      // Material color & reflectivity shift per scene
      if (p <= 1) {
        sculptureMaterial.color.setHex(0x111116);
        sculptureMaterial.metalness = 0.85;
        sculptureMaterial.roughness = 0.18;
      } else if (p <= 2) {
        // Scene 2: Resonance - mercury sheen
        sculptureMaterial.color.setHex(0x181a24);
        sculptureMaterial.metalness = 0.92;
        sculptureMaterial.roughness = 0.12;
      } else if (p <= 3) {
        // Scene 3: Morphic Phase - iridescent high contrast
        sculptureMaterial.color.setHex(0x22242f);
        sculptureMaterial.metalness = 0.98;
        sculptureMaterial.roughness = 0.08;
      } else {
        // Scene 4 & 5: Crystalline dispersion
        sculptureMaterial.color.setHex(0x15161d);
        sculptureMaterial.metalness = 0.8;
        sculptureMaterial.roughness = 0.25;
      }

      // 5. PARTICLE SWARM MOTION & SHOCKWAVE DISPERSION
      const pPositions = particleGeo.attributes.position.array as Float32Array;

      let shockwaveForce = 0;
      if (shockwaveTriggerRef.current) {
        const timeSince = (performance.now() - shockwaveTriggerRef.current) / 1000;
        if (timeSince < 1.2) {
          shockwaveForce = Math.sin((timeSince / 1.2) * Math.PI) * 1.8;
        } else {
          shockwaveTriggerRef.current = null;
        }
      }

      // Finale scene expansion coefficient
      const finaleExpansion = p > 3 ? (p - 3) * 2.2 : 0;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const bx = particleBasePositions[idx];
        const by = particleBasePositions[idx + 1];
        const bz = particleBasePositions[idx + 2];

        // Harmonic particle orbit
        const pAngle = elapsed * 0.15 * spd + (i % 50) * 0.1;
        const cosA = Math.cos(pAngle);
        const sinA = Math.sin(pAngle);

        let px = bx * cosA - bz * sinA;
        let py = by + Math.sin(elapsed * 0.6 + i) * 0.15;
        let pz = bx * sinA + bz * cosA;

        // Apply Shockwave
        if (shockwaveForce > 0) {
          const dist = Math.sqrt(px * px + py * py + pz * pz);
          const push = (shockwaveForce / (dist + 0.5)) * 0.8;
          px += (px / dist) * push;
          py += (py / dist) * push;
          pz += (pz / dist) * push;
        }

        // Apply Finale expansion
        if (finaleExpansion > 0) {
          px *= 1 + finaleExpansion;
          py *= 1 + finaleExpansion;
          pz *= 1 + finaleExpansion;
        }

        pPositions[idx] = px;
        pPositions[idx + 1] = py;
        pPositions[idx + 2] = pz;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Render Three.js frame
      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      // Disposal
      baseGeometry.dispose();
      sculptureMaterial.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onShockwave]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => onHover3D(true)}
      onMouseLeave={() => onHover3D(false)}
      className="fixed inset-0 z-0 pointer-events-auto overflow-hidden bg-[#030305]"
    />
  );
};
