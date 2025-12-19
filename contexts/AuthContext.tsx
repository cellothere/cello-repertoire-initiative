import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SavedPiece {
  pieceId: number;
  instrument: string;
  savedAt: Date;
}

export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  savedPieces: SavedPiece[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  savePiece: (pieceId: number, instrument: string) => Promise<void>;
  unsavePiece: (pieceId: number) => Promise<void>;
  isPieceSaved: (pieceId: number) => boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    // Refetch complete user data including savedPieces
    await fetchUser();
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Registration failed');
    }

    // Refetch complete user data including savedPieces
    await fetchUser();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const updateUsername = async (username: string) => {
    const response = await fetch('/api/user/update-username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update username');
    }

    const data = await response.json();

    // Update user in state
    if (user) {
      setUser({ ...user, username: data.username });
    }
  };

  const savePiece = async (pieceId: number, instrument: string) => {
    // Optimistic update
    if (user) {
      const newSavedPiece: SavedPiece = { pieceId, instrument, savedAt: new Date() };
      setUser({
        ...user,
        savedPieces: [...(user.savedPieces || []), newSavedPiece],
      });
    }

    try {
      const response = await fetch('/api/user/saved-pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieceId, instrument }),
      });

      if (!response.ok) {
        throw new Error('Failed to save piece');
      }

      const data = await response.json();

      // Update with server response
      if (user) {
        setUser({ ...user, savedPieces: data.savedPieces });
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchUser();
      throw error;
    }
  };

  const unsavePiece = async (pieceId: number) => {
    // Optimistic update
    if (user) {
      setUser({
        ...user,
        savedPieces: (user.savedPieces || []).filter(sp => sp.pieceId !== pieceId),
      });
    }

    try {
      const response = await fetch('/api/user/saved-pieces', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsave piece');
      }

      const data = await response.json();

      // Update with server response
      if (user) {
        setUser({ ...user, savedPieces: data.savedPieces });
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchUser();
      throw error;
    }
  };

  const isPieceSaved = (pieceId: number): boolean => {
    if (!user || !user.savedPieces) return false;
    return user.savedPieces.some(sp => sp.pieceId === pieceId);
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUsername,
    savePiece,
    unsavePiece,
    isPieceSaved,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
