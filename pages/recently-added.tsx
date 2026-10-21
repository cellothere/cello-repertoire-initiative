import { NextPage } from 'next';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { CardSkeletonGrid, PieceGrid } from '@/components/piece-results';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { PieceSummary } from '@/lib/types';

const RecentlyAdded: NextPage = () => {
  const { data, error, loading, retry } = useJson<PieceSummary[]>('/api/recentlyAdded');

  return (
    <>
      <Seo
        title="Recently Added"
        path="/recently-added"
        description="The latest additions to the Cello Repertoire Initiative catalogue."
      />
      <PageHeader title="Recently Added" subtitle="The latest additions to our repertoire database." />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {error ? (
          <ErrorState message="We couldn't load the latest additions. Please try again." onRetry={retry} />
        ) : loading ? (
          <CardSkeletonGrid count={12} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Nothing new yet">Check back soon for new additions.</EmptyState>
        ) : (
          <PieceGrid pieces={data} />
        )}
      </div>
    </>
  );
};

export default RecentlyAdded;
