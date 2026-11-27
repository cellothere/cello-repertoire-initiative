import { useMemo } from 'react';

const SHELVES = 2;
// Each shelf repeats its books until it is at least this wide (in px at full size), so it fills a wide screen.
const MIN_SHELF_PX = 1500;
// Drift speed in px a second at full size; the lower shelf runs the other way, a little slower, for depth.
const PX_PER_SECOND = [9, 7];
// Spine colours as "r g b": the brand teal and purple, with slate and a warm leather tone between them.
const COLOURS = ['54 193 144', '98 61 136', '148 163 184', '196 150 98', '40 150 140', '128 96 168'];
// Books whose titles name canonical composers or star cellists stay off the banner, like the other headers'
// imagery (see lib/database-names.ts): the point is the less-told stories.
const CANON =
  // Letter-aware edges rather than \b, which doesn't see accented letters ("du Pré:" would slip through).
  /(?<!\p{L})(Bach|Beethoven|Brahms|Mozart|Haydn|Schubert|Schumann|Chopin|Tchaikovsky|Dvořák|Dvorak|Elgar|Britten|Debussy|Ravel|Shostakovich|Prokofiev|Boccherini|Casals|Rostropovich|Piatigorsky|Feuermann|du Pré|Yo-Yo Ma)(?!\p{L})/iu;
// A spine has room for a short form of the title: up to this many characters.
const SPINE_CHARS = 12;
// Shelf height in px at full size, and roughly how much height each uppercase letter takes on a spine.
const SHELF_PX = 104;
const PX_PER_CHAR = 6.8;
// Short forms that would be a lone fragment on a spine ("From", "Including") leave the book off the shelf.
const FRAGMENT = /^(from|including|how|what|when|why|on|in|up|for|to|with|beyond|toward|towards|into|about)$/i;

/** "The Art of Cello Playing: …" → "Art of Cello": the main title without a leading article, cut at a word. */
function spineTitle(title: string): string {
  const words = title.split(/[:–—,(;]/)[0].trim().split(/\s+/);
  if (words.length > 1 && /^(the|a|an)$/i.test(words[0])) words.shift();
  let text = words[0] ?? '';
  for (const word of words.slice(1)) {
    if (`${text} ${word}`.length > SPINE_CHARS) break;
    text = `${text} ${word}`;
  }
  // Don't end on a dangling small word ("Art of").
  return text.replace(/(\s+(of|the|and|for|a|an|to|in|on|with|from|my|your|our|its))+$/i, '');
}

// A stable order that mixes the books up without following the alphabet, and doesn't change between renders.
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface Spine {
  title: string;
  width: number;
  height: number;
  colour: string;
  gap: number;
}

/**
 * Two faint shelves of book spines drifting past behind the Literature header, the lower shelf the other way, each
 * spine lettered with the title of a book in the collection. Fades in once the books have loaded. The middle is
 * masked out so the title and subtitle stay clear. Decoration only, so hidden from assistive technology; with
 * reduced motion the global rule in globals.css stops the drift.
 */
export default function BookShelf({ titles }: { titles: string[] }) {
  const shelves = useMemo(() => {
    const books = Array.from(
      new Set(titles.filter((title) => title && !CANON.test(title)).map(spineTitle).filter((title) => title.length <= SPINE_CHARS && !FRAGMENT.test(title)))
    ).sort((a, b) => hash(a) - hash(b));
    return Array.from({ length: SHELVES }, (_, shelf) => {
      const own = books.filter((_, index) => index % SHELVES === shelf);
      const base = own.length ? own : books;
      const spines: Spine[] = [];
      let px = 0;
      while (px < MIN_SHELF_PX && base.length) {
        for (const title of base) {
          const h = hash(`${title}${shelf}`);
          // Each book is tall enough for its lettering, with a little variety in height and thickness.
          const height = Math.min(100, Math.max(60, ((title.length * PX_PER_CHAR + 26) / SHELF_PX) * 100 + (h % 12)));
          const width = 18 + (h % 13);
          // Now and then a wider gap, as on a real shelf.
          const gap = h % 7 === 0 ? 14 : 4;
          spines.push({ title, width, height, colour: COLOURS[h % COLOURS.length], gap });
          px += width + gap;
        }
      }
      return { spines, seconds: Math.round(px / PX_PER_SECOND[shelf]) };
    });
  }, [titles]);

  if (!shelves[0].spines.length) return null;

  return (
    <div
      className="book-shelf-in pointer-events-none absolute inset-0 flex flex-col justify-evenly overflow-hidden [--spine:0.72] [mask-image:radial-gradient(ellipse_95%_62%_at_50%_48%,transparent_55%,black_100%)] md:[--spine:1] md:[mask-image:radial-gradient(ellipse_48%_78%_at_50%_44%,transparent_42%,black_96%)]"
      aria-hidden="true"
    >
      {shelves.map(({ spines, seconds }, shelf) => (
        // The board stays put while the books slide along it. Two copies side by side; the animation moves the pair
        // by exactly one copy, so the loop has no seam.
        <div key={shelf} className="relative">
          <div
            className={`flex w-max items-end ${shelf % 2 ? 'book-shelf-right' : 'book-shelf-left'}`}
            style={{ animationDuration: `${seconds}s`, height: `calc(var(--spine) * ${SHELF_PX}px)` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex h-full shrink-0 items-end">
                {spines.map(({ title, width, height, colour, gap }, index) => (
                  <div
                    key={index}
                    className="relative flex shrink-0 justify-center overflow-hidden rounded-t-[2px] py-[calc(var(--spine)*9px)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]"
                    style={{
                      width: `calc(var(--spine) * ${width}px)`,
                      marginRight: `calc(var(--spine) * ${gap}px)`,
                      height: `${height}%`,
                      background: `linear-gradient(90deg, rgb(${colour} / 0.08), rgb(${colour} / 0.17) 45%, rgb(${colour} / 0.09))`,
                    }}
                  >
                    {/* Gilt bands near the head and foot of the spine. */}
                    <span className="absolute inset-x-0 top-[6%] h-px bg-amber-100/20" />
                    <span className="absolute inset-x-0 bottom-[6%] h-px bg-amber-100/20" />
                    <span
                      className="max-h-full overflow-hidden whitespace-nowrap uppercase leading-none tracking-[0.1em] text-white/40 [writing-mode:vertical-rl]"
                      style={{ fontSize: 'calc(var(--spine) * 0.5625rem)' }}
                    >
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* The shelf board: a lit top edge and a soft shadow beneath. */}
          <div className="h-[3px] bg-gradient-to-b from-white/[0.14] to-white/[0.04] shadow-[0_3px_6px_rgb(0_0_0/0.45)]" />
        </div>
      ))}
    </div>
  );
}
