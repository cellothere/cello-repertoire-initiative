import { adminHandler, applyEdit, parseDocId } from '@/lib/admin';
import { RESOURCE_FIELDS } from '@/lib/admin-fields';
import { toResource } from '@/lib/repertoire';

/** PATCH { id, changes }: saves a Resource Catalog entry's changed fields and returns the entry as the page shows it. */
export default adminHandler(['PATCH'], async (req, res, user) => {
  const body = req.body ?? {};
  const { doc, changed } = await applyEdit({
    user,
    collection: 'resources',
    filter: { _id: parseDocId(body.id) },
    specs: RESOURCE_FIELDS,
    changes: body.changes,
  });
  res.status(200).json({ changed, record: toResource(doc) });
});
