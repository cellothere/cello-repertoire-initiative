import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * "Read more" for a block of text clamped on phones (the cards on the Resource Catalog and Literature pages).
 * Attach `ref` to the text; `clamped` says whether the text really is cut (rechecked when the width changes), and
 * `toggle` glides between the clamped and full heights rather than jumping. Pass the text as `content` so the
 * check reruns when it changes.
 */
export function useClampToggle(content: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const fromHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const from = fromHeight.current;
    fromHeight.current = null;
    if (!el || from === null || typeof el.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A quick second tap: stop the first glide so the target height is the real one.
    el.getAnimations().forEach((animation) => animation.cancel());
    const to = el.getBoundingClientRect().height;
    el.animate([{ height: `${from}px`, overflow: 'hidden' }, { height: `${to}px`, overflow: 'hidden' }], {
      duration: 380,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }, [expanded]);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, content]);

  const toggle = () => {
    fromHeight.current = ref.current?.getBoundingClientRect().height ?? null;
    setExpanded((open) => !open);
  };

  return { ref, expanded, clamped, toggle };
}
