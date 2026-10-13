import React, { useEffect, useRef, useState } from 'react';

/**
 * Universal Custom Cursor
 * - Small central dot: 6-8px
 * - Outer subtle ring: 24-32px
 * - Contrasting warm ivory / white (#F3F0EA, ring rgba(243,240,234,0.45))
 * - High z-index (99999) above all overlays
 * - High performance: requestAnimationFrame + refs (no react state on mousemove)
 * - Safe fallback: if not supported or on touch, defaults cleanly without hiding system cursor
 */

export type CursorHoverType = 'default' | 'button' | 'close' | 'continue' | 'interactive';

class CursorController {
  private listeners: ((type: CursorHoverType, label?: string) => void)[] = [];
  private currentType: CursorHoverType = 'default';
  private currentLabel: string = '';

  public subscribe(fn: (type: CursorHoverType, label?: string) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public set(type: CursorHoverType, label: string = '') {
    if (this.currentType === type && this.currentLabel === label) return;
    this.currentType = type;
    this.currentLabel = label;
    this.listeners.forEach((fn) => fn(type, label));
  }

  public setMode(mode: string, label: string = '') {
    const mapped: CursorHoverType = mode === 'hidden' ? 'default' : (mode.includes('hover') ? 'interactive' : 'default');
    this.set(mapped, label);
  }
}

export const cursorController = new CursorController();
export const cursorManager = cursorController;

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Check fine pointer
    const media = window.matchMedia('(pointer: fine)');
    setIsFinePointer(media.matches);

    if (!media.matches) return;

    // Apply cursor:none to body safely now that custom cursor is active
    document.body.classList.add('has-custom-cursor');

    const mouse = { x: -100, y: -100, targetX: -100, targetY: -100 };
    const ring = { x: -100, y: -100 };
    let isVisible = false;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      // Zero-latency update for central dot
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
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

    // Dynamic element hover detection for interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input, textarea, [data-cursor]');
      if (interactive) {
        const text = interactive.getAttribute('data-cursor-label') || '';
        if (interactive.getAttribute('aria-label')?.toLowerCase().includes('close') || interactive.textContent?.toLowerCase().includes('close')) {
          cursorController.set('close', text || 'CLOSE');
        } else if (interactive.textContent?.toLowerCase().includes('continue') || interactive.textContent?.toLowerCase().includes('enter')) {
          cursorController.set('continue', text || 'NEXT');
        } else {
          cursorController.set('button', text);
        }
      } else {
        cursorController.set('default');
      }
    };

    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // Snappy trailing loop for outer ring
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      ring.x += (mouse.targetX - ring.x) * 0.38;
      ring.y += (mouse.targetY - ring.y) * 0.38;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
    };

    animId = requestAnimationFrame(renderLoop);

    const unsubscribe = cursorController.subscribe((type, label) => {
      const r = ringRef.current;
      const d = dotRef.current;
      const l = labelRef.current;
      if (!r || !d || !l) return;

      if (type === 'close') {
        r.style.width = '40px';
        r.style.height = '40px';
        r.style.marginLeft = '-20px';
        r.style.marginTop = '-20px';
        r.style.borderColor = 'rgba(255, 115, 96, 0.85)';
        r.style.backgroundColor = 'rgba(224, 35, 28, 0.12)';
        d.style.backgroundColor = '#ff7360';

        if (label) {
          l.textContent = label;
          l.style.opacity = '1';
        } else {
          l.style.opacity = '0';
        }
      } else if (type === 'continue') {
        r.style.width = '44px';
        r.style.height = '44px';
        r.style.marginLeft = '-22px';
        r.style.marginTop = '-22px';
        r.style.borderColor = 'rgba(201, 162, 74, 0.9)';
        r.style.backgroundColor = 'rgba(201, 162, 74, 0.12)';
        d.style.backgroundColor = '#f7df94';

        if (label) {
          l.textContent = label;
          l.style.opacity = '1';
        } else {
          l.style.opacity = '0';
        }
      } else if (type === 'button' || type === 'interactive') {
        r.style.width = '36px';
        r.style.height = '36px';
        r.style.marginLeft = '-18px';
        r.style.marginTop = '-18px';
        r.style.borderColor = 'rgba(243, 240, 234, 0.75)';
        r.style.backgroundColor = 'rgba(243, 240, 234, 0.08)';
        d.style.backgroundColor = '#F3F0EA';

        if (label) {
          l.textContent = label;
          l.style.opacity = '1';
        } else {
          l.style.opacity = '0';
        }
      } else {
        r.style.width = '26px';
        r.style.height = '26px';
        r.style.marginLeft = '-13px';
        r.style.marginTop = '-13px';
        r.style.borderColor = 'rgba(243, 240, 234, 0.45)';
        r.style.backgroundColor = 'transparent';
        d.style.backgroundColor = '#F3F0EA';
        l.style.opacity = '0';
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      document.removeEventListener('mouseover', onMouseOver);
      unsubscribe();
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Central responsive dot: 7px warm white */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[7px] h-[7px] -ml-[3.5px] -mt-[3.5px] rounded-full bg-[#F3F0EA] shadow-[0_0_8px_rgba(243,240,234,0.6)] pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      />

      {/* Outer subtle ring: 26px trailing smoothly */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[26px] h-[26px] -ml-[13px] -mt-[13px] rounded-full border border-[rgba(243,240,234,0.45)] pointer-events-none opacity-0 flex items-center justify-center transition-[width,height,margin,border-color,background-color] duration-200 ease-out"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        <span
          ref={labelRef}
          className="text-[9px] font-mono tracking-widest text-[#F3F0EA] uppercase font-semibold opacity-0 transition-opacity duration-200 pointer-events-none select-none"
        >
          OPEN
        </span>
      </div>
    </div>
  );
};
