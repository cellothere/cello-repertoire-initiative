import { useMemo, useState, type ReactNode } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FaChevronDown } from 'react-icons/fa';
import { AiFillQuestionCircle } from 'react-icons/ai';
import LevelModal from './level-modal';
import type { BrowseFilters } from '@/lib/browse-state';
import { CURRENT_YEAR, MIN_YEAR, normalizeForSearch } from '@/utils/musicUtils';

export type ListFilterKey = 'level' | 'database' | 'instrumentation' | 'composer' | 'country' | 'focus';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  level: FilterOption[];
  database: FilterOption[];
  instrumentation: FilterOption[];
  composer: FilterOption[];
  country: FilterOption[];
  focus: FilterOption[];
}

interface FilterPanelProps {
  /** Distinguishes element ids when the panel is rendered twice (sidebar and mobile drawer). */
  idPrefix: string;
  filters: BrowseFilters;
  options: FilterOptions;
  onToggle: (key: ListFilterKey, value: string) => void;
  onYearChange: (from: number, to: number) => void;
}

function Section({
  id,
  title,
  count,
  defaultOpen,
  children,
}: {
  id: string;
  title: string;
  count: number;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-2 py-3.5 text-left font-semibold text-gray-900 lg:py-3"
        >
          <span className="flex items-center gap-2">
            {title}
            {count > 0 && (
              <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">{count}</span>
            )}
          </span>
          <FaChevronDown
            className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {open && (
        <div id={id} className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Long lists show this many options (plus any already ticked) until "Show all" is pressed, so the sidebar
// never needs a scroll box inside it.
const SHORT_LIST = 8;

function CheckboxList({
  idPrefix,
  options,
  selected,
  onToggle,
  searchLabel,
  renderAfter,
}: {
  idPrefix: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  /** When set, shows a search box. */
  searchLabel?: string;
  renderAfter?: (option: FilterOption) => ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  // Short lists (e.g. levels) keep their natural order; long ones pin ticked options to the top.
  const long = options.length > SHORT_LIST + 2;

  const matches = useMemo(() => {
    const needle = normalizeForSearch(search);
    const found = needle ? options.filter((o) => normalizeForSearch(o.label).includes(needle)) : options;
    return long ? [...found.filter((o) => selectedSet.has(o.value)), ...found.filter((o) => !selectedSet.has(o.value))] : found;
  }, [options, search, long, selectedSet]);

  const shortLength = Math.max(SHORT_LIST, matches.filter((o) => selectedSet.has(o.value)).length);
  const collapsible = long && matches.length > shortLength + 2;
  const visible = collapsible && !showAll ? matches.slice(0, shortLength) : matches;

  return (
    <div>
      {searchLabel && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:py-2 lg:text-sm"
        />
      )}
      <ul className="space-y-0.5">
        {visible.map((option) => {
          const id = `${idPrefix}-${option.value}`.replace(/[^\w-]/g, '_');
          return (
            <li key={option.value} className="group flex items-center gap-1">
              <input
                id={id}
                type="checkbox"
                checked={selectedSet.has(option.value)}
                onChange={() => onToggle(option.value)}
                className="h-5 w-5 shrink-0 rounded border-gray-300 accent-teal-600 lg:h-4 lg:w-4"
              />
              {/* Taller rows in the phone drawer, so each option is easy to hit with a thumb. */}
              <label htmlFor={id} className="flex-1 cursor-pointer rounded px-2 py-2.5 text-base text-gray-700 hover:bg-gray-100 lg:px-1.5 lg:py-1 lg:text-sm">
                {option.label}
              </label>
              {renderAfter?.(option)}
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-1.5 py-1 text-sm text-gray-500">No matches</li>}
      </ul>
      {collapsible && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className="mt-1 rounded px-2 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 hover:text-teal-800 lg:px-1.5 lg:py-1"
        >
          {showAll ? 'Show fewer' : `Show all ${matches.length}`}
        </button>
      )}
    </div>
  );
}

function YearRange({
  idPrefix,
  from,
  to,
  onChange,
}: {
  idPrefix: string;
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
}) {
  // Inputs keep a draft so you can type a full year without each keystroke being rejected.
  // When the committed range changes (slider, chips, clear), reset the drafts to match.
  const [draftFrom, setDraftFrom] = useState(String(from));
  const [draftTo, setDraftTo] = useState(String(to));
  const [committed, setCommitted] = useState({ from, to });
  if (committed.from !== from || committed.to !== to) {
    setCommitted({ from, to });
    setDraftFrom(String(from));
    setDraftTo(String(to));
  }

  const commit = () => {
    const clamp = (value: string, fallback: number) => {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? fallback : Math.min(Math.max(parsed, MIN_YEAR), CURRENT_YEAR);
    };
    const a = clamp(draftFrom, MIN_YEAR);
    const b = clamp(draftTo, CURRENT_YEAR);
    onChange(Math.min(a, b), Math.max(a, b));
    setDraftFrom(String(Math.min(a, b)));
    setDraftTo(String(Math.max(a, b)));
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-2 py-2.5 text-center text-base tabular-nums focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:py-1.5 lg:text-sm';

  return (
    <div className="px-1">
      <div className="px-2 py-2">
        <Slider
          range
          min={MIN_YEAR}
          max={CURRENT_YEAR}
          value={[from, to]}
          allowCross={false}
          onChange={(value) => {
            const [a, b] = value as number[];
            onChange(a, b);
          }}
          ariaLabelForHandle={['Earliest composition year', 'Latest composition year']}
        />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={`${idPrefix}-year-from`} className="mb-1 block text-xs font-medium text-gray-600">
            From
          </label>
          <input
            id={`${idPrefix}-year-from`}
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={CURRENT_YEAR}
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className={inputClass}
          />
        </div>
        <span className="pb-2 text-gray-400">–</span>
        <div className="flex-1">
          <label htmlFor={`${idPrefix}-year-to`} className="mb-1 block text-xs font-medium text-gray-600">
            To
          </label>
          <input
            id={`${idPrefix}-year-to`}
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={CURRENT_YEAR}
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className={inputClass}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">Pieces without a known year are hidden while this filter is set.</p>
    </div>
  );
}

export default function FilterPanel({ idPrefix, filters, options, onToggle, onYearChange }: FilterPanelProps) {
  const [rubricLevel, setRubricLevel] = useState<string | null>(null);
  const yearActive = filters.from > MIN_YEAR || filters.to < CURRENT_YEAR;

  return (
    <div>
      <Section id={`${idPrefix}-level`} title="Level" count={filters.level.length} defaultOpen>
        <CheckboxList
          idPrefix={`${idPrefix}-level`}
          options={options.level}
          selected={filters.level}
          onToggle={(value) => onToggle('level', value)}
          renderAfter={(option) => (
            <button
              type="button"
              onClick={() => setRubricLevel(option.value)}
              className="rounded-full p-2.5 text-gray-400 transition hover:text-teal-700 focus-visible:opacity-100 lg:p-1 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label={`What does ${option.label} mean?`}
              title="What does this level mean?"
            >
              <AiFillQuestionCircle className="h-5 w-5 lg:h-4 lg:w-4" aria-hidden="true" />
            </button>
          )}
        />
      </Section>

      {options.database.length > 0 && (
        <Section id={`${idPrefix}-database`} title="Featured databases" count={filters.database.length} defaultOpen>
          <CheckboxList
            idPrefix={`${idPrefix}-database`}
            options={options.database}
            selected={filters.database}
            onToggle={(value) => onToggle('database', value)}
          />
          {options.database.length > 1 && (
            <p className="mt-2 text-xs text-gray-500">Tick more than one to find pieces in all of them, such as free music by women.</p>
          )}
        </Section>
      )}

      <Section
        id={`${idPrefix}-instrumentation`}
        title="Instrumentation"
        count={filters.instrumentation.length}
        defaultOpen={filters.instrumentation.length > 0}
      >
        <CheckboxList
          idPrefix={`${idPrefix}-instrumentation`}
          options={options.instrumentation}
          selected={filters.instrumentation}
          onToggle={(value) => onToggle('instrumentation', value)}
        />
      </Section>

      <Section
        id={`${idPrefix}-composer`}
        title="Composer"
        count={filters.composer.length}
        defaultOpen={filters.composer.length > 0}
      >
        <CheckboxList
          idPrefix={`${idPrefix}-composer`}
          options={options.composer}
          selected={filters.composer}
          onToggle={(value) => onToggle('composer', value)}
          searchLabel="Search composers…"
        />
      </Section>

      <Section
        id={`${idPrefix}-country`}
        title="Composer nationality"
        count={filters.country.length}
        defaultOpen={filters.country.length > 0}
      >
        <CheckboxList
          idPrefix={`${idPrefix}-country`}
          options={options.country}
          selected={filters.country}
          onToggle={(value) => onToggle('country', value)}
          searchLabel="Search countries…"
        />
      </Section>

      <Section
        id={`${idPrefix}-focus`}
        title="Technical focus"
        count={filters.focus.length}
        defaultOpen={filters.focus.length > 0}
      >
        <CheckboxList
          idPrefix={`${idPrefix}-focus`}
          options={options.focus}
          selected={filters.focus}
          onToggle={(value) => onToggle('focus', value)}
        />
      </Section>

      <Section id={`${idPrefix}-year`} title="Composition year" count={yearActive ? 1 : 0} defaultOpen={yearActive}>
        <YearRange idPrefix={idPrefix} from={filters.from} to={filters.to} onChange={onYearChange} />
      </Section>

      <LevelModal open={rubricLevel !== null} onClose={() => setRubricLevel(null)} level={rubricLevel ?? ''} />
    </div>
  );
}
