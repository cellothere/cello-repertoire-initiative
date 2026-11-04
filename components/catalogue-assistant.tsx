import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiExternalLink } from 'react-icons/fi';
import { HiArrowPath, HiChatBubbleLeftRight, HiPaperAirplane, HiXMark } from 'react-icons/hi2';
import LevelBadge from './level-badge';
import { useAuth } from '@/contexts/AuthContext';
import { pieceHref } from '@/lib/instruments';
import type { LiteratureBook, PieceSummary, Resource } from '@/lib/types';
import { formatComposers, hostnameOf } from '@/utils/musicUtils';

interface Turn {
  role: 'user' | 'assistant';
  /** Assistant turns keep their [[instrument:id]] and [[resource:id]] tokens, which are sent back as context. */
  content: string;
}

// A fresh handful is drawn from this pool for each new chat, so returning visitors see different ideas. Each one is
// something the catalogue (or the Literature page) can answer well.
const SUGGESTIONS = [
  'Beginner pieces by women composers',
  'Intermediate cello and piano music by Black composers',
  'An unaccompanied piece for an advanced student',
  'Duets for two beginner cellists',
  'Free sheet music for an intermediate student',
  'Pieces by Indigenous composers',
  'Music by Latin American composers with piano',
  'A short recital piece under three minutes',
  'Something to practise vibrato on',
  'Tenor clef practice pieces for a late intermediate student',
  "What's new in the catalogue?",
  'Pieces by living composers for a young student',
  'A duet for two cellos by a Brazilian composer',
  'A spiritual arranged for cello and piano',
  'Pieces by queer composers',
  'Music by disabled or neurodivergent composers',
  'A lyrical piece for an early intermediate student',
  'Fiddle-style tunes for cello',
  'Pieces with recordings I can listen to first',
  'A Romantic-era piece by a woman composer',
  'Books on teaching autistic students',
  'A good book on cello technique',
  'Books about the Bach cello suites',
  'Easy pieces for a first recital',
  'Something for cello ensemble',
  'Music by Canadian women composers',
  'A sonata for an advanced student',
  'Pieces that practise shifting for an intermediate student',
  'Free public domain pieces for beginners',
  'Music by Asian composers',
  'A cello and piano piece by a Caribbean composer',
  'Pieces that use pizzicato for beginners',
  'A contemporary piece with extended techniques',
  'Music by Florence Price',
  'Something upbeat for a teenage student',
  'Pieces in treble clef for an advanced student',
  'A piece for a conservatory audition',
  'Music by Polish women composers',
  'Short pieces for a student who has played one year',
  'A concerto by a woman composer',
  'Pieces from the 20th century by Black composers',
  'Books on performance anxiety',
  'Teaching resources for music by underrepresented composers',
  'A slow, expressive piece for an adult beginner',
  'Pieces with double stops for an early advanced student',
  'Music inspired by folk songs',
  'Books on teaching students with disabilities',
  'A piece by a composer from Africa',
  'Unaccompanied pieces for intermediate students',
  'Pieces for cello and orchestra at an advanced level',
  'Music for a beginner and their teacher to play together',
  'A tango for cello',
  'Pieces under five minutes by living composers',
  'Something for a student who loves film music',
  'A piece about nature or animals for a young student',
  'Biographies of women cellists',
  'Free music for two cellos',
  'Pieces that work on spiccato',
  'A piece by a Mexican composer',
  'What should a second-year student play next?',
];

const SUGGESTION_COUNT = 4;

