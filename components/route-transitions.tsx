import { useEffect, useRef, useState, type RefObject } from 'react';
import { useRouter } from 'next/router';

const pathOf = (url: string) => url.split(/[?#]/)[0];
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Page-change motion for the whole site:
 * - a thin brand-gradient bar across the top while a page loads. It waits a moment before
 *   appearing, so instant (prefetched) changes don't flash it, then creeps toward the end and
 *   finishes with a quick fill and fade;
 * - the new page fades up a few pixels into place.
 * Filter and sort changes only touch the query string, so they get neither.
 */
export default function RouteTransitions({ contentRef }: { contentRef: RefObject<HTMLElement | null> }) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const timers = useRef<{ show?: number; trickle?: number; hide?: number }>({});

  useEffect(() => {
    const t = timers.current;
    const clear = () => {
      window.clearTimeout(t.show);
      window.clearInterval(t.trickle);
      window.clearTimeout(t.hide);
    };

    const start = (url: string, { shallow }: { shallow: boolean }) => {
      if (shallow || pathOf(url) === window.location.pathname) return;
      clear();
      t.show = window.setTimeout(() => {
        setProgress(0.08);
        // Each step covers part of what's left, so the bar slows but never quite arrives.
        t.trickle = window.setInterval(() => setProgress((p) => (p === null ? p : p + (0.9 - p) * 0.12)), 260);
      }, 120);
    };

    const finish = () => {
      window.clearTimeout(t.show);
      window.clearInterval(t.trickle);
      setProgress((p) => {
        if (p === null) return p;
        t.hide = window.setTimeout(() => setProgress(null), 380);
        return 1;
      });
    };

    const complete = (url: string, { shallow }: { shallow: boolean }) => {
      finish();
      const el = contentRef.current;
      if (shallow || !el || prefersReducedMotion() || typeof el.animate !== 'function') return;
      if (pathOf(url) === lastPath.current) return;
      lastPath.current = pathOf(url);
      el.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    };

    const lastPath = { current: pathOf(router.asPath) };
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', complete);
    router.events.on('routeChangeError', finish);
    return () => {
      clear();
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', complete);
      router.events.off('routeChangeError', finish);
    };
    // The listeners only need setting up once; the starting path is read on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events, contentRef]);

  return (
    <div
      className="route-progress"
      aria-hidden="true"
      style={{
        transform: `scaleX(${progress ?? 0})`,
        opacity: progress === null || progress >= 1 ? 0 : 1,
        transitionDelay: progress !== null && progress >= 1 ? '0ms, 180ms' : undefined,
      }}
    />
  );
}
