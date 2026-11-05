import { useCallback, useMemo, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeFields, type FieldSpec, type FieldValues } from '@/lib/admin-fields';
import { patchCachedJson, useJson } from '@/lib/use-json';
import RecordForm, { adminRequest } from './record-form';

interface Record_ {
  _id: string;
  title: string;
}

/**
 * Loads a list page's records (Resource Catalog, Literature) and keeps admin edits on screen. In admin view the list
 * is fetched past the CDN cache, so a reload right after saving shows what was saved.
 */
export function useEditableList<T extends Record_>(url: string) {
  const { adminView } = useAuth();
  const [stamp] = useState(() => Date.now());
  const source = adminView ? `${url}?admin=${stamp}` : url;
  const result = useJson<T[]>(source);
  const [edited, setEdited] = useState<Record<string, T>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const data = useMemo(() => result.data?.map((record) => edited[record._id] ?? record), [result.data, edited]);

  const saved = useCallback(
    (record: T) => {
      setEdited((prev) => ({ ...prev, [record._id]: record }));
      setEditingId(null);
      for (const key of [url, source]) {
        patchCachedJson<T[]>(key, (list) => list.map((item) => (item._id === record._id ? record : item)));
      }
    },
    [url, source]
  );

  return { ...result, data, adminView, editingId: adminView ? editingId : null, setEditingId, saved };
}

/** The pencil button on a card in admin view. It sits above the card's stretched link. */
export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      className="absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md transition-colors hover:bg-amber-300"
    >
      <FaPen className="h-3 w-3" aria-hidden="true" />
      Edit
    </button>
  );
}

/** The inline edit form that replaces a card while it is being edited. */
export function InlineEditor<T extends Record_>({
  record,
  specs,
  endpoint,
  onSaved,
  onCancel,
}: {
  record: T;
  specs: FieldSpec[];
  endpoint: string;
  onSaved: (record: T) => void;
  onCancel: () => void;
}) {
  const initial = useMemo(() => normalizeFields(specs, record as unknown as Record<string, unknown>), [specs, record]);

  const save = async (changes: FieldValues) => {
    const result = await adminRequest<{ record: T }>(endpoint, 'PATCH', { id: record._id, changes });
    onSaved(result.record);
  };

  return (
    <div className="card p-4 ring-2 ring-amber-300 sm:p-6">
      <RecordForm title={`Edit “${record.title}”`} specs={specs} initial={initial} onSave={save} onCancel={onCancel} />
    </div>
  );
}
