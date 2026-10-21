import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Instrument } from '@/lib/instruments';

export interface SavedPiece {
  pieceId: number;
  instrument: Instrument;
  savedAt: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  savedPieces: SavedPiece[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  savePiece: (pieceId: number, instrument: Instrument) => Promise<void>;
  unsavePiece: (pieceId: number, instrument: Instrument) => Promise<void>;
  isPieceSaved: (pieceId: number, instrument: Instrument) => boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_SAVE_KEY = 'pendingSave';
const savedKey = (pieceId: number, instrument: string) => `${instrument}:${pieceId}`;

/** Remember a piece the visitor tried to save before signing in, so it can be saved afterwards. */
export function rememberPendingSave(pieceId: number, instrument: Instrument) {
  try {
    sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({ pieceId, instrument }));
  } catch {
    // Storage can be unavailable (private mode); the save is simply skipped.
  }
}

async function readError(response: Response, fallback: string): Promise<Error> {
  try {
    const data = await response.json();
    return new Error(data.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

async function postSavedPiece(method: 'POST' | 'DELETE', pieceId: number, instrument: Instrument) {
  const response = await fetch('/api/user/saved-pieces', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pieceId, instrument }),
  });
  if (!response.ok) {
    throw await readError(response, method === 'POST' ? 'Failed to save piece' : 'Failed to unsave piece');
  }
  return (await response.json()) as { savedPieces: SavedPiece[] };
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.user ?? null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setUser(await loadCurrentUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    loadCurrentUser().then((current) => {
      if (!active) return;
      setUser(current);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  /** After signing in, save the piece the visitor tried to save while signed out. */
  const flushPendingSave = useCallback(async () => {
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_SAVE_KEY);
      sessionStorage.removeItem(PENDING_SAVE_KEY);
    } catch {
      return;
    }
    if (!pending) return;
    try {
      const { pieceId, instrument } = JSON.parse(pending);
      await postSavedPiece('POST', pieceId, instrument);
    } catch (error) {
      console.error('Failed to save pending piece:', error);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw await readError(response, 'Login failed');
      await flushPendingSave();
      await fetchUser();
    },
    [fetchUser, flushPendingSave]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      if (!response.ok) throw await readError(response, 'Registration failed');
      await flushPendingSave();
      await fetchUser();
    },
    [fetchUser, flushPendingSave]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    const response = await fetch('/api/user/update-username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) throw await readError(response, 'Failed to update username');
    const data = await response.json();
    setUser((prev) => (prev ? { ...prev, username: data.username } : prev));
  }, []);

  // Optimistic updates use functional setState so that several quick clicks on different
  // cards don't overwrite each other with a stale copy of the user.
  const savePiece = useCallback(
    async (pieceId: number, instrument: Instrument) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              savedPieces: [...prev.savedPieces, { pieceId, instrument, savedAt: new Date().toISOString() }],
            }
          : prev
      );
      try {
        const data = await postSavedPiece('POST', pieceId, instrument);
        setUser((prev) => (prev ? { ...prev, savedPieces: data.savedPieces } : prev));
      } catch (error) {
        await fetchUser();
        throw error;
      }
    },
    [fetchUser]
  );

  const unsavePiece = useCallback(
    async (pieceId: number, instrument: Instrument) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              savedPieces: prev.savedPieces.filter(
                (sp) => savedKey(sp.pieceId, sp.instrument ?? 'cello') !== savedKey(pieceId, instrument)
              ),
            }
          : prev
      );
      try {
        const data = await postSavedPiece('DELETE', pieceId, instrument);
        setUser((prev) => (prev ? { ...prev, savedPieces: data.savedPieces } : prev));
      } catch (error) {
        await fetchUser();
        throw error;
      }
    },
    [fetchUser]
  );

  const savedKeys = useMemo(
    () => new Set((user?.savedPieces ?? []).map((sp) => savedKey(sp.pieceId, sp.instrument ?? 'cello'))),
    [user]
  );

  const isPieceSaved = useCallback(
    (pieceId: number, instrument: Instrument) => savedKeys.has(savedKey(pieceId, instrument)),
    [savedKeys]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUsername,
      savePiece,
      unsavePiece,
      isPieceSaved,
      refetchUser: fetchUser,
    }),
    [user, loading, login, register, logout, updateUsername, savePiece, unsavePiece, isPieceSaved, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/** Only allow redirects to paths on this site, never to another origin. */
export function safeRedirect(value: unknown, fallback = '/cello-music'): string {
  const target = Array.isArray(value) ? value[0] : value;
  if (typeof target !== 'string') return fallback;
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  return target;
}
