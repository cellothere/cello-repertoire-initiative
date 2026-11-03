import { useMemo } from 'react';

const ROWS = 5;
// Each row is repeated until it is at least this many characters long, so even a short list fills a wide screen.
const MIN_ROW_CHARS = 320;
// Seconds per character of a row, which sets each row's speed (roughly 7–11px a second); odd rows run the other way.
const SECONDS_PER_CHAR = [1.1, 1.5, 1.25, 1.6, 1.2];

// A stable order that mixes names up without favouring the alphabet, and doesn't change between renders.
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Faint rows of composer names drifting sideways behind a page header, alternate rows in opposite directions, like
 * names cut into a wall. Fades in when the names change (e.g. on choosing another database). The middle is masked
 * out so the title and controls stay clear. Decoration only, so hidden from assistive technology; with reduced
 * motion the global rule in globals.css stops the drift.
 */
export default function NameDrift({ names }: { names: string[] }) {
  const rows = useMemo(() => {
    const ordered = [...names].sort((a, b) => hash(a) - hash(b));
    return Array.from({ length: ROWS }, (_, row) => {
      const own = ordered.filter((_, index) => index % ROWS === row);
      const base = own.length ? own : ordered;
      const line: string[] = [];
      let chars = 0;
      while (chars < MIN_ROW_CHARS && base.length) {
        for (const name of base) {
          line.push(name);
          chars += name.length + 4;
        }
      }
      return { line, seconds: Math.round(chars * SECONDS_PER_CHAR[row]) };
    });
  }, [names]);

  if (!names.length) return null;

  return (
    <div
      className="name-drift-in pointer-events-none absolute inset-0 flex flex-col justify-evenly overflow-hidden [mask-image:radial-gradient(ellipse_60%_75%_at_50%_45%,transparent_25%,black_90%)] md:[mask-image:radial-gradient(ellipse_45%_70%_at_50%_42%,transparent_30%,black_95%)]"
      aria-hidden="true"
    >
      {rows.map(({ line, seconds }, row) => (
        // Two copies side by side; the animation moves the pair by exactly one copy, so the loop has no seam.
        <div
          key={row}
          className={`flex w-max ${row % 2 ? 'name-drift-right' : 'name-drift-left'}`}
          style={{ animationDuration: `${seconds}s` }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {line.map((name, index) => (
                <span
                  key={index}
                  className="whitespace-nowrap px-3 text-[0.6875rem] uppercase tracking-[0.25em] text-white/[0.16] md:px-5 md:text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
