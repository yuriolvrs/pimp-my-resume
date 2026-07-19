// What this file is: the editable form for the Experience section — a list
// of jobs, each with company/title/dates/location and a list of resume
// bullets.
// In plain terms: the form where you list your past jobs and what you did
// at each one.

import type { ExperienceEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export function ExperienceForm({
  value,
  onChange,
}: {
  value: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Experience</h2>
      <EditableList<ExperienceEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ company: '', title: '', start: '', bullets: [] })}
        addLabel="Add experience"
        emptyLabel="No experience entries yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Company"
                value={entry.company}
                onChange={(e) => update({ ...entry, company: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Title"
                value={entry.title}
                onChange={(e) => update({ ...entry, title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Start (e.g. 2023-01)"
                value={entry.start}
                onChange={(e) => update({ ...entry, start: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="End (blank = present)"
                value={entry.end ?? ''}
                onChange={(e) => update({ ...entry, end: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Location"
                value={entry.location ?? ''}
                onChange={(e) => update({ ...entry, location: e.target.value })}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Bullets</span>
              <StringList
                items={entry.bullets}
                onChange={(bullets) => update({ ...entry, bullets })}
                placeholder="Describe an accomplishment..."
                multiline
                addLabel="Add bullet"
                emptyLabel="No bullets yet."
              />
            </div>
          </div>
        )}
      />
    </section>
  );
}