/** A few suggestions, chosen at random. */
const pickSuggestions = () =>
  [...SUGGESTIONS]
    .map((text) => ({ text, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .slice(0, SUGGESTION_COUNT)
    .map(({ text }) => text);

// On a piece's page, the assistant knows which piece "this" is.
const PIECE_SUGGESTIONS = ['Is this right for my student?', 'Find similar pieces', 'Tell me about the composer'];

// Piece ids are numbers; resource and book ids can be MongoDB ObjectIds.
const TOKEN = /\[\[([a-z]+:[0-9a-f]+)\]\]/g;
const STORAGE_KEY = 'cri-assistant-chat';
const MAX_LENGTH = 800;

// Site pages the assistant may mention by path; anything else stays plain text.
const SITE_PATH = /(\/(?:cello-music|violin-music|featured-databases|composers|recently-added|resources|literature|contribute)\b(?:\?category=[a-z-]+)?)/;

function PieceLink({ piece, onNavigate }: { piece: PieceSummary; onNavigate: () => void }) {
  return (
    <Link
      href={pieceHref(piece.instrument, piece.id)}
      onClick={onNavigate}
      className="block rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition hover:border-teal-400 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      <span className="block font-semibold leading-snug text-gray-900">{piece.title}</span>
      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
        <span>{formatComposers(piece.composers)}</span>
        <LevelBadge level={piece.level} />
      </span>
    </Link>
  );
}

/** An outside resource from the Resources page; opens in a new tab. */
function ResourceLink({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm transition hover:border-amber-400 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Resource</span>
      <span className="block font-semibold leading-snug text-gray-900">{resource.title}</span>
      <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-gray-600">
        {hostnameOf(resource.url)}
        <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </a>
  );
}

/** A book from the Literature page; opens the publisher's page in a new tab. */
function BookLink({ book }: { book: LiteratureBook }) {
  return (
    <a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 shadow-sm transition hover:border-indigo-400 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800">Book · {book.topic}</span>
      <span className="block font-semibold leading-snug text-gray-900">{book.title}</span>
      <span className="mt-0.5 inline-flex flex-wrap items-center gap-x-1 text-sm text-gray-600">
        {book.authors.join(', ')}
        <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </a>
  );
}

/** Plain text with any site page paths (e.g. /resources) turned into links. */
function TextWithPageLinks({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  // With a capturing group, split() puts the paths at odd indices.
  return (
    <>
      {text.split(SITE_PATH).map((part, index) =>
        index % 2 === 1 ? (
          <Link key={index} href={part} onClick={onNavigate} className="font-medium text-teal-700 underline underline-offset-2">
            {part}
          </Link>
        ) : (
          part
        )
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Formatting. The assistant may use a little Markdown (bold, short lists); it is turned into React elements here, never
// into raw HTML, so nothing it writes can inject markup. Anything else Markdown-like is shown as plain words.
// ---------------------------------------------------------------------------

const LIST_ITEM = /^(?:[-*+•]|\d{1,2}[.)])\s+/;
const ORDERED_ITEM = /^\d{1,2}[.)]\s+/;
const HEADING = /^#{1,6}\s+/;
const RULE = /^([-*_])(?:\s*\1){2,}$/;
// **bold** or __bold__, *italic*, `code`, and [label](target) links.
const INLINE = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|\*[^*\s][^*\n]*?\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

/** One line's inline formatting, with site paths (e.g. /resources) turned into links. */
function Inline({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  // With a capturing group, split() puts the formatted pieces at odd indices.
  return (
    <>
      {text.split(INLINE).map((part, index) => {
        if (index % 2 === 0) return part && <TextWithPageLinks key={index} text={part} onNavigate={onNavigate} />;
        if (part.startsWith('**') || part.startsWith('__')) {
          return (
            <strong key={index} className="font-semibold text-gray-900">
              <TextWithPageLinks text={part.slice(2, -2)} onNavigate={onNavigate} />
            </strong>
          );
        }
        if (part.startsWith('`')) return <span key={index}>{part.slice(1, -1)}</span>;
        if (part.startsWith('[')) {
          const [, label, target] = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? [];
          // Only links to the site's own pages; the assistant isn't trusted to link elsewhere.
          return SITE_PATH.test(target ?? '') && target === target.match(SITE_PATH)?.[1] ? (
            <Link key={index} href={target} onClick={onNavigate} className="font-medium text-teal-700 underline underline-offset-2">
              {label}
            </Link>
          ) : (
            <span key={index}>{label}</span>
          );
        }
        return <em key={index}>{part.slice(1, -1)}</em>;
      })}
    </>
  );
}

type Block =
  | { kind: 'paragraph'; text: string; heading: boolean }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'cards'; refs: string[]; note: string };

/**
 * Groups a reply's lines into blocks: paragraphs (headings become bold lines), bulleted or numbered lists, and lines
 * that cite pieces, books or resources, which become cards with their note underneath.
 */
function toBlocks(content: string, known: (ref: string) => boolean): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim().replace(/^>\s?/, '');
    if (!line || RULE.test(line)) continue;
    const refs = Array.from(line.matchAll(TOKEN), (match) => match[1]).filter(known);
    if (refs.length) {
      const note = line.replace(TOKEN, '').replace(LIST_ITEM, '').replace(/^[\s\-–—:•]+/, '').trim();
      blocks.push({ kind: 'cards', refs, note });
      continue;
    }
    // A token for something no longer known leaves nothing worth showing.
    const text = line.replace(TOKEN, '').trim();
    if (!text) continue;
    if (LIST_ITEM.test(text)) {
      const ordered = ORDERED_ITEM.test(text);
      const item = text.replace(LIST_ITEM, '');
      const previous = blocks[blocks.length - 1];
      if (previous?.kind === 'list' && previous.ordered === ordered) previous.items.push(item);
      else blocks.push({ kind: 'list', ordered, items: [item] });
      continue;
    }
    const heading = HEADING.test(text);
    blocks.push({ kind: 'paragraph', text: text.replace(HEADING, ''), heading });
  }
  return blocks;
}

/** An assistant reply: lightly formatted text, with each piece, book or resource token shown as a card. */
function AssistantMessage({
  content,
  pieces,
  resources,
  books,
  onNavigate,
}: {
  content: string;
  pieces: Record<string, PieceSummary>;
  resources: Record<string, Resource>;
  books: Record<string, LiteratureBook>;
  onNavigate: () => void;
}) {
  const blocks = toBlocks(content, (ref) => Boolean(pieces[ref] || resources[ref] || books[ref]));
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={index} className={block.heading ? 'font-semibold text-gray-900' : undefined}>
              <Inline text={block.text} onNavigate={onNavigate} />
            </p>
          );
        }
        if (block.kind === 'list') {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List key={index} className={`space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-teal-600`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline text={item} onNavigate={onNavigate} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <div key={index} className="space-y-1">
            {block.refs.map((ref) =>
              pieces[ref] ? (
                <PieceLink key={ref} piece={pieces[ref]} onNavigate={onNavigate} />
              ) : books[ref] ? (
                <BookLink key={ref} book={books[ref]} />
              ) : (
                <ResourceLink key={ref} resource={resources[ref]} />
              )
            )}
            {block.note && (
              <p className="px-1 text-sm text-gray-600">
                <Inline text={block.note} onNavigate={onNavigate} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ReplyData {
  reply: string;
  pieces: Record<string, PieceSummary>;
  resources: Record<string, Resource>;
  books: Record<string, LiteratureBook>;
}

/**
 * Reads the assistant's answer. It streams as newline-delimited JSON: {"status"} lines while it searches, passed to
 * `onStatus`, then the reply (or {"error"}). An error before the stream starts comes back as a plain JSON error.
 */
async function readReply(response: Response, onStatus: (status: string) => void): Promise<ReplyData> {
  const fallback = 'Something went wrong. Please try again.';
  if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('ndjson')) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || fallback);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = '';
  for (;;) {
    const { value, done } = await reader.read();
    buffered += decoder.decode(value, { stream: !done });
    const lines = buffered.split('\n');
    buffered = done ? '' : lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line);
      if (typeof data.status === 'string') onStatus(data.status);
      else if (typeof data.reply === 'string') return { pieces: {}, resources: {}, books: {}, ...data };
      else throw new Error(data.error || fallback);
    }
    if (done) throw new Error(fallback);
  }
}

interface SavedChat {
  turns: Turn[];
  pieces: Record<string, PieceSummary>;
  resources: Record<string, Resource>;
  books: Record<string, LiteratureBook>;
}

/**
 * The conversation survives a page refresh within the tab (sessionStorage), so a visitor who opens a suggested piece
 * and comes back still has their list. The panel is closed when the page is first drawn, so reading this during the
 * first render can't cause a hydration mismatch. Storage can be unavailable (private mode); then the chat starts fresh.
 */
function loadSavedChat(): SavedChat | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    return saved && Array.isArray(saved.turns) ? { pieces: {}, resources: {}, books: {}, ...saved } : null;
  } catch {
    return null;
  }
}

/** The floating "ask the assistant" button and chat panel, shown on every page. */
const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

export default function CatalogueAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  // A conversation from earlier in this tab, if any (see loadSavedChat).
  const [saved] = useState(loadSavedChat);
  const [turns, setTurns] = useState<Turn[]>(saved?.turns ?? []);
  const [pieces, setPieces] = useState<Record<string, PieceSummary>>(saved?.pieces ?? {});
  const [resources, setResources] = useState<Record<string, Resource>>(saved?.resources ?? {});
  const [books, setBooks] = useState<Record<string, LiteratureBook>>(saved?.books ?? {});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  // What the assistant is doing right now ("Searching: Beginner · Women composers"), while a reply is on its way.
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const greeting = `Hi${user ? ` ${user.username}` : ''}! I'm a virtual assistant. Tell me what you're looking for and I'll search our catalogue, books and resources for suggestions.`;

  // On a phone, focusing the field pops up the keyboard, which then covers most of the panel; there the
  // keyboard waits until the visitor taps the field.
  const focusInput = () => {
    if (!isPhone()) inputRef.current?.focus();
  };

  useEffect(() => {
    if (open) focusInput();
  }, [open]);

  // New ideas each time the panel opens on an empty chat.
  const toggleOpen = () => {
    if (!open && turns.length === 0) setSuggestions(pickSuggestions());
    setOpen(!open);
  };

  useEffect(() => {
    try {
      if (turns.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ turns, pieces, resources, books }));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Not saved; the chat still works.
    }
  }, [turns, pieces, resources, books]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy, error, status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // On a phone the panel covers the page, so close it when a suggestion is opened.
  const closeOnPhone = () => {
    if (isPhone()) setOpen(false);
  };

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const history: Turn[] = [...turns, { role: 'user', content: message }];
    setTurns(history);
    setDraft('');
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The page lets the assistant tell what "this piece" means.
        body: JSON.stringify({ messages: history, page: router.asPath }),
      });
      const data = await readReply(response, setStatus);
      setPieces((known) => ({ ...known, ...data.pieces }));
      setResources((known) => ({ ...known, ...data.resources }));
      setBooks((known) => ({ ...known, ...data.books }));
      setTurns([...history, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      // Put the message back so the visitor can retry without retyping it.
      setTurns(turns);
      setDraft(message);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
      setStatus(null);
      focusInput();
    }
  }

  // Waits for any reply in progress, which would otherwise bring the old conversation back when it arrives.
  const startOver = () => {
    if (busy) return;
    setTurns([]);
    setPieces({});
    setResources({});
    setBooks({});
    setError(null);
    setSuggestions(pickSuggestions());
    focusInput();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(draft);
  };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Repertoire assistant"
          className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:top-auto md:h-[min(36rem,calc(100dvh-8rem))] md:w-[24rem]"
        >
          <header className="flex items-center justify-between gap-3 bg-teal-700 px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold leading-tight">Repertoire assistant</h2>
              <p className="text-xs text-teal-100">Searches the Cello Repertoire Initiative catalogue</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {turns.length > 0 && (
                <button
                  type="button"
                  onClick={startOver}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HiArrowPath className="h-4 w-4" aria-hidden="true" />
                  New chat
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the assistant"
                className="rounded-full p-1.5 hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <HiXMark className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div ref={logRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gray-50 px-3 py-4 text-[15px] leading-relaxed">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-800 shadow-sm">{greeting}</div>

            {turns.length === 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {(/-piece\/\[id\]$/.test(router.pathname) ? PIECE_SUGGESTIONS : suggestions).map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    style={{ '--i': index } as React.CSSProperties}
                    className="reveal rounded-full border border-teal-200 bg-white px-3 py-1.5 text-left text-sm text-teal-800 hover:border-teal-400 hover:bg-teal-50"
                  >
                    {suggestion}
                  </button>
                ))}
                {!/-piece\/\[id\]$/.test(router.pathname) && (
                  <button
                    type="button"
                    onClick={() => setSuggestions(pickSuggestions())}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-500 hover:text-teal-700"
                  >
                    <HiArrowPath className="h-3.5 w-3.5" aria-hidden="true" />
                    Other ideas
                  </button>
                )}
              </div>
            )}

            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <div key={index} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-teal-700 px-3 py-2 text-white">
                  {turn.content}
                </div>
              ) : (
                <div key={index} className="max-w-[95%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-800 shadow-sm">
                  <AssistantMessage content={turn.content} pieces={pieces} resources={resources} books={books} onNavigate={closeOnPhone} />
                </div>
              )
            )}

            {busy && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" />
                </span>
                <span key={status ?? ''} className="animate-fade-in">{status ? `${status}…` : 'Thinking…'}</span>
              </div>
            )}

            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-gray-200 bg-white p-2">
            <label htmlFor="assistant-input" className="sr-only">
              Your message
            </label>
            <textarea
              id="assistant-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              maxLength={MAX_LENGTH}
              placeholder="What are you looking for?"
              className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiPaperAirplane className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={open ? 'Close the assistant' : 'Ask the repertoire assistant'}
        className={`fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 ${open ? 'hidden md:flex' : 'flex'} h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:bottom-6 md:right-6`}
      >
        {open ? <HiXMark className="h-6 w-6" aria-hidden="true" /> : <HiChatBubbleLeftRight className="h-6 w-6" aria-hidden="true" />}
      </button>
    </>
  );
}
