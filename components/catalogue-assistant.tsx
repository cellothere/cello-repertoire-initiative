import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { HiChatBubbleLeftRight, HiPaperAirplane, HiXMark } from 'react-icons/hi2';
import LevelBadge from './level-badge';
import { useAuth } from '@/contexts/AuthContext';
import { pieceHref } from '@/lib/instruments';
import type { PieceSummary, Resource } from '@/lib/types';
import { formatComposers, hostnameOf } from '@/utils/musicUtils';

interface Turn {
  role: 'user' | 'assistant';
  /** Assistant turns keep their [[instrument:id]] and [[resource:id]] tokens, which are sent back as context. */
  content: string;
}

const SUGGESTIONS = [
  'Beginner pieces by women composers',
  'Intermediate cello and piano music by Black composers',
  'An unaccompanied piece for an advanced student',
];

const TOKEN = /\[\[([a-z]+:\d+)\]\]/g;
const MAX_LENGTH = 800;

// Site pages the assistant may mention by path; anything else stays plain text.
const SITE_PATH = /(\/(?:cello-music|violin-music|featured-databases|composers|recently-added|resources|contribute)\b(?:\?category=[a-z-]+)?)/;

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

/** An assistant reply: plain lines of text, with each piece or resource token shown as a card above its note. */
function AssistantMessage({
  content,
  pieces,
  resources,
  onNavigate,
}: {
  content: string;
  pieces: Record<string, PieceSummary>;
  resources: Record<string, Resource>;
  onNavigate: () => void;
}) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const refs = Array.from(line.matchAll(TOKEN), (match) => match[1]).filter((ref) => pieces[ref] || resources[ref]);
        const text = line.replace(TOKEN, '').replace(/^[\s\-–—:•]+/, '').trim();
        if (!refs.length) {
          return (
            <p key={index}>
              <TextWithPageLinks text={text} onNavigate={onNavigate} />
            </p>
          );
        }
        return (
          <div key={index} className="space-y-1">
            {refs.map((ref) =>
              pieces[ref] ? (
                <PieceLink key={ref} piece={pieces[ref]} onNavigate={onNavigate} />
              ) : (
                <ResourceLink key={ref} resource={resources[ref]} />
              )
            )}
            {text && (
              <p className="px-1 text-sm text-gray-600">
                <TextWithPageLinks text={text} onNavigate={onNavigate} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The floating "ask the assistant" button and chat panel, shown on every page. */
const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

export default function CatalogueAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pieces, setPieces] = useState<Record<string, PieceSummary>>({});
  const [resources, setResources] = useState<Record<string, Resource>>({});
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const greeting = `Hi${user ? ` ${user.username}` : ''}! I'm a virtual assistant. Tell me what you're looking for and I'll search our catalogue for suggestions.`;

  // On a phone, focusing the field pops up the keyboard, which then covers most of the panel; there the
  // keyboard waits until the visitor taps the field.
  const focusInput = () => {
    if (!isPhone()) inputRef.current?.focus();
  };

  useEffect(() => {
    if (open) focusInput();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy, error]);

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
    setBusy(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.reply !== 'string') {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setPieces((known) => ({ ...known, ...data.pieces }));
      setResources((known) => ({ ...known, ...data.resources }));
      setTurns([...history, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      // Put the message back so the visitor can retry without retyping it.
      setTurns(turns);
      setDraft(message);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
      focusInput();
    }
  }

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
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="rounded-full p-1.5 hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <HiXMark className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={logRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gray-50 px-3 py-4 text-[15px] leading-relaxed">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-800 shadow-sm">{greeting}</div>

            {turns.length === 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-left text-sm text-teal-800 hover:border-teal-400 hover:bg-teal-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <div key={index} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-teal-700 px-3 py-2 text-white">
                  {turn.content}
                </div>
              ) : (
                <div key={index} className="max-w-[95%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-800 shadow-sm">
                  <AssistantMessage content={turn.content} pieces={pieces} resources={resources} onNavigate={closeOnPhone} />
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
                Searching the catalogue…
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
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close the assistant' : 'Ask the repertoire assistant'}
        className={`fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 ${open ? 'hidden md:flex' : 'flex'} h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:bottom-6 md:right-6`}
      >
        {open ? <HiXMark className="h-6 w-6" aria-hidden="true" /> : <HiChatBubbleLeftRight className="h-6 w-6" aria-hidden="true" />}
      </button>
    </>
  );
}
