import Link from 'next/link';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import SaveButton from './save-button';
import LevelBadge from './level-badge';
import { pieceHref } from '@/lib/instruments';
import type { PieceSummary, SortKey } from '@/lib/types';
import { formatComposerName, formatDuration, parseYear } from '@/utils/musicUtils';

interface MusicListViewProps {
  pieces: PieceSummary[];
  sort?: SortKey;
  onSortChange?: (sort: SortKey) => void;
}

type SortField = 'title' | 'composer' | 'level' | 'year' | 'duration';

function SortableHeader({
  field,
  label,
  sort,
  onSortChange,
  className = '',
}: {
  field: SortField;
  label: string;
  sort?: SortKey;
  onSortChange?: (sort: SortKey) => void;
  className?: string;
}) {
  const [activeField, direction] = (sort ?? '').split('-');
  const active = activeField === field;
  const Icon = !active ? FaSort : direction === 'asc' ? FaSortUp : FaSortDown;

  if (!onSortChange) {
    return (
      <th scope="col" className={`px-4 py-3 text-left font-semibold ${className}`}>
        {label}
      </th>
    );
  }

  return (
    <th
      scope="col"
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-2 py-1.5 text-left font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => onSortChange(`${field}-${active && direction === 'asc' ? 'desc' : 'asc'}` as SortKey)}
        className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 transition-colors hover:bg-white/10"
      >
        {label}
        <Icon className={active ? 'text-teal-300' : 'text-gray-500'} aria-hidden="true" />
      </button>
    </th>
  );
}

const MusicListView: React.FC<MusicListViewProps> = ({ pieces, sort, onSortChange }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-900 text-white">
          <tr>
            <SortableHeader field="title" label="Piece" sort={sort} onSortChange={onSortChange} />
            <SortableHeader field="composer" label="Composer" sort={sort} onSortChange={onSortChange} />
            <SortableHeader field="level" label="Level" sort={sort} onSortChange={onSortChange} />
            <th scope="col" className="hidden px-4 py-3 text-left font-semibold md:table-cell">
              Instrumentation
            </th>
            <SortableHeader field="year" label="Year" sort={sort} onSortChange={onSortChange} className="hidden lg:table-cell" />
            <SortableHeader
              field="duration"
              label="Duration"
              sort={sort}
              onSortChange={onSortChange}
              className="hidden lg:table-cell"
            />
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Save</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pieces.map((piece) => (
            <tr key={`${piece.instrument}-${piece.id}`} className="transition-colors hover:bg-teal-50/50">
              <td className="max-w-xs px-4 py-3">
                <Link
                  href={pieceHref(piece.instrument, piece.id)}
                  prefetch={false}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {piece.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatComposerName(piece.composer_first_name, piece.composer_last_name)}
              </td>
              <td className="px-4 py-3">
                <LevelBadge level={piece.level} />
              </td>
              <td className="hidden px-4 py-3 text-gray-700 md:table-cell">{piece.instrumentation.join(', ')}</td>
              <td className="hidden px-4 py-3 tabular-nums text-gray-700 lg:table-cell">
                {parseYear(piece.composition_year) ?? '—'}
              </td>
              <td className="hidden px-4 py-3 tabular-nums text-gray-700 lg:table-cell">
                {formatDuration(piece.duration) ?? '—'}
              </td>
              <td className="px-2 py-2 text-right">
                <SaveButton
                  pieceId={piece.id}
                  instrument={piece.instrument}
                  title={piece.title}
                  className="!bg-transparent !shadow-none hover:!bg-gray-100"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MusicListView;
