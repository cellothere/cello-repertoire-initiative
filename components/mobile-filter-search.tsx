// components/mobile-filter-search.tsx

import { useState } from 'react';

interface MobileFilterAccordionProps {
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

const MobileFilterAccordion: React.FC<MobileFilterAccordionProps> = ({
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
        <div className="w-full p-5">
            <h2 className="text-xl color-black font-bold mb-4">Filter</h2>
            <input
                type="text"
                placeholder="Search by title or composer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-black font-mono mb-4"
            />

            <div id="accordion">
                {Object.entries(accordionContent).map(([key, content], index) => (
                    <div key={index}>
                        <h2 id={`accordion-heading-${index}`}>
                            <button
                                type="button"
                                className={`flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 gap-3 ${openAccordion === index ? 'bg-gray-100' : ''}`}
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
                            className={`transition-max-height overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'} bg-white border border-gray-200`}
                        >
                            <div className="p-5">
                                {key === 'Composer' && (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search composers..."
                                            value={composerSearch}
                                            onChange={(e) => setComposerSearch(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-black font-mono mb-4"
                                        />
                                    </div>
                                )}

                                {key === 'Level' && (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search levels..."
                                            value={levelSearch}
                                            onChange={(e) => setLevelSearch(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-black font-mono mb-4"
                                        />
                                    </div>
                                )}
                                {/* Add more search inputs if needed for other filters */}

                                <p className="mb-2 text-gray-500">Select {key}:</p>
                                <ul className="list-none pl-0 max-h-64 overflow-y-auto">
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
                                            <li key={i} className="text-gray-600">
                                                {key === 'Composer' || key === 'Level' || key === 'Instrumentation' ? (
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
                                                ) : (
                                                    item
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Clear Filters Button */}
            <button
                onClick={clearFilters}
                className="w-full mt-4 p-3 bg-red-500 text-white font-bold rounded"
            >
                Clear Filters
            </button>
        </div>
    );
};

export default MobileFilterAccordion;
