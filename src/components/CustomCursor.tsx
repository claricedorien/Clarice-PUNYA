import React, { useEffect, useRef } from 'react';

/**
 * The Living Library Custom Cursor
 * - Zero-latency dot
 * - Snappy smooth trailing ring
 * - Dynamic "ENTER" / "VIEW STORY" badge on artefact hover
 * - Zero React re-renders on mouse movement
 */

type CursorMode = 'default' | 'hover-story' | 'hover-nav' | 'hover-book' | 'hover-button' | 'hidden';

class CursorManager {
  private listeners: ((mode: CursorMode, label?: string) => void)[] = [];
  private currentMode: CursorMode = 'default';
  private currentLabel: string = '';

  public subscribe(fn: (mode: CursorMode, label?: string) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public setMode(mode: CursorMode, label: string = '') {
    if (this.currentMode === mode && this.currentLabel === label) return;
    this.currentMode = mode;
    this.currentLabel = label;
    this.listeners.forEach((fn) => fn(mode, label));
  }

  public getMode() {
    return this.currentMode;
  }
}

export const cursorManager = new CursorManager();

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const mousePos = { x: -100, y: -100, targetX: -100, targetY: -100 };
    const ringPos = { x: -100, y: -100 };
    let isVisible = false;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      mousePos.targetX = e.clientX;
      mousePos.targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      // Fast update for real dot
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`;
      }
    };

    const onPointerLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const onPointerEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('pointerenter', onPointerEnter);

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      ringPos.x += (mousePos.targetX - ringPos.x) * 0.35;
      ringPos.y += (mousePos.targetY - ringPos.y) * 0.35;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      }
    };

    animId = requestAnimationFrame(renderLoop);

    const unsubscribe = cursorManager.subscribe((mode, label) => {
      const ring = ringRef.current;
      const dot = dotRef.current;
      const labelEl = labelRef.current;
      if (!ring || !dot || !labelEl) return;

      if (mode === 'hover-story' || mode === 'hover-book') {
        ring.style.width = '78px';
        ring.style.height = '78px';
        ring.style.marginLeft = '-39px';
        ring.style.marginTop = '-39px';
        ring.style.borderColor = 'rgba(201, 166, 107, 0.9)';
        ring.style.backgroundColor = 'rgba(201, 166, 107, 0.1)';
        ring.style.backdropFilter = 'blur(4px)';

        labelEl.textContent = label || 'ENTER';
        labelEl.style.opacity = '1';
        labelEl.style.transform = 'scale(1)';
        dot.style.opacity = '0';
      } else if (mode === 'hover-nav' || mode === 'hover-button') {
        ring.style.width = '42px';
        ring.style.height = '42px';
        ring.style.marginLeft = '-21px';
        ring.style.marginTop = '-21px';
        ring.style.borderColor = 'rgba(241, 238, 232, 0.6)';
        ring.style.backgroundColor = 'rgba(241, 238, 232, 0.05)';
        ring.style.backdropFilter = 'none';

        labelEl.style.opacity = '0';
        labelEl.style.transform = 'scale(0.8)';
        dot.style.opacity = '1';
      } else if (mode === 'hidden') {
        ring.style.opacity = '0';
        dot.style.opacity = '0';
      } else {
        ring.style.width = '24px';
        ring.style.height = '24px';
        ring.style.marginLeft = '-12px';
        ring.style.marginTop = '-12px';
        ring.style.borderColor = 'rgba(241, 238, 232, 0.35)';
        ring.style.backgroundColor = 'transparent';
        ring.style.backdropFilter = 'none';

        labelEl.style.opacity = '0';
        labelEl.style.transform = 'scale(0.8)';
        dot.style.opacity = '1';
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      unsubscribe();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Real cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#F1EEE8] shadow-sm shadow-[#F1EEE8] pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      />

      {/* Trailing smooth ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-6 h-6 -ml-3 -mt-3 rounded-full border border-white/40 pointer-events-none opacity-0 flex items-center justify-center transition-[width,height,margin,border-color,background-color] duration-200 ease-out"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        <span
          ref={labelRef}
          className="text-[10px] font-mono tracking-widest text-[#E8E1D5] uppercase font-semibold opacity-0 transition-all duration-200 pointer-events-none select-none scale-75"
        >
          ENTER
        </span>
      </div>
    </div>
  );
};
