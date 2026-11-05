import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId, type Document, type Filter } from 'mongodb';
import { allowMethods } from './api';
import { getDb } from './mongodb';
import { isForbidden, isUnauthorized, requireSuperUser, type User } from './auth-middleware';
import { cleanField, normalizeField, type FieldSpec, type FieldValue } from './admin-fields';

/** An error whose message is safe to show the editor, with the HTTP status to send. */
export class EditError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

/**
 * Wraps an admin API route: only the listed methods, never cached, super users only, and errors turned into
 * `{ error }` responses with the right status.
 */
export function adminHandler(methods: string[], handle: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!allowMethods(req, res, methods)) return;
    res.setHeader('Cache-Control', 'private, no-store');
    try {
      const user = await requireSuperUser(req);
      await handle(req, res, user);
    } catch (error) {
      if (isUnauthorized(error)) return res.status(401).json({ error: 'Please sign in again.' });
      if (isForbidden(error)) return res.status(403).json({ error: 'Only super users can edit the catalogue.' });
      if (error instanceof EditError) return res.status(error.status).json({ error: error.message });
      console.error('Admin edit error:', error);
      return res.status(500).json({ error: 'Something went wrong saving that. Nothing was changed.' });
    }
  };
}

/** Resource ids are numbers for older entries and ObjectIds for newer ones; literature ids are ObjectIds. */
export function parseDocId(raw: unknown): number | ObjectId {
  if (typeof raw === 'number' && Number.isInteger(raw)) return raw;
  if (typeof raw === 'string' && /^\d{1,9}$/.test(raw)) return Number(raw);
  if (typeof raw === 'string' && ObjectId.isValid(raw) && /^[0-9a-f]{24}$/i.test(raw)) return new ObjectId(raw);
  throw new EditError('Unknown record id.');
}

const sameValue = (a: FieldValue, b: FieldValue) => JSON.stringify(a) === JSON.stringify(b);

/** Every admin change is logged here with the before and after values, so any edit can be looked up or undone. */
export async function logEdit(user: User, collection: string, filter: Document, changes: Record<string, { before: unknown; after: unknown }>) {
  const db = await getDb();
  await db.collection('admin_edits').insertOne({
    collection,
    filter,
    changes,
    user_id: user.id,
    username: user.username,
    at: new Date(),
  });
}

/**
 * Checks `changes` against the field specs and saves the fields that actually differ from the stored document.
 * Returns the updated document and the names of the fields that changed.
 */
export async function applyEdit({
  user,
  collection,
  filter,
  specs,
  changes,
}: {
  user: User;
  collection: string;
  filter: Document;
  specs: FieldSpec[];
  changes: unknown;
}): Promise<{ doc: Document; changed: string[] }> {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new EditError('Nothing to save.');

  const db = await getDb();
  const coll = db.collection(collection);
  const doc = await coll.findOne(filter as Filter<Document>);
  if (!doc) throw new EditError('That record no longer exists.', 404);

  const set: Record<string, FieldValue> = {};
  const log: Record<string, { before: unknown; after: unknown }> = {};
  for (const [name, raw] of Object.entries(changes)) {
    const spec = specs.find((field) => field.name === name);
    if (!spec) throw new EditError(`"${name}" can't be edited here.`);
    let value: FieldValue;
    try {
      value = cleanField(spec, raw);
    } catch (error) {
      throw new EditError(error instanceof Error ? error.message : 'Invalid value.');
    }
    if (sameValue(value, normalizeField(spec, doc[name]))) continue;
    set[name] = value;
    log[name] = { before: doc[name] ?? null, after: value };
  }

  const changed = Object.keys(set);
  if (changed.length === 0) return { doc, changed };

  await coll.updateOne({ _id: doc._id }, { $set: set });
  await logEdit(user, collection, { _id: doc._id }, log);
  return { doc: { ...doc, ...set }, changed };
}
