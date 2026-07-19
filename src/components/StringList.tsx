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
    'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

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
