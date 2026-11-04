import { useEffect } from 'react';

/**
 * Feeds the pointer position to `.spotlight` cards (see globals.css) so their glow follows the pointer. One listener
 * for the whole site rather than one per card; it only writes to the card under the pointer, once per frame.
 */
export default function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      const event = last;
      const card = event?.target instanceof Element ? event.target.closest<HTMLElement>('.spotlight') : null;
      if (!event || !card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      last = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener('pointermove', move, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
