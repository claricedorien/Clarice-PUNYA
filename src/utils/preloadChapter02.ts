/**
 * Preload Chapter 02 (ThreeUI Chinese Tower Landscape) during browser idle time.
 * This ensures clicking Chapter 02 enters the fullscreen experience almost instantaneously
 * without long blank waits or heavy offscreen render penalties.
 */

let isPreloaded = false;

export function preloadChapter02(): void {
  if (isPreloaded || typeof window === 'undefined') return;
  isPreloaded = true;

  const runPreload = () => {
    try {
      // 1. Prefetch the iframe document so browser caches HTML & Three.js bundle
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/japanese-tower.html?country=china';
      link.as = 'document';
      document.head.appendChild(link);

      // Warm up fetch cache in background without blocking main thread
      fetch('/japanese-tower.html?country=china', { mode: 'no-cors' }).catch(() => {
        // Ignore offline / caching quirks
      });

      // 2. Dynamic import prefetch of the React wrapper component
      import('../shaders/japanese-tower/JapaneseTowerLandscape').catch(() => {});
      import('../components/Chapter02Experience').catch(() => {});
    } catch {
      // Ignore background prefetch errors
    }
  };

  // Schedule during browser idle time or fallback to 800ms timeout
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
      runPreload,
      { timeout: 2000 }
    );
  } else {
    setTimeout(runPreload, 800);
  }
}
