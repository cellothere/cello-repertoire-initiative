import { adminHandler, applyEdit, parseDocId } from '@/lib/admin';
import { LITERATURE_FIELDS } from '@/lib/admin-fields';
import { toBook } from '@/lib/repertoire';

/** PATCH { id, changes }: saves a Literature book's changed fields and returns the book as the page shows it. */
export default adminHandler(['PATCH'], async (req, res, user) => {
  const body = req.body ?? {};
  const { doc, changed } = await applyEdit({
    user,
    collection: 'literature',
    filter: { _id: parseDocId(body.id) },
    specs: LITERATURE_FIELDS,
    changes: body.changes,
  });
  res.status(200).json({ changed, record: toBook(doc) });
});
