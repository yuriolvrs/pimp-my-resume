// What this file is: the editable form for the Skills section — a list of
// skill groups (e.g. "Languages"), each containing a list of individual
// skills.
// In plain terms: the form where you list your skills, grouped into
// categories.

import type { SkillGroup } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm font-medium focus:border-slate-500 focus:outline-none';

export function SkillsForm({
  value,
  onChange,
}: {
  value: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Skills</h2>
      <EditableList<SkillGroup>
        items={value}
        onChange={onChange}
        newItem={() => ({ category: '', items: [] })}
        addLabel="Add skill group"
        emptyLabel="No skill groups yet."
        renderItem={(group, update) => (
          <div className="space-y-2">
            <input
              className={inputClass}
              placeholder="Category (e.g. Languages)"
              value={group.category}
              onChange={(e) => update({ ...group, category: e.target.value })}
            />
            <StringList
              items={group.items}
              onChange={(items) => update({ ...group, items })}
              placeholder="e.g. TypeScript"
              addLabel="Add skill"
              emptyLabel="No skills in this group yet."
            />
          </div>
        )}
      />
    </section>
  );
}
