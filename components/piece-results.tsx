import { useEffect, useMemo, useRef } from 'react';
import { BsGrid3X3GapFill, BsListUl } from 'react-icons/bs';
import { FaSort } from 'react-icons/fa';
import MusicCard from './music-card';
import MusicListView from './music-list-view';
import type { PieceSummary, SortKey, ViewMode } from '@/lib/types';
import { SORT_OPTIONS, isSortKey } from '@/utils/musicUtils';

export const PAGE_SIZE = 24;

export const GRID_CLASSES = 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4';

export function CardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES} aria-busy="true" aria-label="Loading pieces">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Same shape as a real card: a strip on phones, the picture from sm up. */}
          <div className="skeleton h-1.5 sm:hidden" />
          <div className="skeleton hidden aspect-[4/3] sm:block" />
          <div className="space-y-2.5 p-3 sm:p-4">
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton mt-4 h-5 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PieceGrid({ pieces }: { pieces: PieceSummary[] }) {
  return (
    <div className={GRID_CLASSES}>
      {pieces.map((piece, index) => (
        <MusicCard key={`${piece.instrument}-${piece.id}`} {...piece} priority={index < 4} index={index} />
      ))}
    </div>
  );
}

export function SortSelect({ value, onChange, id }: { value: SortKey; onChange: (sort: SortKey) => void; id: string }) {
  return (
    <div className="relative flex items-center gap-2">
      <label htmlFor={id} className="sr-only whitespace-nowrap text-sm font-medium text-gray-600 sm:not-sr-only">
        Sort by
      </label>
      {/* Phones: a compact "Sort" button with the native picker laid invisibly over it, since the
          option names don't fit the toolbar. Its 16px text stops iOS zooming in when it's tapped. */}
      <span
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 sm:hidden"
        aria-hidden="true"
      >
        <FaSort className="h-3.5 w-3.5" />
        Sort
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => isSortKey(e.target.value) && onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-base font-medium text-gray-900 opacity-0 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:static sm:w-auto sm:text-sm sm:opacity-100"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (view: ViewMode) => void }) {
  const options: { value: ViewMode; label: string; Icon: typeof BsGrid3X3GapFill }[] = [
    { value: 'grid', label: 'Grid view', Icon: BsGrid3X3GapFill },
    { value: 'list', label: 'List view', Icon: BsListUl },
  ];
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5" role="group" aria-label="View mode">
      {options.map(({ value: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          title={label}
          className={`rounded-md p-2.5 transition-colors sm:p-2 ${
            value === option ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}

function pageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? ['ellipsis' as const, page] : [page]));
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const base = 'min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  return (
    <>
      {/* Phones: big previous/next buttons instead of a row of page numbers that would wrap. */}
      <nav aria-label="Pagination" className="mt-6 flex items-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-secondary flex-1 px-3 py-3"
        >
          ‹ Previous
        </button>
        <span className="whitespace-nowrap text-sm text-gray-600">
          {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-secondary flex-1 px-3 py-3"
        >
          Next ›
        </button>
      </nav>
      <nav aria-label="Pagination" className="mt-8 hidden flex-wrap items-center justify-center gap-1 sm:flex">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${base} text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          ‹ Prev
        </button>
        {pageItems(page, totalPages).map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e${i}`} className="px-1 text-gray-500" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={`${base} ${item === page ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${base} text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Next ›
        </button>
      </nav>
    </>
  );
}

interface PieceResultsProps {
  /** Already filtered and sorted. */
  pieces: PieceSummary[];
  view: ViewMode;
  page: number;
  onPageChange: (page: number) => void;
  sort?: SortKey;
  onSortChange?: (sort: SortKey) => void;
}

/** One page of results in grid or list form, with pagination that scrolls back to the top. */
export default function PieceResults({ pieces, view, page, onPageChange, sort, onSortChange }: PieceResultsProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const previousPage = useRef(page);
  const totalPages = Math.max(1, Math.ceil(pieces.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const visible = useMemo(
    () => pieces.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [pieces, currentPage]
  );

  useEffect(() => {
    if (previousPage.current !== currentPage) {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    previousPage.current = currentPage;
  }, [currentPage]);

  return (
    <div ref={topRef} className="scroll-mt-32 lg:scroll-mt-24">
      {view === 'grid' ? (
        <PieceGrid pieces={visible} />
      ) : (
        <MusicListView pieces={visible} sort={sort} onSortChange={onSortChange} />
      )}
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
