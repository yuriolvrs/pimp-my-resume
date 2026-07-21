// What this file is: a specialization of EditableList for the common case
// of a list of plain text entries (or paragraphs). Used for skill items,
// education details, writing samples, and bullets. The `multiline` flag
// switches between a single-line input and a textarea.
// In plain terms: a simpler version of the list component, just for lists
// of plain text.

import { EditableList } from './EditableList';

interface StringListProps {
  items: string[];
  onChange: (items: string[]) => void;
  onBlurCommit?: (items: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
  emptyLabel?: string;
}

/**
 * EditableList specialized for plain-string items: skill items, education
 * details, writing samples, bullets. Single place that owns the
 * input-vs-textarea choice and styling for "a list of text".
 */
export function StringList({
  items,
  onChange,
  onBlurCommit,
  placeholder,
  multiline = false,
  addLabel = 'Add',
  emptyLabel,
}: StringListProps) {
  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:border-blue-400 transition-all';

  return (
    <EditableList<string>
      items={items}
      onChange={onChange}
      newItem={() => ''}
      addLabel={addLabel}
      emptyLabel={emptyLabel}
      renderItem={(value, update) =>
        multiline ? (
          <textarea
            className={inputClass}
            rows={3}
            value={value}
            placeholder={placeholder}
            onChange={(e) => update(e.target.value)}
            onBlur={() => onBlurCommit?.(items)}
          />
        ) : (
          <input
            className={inputClass}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => update(e.target.value)}
            onBlur={() => onBlurCommit?.(items)}
          />
        )
      }
    />
  );
}
