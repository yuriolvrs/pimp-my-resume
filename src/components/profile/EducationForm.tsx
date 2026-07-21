// What this file is: the editable form for the Education section — a list
// of schools/degrees with optional extra details.
// In plain terms: the form where you list your schools and degrees.

import type { EducationEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';
import { Card, FieldInput, SectionTitle } from '../ui/primitives';

export function EducationForm({
  value,
  onChange,
}: {
  value: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub={`${value.length} entr${value.length !== 1 ? 'ies' : 'y'}`}>
        Education
      </SectionTitle>
      <EditableList<EducationEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ school: '', degree: '', start: '' })}
        addLabel="Add education"
        emptyLabel="No education entries yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FieldInput
                placeholder="School"
                value={entry.school}
                onChange={(school) => update({ ...entry, school })}
              />
              <FieldInput
                placeholder="Degree"
                value={entry.degree}
                onChange={(degree) => update({ ...entry, degree })}
              />
              <FieldInput
                placeholder="Field of study"
                value={entry.field ?? ''}
                onChange={(field) => update({ ...entry, field })}
              />
              <FieldInput
                placeholder="Start (e.g. 2019)"
                value={entry.start}
                onChange={(start) => update({ ...entry, start })}
              />
              <FieldInput
                placeholder="End (blank = present)"
                value={entry.end ?? ''}
                onChange={(end) => update({ ...entry, end })}
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Details
              </span>
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
    </Card>
  );
}
