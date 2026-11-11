import DEFAULT_TECHNIQUE_KEYWORDS from '@/utils/techniqueKeywords';
import { getDb } from './mongodb';

/**
 * The technique-focus chips are stored in the database, in the `settings` collection as
 * `{ _id: 'technique_keywords', values: [...] }`, so a super user can add one from the admin piece editor without a
 * deployment. utils/techniqueKeywords.ts is the starting list, and the fallback if the database can't be read.
 */
const SETTINGS = 'settings';
const DOC_ID = 'technique_keywords';
const TTL_MS = 60 * 1000;
const MAX_LENGTH = 40;

interface SettingsDoc {
  _id: string;
  values?: unknown;
}

/** Letters, numbers, spaces and simple punctuation, starting with a letter or number: e.g. "2 Note Slurs", "Left-Hand Pizzicato". */
const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} '&/().,-]*$/u;

/** A new chip name tidied up (spaces collapsed), or an error message explaining why it can't be used. */
export function checkTechniqueName(raw: string): { name: string } | { error: string } {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (!name) return { error: 'A technique name is empty.' };
  if (name.length > MAX_LENGTH) return { error: `"${name}" is longer than ${MAX_LENGTH} characters.` };
  if (!NAME_RE.test(name)) return { error: `"${name}" can only use letters, numbers, spaces and simple punctuation.` };
  return { name };
}

const fold = (value: string) => value.toLocaleLowerCase('en');

/** The stored list as clean strings, without blanks or case-insensitive repeats. */
function cleanList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const list: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const name = value.replace(/\s+/g, ' ').trim();
    if (!name || seen.has(fold(name))) continue;
    seen.add(fold(name));
    list.push(name);
  }
  return list;
}

async function load(): Promise<string[]> {
  try {
    const doc = await (await getDb()).collection<SettingsDoc>(SETTINGS).findOne({ _id: DOC_ID });
    const list = cleanList(doc?.values);
    return list.length ? list : [...DEFAULT_TECHNIQUE_KEYWORDS];
  } catch (error) {
    console.error('Reading technique keywords failed, using the built-in list:', error);
    return [...DEFAULT_TECHNIQUE_KEYWORDS];
  }
}

let cache: { at: number; value: Promise<string[]> } | null = null;

/** The current chip list, cached for a minute per server instance. Pass `fresh` to read the database now. */
export function getTechniqueKeywords({ fresh = false }: { fresh?: boolean } = {}): Promise<string[]> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const value = load();
  cache = { at: Date.now(), value };
  return value;
}

/**
 * Maps chosen chips onto `list`, in the order chosen: names already on the list take its spelling (so "tied notes"
 * becomes "Tied Notes"), and new names are checked with checkTechniqueName and returned in `added`.
 */
export function matchTechniques(chosen: string[], list: string[]): { names: string[]; added: string[]; errors: string[] } {
  const byFold = new Map(list.map((name) => [fold(name), name]));
  const names: string[] = [];
  const added: string[] = [];
  const errors: string[] = [];
  for (const raw of chosen) {
    if (!raw.trim()) continue; // blanks are dropped, as cleanField does
    const existing = byFold.get(fold(raw.replace(/\s+/g, ' ').trim()));
    if (existing) {
      names.push(existing);
      continue;
    }
    const checked = checkTechniqueName(raw);
    if ('error' in checked) {
      errors.push(checked.error);
      continue;
    }
    byFold.set(fold(checked.name), checked.name);
    names.push(checked.name);
    added.push(checked.name);
  }
  return { names, added, errors };
}

/** Adds new chip names to the stored list (creating it from the built-in list the first time) and returns the new list. */
export async function addTechniqueKeywords(names: string[]): Promise<string[]> {
  const coll = (await getDb()).collection<SettingsDoc>(SETTINGS);
  const current = await getTechniqueKeywords({ fresh: true });
  const missing = names.filter((name) => !current.some((existing) => fold(existing) === fold(name)));
  if (missing.length) {
    await coll.updateOne({ _id: DOC_ID }, { $set: { values: [...current, ...missing] } }, { upsert: true });
  }
  return getTechniqueKeywords({ fresh: true });
}
