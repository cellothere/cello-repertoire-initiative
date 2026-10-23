import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { FaBookOpen, FaSearch } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { Resource } from '@/lib/types';
import { hostnameOf, normalizeForSearch } from '@/utils/musicUtils';

/**
 * One resource. On phones the description is cut to three lines with a "Read more" toggle, since some
 * run to a full screen. The title's link is stretched over the card, so the card stays one big tap
 * target while the toggle (a button, which can't sit inside a link) works on its own.
 */
function ResourceCard({ resource }: { resource: Resource }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const fromHeight = useRef<number | null>(null);

  // Glide between the clamped and full heights rather than jumping.
  useLayoutEffect(() => {
    const el = textRef.current;
    const from = fromHeight.current;
    fromHeight.current = null;
    if (!el || from === null || typeof el.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A quick second tap: stop the first glide so the target height is the real one.
    el.getAnimations().forEach((animation) => animation.cancel());
    const to = el.getBoundingClientRect().height;
    el.animate([{ height: `${from}px`, overflow: 'hidden' }, { height: `${to}px`, overflow: 'hidden' }], {
      duration: 380,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }, [expanded]);

  const toggle = () => {
    fromHeight.current = textRef.current?.getBoundingClientRect().height ?? null;
    setExpanded((open) => !open);
  };

  // Show the toggle only when the text really is cut, rechecking when the width changes.
  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, resource.description]);

  return (
    <div className="card group relative flex h-full flex-col p-4 transition focus-within:ring-2 focus-within:ring-teal-500 duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-xl sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 group-hover:underline">
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus:outline-none">
          {resource.title}
        </a>
      </h2>
      <p ref={textRef} className={`mt-2 leading-relaxed text-gray-600 ${expanded ? '' : 'max-sm:line-clamp-3'}`}>
        {resource.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-4">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-teal-700">
          <span className="truncate">{hostnameOf(resource.url) ?? 'Visit website'}</span>
          <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </span>
        {(clamped || expanded) && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            className="relative z-10 -my-1.5 -mr-2 shrink-0 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-2 active:bg-gray-100 sm:hidden"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}

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
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<FaBookOpen className="h-8 w-8" />} title="No resources found">
              Try a different search.
            </EmptyState>
          ) : (
            <ul className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((resource, index) => (
                <li key={resource._id} className="reveal min-w-0" style={{ '--i': index } as React.CSSProperties}>
                  <ResourceCard resource={resource} />
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
