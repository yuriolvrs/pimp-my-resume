// What this file is: the editable form for the Education section — a list
// of schools/degrees with optional extra details.
// In plain terms: the form where you list your schools and degrees.

import type { EducationEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export function EducationForm({
  value,
  onChange,
}: {
  value: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Education</h2>
      <EditableList<EducationEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ school: '', degree: '', start: '' })}
        addLabel="Add education"
        emptyLabel="No education entries yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="School"
                value={entry.school}
                onChange={(e) => update({ ...entry, school: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Degree"
                value={entry.degree}
                onChange={(e) => update({ ...entry, degree: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Field of study"
                value={entry.field ?? ''}
                onChange={(e) => update({ ...entry, field: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Start (e.g. 2019)"
                value={entry.start}
                onChange={(e) => update({ ...entry, start: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="End (blank = present)"
                value={entry.end ?? ''}
                onChange={(e) => update({ ...entry, end: e.target.value })}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Details</span>
              <StringList
                items={entry.details ?? []}
                onChange={(details) => update({ ...entry, details })}
                placeholder="e.g. Dean's List, relevant coursework..."
                addLabel="Add detail"
                emptyLabel="No details yet."
              />
            </div>
          </div>
        )}
      />
    </section>
  );
}
