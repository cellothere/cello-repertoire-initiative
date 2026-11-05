import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { FaBook, FaSearch } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Seo from '@/components/seo';
import CitedText from '@/components/cited-text';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useClampToggle } from '@/lib/use-clamp-toggle';
import { EditButton, InlineEditor, useEditableList } from '@/components/admin/editable-list';
import { LITERATURE_FIELDS } from '@/lib/admin-fields';
import { LITERATURE_TOPICS, type LiteratureBook } from '@/lib/types';
import { hostnameOf, normalizeForSearch } from '@/utils/musicUtils';

/** "A", "A and B", "A, B and C". */
const listNames = (names: string[]) =>
  names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** "Dover Publications · 2003 (first published 1922)". */
function edition(book: LiteratureBook) {
  const year = book.year && book.original_year && book.original_year !== book.year
    ? `${book.year} (first published ${book.original_year})`
    : book.year || book.original_year;
  return [book.publisher, year].filter(Boolean).join(' · ');
}

/**
 * One book. Like the resource cards, the title's link (to the publisher's page) is stretched over the card and the
 * description is cut to three lines on phones with a "Read more" toggle.
 */
function BookCard({ book }: { book: LiteratureBook }) {
  const { ref: textRef, expanded, clamped, toggle } = useClampToggle(book.description);

  return (
    <div className="scroll-reveal card spotlight group relative flex h-full flex-col p-4 transition focus-within:ring-2 focus-within:ring-teal-500 duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{book.topic}</p>
      <h2 className="mt-1 text-lg font-semibold leading-snug text-gray-900 group-hover:underline">
        <a href={book.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus:outline-none">
          {book.title}
        </a>
      </h2>
      {book.authors.length > 0 && <p className="mt-1 text-sm font-medium text-gray-800">{listNames(book.authors)}</p>}
      <p className="text-sm text-gray-500">{edition(book)}</p>
      <div
        ref={textRef}
        className={`mt-3 leading-relaxed text-gray-600 [&_a]:relative [&_a]:z-10 ${expanded ? '' : 'max-sm:line-clamp-3'}`}
      >
        <CitedText text={book.description} sources={book.description_sources} />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-teal-700">
            <span className="truncate">{hostnameOf(book.url) ?? 'Publisher'}</span>
            <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </span>
          {book.extra_links.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex min-w-0 items-center gap-1.5 rounded font-medium text-teal-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <span className="truncate">{hostnameOf(link) ?? 'Website'}</span>
              <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ))}
          {book.isbn && <span className="text-gray-500">ISBN {book.isbn}</span>}
        </div>
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

const Literature: NextPage = () => {
  const { data, error, loading, retry, adminView, editingId, setEditingId, saved } = useEditableList<LiteratureBook>('/api/literature');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<string | null>(null);

  // Only offer topics that have books, in the fixed order.
  const topics = useMemo(
    () => LITERATURE_TOPICS.filter((name) => (data ?? []).some((book) => book.topic === name)),
    [data]
  );

  const visible = useMemo(() => {
    const tokens = normalizeForSearch(search).split(' ').filter(Boolean);
    return (data ?? []).filter((book) => {
      if (topic && book.topic !== topic) return false;
      const text = normalizeForSearch(`${book.title} ${book.authors.join(' ')} ${book.publisher} ${book.description}`);
      return tokens.every((token) => text.includes(token));
    });
  }, [data, search, topic]);

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
    }`;

  return (
    <>
      <Seo
        title="Literature"
        path="/literature"
        description="Books for teaching and learning the cello: technique treatises, pedagogy, repertoire guides and teaching students with disabilities."
      />
      <PageHeader
        title="Literature"
        subtitle="Books on playing, teaching and learning the cello and its repertoire."
        background={<div className="header-glow" aria-hidden="true" />}
      />

      <div className="container mx-auto px-4 py-5 md:py-12">
        <div className="relative mx-auto max-w-xl">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            enterKeyHint="search"
            placeholder="Search books or authors…"
            aria-label="Search books or authors"
            className="input pl-11 shadow-sm"
          />
        </div>

        {topics.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by topic">
            <button type="button" aria-pressed={topic === null} onClick={() => setTopic(null)} className={chip(topic === null)}>
              All
            </button>
            {topics.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={topic === name}
                onClick={() => setTopic(topic === name ? null : name)}
                className={chip(topic === name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 md:mt-8">
          {error ? (
            <ErrorState message="We couldn't load the literature list. Please try again." onRetry={retry} />
          ) : loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading books">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="card space-y-3 p-6">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<FaBook className="h-8 w-8" />} title="No books found">
              Try a different search or topic.
            </EmptyState>
          ) : (
            <ul className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((book, index) => (
                <li
                  key={book._id}
                  className={`reveal min-w-0 ${editingId === book._id ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  style={{ '--i': index } as React.CSSProperties}
                >
                  {editingId === book._id ? (
                    <InlineEditor
                      record={book}
                      specs={LITERATURE_FIELDS}
                      endpoint="/api/admin/literature"
                      onSaved={saved}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="relative h-full">
                      <BookCard book={book} />
                      {adminView && <EditButton label={book.title} onClick={() => setEditingId(book._id)} />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Literature;
