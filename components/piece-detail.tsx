import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { BsFileEarmarkMusicFill } from 'react-icons/bs';
import { FaArrowRight, FaChevronRight } from 'react-icons/fa';
import { HiMusicNote } from 'react-icons/hi';
import Seo from './seo';
import SaveButton from './save-button';
import LevelModal from './level-modal';
import YouTubeEmbed from './youtube-embed';
import Linkify, { ExternalLink } from './linkify';
import { INSTRUMENT_LABELS, LISTING_PATHS, composerWorksHref, pieceHref } from '@/lib/instruments';
import type { PieceDetail } from '@/lib/types';
import { formatDuration, hostnameOf, joinNames, parseYear, youtubeId } from '@/utils/musicUtils';

function Card({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4">{title}</h2>
      {children}
    </section>
  );
}

function summarize(text: string, max = 155): string {
  const clean = text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export default function PieceDetailPage({ piece }: { piece: PieceDetail }) {
  const [rubricOpen, setRubricOpen] = useState(false);

  const instrumentLabel = INSTRUMENT_LABELS[piece.instrument];
  const listingPath = LISTING_PATHS[piece.instrument];
  const composers = piece.composers.length ? piece.composers : [{ id: 0, full_name: 'Unknown Composer', bio_link: null }];
  const byLine = joinNames(composers.map((c) => c.full_name));
  // One "more by" link per composer; pieces with a missing composer record get none.
  const worksLinks = piece.composers
    .map((c) => ({ composer: c, href: composerWorksHref(piece.instrument, c.full_name) }))
    .filter((link): link is { composer: (typeof composers)[number]; href: string } => Boolean(link.href));
  const year = parseYear(piece.composition_year);
  const duration = formatDuration(piece.duration);
  const videoId = useMemo(() => piece.audio_link.map(youtubeId).find(Boolean) ?? null, [piece.audio_link]);
  const recordings = piece.audio_link.filter((link) => hostnameOf(link));

  const details = [
    { label: 'Instrumentation', value: piece.instrumentation.join(', ') },
    { label: 'Composed', value: year ? String(year) : '' },
    { label: 'Duration', value: duration ?? '' },
    { label: 'Publisher', value: piece.publisher_info },
  ].filter((detail) => detail.value);

  // Shown in the sidebar on wide screens, and straight after the recording on phones, where the
  // sidebar would otherwise come last.
  const purchaseCard = (className: string) => (
    <Card title="Purchase or download" className={className}>
      {piece.where_to_buy_or_download.length > 0 ? (
        <ul className="space-y-3">
          {piece.where_to_buy_or_download.map((entry, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <BsFileEarmarkMusicFill className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <span className="min-w-0 break-words">
                <Linkify text={entry} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">
          We don&apos;t have a source for this score yet.{' '}
          <Link href="/contribute" className="font-medium text-teal-700 underline underline-offset-2">
            Know where to find it?
          </Link>
        </p>
      )}
    </Card>
  );

  return (
    <>
      <Seo
        title={`${piece.title} by ${byLine}`}
        path={pieceHref(piece.instrument, piece.id)}
        description={
          summarize(piece.description) ||
          `${piece.title} by ${byLine}: a ${piece.level.toLowerCase()} level piece for ${piece.instrumentation.join(', ').toLowerCase() || instrumentLabel.toLowerCase()}.`
        }
      />

      <header className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 py-6 md:py-12">
          {listingPath && (
            <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-400 md:mb-4">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href={listingPath} className="hover:text-white hover:underline">
                    {instrumentLabel} Music
                  </Link>
                </li>
                <li aria-hidden="true">
                  <FaChevronRight className="h-2.5 w-2.5" />
                </li>
                <li aria-current="page" className="line-clamp-1 text-gray-300">
                  {piece.title}
                </li>
              </ol>
            </nav>
          )}

          <h1 className="max-w-4xl break-words text-[1.75rem] font-bold leading-tight tracking-tight md:text-5xl">{piece.title}</h1>

          <p className="mt-2 text-lg text-gray-300 md:mt-3">
            by{' '}
            {composers.map((composer, index) => (
              <span key={composer.id}>
                {index > 0 && (index === composers.length - 1 ? ' and ' : ', ')}
                {composer.bio_link ? (
                  <a
                    href={composer.bio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    {composer.full_name}
                  </a>
                ) : (
                  <span className="font-semibold text-white">{composer.full_name}</span>
                )}
              </span>
            ))}
          </p>

          {/* Phones get the key facts up top; wider screens have the Details card beside the description. */}
          {details.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-white/5 p-3 text-sm ring-1 ring-inset ring-white/10 lg:hidden">
              {details.map((detail) => (
                <div key={detail.label} className={`min-w-0 ${detail.label === 'Publisher' ? 'col-span-2' : ''}`}>
                  <dt className="text-xs text-gray-400">{detail.label}</dt>
                  <dd className="break-words font-medium text-white">{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <button
              type="button"
              onClick={() => setRubricOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white/10 px-4 py-2.5 font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20 sm:flex-none sm:py-2"
              aria-label={`Level: ${piece.level}. What does this level mean?`}
            >
              {piece.level}
              <AiFillQuestionCircle className="h-4 w-4 text-teal-300" aria-hidden="true" />
            </button>
            <SaveButton
              pieceId={piece.id}
              instrument={piece.instrument}
              title={piece.title}
              variant="full"
              className="shrink-0 justify-center py-2.5 sm:py-2"
            />
            {worksLinks.map(({ composer, href }) => (
              <Link
                key={composer.id}
                href={href}
                className="-ml-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 font-semibold text-teal-300 transition-colors hover:bg-white/10 hover:text-teal-200 sm:ml-0 sm:w-auto sm:px-4"
              >
                {worksLinks.length > 1 ? `More by ${composer.full_name}` : 'More by this composer'}
                <FaArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto grid gap-4 px-4 py-5 sm:gap-6 md:py-12 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {videoId && (
            <section className="card overflow-hidden" aria-label="Recording">
              <YouTubeEmbed videoId={videoId} title={piece.title} />
            </section>
          )}

          {purchaseCard('lg:hidden')}

          <Card title="About this piece">
            <p className="whitespace-pre-line break-words leading-relaxed text-gray-700">
              {piece.description ? <Linkify text={piece.description} /> : 'A description is coming soon.'}
            </p>
          </Card>

          <Card title="Technical overview">
            <p className="whitespace-pre-line break-words leading-relaxed text-gray-700">
              {piece.technical_overview ? (
                <Linkify text={piece.technical_overview} />
              ) : (
                'No technical overview is available yet.'
              )}
            </p>
            {piece.technique_focus.length > 0 && (
              <>
                <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">Technical focus</h3>
                <ul className="flex flex-wrap gap-2">
                  {piece.technique_focus.map((focus) => (
                    <li key={focus} className="chip">
                      {focus}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        <aside className="space-y-4 sm:space-y-6">
          {details.length > 0 && (
            <Card title="Details" className="hidden lg:block">
              <dl className="space-y-3">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                    <dd className="break-words text-gray-900">
                      <Linkify text={detail.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {purchaseCard('hidden lg:block')}

          {recordings.length > 0 && (
            <Card title="Recordings">
              <ul className="space-y-3">
                {recordings.map((link, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <HiMusicNote className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <ExternalLink href={link}>{hostnameOf(link)}</ExternalLink>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>

      <LevelModal open={rubricOpen} onClose={() => setRubricOpen(false)} level={piece.level} />
    </>
  );
}
