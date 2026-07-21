// What this file is: the editable form for the Experience section — a list
// of jobs, each with company/title/dates/location and a list of resume
// bullets.
// In plain terms: the form where you list your past jobs and what you did
// at each one.

import { useState } from 'react';
import type { ExperienceEntry } from '../../types';
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

function newExperienceEntry(): ExperienceEntry {
  return { company: '', title: '', current: false, bullets: [] };
}

export function ExperienceForm({
  value,
  onChange,
}: {
  value: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-6">
      <CollapsibleSectionHeader
        title="Work Experience"
        sub={`${value.length} position${value.length !== 1 ? 's' : ''}`}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onAdd={() => onChange([...value, newExperienceEntry()])}
        addLabel="Add"
      />
      <Collapsible open={open}>
        <EditableList<ExperienceEntry>
          items={value}
          onChange={onChange}
          newItem={newExperienceEntry}
          emptyLabel="No experience entries yet."
          hideAddButton
          renderItem={(entry, update) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Company"
                  placeholder="Stripe"
                  value={entry.company}
                  onChange={(company) => update({ ...entry, company })}
                />
                <FieldInput
                  label="Job Title"
                  placeholder="Senior Engineer"
                  value={entry.title}
                  onChange={(title) => update({ ...entry, title })}
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
                Currently working here
              </label>

              <FieldInput
                label="Location"
                placeholder="San Francisco, CA"
                value={entry.location ?? ''}
                onChange={(location) => update({ ...entry, location })}
              />

              <div>
                <span className={`mb-1 block ${fieldLabelClass}`}>Description & Achievements</span>
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
      </Collapsible>
    </Card>
  );
}
