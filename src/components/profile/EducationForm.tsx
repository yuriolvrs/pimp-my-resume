// What this file is: the editable form for the Education section — a list
// of schools/degrees with optional extra details.
// In plain terms: the form where you list your schools and degrees.

import { useState } from 'react';
import type { EducationEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';
import {
  Card,
  Collapsible,
  CollapsibleSectionHeader,
  FieldInput,
  FieldSelect,
  fieldLabelClass,
  MONTHS,
  yearOptions,
} from '../ui/primitives';

const YEARS = yearOptions();

function newEducationEntry(): EducationEntry {
  return { school: '', degree: '', current: false };
}

export function EducationForm({
  value,
  onChange,
}: {
  value: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-6">
      <CollapsibleSectionHeader
        title="Education"
        sub={`${value.length} entr${value.length !== 1 ? 'ies' : 'y'}`}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onAdd={() => onChange([...value, newEducationEntry()])}
        addLabel="Add"
      />
      <Collapsible open={open}>
        <EditableList<EducationEntry>
          items={value}
          onChange={onChange}
          newItem={newEducationEntry}
          emptyLabel="No education entries yet."
          hideAddButton
          renderItem={(entry, update) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FieldInput
                    label="Institution"
                    placeholder="UC Berkeley"
                    value={entry.school}
                    onChange={(school) => update({ ...entry, school })}
                  />
                </div>
                <FieldInput
                  label="Degree"
                  placeholder="B.S."
                  value={entry.degree}
                  onChange={(degree) => update({ ...entry, degree })}
                />
                <FieldInput
                  label="Field of Study"
                  placeholder="Computer Science"
                  value={entry.field ?? ''}
                  onChange={(field) => update({ ...entry, field })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className={`mb-1.5 block ${fieldLabelClass}`}>Start Date</span>
                  <div className="grid grid-cols-2 gap-2">
                    <FieldSelect
                      value={entry.startMonth ?? ''}
                      onChange={(startMonth) => update({ ...entry, startMonth })}
                      options={MONTHS}
                      placeholder="Month"
                    />
                    <FieldSelect
                      value={entry.startYear ?? ''}
                      onChange={(startYear) => update({ ...entry, startYear })}
                      options={YEARS}
                      placeholder="Year"
                    />
                  </div>
                </div>
                <div>
                  <span className={`mb-1.5 block ${fieldLabelClass}`}>End Date</span>
                  {entry.current ? (
                    <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm">
                      Present
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <FieldSelect
                        value={entry.endMonth ?? ''}
                        onChange={(endMonth) => update({ ...entry, endMonth })}
                        options={MONTHS}
                        placeholder="Month"
                      />
                      <FieldSelect
                        value={entry.endYear ?? ''}
                        onChange={(endYear) => update({ ...entry, endYear })}
                        options={YEARS}
                        placeholder="Year"
                      />
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entry.current}
                  onChange={(e) =>
                    update({
                      ...entry,
                      current: e.target.checked,
                      ...(e.target.checked ? { endMonth: undefined, endYear: undefined } : {}),
                    })
                  }
                  className="rounded border-slate-300 text-blue-600"
                />
                Currently studying here
              </label>

              <div>
                <span className={`mb-1 block ${fieldLabelClass}`}>Details</span>
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
      </Collapsible>
    </Card>
  );
}
