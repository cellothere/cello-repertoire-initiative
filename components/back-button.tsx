import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import { HiArrowLeft } from 'react-icons/hi2';

/*
 * How many pages deep the visitor is within this site in the current tab, so the back button only shows when going
 * back stays on the site. Next gives every history entry a `key` in history.state (a push makes a new one; replace,
 * back and forward keep theirs), and we remember each key's depth for the tab in sessionStorage, which also survives
 * a reload or a return from another site.
 */
const STORAGE_KEY = 'cri-history-depth';
let depths: Record<string, number> | null = null;
let current = 0;

const entryKey = (): string | undefined => window.history.state?.key;

function load() {
  if (depths) return depths;
  try {
    depths = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}') as Record<string, number>;
  } catch {
    depths = {};
  }
  return depths;
}

/** Records the entry we are now on: a known key keeps its depth; a new one is one deeper than where we came from. */
function settle(isFirst: boolean) {
  const map = load();
  const key = entryKey();
  if (!key) return;
  if (!(key in map)) {
    map[key] = isFirst ? 0 : current + 1;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Private mode or storage full: the depth still works until the tab is reloaded.
    }
  }
  current = map[key];
}

let started = false;
function snapshot() {
  if (!started) {
    started = true;
    settle(true);
  }
  return current;
}

/** Phones only: a round back button at the bottom left, mirroring the assistant button, once there is a page to go back to. */
export default function BackButton() {
  const router = useRouter();
  const depth = useSyncExternalStore(
    (onChange) => {
      // settle() is idempotent for a known entry, so it is safe however many times this runs per change.
      const changed = () => {
        settle(false);
        onChange();
      };
      router.events.on('routeChangeComplete', changed);
      return () => router.events.off('routeChangeComplete', changed);
    },
    snapshot,
    () => 0
  );

  if (depth === 0) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back to the previous page"
      className="reveal fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-95 md:hidden"
    >
      <HiArrowLeft className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
