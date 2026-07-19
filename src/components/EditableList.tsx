import type { ReactNode } from 'react';

interface EditableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  newItem: () => T;
  addLabel?: string;
  emptyLabel?: string;
}

/**
 * Generic add/remove list editor. Owns list chrome only; callers render the
 * per-item fields. Every repeating-list section in the app (skills,
 * experience, projects, education, writing samples, links, bullets) is built
 * on this so they behave and look the same.
 */
export function EditableList<T>({
  items,
  onChange,
  renderItem,
  newItem,
  addLabel = 'Add',
  emptyLabel = 'Nothing here yet.',
}: EditableListProps<T>) {
  function updateAt(index: number, next: T) {
    onChange(items.map((item, i) => (i === index ? next : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, newItem()]);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-slate-400">{emptyLabel}</p>}
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3"
        >
          <div className="flex-1">{renderItem(item, (next) => updateAt(index, next), index)}</div>
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        {addLabel}
      </button>
    </div>
  );
}
