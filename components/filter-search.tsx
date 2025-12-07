import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { modalLevelText } from '@/utils/modalLevelTexts';
import LevelModal from './level-modal';

interface FilterAsideProps {
  filter: string;
  setFilter: (value: string) => void;
  accordionContent: Record<string, string[]>;
  selectedComposers: string[];
  toggleComposerSelection: (composer: string) => void;
  selectedLevels: string[];
  toggleLevelSelection: (level: string) => void;
  selectedInstruments: string[];
  toggleInstrumentSelection: (instrument: string) => void;
  selectedCountries: string[];
  toggleCountrySelection: (country: string) => void;
  selectedTechnicalFocus: string[];
  toggleTechnicalFocusSelection: (focus: string) => void;
  minYear: number;
  maxYear: number;
  setMinYear: React.Dispatch<React.SetStateAction<number>>;
  setMaxYear: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

// Utility function defined outside to avoid redefinition on each render.
const removeDiacritics = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const FilterAside: React.FC<FilterAsideProps> = ({
  filter,
  setFilter,
  accordionContent,
  selectedComposers,
  toggleComposerSelection,
  selectedLevels,
  toggleLevelSelection,
  selectedInstruments,
  toggleInstrumentSelection,
  selectedCountries,
  toggleCountrySelection,
  selectedTechnicalFocus,
  toggleTechnicalFocusSelection,
  minYear,
  maxYear,
  setMinYear,
  setMaxYear,
  setCurrentPage
}) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [composerSearch, setComposerSearch] = useState<string>('');
  const [levelSearch, setLevelSearch] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');

