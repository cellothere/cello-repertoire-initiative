import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface MobileFilterAccordionProps {
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

const removeDiacritics = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const MobileFilterAccordion: React.FC<MobileFilterAccordionProps> = ({
  filter,
  setFilter,
  accordionContent,
  selectedComposers = [],
  toggleComposerSelection,
  selectedLevels = [],
  toggleLevelSelection,
  selectedInstruments = [],
  toggleInstrumentSelection,
  selectedCountries = [],
  toggleCountrySelection,
  selectedTechnicalFocus = [],
  toggleTechnicalFocusSelection,
  minYear,
  maxYear,
  setMinYear,
  setMaxYear,
  setCurrentPage,
}) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [composerSearch, setComposerSearch] = useState<string>('');
  const [levelSearch, setLevelSearch] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');

  const toggleAccordion = useCallback((index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter('');
    setComposerSearch('');
    setLevelSearch('');
    setCountrySearch('');
    // Remove all selected items by toggling them off.
    selectedComposers.forEach((composer) => toggleComposerSelection(composer));
    selectedLevels.forEach((level) => toggleLevelSelection(level));
    selectedInstruments.forEach((instrument) => toggleInstrumentSelection(instrument));
    selectedCountries.forEach((country) => toggleCountrySelection(country));
    selectedTechnicalFocus.forEach((focus) => toggleTechnicalFocusSelection(focus));
    // Reset the year range to the default values.
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

  // Precompute normalized search terms.
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

  return (
    <div className="w-full p-5">
      <input
        type="text"
        placeholder="Search by title or composer"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black mb-4"
        aria-label="Filter by title or composer"
      />

      <button
        onClick={clearFilters}
        className="w-full mb-4 p-3 bg-black hover:bg-black text-white rounded-lg font-bold"
      >
        Clear All Filters
      </button>

      <div id="accordion" className="space-y-2">
        {Object.entries(accordionContent).map(([key, content], index) => {
          // Compute the number of checked items for each accordion key.
          const count =
            key === 'Composer'
              ? selectedComposers.length
              : key === 'Level'
              ? selectedLevels.length
              : key === 'Instrumentation'
              ? selectedInstruments.length
              : key === 'Country'
              ? selectedCountries.length
              : key === 'Technical Focus'
              ? selectedTechnicalFocus.length
              : 0;

          // Create a display string that only shows count if it's greater than 0.
          const displayTitle = count > 0 ? `${key} (${count})` : key;

          const filteredItems = content.filter((item) => {
            const lowerItem = removeDiacritics(item.toLowerCase());
            if (key === 'Composer') return lowerItem.includes(normalizedComposerSearch);
            if (key === 'Level') return lowerItem.includes(normalizedLevelSearch);
            if (key === 'Country') return lowerItem.includes(normalizedCountrySearch);
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
                  <span>{displayTitle}</span>
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
                  {key === 'Year' && (
                    <div>
                      <label className="block mb-4 text-sm text-black font-semibold">
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
                      <div className="flex justify-between gap-2 mt-2 text-sm text-black">
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

                  {key === 'Composer' && (
                    <div className="mb-2">
                      <input
                        id="composer-search"
                        type="text"
                        placeholder="Search Composers..."
                        value={composerSearch}
                        onChange={(e) => setComposerSearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                      />
                    </div>
                  )}

                  {key === 'Country' && (
                    <div className="mb-2">
                      <input
                        id="country-search"
                        type="text"
                        placeholder="Search Countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                      />
                    </div>
                  )}

                  <ul className="space-y-1">
                    {filteredItems.map((item) => (
                      <li key={item} className="border-b border-gray-300 last:border-none p-3">
                        <label className="flex items-center justify-between text-black">
                          <span>{item}</span>
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-green-500"
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
                              if (key === 'Composer') toggleComposerSelection(item);
                              else if (key === 'Level') toggleLevelSelection(item);
                              else if (key === 'Instrumentation') toggleInstrumentSelection(item);
                              else if (key === 'Country') toggleCountrySelection(item);
                              else if (key === 'Technical Focus') toggleTechnicalFocusSelection(item);
                            }}
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MobileFilterAccordion;
