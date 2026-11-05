import { LEVEL_ORDER } from '@/utils/musicUtils';
import techniqueKeywords from '@/utils/techniqueKeywords';
import { FREE_DOWNLOAD_KINDS } from './copyright';
import { LITERATURE_TOPICS } from './types';

/**
 * The fields a super user can edit in admin view, shared by the edit forms (components/admin) and the API routes that
 * check and save them (lib/admin.ts), so both always agree on what each field accepts.
 *
 * Kinds: `line` one line of text, `text` a paragraph, `url` one link, `list` one item per line, `urls` one link per
 * line, `select` one of `options`, `chips` any of `options`.
 */
export type FieldKind = 'line' | 'text' | 'url' | 'list' | 'urls' | 'select' | 'chips';

export interface FieldSpec {
  name: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  /** Labels for select options, when the stored value isn't readable (e.g. '' or "from-composer"). */
  optionLabels?: Record<string, string>;
  required?: boolean;
  /** A whole-value check for `line` fields, e.g. a four-digit year. */
  pattern?: RegExp;
  hint?: string;
}

export type FieldValue = string | string[];
export type FieldValues = Record<string, FieldValue>;

const CITATION_HINT = 'One link per line; the first is [1] in the description, the second [2], and so on.';

export const PIECE_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', kind: 'line', required: true },
  { name: 'level', label: 'Level', kind: 'select', options: LEVEL_ORDER, required: true },
  { name: 'composition_year', label: 'Composed', kind: 'line', hint: 'e.g. 1916 or c. 1890' },
  { name: 'duration', label: 'Duration', kind: 'line', hint: 'As stored, e.g. 4:00' },
  { name: 'instrumentation', label: 'Instrumentation', kind: 'list', hint: 'One instrument per line; two cellos are two lines.' },
  { name: 'arrangers', label: 'Arrangers', kind: 'list', hint: 'One name per line.' },
  { name: 'publisher_info', label: 'Publisher', kind: 'line' },
  { name: 'description', label: 'About this piece', kind: 'text', hint: 'Use [1], [2]… to cite the sources below.' },
  { name: 'description_sources', label: 'Description sources', kind: 'urls', hint: CITATION_HINT },
  { name: 'technical_overview', label: 'Technical overview', kind: 'text' },
  { name: 'technique_focus', label: 'Technical focus', kind: 'chips', options: techniqueKeywords },
  {
    name: 'where_to_buy_or_download',
    label: 'Purchase or download',
    kind: 'list',
    hint: 'One entry per line; links in the text become clickable.',
  },
  { name: 'audio_link', label: 'Recordings', kind: 'urls', hint: 'One link per line; the first YouTube link is embedded.' },
  {
    name: 'free_download',
    label: 'Free download',
    kind: 'select',
    options: ['', ...FREE_DOWNLOAD_KINDS],
    optionLabels: { '': 'Not free', 'public-domain': 'Public domain', 'from-composer': 'Free from the composer' },
  },
  { name: 'first_published', label: 'First published', kind: 'line', pattern: /^\d{4}$/, hint: 'Four-digit year, or blank.' },
];

export const RESOURCE_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', kind: 'line', required: true },
  { name: 'url', label: 'Website', kind: 'url', required: true },
  { name: 'description', label: 'Description', kind: 'text', hint: 'Use [1], [2]… to cite the sources below.' },
  { name: 'description_sources', label: 'Description sources', kind: 'urls', hint: CITATION_HINT },
  { name: 'extra_links', label: 'Extra links', kind: 'urls', hint: 'Shown under the description, one per line.' },
];

export const LITERATURE_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', kind: 'line', required: true },
  { name: 'authors', label: 'Authors', kind: 'list', hint: 'One per line, roles in the name, e.g. "Jane Doe (translator)".' },
  { name: 'topic', label: 'Topic', kind: 'select', options: LITERATURE_TOPICS, required: true },
  { name: 'publisher', label: 'Publisher', kind: 'line' },
  { name: 'year', label: 'Year', kind: 'line', pattern: /^\d{4}$/, hint: 'Year of the edition linked to.' },
  { name: 'original_year', label: 'First published', kind: 'line', pattern: /^\d{4}$/, hint: 'Only for reprints or translations.' },
  { name: 'isbn', label: 'ISBN', kind: 'line' },
  { name: 'url', label: 'Publisher page', kind: 'url', required: true },
  { name: 'description', label: 'Description', kind: 'text', hint: 'Use [1], [2]… to cite the sources below.' },
  { name: 'description_sources', label: 'Description sources', kind: 'urls', hint: CITATION_HINT },
  { name: 'extra_links', label: 'Extra links', kind: 'urls', hint: 'One per line.' },
];

const isListKind = (kind: FieldKind) => kind === 'list' || kind === 'urls' || kind === 'chips';
const isUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

/** A stored value in the shape its field uses, however the document happened to store it. */
export function normalizeField(spec: FieldSpec, value: unknown): FieldValue {
  if (isListKind(spec.kind)) {
    const items = Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
    return items.map((item) => (typeof item === 'string' ? item.trim() : String(item ?? ''))).filter(Boolean);
  }
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value);
}

export function normalizeFields(specs: FieldSpec[], doc: Record<string, unknown>): FieldValues {
  return Object.fromEntries(specs.map((spec) => [spec.name, normalizeField(spec, doc[spec.name])]));
}

const MAX_LINE = 1000;
const MAX_TEXT = 20000;
const MAX_ITEMS = 80;

/**
 * Checks one submitted value and returns it cleaned up, or throws an Error whose message is shown to the editor.
 * Paragraph text keeps its line breaks; everything else is trimmed.
 */
export function cleanField(spec: FieldSpec, raw: unknown): FieldValue {
  const fail = (problem: string): never => {
    throw new Error(`${spec.label}: ${problem}`);
  };

  if (isListKind(spec.kind)) {
    if (!Array.isArray(raw) || raw.some((item) => typeof item !== 'string')) fail('expected a list');
    const items = (raw as string[]).map((item) => item.trim()).filter(Boolean);
    if (items.length > MAX_ITEMS) fail(`at most ${MAX_ITEMS} entries`);
    for (const item of items) {
      if (item.length > MAX_LINE) fail('an entry is too long');
      if (spec.kind === 'urls' && !isUrl(item)) fail(`"${item}" is not a link starting with http:// or https://`);
      if (spec.kind === 'chips' && !spec.options?.includes(item)) fail(`"${item}" is not one of the options`);
    }
    if (spec.required && items.length === 0) fail('required');
    return Array.from(new Set(items));
  }

  if (typeof raw !== 'string') fail('expected text');
  const value = spec.kind === 'text' ? (raw as string).replace(/\r\n?/g, '\n').trim() : (raw as string).replace(/\s+/g, ' ').trim();
  if (value.length > (spec.kind === 'text' ? MAX_TEXT : MAX_LINE)) fail('too long');
  if (spec.required && !value) fail('required');
  if (value && spec.kind === 'url' && !isUrl(value)) fail('must be a link starting with http:// or https://');
  if (value && spec.pattern && !spec.pattern.test(value)) fail(spec.hint ?? 'not in the expected format');
  if (spec.kind === 'select' && !spec.options?.includes(value)) fail('choose one of the options');
  return value;
}

/** The highest [n] citation marker in a description, to warn when there are fewer sources than markers. */
export function highestCitation(text: string): number {
  let highest = 0;
  for (const match of text.matchAll(/\[(\d{1,3})\]/g)) highest = Math.max(highest, Number(match[1]));
  return highest;
}
