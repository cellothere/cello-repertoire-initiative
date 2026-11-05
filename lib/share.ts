import { SITE_NAME, SITE_URL } from '@/components/seo';
import { INSTRUMENT_LABELS, pieceHref } from './instruments';
import type { PieceDetail } from './types';
import { joinNames, parseYear } from '@/utils/musicUtils';

/** Bump to make link previews everywhere pick up a redesigned site image. */
const SITE_IMAGE_VERSION = '1';

/** The branded preview image for pages without their own. */
export const SITE_SHARE_IMAGE = `/api/og/site?v=${SITE_IMAGE_VERSION}`;

/** A short, stable fingerprint of a string (not for security), so an image URL changes when its content does. */
function fingerprint(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

/**
 * The piece's preview image. The version changes whenever something drawn on it changes (e.g. an admin edit to the
 * level), so link previews and the CDN don't keep showing the old one.
 */
export function pieceShareImage(piece: PieceDetail): string {
  const drawn = [
    SITE_IMAGE_VERSION,
    piece.title,
    piece.composers.map((c) => c.full_name).join('|'),
    piece.arrangers.join('|'),
    piece.level,
    piece.instrumentation.join('|'),
    piece.composition_year,
    piece.cover_image,
  ].join('\n');
  return `/api/og/${piece.instrument}/${piece.id}?v=${fingerprint(drawn)}`;
}

/** "Cello and piano", "Cello, violin and piano". */
export function instrumentationLabel(parts: string[]): string {
  const names = parts.map((part, index) => (index === 0 ? part : part.toLowerCase()));
  return joinNames(names);
}

export interface ShareContent {
  url: string;
  /** For the native share sheet and the email subject. */
  title: string;
  /** One line for text messages and the native share sheet; the link is added after it. */
  text: string;
  emailSubject: string;
  emailBody: string;
}

/** What gets shared for a piece: its address and a friendly message naming the piece. */
export function pieceShareContent(piece: PieceDetail): ShareContent {
  const url = `${SITE_URL}${pieceHref(piece.instrument, piece.id)}`;
  const composers = joinNames(piece.composers.map((c) => c.full_name));
  const name = composers ? `“${piece.title}” by ${composers}` : `“${piece.title}”`;
  const year = parseYear(piece.composition_year);
  const facts = [
    piece.level !== 'Unknown' ? piece.level : '',
    instrumentationLabel(piece.instrumentation) || INSTRUMENT_LABELS[piece.instrument],
    year ? String(year) : '',
  ].filter(Boolean);

  return {
    url,
    title: `${piece.title}${composers ? ` by ${composers}` : ''}`,
    text: `Check out what I found on the ${SITE_NAME}: ${name}`,
    emailSubject: `${name} on the ${SITE_NAME}`,
    emailBody: [
      `Check out what I found on the ${SITE_NAME}:`,
      '',
      name,
      facts.join(' · '),
      '',
      url,
      '',
      `The ${SITE_NAME} is a free, searchable catalogue of level-appropriate cello music, featuring under-recognized and underrepresented composers.`,
    ].join('\n'),
  };
}
