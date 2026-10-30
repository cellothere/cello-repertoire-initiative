import { useEffect, useState } from 'react';

const COUNTRY_KEY = 'freeMusicCountry';

/**
 * The country whose copyright rules decide which public-domain pieces count as free: the visitor's own choice if
 * they made one, otherwise the country Vercel detects. Null means unknown, so only music free everywhere is shown.
 * Pass `enabled: false` to skip looking up the visitor's region until Free Music is actually needed.
 */
export function useFreeMusicCountry(enabled = true) {
  const [detected, setDetected] = useState<string | null>(null);
  // undefined = the visitor hasn't chosen; '' was saved for "every country".
  const [chosen, setChosen] = useState<string | null | undefined>(() => {
    try {
      const saved = typeof window === 'undefined' ? null : localStorage.getItem(COUNTRY_KEY);
      return saved === null ? undefined : saved || null;
    } catch {
      return undefined; // Storage can be unavailable (private windows); the detected country still works.
    }
  });

  useEffect(() => {
    if (!enabled) return;
    fetch('/api/region')
      .then((response) => (response.ok ? response.json() : { country: null }))
      .then((data: { country: string | null }) => setDetected(data.country))
      .catch(() => setDetected(null));
  }, [enabled]);

  const choose = (code: string | null) => {
    setChosen(code);
    try {
      localStorage.setItem(COUNTRY_KEY, code ?? '');
    } catch {
      // Not remembered across visits, but still applied now.
    }
  };

  return { country: chosen === undefined ? detected : chosen, detected, choose };
}
