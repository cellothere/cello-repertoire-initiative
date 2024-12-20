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
    selectedInstruments: string[]; // New prop
    toggleInstrumentSelection: (instrument: string) => void; // New prop
}

const FilterAside: React.FC<FilterAsideProps> = ({
    filter,
    setFilter,
    accordionContent,
    selectedComposers,
    toggleComposerSelection,
    selectedLevels,
    toggleLevelSelection,
    selectedInstruments, // New prop
    toggleInstrumentSelection, // New prop
}) => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [composerSearch, setComposerSearch] = useState<string>(''); // State for composer search
    const [levelSearch, setLevelSearch] = useState<string>(''); // State for level search

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const clearFilters = () => {
        setFilter('');
        setComposerSearch('');
        selectedComposers.forEach(composer => toggleComposerSelection(composer)); // Unselect all composers
        setLevelSearch('');
        selectedLevels.forEach(level => toggleLevelSelection(level)); // Unselect all levels
        selectedInstruments.forEach(instrument => toggleInstrumentSelection(instrument)); // Unselect all instruments
    };

    return (
        <aside className="hidden md:block fixed top-24 left-0 w-64 h-full p-5 ">
            <h2 className="text-xl color-black font-bold mb-4">Filter</h2>
            <input
                type="text"
                placeholder="Title or composer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-black font-mono"
            />
            {/* Clear Filters Button */}
            <button
                onClick={clearFilters}
                className="w-full mt-4 mb-4 p-3 bg-black hover:bg-red-500 text-white rounded-lg font-bold"
            >
                Clear Filters
            </button>

            <div id="accordion">
                {Object.entries(accordionContent).map(([key, content], index) => (
                    <div key={index}>
                        <h2 id={`accordion-heading-${index}`}>
                            <button
                                type="button"
                                className={`flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-lg dark:border-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 gap-3 ${openAccordion === index ? 'bg-gray-800' : ''}`}
                                onClick={() => toggleAccordion(index)}
                                aria-expanded={openAccordion === index}
                                aria-controls={`accordion-body-${index}`}
                            >
                                <span>{key}</span>
                                <svg className={`w-3 h-3 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                                </svg>
                            </button>
                        </h2>
                        <div
                            id={`accordion-body-${index}`}
                            className={`transition-max-height overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'} bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700`}
                        >
                            <div className="p-5 max-h-80 overflow-y-auto">
                                {key === 'Composer' && (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search composers..."
                                            value={composerSearch}
                                            onChange={(e) => setComposerSearch(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-black font-mono"
                                        />
                                    </div>
                                )}

                                {/* {key === 'Level' && (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search levels..."
                                            value={levelSearch}
                                            onChange={(e) => setLevelSearch(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-black font-mono"
                                        />
                                    </div>
                                )} */}
                                {/* Add more search inputs if needed for other filters */}

                                <p className="mb-2 text-gray-500 dark:text-white-400">Select {key}:</p>
                                <ul className="list-none pl-1">
                                    {content
                                        .filter((item) =>
                                            typeof item === 'string' &&
                                            (key === 'Composer'
                                                ? item.toLowerCase().includes(composerSearch.toLowerCase())
                                                : key === 'Level'
                                                    ? item.toLowerCase().includes(levelSearch.toLowerCase())
                                                    : true) // No search for Instrumentation
                                        )
                                        .map((item, i) => (
                                            <li key={i} className="text-white-600 dark:text-white-400">
                                                <label>
                                                    <input
                                                        type="checkbox"
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
                                                        className="mr-2"
                                                    />
                                                    {item}
                                                </label>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default FilterAside;
