import { useCallback, useEffect, useState } from 'react';

const TTL_MS = 10 * 60 * 1000;

interface Entry {
  promise: Promise<unknown>;
  value?: unknown;
  fetchedAt: number;
}

// Shared across pages for the whole session, so moving between pages that use the same
// catalogue data (e.g. Cello Music ↔ Featured Databases) doesn't refetch or flash a skeleton.
const cache = new Map<string, Entry>();

function freshEntry(url: string): Entry | undefined {
  const entry = cache.get(url);
  return entry && Date.now() - entry.fetchedAt < TTL_MS ? entry : undefined;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

export function fetchJson<T>(url: string): Promise<T> {
  const existing = freshEntry(url);
  if (existing) return existing.promise as Promise<T>;

  const entry: Entry = { fetchedAt: Date.now(), promise: Promise.resolve() };
  entry.promise = request<T>(url).then(
    (value) => {
      entry.value = value;
      return value;
    },
    (error) => {
      cache.delete(url);
      throw error;
    }
  );
  cache.set(url, entry);
  return entry.promise as Promise<T>;
}

interface Result<T> {
  key: string;
  data?: T;
  error?: Error;
}

/**
 * Fetch JSON for a component. Pass `null` to skip fetching. By default responses are shared
 * through an in-memory session cache; pass `{ cache: false }` for per-user data.
 */
export function useJson<T>(url: string | null, { cache: useCache = true }: { cache?: boolean } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = url ? `${url}#${attempt}` : null;
  const cached = url && useCache ? (freshEntry(url)?.value as T | undefined) : undefined;

  useEffect(() => {
    if (!url || !key) return;
    if (useCache && freshEntry(url)?.value !== undefined) return;
    let active = true;
    (useCache ? fetchJson<T>(url) : request<T>(url)).then(
      (data) => active && setResult({ key, data }),
      (error: Error) => active && setResult({ key, error })
    );
    return () => {
      active = false;
    };
  }, [url, key, useCache]);

  const current = result?.key === key ? result : null;
  const data = current?.data ?? cached;
  const error = current?.error ?? null;
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, error, loading: Boolean(url) && data === undefined && !error, retry };
}
