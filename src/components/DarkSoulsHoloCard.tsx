import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface DarkSoulsHoloCardProps {
  variant?: 'cindermane' | 'ashen-one' | string;
  cardName?: string;
  characterTitle?: string;
  onClose?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function DarkSoulsHoloCard({
  variant = 'cindermane',
  cardName = 'CLAIRE',
  characterTitle = 'THE ASHEN WARRIOR · FA MULAN',
  onClose,
  onContinue,
  className = '',
}: DarkSoulsHoloCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isFlippedRef = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [interactionHint, setInteractionHint] = useState(true);

  // Animation & 3D state refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const currentRotationRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const targetScaleRef = useRef(1);
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lightPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const spotLightRef = useRef<THREE.PointLight | null>(null);
  const holoMaterialFrontRef = useRef<THREE.ShaderMaterial | null>(null);
  const holoMaterialBackRef = useRef<THREE.ShaderMaterial | null>(null);
  const embersRef = useRef<THREE.Points | null>(null);

  // Helper to create front card texture
  const createFrontCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Dark obsidian textured background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1440);
    bgGrad.addColorStop(0, '#090d14');
    bgGrad.addColorStop(0.3, '#0e141e');
    bgGrad.addColorStop(0.7, '#120d0f');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1440);

    // Subtle dark texture & grain
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = `rgba(255, 230, 200, ${Math.random() * 0.035})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1440, 2, 2);
    }

    // Outer intricate ornate gold border
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c9a24a';
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e6c875';
    ctx.strokeRect(46, 46, 1024 - 92, 1440 - 92);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(212, 56, 38, 0.6)';
    ctx.strokeRect(54, 54, 1024 - 108, 1440 - 108);

    // Corner ornate filigree brackets
    const drawCornerBracket = (x: number, y: number, flipX: number, flipY: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flipX, flipY);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(44, 0);
      ctx.lineTo(44, 14);
      ctx.lineTo(14, 14);
      ctx.lineTo(14, 44);
      ctx.lineTo(0, 44);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#f03828';
      ctx.beginPath();
      ctx.arc(22, 22, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCornerBracket(46, 46, 1, 1);
    drawCornerBracket(1024 - 46, 46, -1, 1);
    drawCornerBracket(46, 1440 - 46, 1, -1);
    drawCornerBracket(1024 - 46, 1440 - 46, -1, -1);
    ctx.restore();

    // Top Header Banner - Card Name "CLAIRE"
    ctx.save();
    const bannerGrad = ctx.createLinearGradient(70, 70, 1024 - 70, 160);
    bannerGrad.addColorStop(0, 'rgba(15, 20, 28, 0.95)');
    bannerGrad.addColorStop(0.5, 'rgba(32, 18, 20, 0.95)');
    bannerGrad.addColorStop(1, 'rgba(15, 20, 28, 0.95)');
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(70, 70, 1024 - 140, 96);
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 70, 1024 - 140, 96);

    // Character Card Name: "CLAIRE"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 48px "Cinzel", "Times New Roman", serif';
    ctx.letterSpacing = '10px';

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(cardName, 512 + 2, 118 + 2);

    // Gold metallic text gradient
    const nameGrad = ctx.createLinearGradient(0, 90, 0, 145);
    nameGrad.addColorStop(0, '#ffffff');
    nameGrad.addColorStop(0.3, '#f7df94');
    nameGrad.addColorStop(0.6, '#d4af37');
    nameGrad.addColorStop(1, '#9b7824');
    ctx.fillStyle = nameGrad;
    ctx.fillText(cardName, 512, 118);

    // Subtitle badge
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillStyle = '#ff826e';
    ctx.fillText(characterTitle, 512, 148);
    ctx.restore();

    // Central Artwork Frame
    const artX = 70;
    const artY = 186;
    const artW = 1024 - 140;
    const artH = 860;

    // Artwork inner shadow & frame
    ctx.save();
    ctx.fillStyle = '#060a0f';
    ctx.fillRect(artX, artY, artW, artH);
    ctx.strokeStyle = 'rgba(201, 162, 74, 0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(artX, artY, artW, artH);

    // Deep artistic background for the artwork
    const artBg = ctx.createRadialGradient(512, artY + 360, 40, 512, artY + 400, 600);
    artBg.addColorStop(0, '#2d1416');
    artBg.addColorStop(0.4, '#1b1218');
    artBg.addColorStop(0.8, '#0d1017');
    artBg.addColorStop(1, '#05070a');
    ctx.fillStyle = artBg;
    ctx.fillRect(artX, artY, artW, artH);

    // Moon / Sun halo in artwork background
    const moonGrad = ctx.createRadialGradient(512, artY + 220, 10, 512, artY + 220, 200);
    moonGrad.addColorStop(0, 'rgba(255, 120, 90, 0.7)');
    moonGrad.addColorStop(0.5, 'rgba(224, 35, 28, 0.35)');
    moonGrad.addColorStop(1, 'rgba(224, 35, 28, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(512, artY + 220, 200, 0, Math.PI * 2);
    ctx.fill();

    // Ancient Chinese Gate Silhouette in background
    ctx.strokeStyle = 'rgba(255, 180, 140, 0.25)';
    ctx.lineWidth = 2;
    // Pavilion eaves
    ctx.beginPath();
    ctx.moveTo(340, artY + 180);
    ctx.quadraticCurveTo(512, artY + 140, 684, artY + 180);
    ctx.stroke();

    // Chinese Seal watermark in art background: "花木兰"
    ctx.font = '400 96px "Cinzel", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(224, 35, 28, 0.12)';
    ctx.fillText('花木兰', 512, artY + 440);

    // Ornate banner ribbons in artwork
    ctx.strokeStyle = 'rgba(201, 162, 74, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(artX + 16, artY + 16, artW - 32, artH - 32);
    ctx.restore();

    // Bottom Stats & Lore Section
    const statsY = 1066;
    const statsH = 310;

    // Stat banner background
    ctx.save();
    const statBg = ctx.createLinearGradient(0, statsY, 0, statsY + statsH);
    statBg.addColorStop(0, 'rgba(12, 17, 24, 0.95)');
    statBg.addColorStop(1, 'rgba(6, 8, 12, 0.98)');
    ctx.fillStyle = statBg;
    ctx.fillRect(70, statsY, 1024 - 140, statsH);
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, statsY, 1024 - 140, statsH);

    // Lore text quote
    ctx.font = 'italic 18px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dfe7e0';
    ctx.fillText('“Honor asked for a son. Courage answered with Mulan.”', 512, statsY + 44);

    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#8e9da8';
    ctx.letterSpacing = '1px';
    ctx.fillText('Cindermane Variant · Soul of Ancient Vermilion · Born of Fire & filial oath', 512, statsY + 74);

    // Horizontal separator
    ctx.strokeStyle = 'rgba(201, 162, 74, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, statsY + 98);
    ctx.lineTo(1024 - 110, statsY + 98);
    ctx.stroke();

    // 3 Stat Boxes
    const drawStatBox = (x: number, label: string, val: string, iconColor: string) => {
      ctx.save();
      ctx.fillStyle = 'rgba(20, 26, 36, 0.8)';
      ctx.fillRect(x, statsY + 120, 240, 110);
      ctx.strokeStyle = 'rgba(201, 162, 74, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, statsY + 120, 240, 110);

      ctx.font = 'bold 12px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.fillText(label, x + 120, statsY + 150);

      ctx.font = '900 32px "Cinzel", serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(val, x + 120, statsY + 195);
      ctx.restore();
    };

    drawStatBox(110, 'ATK · CINDER JIAN', '9,450', '#ff826e');
    drawStatBox(392, 'DEF · LAMELLAR', '8,800', '#f7df94');
    drawStatBox(674, 'VALOR · FA FAMILY', '∞', '#7fd3a6');

    // Bottom Footer Meta
    ctx.font = '11px -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = 'rgba(223, 231, 224, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText('THREEUI · HOLO ED. #001', 110, statsY + 275);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#c9a24a';
    ctx.fillText('MYTHIC WARRIOR FOIL', 1024 - 110, statsY + 275);
    ctx.restore();

    return canvas;
  }, [cardName, characterTitle]);

  // Helper to create back card texture with MULAN EMBLEM
  const createBackCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Deep cosmic / obsidian gradient
    const bgGrad = ctx.createRadialGradient(512, 720, 60, 512, 720, 800);
    bgGrad.addColorStop(0, '#151b24');
    bgGrad.addColorStop(0.5, '#0b0f15');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1440);

    // Ornate gold border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c9a24a';
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e6c875';
    ctx.strokeRect(46, 46, 1024 - 92, 1440 - 92);

    // Concentric celestial rune circles
    ctx.save();
    ctx.translate(512, 720);

    // Outer intricate rune ring
    ctx.strokeStyle = 'rgba(201, 162, 74, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 410, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(201, 162, 74, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 395, 0, Math.PI * 2);
    ctx.stroke();

    // 8-point imperial star geometry
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.strokeStyle = 'rgba(201, 162, 74, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 390);
      ctx.stroke();

      ctx.fillStyle = '#c9a24a';
      ctx.beginPath();
      ctx.arc(0, 390, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer vermilion aura glow
    const sealAura = ctx.createRadialGradient(0, 0, 160, 0, 0, 320);
    sealAura.addColorStop(0, 'rgba(240, 56, 40, 0.45)');
    sealAura.addColorStop(0.7, 'rgba(180, 30, 20, 0.15)');
    sealAura.addColorStop(1, 'rgba(180, 30, 20, 0)');
    ctx.fillStyle = sealAura;
    ctx.beginPath();
    ctx.arc(0, 0, 320, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // REAR MULAN EMBLEM (Zhang / Mulan Seal)
    // ==========================================
    // Vermilion Imperial Seal Disc
    const sealGrad = ctx.createRadialGradient(0, -30, 20, 0, 0, 220);
    sealGrad.addColorStop(0, '#f24838');
    sealGrad.addColorStop(0.65, '#c91a14');
    sealGrad.addColorStop(1, '#820c08');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 210, 0, Math.PI * 2);
    ctx.fill();

    // Inner gold rim
    ctx.strokeStyle = '#f5b550';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 202, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 230, 180, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 192, 0, Math.PI * 2);
    ctx.stroke();

    // Chinese "章" / Mulan Seal Geometry in Pale Ivory Bone (#dfe7e0)
    ctx.fillStyle = '#dfe7e0';
    ctx.strokeStyle = '#dfe7e0';
    ctx.save();
    ctx.scale(5.2, 5.2);

    // Top Crest of 立
    ctx.beginPath();
    ctx.arc(0, -22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Top Horizontal Bar of 立
    ctx.fillRect(-15, -17, 30, 3.4);

    // Left & Right slanted inner strokes of 立
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -13);
    ctx.lineTo(-12, -7);
    ctx.moveTo(8, -13);
    ctx.lineTo(12, -7);
    ctx.stroke();

    // Lower broad base horizontal bar of 立
    ctx.fillRect(-20, -5, 40, 3.4);

    // Lower character: The Box (日)
    ctx.lineWidth = 3.2;
    ctx.strokeRect(-13, 2, 26, 15);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-11, 9.5);
    ctx.lineTo(11, 9.5);
    ctx.stroke();

    // Downward Cross Bar (十)
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(0, 17);
    ctx.lineTo(0, 27);
    ctx.stroke();
    ctx.fillRect(-16, 21, 32, 3.2);

    ctx.restore();

    // Top and bottom banner texts around seal
    ctx.restore();

    // Top Brand Text
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 24px "Cinzel", serif';
    ctx.letterSpacing = '10px';
    ctx.fillStyle = '#c9a24a';
    ctx.fillText('THE LEGEND OF MULAN', 512, 140);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = '#8e9da8';
    ctx.fillText('DARKSOUULS HOLO CARD · CINDERMANE', 512, 175);

    // Bottom Brand Text
    ctx.font = '900 24px "Cinzel", serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#c9a24a';
    ctx.fillText('FA CLAN SACRED EMBLEM', 512, 1310);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = '#8e9da8';
    ctx.fillText('FLAME · LOYALTY · BRAVERY · TRUE', 512, 1345);
    ctx.restore();

    return canvas;
  }, []);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffa250, 4.5, 25);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    spotLightRef.current = pointLight;

    const rimLight = new THREE.PointLight(0x40a0ff, 2.5, 20);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // 4. Card Geometry & Group
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    // Create Front and Back Textures
    const frontCanvas = createFrontCanvas();
    const backCanvas = createBackCanvas();

    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.generateMipmaps = true;
    frontTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.generateMipmaps = true;
    backTexture.minFilter = THREE.LinearMipmapLinearFilter;

    // Asynchronously overlay real Mulan image onto the front texture
    const mulanImg = new Image();
    mulanImg.crossOrigin = 'anonymous';
    mulanImg.onload = () => {
      const ctx = frontCanvas.getContext('2d');
      if (ctx) {
        ctx.save();
        const artX = 70;
        const artY = 186;
        const artW = 1024 - 140;
        const artH = 860;
        ctx.drawImage(mulanImg, artX, artY, artW, artH);

        // Add subtle flame gradient over artwork edges
        const overlayGrad = ctx.createLinearGradient(0, artY + artH - 240, 0, artY + artH);
        overlayGrad.addColorStop(0, 'rgba(10, 14, 20, 0)');
        overlayGrad.addColorStop(1, 'rgba(6, 9, 14, 0.9)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(artX, artY + artH - 240, artW, 240);

        // Re-stroke inner border
        ctx.strokeStyle = 'rgba(201, 162, 74, 0.85)';
        ctx.lineWidth = 3;
        ctx.strokeRect(artX, artY, artW, artH);
        ctx.restore();

        frontTexture.needsUpdate = true;
      }
    };
    mulanImg.src = '/landing-pages/secret-pathways-assets/mulan-card-01-calling.jpg';

    // 5. Holographic Shader Material
    const holoVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const holoFragmentShader = `
      uniform sampler2D tDiffuse;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uFoilIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      // Rainbow spectral color calculation
      vec3 rainbow(float t) {
        return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Pointer distance on card
        float distToPointer = distance(vUv, uPointer);

        // Fresnel edge shine
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

        // Holographic diffraction grating
        float holoFactor = sin((vUv.x * 6.0 + vUv.y * 8.0) * 3.14159 + uPointer.x * 4.0 - uPointer.y * 3.0 + uTime * 0.4);
        holoFactor += dot(normal, viewDir) * 2.0;

        vec3 holoRainbow = rainbow(holoFactor * 0.4 + vUv.y * 0.6);

        // Specular highlight from pointer
        float spec = pow(max(1.0 - distToPointer * 1.8, 0.0), 4.0);

        // Foil shines strongly on gold/bright elements (determined by luminance of base)
        float lum = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
        float foilMask = smoothstep(0.35, 0.85, lum) * 1.2;

        vec3 finalColor = baseColor.rgb;
        finalColor += holoRainbow * (fresnel * 0.65 + foilMask * 0.5) * uFoilIntensity;
        finalColor += vec3(1.0, 0.85, 0.6) * spec * 0.55;
        finalColor += vec3(1.0, 0.35, 0.15) * fresnel * 0.25;

        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `;

    const holoFrontMaterial = new THREE.ShaderMaterial({
      vertexShader: holoVertexShader,
      fragmentShader: holoFragmentShader,
      uniforms: {
        tDiffuse: { value: frontTexture },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uTime: { value: 0 },
        uFoilIntensity: { value: 0.85 },
      },
      side: THREE.FrontSide,
    });
    holoMaterialFrontRef.current = holoFrontMaterial;

    const holoBackMaterial = new THREE.ShaderMaterial({
      vertexShader: holoVertexShader,
      fragmentShader: holoFragmentShader,
      uniforms: {
        tDiffuse: { value: backTexture },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uTime: { value: 0 },
        uFoilIntensity: { value: 0.95 },
      },
      side: THREE.BackSide,
    });
    holoMaterialBackRef.current = holoBackMaterial;

    // Card dimensions: width 2.6, height 3.65, thickness 0.04
    const cardWidth = 2.65;
    const cardHeight = 3.72;
    const cardThickness = 0.035;

    // Front Mesh
    const frontGeom = new THREE.PlaneGeometry(cardWidth, cardHeight, 32, 32);
    const frontMesh = new THREE.Mesh(frontGeom, holoFrontMaterial);
    frontMesh.position.z = cardThickness / 2;
    cardGroup.add(frontMesh);

    // Back Mesh (rotated 180° around Y)
    const backGeom = new THREE.PlaneGeometry(cardWidth, cardHeight, 32, 32);
    const backMesh = new THREE.Mesh(backGeom, holoBackMaterial);
    backMesh.position.z = -cardThickness / 2;
    backMesh.rotation.y = Math.PI;
    cardGroup.add(backMesh);

    // Metallic Edge Band
    const edgeGeom = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness - 0.002);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x9b7824,
      metalness: 0.9,
      roughness: 0.3,
    });
    const edgeMesh = new THREE.Mesh(edgeGeom, edgeMat);
    cardGroup.add(edgeMesh);

    // 6. Floating Drifting Embers Particles
    const emberCount = 140;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 8;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      emberSpeeds[i * 3] = (Math.random() - 0.5) * 0.015;
      emberSpeeds[i * 3 + 1] = 0.01 + Math.random() * 0.025; // drift upward
      emberSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    const emberGeometry = new THREE.BufferGeometry();
    emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    // Circular ember texture
    const emberCanvas = document.createElement('canvas');
    emberCanvas.width = 64;
    emberCanvas.height = 64;
    const emberCtx = emberCanvas.getContext('2d');
    if (emberCtx) {
      const grad = emberCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 230, 160, 1)');
      grad.addColorStop(0.3, 'rgba(255, 120, 40, 0.85)');
      grad.addColorStop(0.7, 'rgba(210, 40, 20, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      emberCtx.fillStyle = grad;
      emberCtx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(emberCanvas);

    const emberMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: emberTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embers = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(embers);
    embersRef.current = embers;

    // 7. Interactive Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth damping for card tilt and rotation
      const cur = currentRotationRef.current;
      const target = targetRotationRef.current;

      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      cur.z += (target.z - cur.z) * 0.08;

      if (cardGroupRef.current) {
        cardGroupRef.current.rotation.x = cur.x;
        cardGroupRef.current.rotation.y = cur.y;
        cardGroupRef.current.rotation.z = cur.z;

        // Scale lerp
        const currentScale = cardGroupRef.current.scale.x;
        const nextScale = currentScale + (targetScaleRef.current - currentScale) * 0.1;
        cardGroupRef.current.scale.set(nextScale, nextScale, nextScale);

        // Subtle organic breathing float
        cardGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.06;
      }

      // Update shader uniforms
      if (holoMaterialFrontRef.current) {
        holoMaterialFrontRef.current.uniforms.uTime.value = elapsed;
        holoMaterialFrontRef.current.uniforms.uPointer.value.set(
          lightPointerRef.current.x,
          lightPointerRef.current.y
        );
      }
      if (holoMaterialBackRef.current) {
        holoMaterialBackRef.current.uniforms.uTime.value = elapsed;
        holoMaterialBackRef.current.uniforms.uPointer.value.set(
          1.0 - lightPointerRef.current.x,
          lightPointerRef.current.y
        );
      }

      // Update spot light position relative to pointer
      if (spotLightRef.current) {
        const lx = (lightPointerRef.current.x - 0.5) * 5;
        const ly = -(lightPointerRef.current.y - 0.5) * 6;
        spotLightRef.current.position.set(lx, ly, 4);
      }

      // Update embers
      if (embersRef.current) {
        const posAttr = embersRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let i = 0; i < emberCount; i++) {
          positions[i * 3 + 1] += emberSpeeds[i * 3 + 1];
          positions[i * 3] += emberSpeeds[i * 3] + Math.sin(elapsed + i) * 0.003;
          positions[i * 3 + 2] += emberSpeeds[i * 3 + 2];

          // Wrap around top
          if (positions[i * 3 + 1] > 4) {
            positions[i * 3 + 1] = -4;
            positions[i * 3] = (Math.random() - 0.5) * 8;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      emberTexture.dispose();
    };
  }, [createFrontCanvas, createBackCanvas]);

  // Pointer Movement (Hover Tilt & Shader Lighting)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const mount = mountRef.current;
    if (!mount) return;

    const rect = mount.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    lightPointerRef.current = { x, y };

    if (!isDraggingRef.current) {
      // Normal pointer tilt when hovering
      const tiltX = (y - 0.5) * -0.45;
      const baseFlipY = isFlippedRef.current ? Math.PI : 0;
      const tiltY = baseFlipY + (x - 0.5) * 0.55;

      targetRotationRef.current = {
        x: tiltX,
        y: tiltY,
        z: (x - 0.5) * -0.15,
      };
    } else {
      // Dragging to rotate
      const dx = e.clientX - previousPointerRef.current.x;
      const dy = e.clientY - previousPointerRef.current.y;

      targetRotationRef.current.y += dx * 0.012;
      targetRotationRef.current.x += dy * 0.012;

      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousPointerRef.current = { x: e.clientX, y: e.clientY };
    setInteractionHint(false);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Flip Toggle ('F' or double click)
  const toggleFlip = useCallback(() => {
    isFlippedRef.current = !isFlippedRef.current;
    setIsFlipped(isFlippedRef.current);
    targetRotationRef.current.y = isFlippedRef.current ? Math.PI : 0;
    targetRotationRef.current.x = 0;
    targetRotationRef.current.z = 0;
  }, []);

  // Reset ('R')
  const handleReset = useCallback(() => {
    isFlippedRef.current = false;
    setIsFlipped(false);
    targetRotationRef.current = { x: 0, y: 0, z: 0 };
    targetScaleRef.current = 1;
    setZoomLevel(1);
  }, []);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    const newScale = Math.min(Math.max(targetScaleRef.current + delta, 0.75), 1.45);
    targetScaleRef.current = newScale;
    setZoomLevel(Number(newScale.toFixed(2)));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlip();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleFlip, handleReset]);

  return (
    <div
      className={`relative w-full h-full select-none touch-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDoubleClick={toggleFlip}
      onWheel={handleWheel}
      role="region"
      aria-label="Interactive ThreeUI Dark Souls Holo Card"
      tabIndex={0}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Ambient Atmosphere Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,7,10,0.85)_100%)]" />

      {/* Desktop / Mobile Interaction Badges */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex flex-col gap-1.5 text-xs text-[#dfe7e0]/70 font-mono tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f03828] animate-pulse" />
          <span className="text-[#c9a24a] font-bold tracking-widest uppercase">
            HOLO ARCHIVE // {variant.toUpperCase()}
          </span>
        </div>
        <div className="text-[11px] text-[#dfe7e0]/50 uppercase">
          CARD IDENTITY: <b className="text-white font-normal">{cardName}</b> · MULAN EMBLEM
        </div>
      </div>

      {/* Flip indicator button (quick touch target) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={toggleFlip}
          className="px-4 py-2 min-h-[44px] min-w-[44px] rounded-full border border-[#c9a24a]/40 bg-[#090d14]/80 backdrop-blur-md text-[#dfe7e0] text-xs uppercase tracking-widest hover:border-[#c9a24a] hover:text-[#f7df94] active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          aria-label={isFlipped ? "Flip to Front" : "Flip to Rear Mulan Emblem"}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v-3a8 8 0 0 1 14.93-4M20 12v3a8 8 0 0 1-14.93 4" />
            <polyline points="20 4 20 10 14 10" />
            <polyline points="4 20 4 14 10 14" />
          </svg>
          <span>{isFlipped ? 'View Front Face' : 'Flip to Mulan Emblem'}</span>
        </button>
      </div>

      {/* Subtle Interaction Guide Bar at Bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex justify-between items-center text-[10.5px] uppercase tracking-widest text-[#dfe7e0]/50 font-mono">
        <div className="hidden sm:flex items-center gap-4">
          <span>DRAG TO ROTATE</span>
          <span>·</span>
          <span>DOUBLE-CLICK OR [F] TO FLIP</span>
          <span>·</span>
          <span>SCROLL TO ZOOM</span>
          <span>·</span>
          <span>[R] RESET</span>
        </div>
        <div className="sm:hidden text-center w-full">
          TOUCH & DRAG TO TILT · TAP BUTTON TO FLIP
        </div>
        <div className="hidden sm:block text-[#c9a24a]/75">
          SCALE: {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
}

export default DarkSoulsHoloCard;