  // State for the tooltip modal for levels.
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLevel, setModalLevel] = useState<string | null>(null);

  // Precompute normalized search terms to avoid re-computation in each filter callback.
  const normalizedComposerSearch = useMemo(
    () => removeDiacritics(composerSearch.toLowerCase()),
    [composerSearch]
  );
  const normalizedLevelSearch = useMemo(
    () => removeDiacritics(levelSearch.toLowerCase()),
    [levelSearch]
  );
  const normalizedCountrySearch = useMemo(
    () => removeDiacritics(countrySearch.toLowerCase()),
    [countrySearch]
  );

  const toggleAccordion = useCallback((index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter('');
    setComposerSearch('');
    setLevelSearch('');
    setCountrySearch('');
    // Reset selections by toggling each selected value.
    selectedComposers.forEach((composer) => toggleComposerSelection(composer));
    selectedLevels.forEach((level) => toggleLevelSelection(level));
    selectedInstruments.forEach((instrument) => toggleInstrumentSelection(instrument));
    selectedCountries.forEach((country) => toggleCountrySelection(country));
    selectedTechnicalFocus.forEach((focus) => toggleTechnicalFocusSelection(focus));
    setMinYear(1600);
    setMaxYear(2025);
    setCurrentPage(1);
    setOpenAccordion(null);
  }, [
    setFilter,
    selectedComposers,
    toggleComposerSelection,
    selectedLevels,
    toggleLevelSelection,
    selectedInstruments,
    toggleInstrumentSelection,
    selectedCountries,
    toggleCountrySelection,
    selectedTechnicalFocus,
    toggleTechnicalFocusSelection,
    setMinYear,
    setMaxYear,
    setCurrentPage,
  ]);

  const getSelectedCountForKey = useCallback((key: string): number => {
    if (key === 'Composer') return selectedComposers.length;
    if (key === 'Level') return selectedLevels.length;
    if (key === 'Instrumentation') return selectedInstruments.length;
    if (key === 'Country') return selectedCountries.length;
    if (key === 'Technical Focus') return selectedTechnicalFocus.length;
    return 0;
  }, [selectedComposers, selectedLevels, selectedInstruments, selectedCountries, selectedTechnicalFocus]);

  return (
    <aside className="hidden md:block relative w-66 p-5 border-gray-300" aria-label="Filter Panel">
      <h2 className="text-2xl font-bold text-white mb-4">Filter</h2>
      {/* Global Search */}
      <div className="mb-4">
        <label htmlFor="global-filter" className="block mb-2 text-sm font-semibold text-white">
          Search:
        </label>
        <input
          id="global-filter"
          type="text"
          placeholder="Title or Composer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
          aria-label="Global filter by title or composer"
        />
      </div>
      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full mb-4 p-3 bg-black hover:bg-red-700 text-white rounded-lg font-bold"
      >
        Clear All Filters
      </button>
      <div id="accordion" className="space-y-2">
        {Object.entries(accordionContent).map(([key, content], index) => {
          const filteredItems = content.filter((item) => {
            const normalizedItem = removeDiacritics(item.toLowerCase());
            if (key === 'Composer') {
              return normalizedItem.includes(normalizedComposerSearch);
            } else if (key === 'Level') {
              return normalizedItem.includes(normalizedLevelSearch);
            } else if (key === 'Country') {
              return normalizedItem.includes(normalizedCountrySearch);
            }
            return true;
          });

          return (
            <div key={key} className="border border-gray-300 rounded-lg bg-white">
              <h2 id={`accordion-heading-${index}`}>
                <button
                  type="button"
                  className={`flex items-center justify-between w-full px-4 py-3 font-medium text-left text-gray-700 focus:outline-none ${
                    openAccordion === index ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openAccordion === index}
                  aria-controls={`accordion-body-${index}`}
                >
                  <span>
                    {key}
                    {getSelectedCountForKey(key) > 0 && ` (${getSelectedCountForKey(key)})`}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                    viewBox="0 0 10 6"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>
              <div
                id={`accordion-body-${index}`}
                className={`transition-[max-height] overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="p-4 border-t border-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {/* YEAR ACCORDION SPECIAL CASE */}
                  {key === 'Year' && (
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Composition Year Range
                      </label>
                      <Slider
                        range
                        min={1600}
                        max={2025}
                        value={[minYear, maxYear]}
                        onChange={(value) => {
                          const [newMin, newMax] = value as number[];
                          setMinYear(newMin);
                          setMaxYear(newMax);
                        }}
                      />
                      <div className="flex justify-between gap-2 mt-2 text-sm text-gray-700">
                        <div className="flex flex-col items-start flex-1">
                          <label className="text-xs mb-1">From:</label>
                          <input
                            type="number"
                            min={1600}
                            max={maxYear}
                            value={minYear}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 1600 && value <= maxYear) {
                                setMinYear(value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value);
                              if (isNaN(value) || value < 1600) {
                                setMinYear(1600);
                              } else if (value > maxYear) {
                                setMinYear(maxYear);
                              }
                            }}
                            className="w-full p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col items-end flex-1">
                          <label className="text-xs mb-1">To:</label>
                          <input
                            type="number"
                            min={minYear}
                            max={2025}
                            value={maxYear}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= minYear && value <= 2025) {
                                setMaxYear(value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value);
                              if (isNaN(value) || value > 2025) {
                                setMaxYear(2025);
                              } else if (value < minYear) {
                                setMaxYear(minYear);
                              }
                            }}
                            className="w-full p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Input for Composers */}
                  {key === 'Composer' && (
                    <div className="mb-2">
                      <label
                        htmlFor="composer-search"
                        className="block mb-1 text-sm font-medium text-gray-700"
                      >
                        Search Composers
                      </label>
                      <input
                        id="composer-search"
                        type="text"
                        placeholder="Search composers..."
                        value={composerSearch}
                        onChange={(e) => setComposerSearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                        aria-label="Search composers"
                      />
                    </div>
                  )}

                  {/* Search Input for Countries */}
                  {key === 'Country' && (
                    <div className="mb-2">
                      <label
                        htmlFor="country-search"
                        className="block mb-1 text-sm font-medium text-gray-700"
                      >
                        Search countries
                      </label>
                      <input
                        id="country-search"
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                        aria-label="Search countries"
                      />
                    </div>
                  )}

                  <ul className="space-y-1">
                    {filteredItems.map((item) => (
                      <li
                        key={item}
                        className="border-b border-gray-300 last:border-none py-1 flex items-center"
                      >
                        <label className="inline-flex items-center text-gray-700 flex-grow">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={
                              key === 'Composer'
                                ? selectedComposers.includes(item)
                                : key === 'Level'
                                ? selectedLevels.includes(item)
                                : key === 'Instrumentation'
                                ? selectedInstruments.includes(item === 'Cello Solo' ? 'Cello' : item)
                                : key === 'Country'
                                ? selectedCountries.includes(item)
                                : key === 'Technical Focus'
                                ? selectedTechnicalFocus.includes(item)
                                : false
                            }
                            onChange={() => {
                              if (key === 'Composer') {
                                toggleComposerSelection(item);
                              } else if (key === 'Level') {
                                toggleLevelSelection(item);
                              } else if (key === 'Instrumentation') {
                                toggleInstrumentSelection(item);
                              } else if (key === 'Country') {
                                toggleCountrySelection(item);
                              } else if (key === 'Technical Focus') {
                                toggleTechnicalFocusSelection(item);
                              }
                            }}
                          />
                          {item}
                        </label>
                        {/* Only add tooltip icon for Level items */}
                        {key === 'Level' && (
                          <AiFillQuestionCircle
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalLevel(item);
                              setModalOpen(true);
                            }}
                            className="ml-2 cursor-pointer text-gray-500"
                            title="More info"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip Modal for Level Info using LevelModal component */}
      <LevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        level={modalLevel || ''}
        tooltipContent={
          modalLevel
            ? modalLevelText[modalLevel.replace(/\s*\(.*\)/, '') as keyof typeof modalLevelText] ||
              modalLevelText.default
            : ''
        }
      />
    </aside>
  );
};

export default FilterAside;
