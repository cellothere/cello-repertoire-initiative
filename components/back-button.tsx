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

/**
 * The back button at the left end of the phone tab bar (see mobile-tab-bar.tsx). On page 2 or later of a results list
 * (any page with a `page` query, e.g. Cello Music, search results, Featured Databases) it steps back one results page;
 * otherwise it goes back to the previous page on the site. It is only shown when one of those is possible.
 */
export default function BackButton({ className = '' }: { className?: string }) {
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

  const page = Number(router.query.page);
  const previousResultsPage = Number.isInteger(page) && page > 1 ? page - 1 : null;
  if (depth === 0 && previousResultsPage === null) return null;

  const goBack = () => {
    if (previousResultsPage === null) {
      router.back();
      return;
    }
    // The same kind of URL change the list's own page buttons make, so it reads the new page from the URL and
    // scrolls to the top of the results.
    const query = { ...router.query };
    if (previousResultsPage === 1) delete query.page;
    else query.page = String(previousResultsPage);
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={previousResultsPage === null ? 'Go back to the previous page' : `Back to results page ${previousResultsPage}`}
      className={`reveal flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-95 ${className}`}
    >
      <HiArrowLeft className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
