import { useState } from 'react';
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
    minYear: number;
    maxYear: number;
    setMinYear: React.Dispatch<React.SetStateAction<number>>;
    setMaxYear: React.Dispatch<React.SetStateAction<number>>;
}

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
    selectedCountries = [], // Default to empty array
    toggleCountrySelection,
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
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
        selectedCountries.forEach((country) => toggleCountrySelection(country));
        setMinYear(1600);
        setMaxYear(2025);
    };

    const getSelectedCountForKey = (key: string) => {
        if (key === 'Composer') return selectedComposers.length;
        if (key === 'Level') return selectedLevels.length;
        if (key === 'Instrumentation') return selectedInstruments.length;
        if (key === 'Country') return selectedCountries.length;
        return 0;
    };

    return (
        <div className="w-full p-5">

            {/* Clear Filters Button */}
            <button
                onClick={clearFilters}
                className="w-full mb-4 p-3 bg-black hover:bg-black text-white rounded-lg font-bold"
            >
                Clear All Filters
            </button>

            {/* Accordion */}
            <div id="accordion" className="space-y-2">
                {Object.entries(accordionContent).map(([key, content], index) => {
                    const filteredItems = content.filter((item) => {
                        const lowerItem = item.toLowerCase();
                        if (key === 'Composer') {
                            return lowerItem.includes(composerSearch.toLowerCase());
                        } else if (key === 'Level') {
                            return lowerItem.includes(levelSearch.toLowerCase());
                        }
                        return true;
                    });

                    return (
                        <div key={key} className="border border-gray-300 rounded-lg bg-white">
                            <h2 id={`accordion-heading-${index}`}>
                                <button
                                    type="button"
                                    className={`flex items-center justify-between w-full px-4 py-3 font-medium text-left text-gray-700 focus:outline-none
                                        ${openAccordion === index ? 'bg-gray-200' : 'bg-gray-100'}`}
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
                                className={`transition-[max-height] overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="p-4 border-t border-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {/* Special Year Range Slider */}
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
                                            <div className="flex justify-between mt-2 text-sm text-black">
                                                <span>{minYear}</span>
                                                <span>{maxYear}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Composer Search */}
                                    {key === 'Composer' && (
                                        <div className="mb-2">
                                            <input
                                                id="composer-search"
                                                type="text"
                                                placeholder="Type to search composers..."
                                                value={composerSearch}
                                                onChange={(e) => setComposerSearch(e.target.value)}
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
                                                                        ? selectedInstruments.includes(item)
                                                                        : key === 'Country'
                                                                            ? selectedCountries.includes(item)
                                                                            : false
                                                        }
                                                        onChange={() => {
                                                            if (key === 'Composer') toggleComposerSelection(item);
                                                            else if (key === 'Level') toggleLevelSelection(item);
                                                            else if (key === 'Instrumentation') toggleInstrumentSelection(item);
                                                            else if (key === 'Country') toggleCountrySelection(item);
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
