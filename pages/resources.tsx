import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { FaBookOpen, FaSearch } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { Resource } from '@/lib/types';
import { hostnameOf, normalizeForSearch } from '@/utils/musicUtils';

const Resources: NextPage = () => {
  const { data, error, loading, retry } = useJson<Resource[]>('/api/resources');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const tokens = normalizeForSearch(search).split(' ').filter(Boolean);
    return (data ?? []).filter((resource) => {
      const text = normalizeForSearch(`${resource.title} ${resource.description}`);
      return tokens.every((token) => text.includes(token));
    });
  }, [data, search]);

  return (
    <>
      <Seo
        title="Resource Catalog"
        path="/resources"
        description="A curated catalog of websites, databases and teaching resources for cellists and string teachers."
      />
      <PageHeader title="Resource Catalog" subtitle="Websites, databases, and teaching tools we recommend." />

      <div className="container mx-auto px-4 py-5 md:py-12">
        <div className="relative mx-auto max-w-xl">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            enterKeyHint="search"
            placeholder="Search resources…"
            aria-label="Search resources"
            className="input pl-11 shadow-sm"
          />
        </div>

        <div className="mt-5 md:mt-8">
          {error ? (
            <ErrorState message="We couldn't load the resource catalog. Please try again." onRetry={retry} />
          ) : loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading resources">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="card space-y-3 p-6">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<FaBookOpen className="h-8 w-8" />} title="No resources found">
              Try a different search.
            </EmptyState>
          ) : (
            <ul className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((resource) => (
                <li key={resource._id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex h-full flex-col p-5 transition active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:underline">{resource.title}</h2>
                    <p className="mt-2 flex-grow leading-relaxed text-gray-600">{resource.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700">
                      {hostnameOf(resource.url) ?? 'Visit website'}
                      <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Resources;
