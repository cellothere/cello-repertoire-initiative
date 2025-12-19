import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import MusicCard from '@/components/music-card';
import LoadingAnimation from '@/components/loading-animation';
import { useAuth } from '@/contexts/AuthContext';

interface MusicPiece {
  id: number;
  title: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
  instrument?: string;
}

export default function SavedPiecesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/saved-pieces');
    }
  }, [user, authLoading, router]);

  // Fetch saved pieces
  useEffect(() => {
    const fetchSavedPieces = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/user/saved-pieces');

        if (!response.ok) {
          throw new Error('Failed to fetch saved pieces');
        }

        const data = await response.json();
        setPieces(data.pieces);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved pieces');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedPieces();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavbarMain />
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingAnimation />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head>
        <title>Saved Pieces | Cello Repertoire Initiative</title>
        <meta name="description" content="View your saved music pieces" />
      </Head>
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">Saved Pieces</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            Your personal collection of favorite music.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingAnimation />
          </div>
        ) : pieces.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No saved pieces yet</h2>
            <p className="text-gray-600 mb-6">
              Browse the music library and save your favorite pieces by clicking the heart icon.
            </p>
            <button
              onClick={() => router.push('/cello-music')}
              className="px-6 py-3 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Browse Music
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                {pieces.length} piece{pieces.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {pieces.map((piece) => (
                <MusicCard
                  key={piece.id}
                  id={piece.id}
                  instrument={piece.instrument || 'cello'}
                  title={piece.title}
                  composer_first_name={piece.composer_first_name}
                  composer_last_name={piece.composer_last_name}
                  level={piece.level}
                  instrumentation={piece.instrumentation}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
