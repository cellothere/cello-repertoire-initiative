import { useEffect, useId, useMemo, useState } from 'react';
import { PIECE_FIELDS, withOptions, type FieldValues } from '@/lib/admin-fields';
import type { PieceDetail } from '@/lib/types';
import RecordForm, { adminRequest, fieldClass } from './record-form';

interface EditorComposer {
  id: number;
  full_name: string;
  bio_link: string;
}

interface EditorData {
  fields: FieldValues;
  composers: EditorComposer[];
  /** The technique chips as stored in the database (lib/technique-keywords.ts). */
  techniques: string[];
}

interface SaveResult extends EditorData {
  changed: string[];
  piece: PieceDetail | null;
}

function ComposerLink({ composer, value, onChange }: { composer: EditorComposer; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-gray-800">
        {composer.full_name}
      </label>
      <input id={id} type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://" className={fieldClass} />
    </div>
  );
}

/**
 * Admin edit form for a piece page. It loads the fields as stored (the page itself may be up to a minute old), and
 * saving refreshes the page for visitors straight away.
 */
export default function PieceEditor({
  piece,
  onSaved,
  onClose,
}: {
  piece: PieceDetail;
  onSaved: (piece: PieceDetail | null, changed: string[]) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<EditorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<number, string>>({});
  const techniques = data?.techniques;
  const specs = useMemo(() => (techniques ? withOptions(PIECE_FIELDS, 'technique_focus', techniques) : PIECE_FIELDS), [techniques]);

  useEffect(() => {
    let active = true;
    adminRequest<EditorData>(`/api/admin/piece?instrument=${piece.instrument}&id=${piece.id}`).then(
      (loaded) => {
        if (!active) return;
        setData(loaded);
        setLinks(Object.fromEntries(loaded.composers.map((c) => [c.id, c.bio_link])));
      },
      (err: Error) => active && setError(err.message)
    );
    return () => {
      active = false;
    };
  }, [piece.instrument, piece.id]);

  if (error) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-rose-700">
          Couldn&apos;t load this piece for editing: {error}
        </p>
        <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
          Close
        </button>
      </div>
    );
  }
  if (!data) return <p className="text-gray-500" aria-busy="true">Loading the editor…</p>;

  const changedLinks = data.composers.filter((c) => (links[c.id] ?? '').trim() !== c.bio_link);

  const save = async (changes: FieldValues) => {
    const result = await adminRequest<SaveResult>('/api/admin/piece', 'PATCH', {
      instrument: piece.instrument,
      id: piece.id,
      changes,
      composers: changedLinks.map((c) => ({ id: c.id, bio_link: (links[c.id] ?? '').trim() })),
    });
    onSaved(result.piece, result.changed);
  };

  return (
    <RecordForm
      title={`Edit “${piece.title}”`}
      specs={specs}
      initial={data.fields}
      onSave={save}
      onCancel={onClose}
      extraChanged={changedLinks.length > 0}
      extra={
        data.composers.length > 0 && (
          <fieldset className="space-y-3 rounded-xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-200">
            <legend className="px-1 text-sm font-semibold text-gray-800">Composer bio links</legend>
            <p className="text-xs text-gray-500">
              These belong to the composer, so a change here shows on all of their pieces. Prefer the composer&apos;s own
              site or a society page.
            </p>
            {data.composers.map((composer) => (
              <ComposerLink
                key={composer.id}
                composer={composer}
                value={links[composer.id] ?? ''}
                onChange={(value) => setLinks((prev) => ({ ...prev, [composer.id]: value }))}
              />
            ))}
          </fieldset>
        )
      }
    />
  );
}
