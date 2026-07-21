// What this file is: the editable form for the Experience section — a list
// of jobs, each with company/title/dates/location and a list of resume
// bullets.
// In plain terms: the form where you list your past jobs and what you did
// at each one.

import type { ExperienceEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';
import { Card, FieldInput, SectionTitle } from '../ui/primitives';

export function ExperienceForm({
  value,
  onChange,
}: {
  value: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub={`${value.length} position${value.length !== 1 ? 's' : ''}`}>
        Work Experience
      </SectionTitle>
      <EditableList<ExperienceEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ company: '', title: '', start: '', bullets: [] })}
        addLabel="Add experience"
        emptyLabel="No experience entries yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FieldInput
                placeholder="Company"
                value={entry.company}
                onChange={(company) => update({ ...entry, company })}
              />
              <FieldInput
                placeholder="Title"
                value={entry.title}
                onChange={(title) => update({ ...entry, title })}
              />
              <FieldInput
                placeholder="Start (e.g. 2023-01)"
                value={entry.start}
                onChange={(start) => update({ ...entry, start })}
              />
              <FieldInput
                placeholder="End (blank = present)"
                value={entry.end ?? ''}
                onChange={(end) => update({ ...entry, end })}
              />
              <FieldInput
                placeholder="Location"
                value={entry.location ?? ''}
                onChange={(location) => update({ ...entry, location })}
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Bullets
              </span>
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
    </Card>
  );
}
