// components/filter-search.tsx

import { useState } from 'react';

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
}

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
}) => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [composerSearch, setComposerSearch] = useState<string>('');
    const [levelSearch, setLevelSearch] = useState<string>('');

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const clearFilters = () => {
        setFilter('');
        setComposerSearch('');
        selectedComposers.forEach((composer) => toggleComposerSelection(composer));
        setLevelSearch('');
        selectedLevels.forEach((level) => toggleLevelSelection(level));
        selectedInstruments.forEach((instrument) => toggleInstrumentSelection(instrument));
    };

    // Utility to get selected count
    const getSelectedCountForKey = (key: string) => {
        if (key === 'Composer') return selectedComposers.length;
        if (key === 'Level') return selectedLevels.length;
        if (key === 'Instrumentation') return selectedInstruments.length;
        return 0;
    };

    return (
        <aside
            className="hidden md:block fixed top-24 bottom-0 left-0 w-64 p-5 border-gray-300 overflow-y-auto"
            aria-label="Filter Panel"
        >
            <h2 className="text-2xl font-bold text-white mb-4">Filter</h2>

            {/* Global Search */}
            <div className="mb-4">
                <label htmlFor="global-filter" className="block mb-2 text-sm font-semibold text-white">
                    Search by Title or Composer:
                </label>
                <input
                    id="global-filter"
                    type="text"
                    placeholder="Type to filter..."
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
                        const lowerItem = item.toLowerCase();
                        if (key === 'Composer') {
                            return lowerItem.includes(composerSearch.toLowerCase());
                        } else if (key === 'Level') {
                            return lowerItem.includes(levelSearch.toLowerCase());
                        }
                        // No search for other categories
                        return true;
                    });

                    return (
                        <div key={key} className="border border-gray-300 rounded-lg bg-white">
                            <h2 id={`accordion-heading-${index}`}>
                                <button
                                    type="button"
                                    className={`flex items-center justify-between w-full px-4 py-3 font-medium text-left 
                                        text-gray-700 focus:outline-none ${openAccordion === index ? 'bg-gray-200' : 'bg-gray-100'}`}
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
                                className={`transition-[max-height] overflow-hidden ${
                                    openAccordion === index ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="p-4 border-t border-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {/* Optional: Add separate search inputs */}
                                    {key === 'Composer' && (
                                        <div className="mb-2">
                                            <label htmlFor="composer-search" className="block mb-1 text-sm font-medium text-gray-700">
                                                Search Composers
                                            </label>
                                            <input
                                                id="composer-search"
                                                type="text"
                                                placeholder="Type to search composers..."
                                                value={composerSearch}
                                                onChange={(e) => setComposerSearch(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                                                aria-label="Search composers"
                                            />
                                        </div>
                                    )}

                                    {key === 'Level' && (
                                        <div className="mb-2">
                                            <label htmlFor="level-search" className="block mb-1 text-sm font-medium text-gray-700">
                                                Search Levels
                                            </label>
                                            <input
                                                id="level-search"
                                                type="text"
                                                placeholder="Type to search levels..."
                                                value={levelSearch}
                                                onChange={(e) => setLevelSearch(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none text-black"
                                                aria-label="Search levels"
                                            />
                                        </div>
                                    )}

                                    <p className="text-sm font-medium text-gray-600 mb-2">Select {key}:</p>
                                    {filteredItems.length === 0 ? (
                                        <p className="text-sm text-gray-500">No results found.</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {filteredItems.map((item) => (
                                                <li key={item}>
                                                    <label className="inline-flex items-center text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-2"
                                                            checked={
                                                                key === 'Composer'
                                                                    ? selectedComposers.includes(item)
                                                                    : key === 'Level'
                                                                    ? selectedLevels.includes(item)
                                                                    : key === 'Instrumentation'
                                                                    ? selectedInstruments.includes(item)
                                                                    : false
                                                            }
                                                            onChange={() => {
                                                                if (key === 'Composer') {
                                                                    toggleComposerSelection(item);
                                                                } else if (key === 'Level') {
                                                                    toggleLevelSelection(item);
                                                                } else if (key === 'Instrumentation') {
                                                                    toggleInstrumentSelection(item);
                                                                }
                                                            }}
                                                        />
                                                        {item}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default FilterAside;
