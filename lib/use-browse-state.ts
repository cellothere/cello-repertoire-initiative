import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { Instrument } from './instruments';
import {
  DEFAULT_BROWSE_STATE,
  browseStateToQuery,
  parseBrowseQuery,
  queryKey,
  type BrowseState,
} from './browse-state';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Browse state that mirrors the URL query string, so filtered views can be bookmarked and shared.
 * The URL is updated with `replace` (not `push`) so typing and filtering don't flood history.
 * `keepQuery` holds parameters the page itself owns (e.g. Featured Databases' `category`), kept when the URL is rewritten.
 */
export function useBrowseState(instrument: Instrument, keepQuery: Record<string, string> = {}) {
  const router = useRouter();
  const [state, setState] = useState<BrowseState>(DEFAULT_BROWSE_STATE);
  const [ready, setReady] = useState(false);
  // Key of the query we last wrote ourselves, to tell our own URL updates apart from navigation.
  const writtenKey = useRef<string | null>(null);
  const lastQ = useRef(state.q);

  // URL → state: on first load, and whenever the URL changes for another reason
  // (e.g. a search from the navbar while already on this page, or back/forward).
  useEffect(() => {
    if (!router.isReady) return;
    const parsed = parseBrowseQuery(router.query, instrument);
    const key = queryKey(browseStateToQuery(parsed));
    if (key === writtenKey.current) return;
    writtenKey.current = key;
    lastQ.current = parsed.q;
    setState(parsed);
    setReady(true);
  }, [router.isReady, router.query, instrument]);

  // State → URL.
  useEffect(() => {
    if (!ready) return;
    const browseQuery = browseStateToQuery(state);
    const key = queryKey(browseQuery);
    const query = { ...keepQuery, ...browseQuery };
    if (queryKey(query) === queryKey(router.query)) {
      writtenKey.current = key;
      return;
    }
    const typing = state.q !== lastQ.current;
    lastQ.current = state.q;
    const timer = setTimeout(
      () => {
        writtenKey.current = key;
        router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
      },
      typing ? SEARCH_DEBOUNCE_MS : 0
    );
    return () => clearTimeout(timer);
    // `router` is intentionally omitted: its identity changes on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready]);

  /** Apply a change. Filter and sort changes return to page 1 unless a page is given. */
  const update = useCallback((patch: Partial<BrowseState>, options: { keepPage?: boolean } = {}) => {
    setState((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? (options.keepPage ? prev.page : 1),
    }));
  }, []);

  return { state, update, ready };
}
