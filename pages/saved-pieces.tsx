import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { CardSkeletonGrid, PieceGrid } from '@/components/piece-results';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { PageSpinner } from '@/components/auth-form';
import { useAuth } from '@/contexts/AuthContext';
import { useJson } from '@/lib/use-json';
import type { PieceSummary } from '@/lib/types';

export default function SavedPiecesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // Fetched once per visit (not after every save/unsave), so un-saving a piece here leaves it
  // visible until the page is reloaded and an accidental click can be undone.
  const { data, error, loading, retry } = useJson<{ pieces: PieceSummary[] }>(
    user ? '/api/user/saved-pieces' : null,
    { cache: false }
  );
  const pieces = data?.pieces ?? [];

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/saved-pieces');
  }, [user, authLoading, router]);

  return (
    <>
      <Seo title="Saved Pieces" path="/saved-pieces" noindex />
      <PageHeader title="Saved Pieces" subtitle="Your personal collection of favorite music." />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {authLoading || !user ? (
          <PageSpinner />
        ) : error ? (
          <ErrorState message="We couldn't load your saved pieces. Please try again." onRetry={retry} />
        ) : loading ? (
          <CardSkeletonGrid />
        ) : pieces.length === 0 ? (
          <EmptyState icon={<FaHeart className="h-10 w-10" />} title="No saved pieces yet">
            <p className="mb-6">Tap the heart on any piece to save it here for later.</p>
            <Link href="/cello-music" className="btn-primary">
              Browse music
            </Link>
          </EmptyState>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              <span className="font-semibold text-gray-900">{pieces.length}</span>{' '}
              {pieces.length === 1 ? 'piece' : 'pieces'} saved
            </p>
            <PieceGrid pieces={pieces} />
          </>
        )}
      </div>
    </>
  );
}
