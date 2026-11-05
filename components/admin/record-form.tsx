import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { highestCitation, type FieldSpec, type FieldValue, type FieldValues } from '@/lib/admin-fields';

const isListKind = (spec: FieldSpec) => spec.kind === 'list' || spec.kind === 'urls';

/** Lists are edited as one entry per line; everything else is edited as it is stored. */
function toDraft(specs: FieldSpec[], values: FieldValues): Record<string, string | string[]> {
  return Object.fromEntries(
    specs.map((spec) => {
      const value = values[spec.name] ?? (spec.kind === 'chips' || isListKind(spec) ? [] : '');
      return [spec.name, isListKind(spec) ? (value as string[]).join('\n') : value];
    })
  );
}

function fromDraft(spec: FieldSpec, draft: string | string[]): FieldValue {
  if (isListKind(spec)) {
    return (draft as string)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return draft;
}

const same = (a: FieldValue, b: FieldValue) => JSON.stringify(a) === JSON.stringify(b);

/** Only the fields that differ from what was loaded, so a save never rewrites fields the editor didn't touch. */
export function changedFields(specs: FieldSpec[], initial: FieldValues, draft: Record<string, string | string[]>): FieldValues {
  const changes: FieldValues = {};
  for (const spec of specs) {
    const value = fromDraft(spec, draft[spec.name]);
    const before = initial[spec.name] ?? (spec.kind === 'chips' || isListKind(spec) ? [] : '');
    const comparable = spec.kind === 'text' || isListKind(spec) || spec.kind === 'chips' ? value : (value as string).trim();
    if (!same(comparable, before)) changes[spec.name] = value;
  }
  return changes;
}

export const fieldClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm';

function ChipPicker({ spec, selected, onChange }: { spec: FieldSpec; selected: string[]; onChange: (next: string[]) => void }) {
  const toggle = (option: string) =>
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  // Keep any stored chip that is no longer in the list visible, so it can be removed.
  const options = [...(spec.options ?? []), ...selected.filter((item) => !spec.options?.includes(item))];
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              on ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: string | string[];
  onChange: (next: string | string[]) => void;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const common = {
    id,
    'aria-describedby': spec.hint ? hintId : undefined,
    required: spec.required,
    className: fieldClass,
  };

  let control: ReactNode;
  if (spec.kind === 'chips') {
    control = <ChipPicker spec={spec} selected={value as string[]} onChange={onChange} />;
  } else if (spec.kind === 'select') {
    const current = value as string;
    const options = spec.options?.includes(current) ? spec.options : [current, ...(spec.options ?? [])];
    control = (
      <select {...common} value={current} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {spec.optionLabels?.[option] ?? (option || '(none)')}
          </option>
        ))}
      </select>
    );
  } else if (spec.kind === 'text' || isListKind(spec)) {
    const text = value as string;
    const lines = text.split('\n').length;
    control = (
      <textarea
        {...common}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={spec.kind === 'text' ? Math.min(16, Math.max(6, Math.ceil(text.length / 70) + 1)) : Math.min(8, Math.max(2, lines + 1))}
        spellCheck={spec.kind === 'text'}
        className={`${fieldClass} ${spec.kind === 'urls' ? 'font-mono text-xs sm:text-xs' : ''}`}
      />
    );
  } else {
    control = (
      <input
        {...common}
        type={spec.kind === 'url' ? 'url' : 'text'}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={spec.kind === 'text' || spec.kind === 'chips' || isListKind(spec) ? 'sm:col-span-2' : ''}>
      {spec.kind === 'chips' ? (
        <p className="text-sm font-semibold text-gray-800">
          {spec.label} <span className="font-normal text-gray-500">({(value as string[]).length} chosen)</span>
        </p>
      ) : (
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">
          {spec.label}
          {spec.required && <span className="text-rose-600"> *</span>}
        </label>
      )}
      {control}
      {spec.hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {spec.hint}
        </p>
      )}
    </div>
  );
}

/**
 * The admin edit form for one catalogue record (a piece, resource or book), built from its field specs. `onSave`
 * gets only the fields that changed; it should throw an Error with a readable message when saving fails.
 */
export default function RecordForm({
  title,
  specs,
  initial,
  onSave,
  onCancel,
  extra,
  extraChanged = false,
}: {
  title: string;
  specs: FieldSpec[];
  initial: FieldValues;
  onSave: (changes: FieldValues) => Promise<void>;
  onCancel: () => void;
  /** More inputs shown after the fields (e.g. composer bio links), managed by the parent. */
  extra?: ReactNode;
  extraChanged?: boolean;
}) {
  const [draft, setDraft] = useState(() => toDraft(specs, initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changes = useMemo(() => changedFields(specs, initial, draft), [specs, initial, draft]);
  const dirty = Object.keys(changes).length > 0 || extraChanged;

  const description = typeof draft.description === 'string' ? draft.description : '';
  const sources =
    typeof draft.description_sources === 'string' ? draft.description_sources.split('\n').filter((l) => l.trim()).length : 0;
  const markers = highestCitation(description);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!dirty) {
      onCancel();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(changes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Admin</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {specs.map((spec) => (
          <Field
            key={spec.name}
            spec={spec}
            value={draft[spec.name]}
            onChange={(next) => setDraft((prev) => ({ ...prev, [spec.name]: next }))}
          />
        ))}
      </div>

      {markers > sources && 'description_sources' in draft && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-inset ring-amber-200">
          The description cites [{markers}] but there {sources === 1 ? 'is' : 'are'} only {sources} source
          {sources === 1 ? '' : 's'}; markers without a source show as plain text.
        </p>
      )}

      {extra}

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 ring-1 ring-inset ring-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Close'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary px-5 py-2 text-sm">
          Cancel
        </button>
        {dirty && !saving && (
          <span className="text-sm text-gray-500">
            {[...Object.keys(changes).map((name) => specs.find((s) => s.name === name)?.label ?? name), ...(extraChanged ? ['composer links'] : [])].join(', ')}{' '}
            changed
          </span>
        )}
      </div>
    </form>
  );
}

/** PATCH/GET JSON for the admin API, throwing the server's error message on failure. */
export async function adminRequest<T>(url: string, method: 'GET' | 'PATCH' = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  let data: { error?: string } & Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    // Fall through to the generic message.
  }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}
