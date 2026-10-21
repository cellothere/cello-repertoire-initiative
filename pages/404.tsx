import Link from 'next/link';
import Seo from '@/components/seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <div className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="bg-brand-gradient bg-clip-text text-7xl font-bold text-transparent">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-gray-600">
          The piece or page you&apos;re looking for may have moved or been removed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cello-music" className="btn-primary">
            Browse cello music
          </Link>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </>
  );
}
