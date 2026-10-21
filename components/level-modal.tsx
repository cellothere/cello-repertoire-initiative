import React, { useEffect, useMemo, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { modalLevelText } from '@/utils/modalLevelTexts';
import { baseLevel } from '@/utils/musicUtils';

interface LevelModalProps {
  open: boolean;
  onClose: () => void;
  level: string;
}

interface Section {
  heading: string | null;
  bullets: string[];
}

/** The rubric text is "Heading:" lines followed by "• item" lines; turn it into sections. */
function parseRubric(content: string): Section[] {
  const sections: Section[] = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[^•].*:$/.test(line)) {
      sections.push({ heading: line.slice(0, -1), bullets: [] });
      continue;
    }
    if (sections.length === 0) sections.push({ heading: null, bullets: [] });
    sections[sections.length - 1].bullets.push(line.replace(/^•\s*/, ''));
  }
  return sections;
}

/** Explains what a level means, using the native <dialog> for focus trapping and Escape handling. */
const LevelModal: React.FC<LevelModalProps> = ({ open, onClose, level }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cleanLevel = baseLevel(level);

  const sections = useMemo(() => {
    const text = modalLevelText[cleanLevel as keyof typeof modalLevelText] ?? modalLevelText.default;
    return parseRubric(text);
  }, [cleanLevel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself (not its contents) is a click on the backdrop.
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="level-modal-title"
      // Phones: a sheet that slides up from the bottom. Wider screens: a centred dialog.
      className="m-0 mt-auto w-full max-w-none animate-slide-up rounded-t-2xl p-0 text-gray-900 shadow-2xl backdrop:bg-black/50 sm:m-auto sm:w-[min(36rem,calc(100%-2rem))] sm:animate-none sm:rounded-2xl"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Level rubric</p>
            <h2 id="level-modal-title" className="text-xl font-bold">
              {cleanLevel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:m-0 sm:p-1.5"
            aria-label="Close"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-5">
          {sections.map((section, index) => (
            <section key={index}>
              {section.heading && <h3 className="mb-2 font-semibold text-gray-900">{section.heading}</h3>}
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700 marker:text-teal-600">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-xs italic text-gray-500">Levels are approximate guides, not strict requirements.</p>
        </div>
      </div>
    </dialog>
  );
};

export default LevelModal;
