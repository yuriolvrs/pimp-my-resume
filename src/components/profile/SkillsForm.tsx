// What this file is: the editable form for the Skills section — a list of
// skill groups (e.g. "Languages"), each containing a list of individual
// skills.
// In plain terms: the form where you list your skills, grouped into
// categories.

import type { SkillGroup } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';
import { Card, FieldInput, SectionTitle } from '../ui/primitives';

export function SkillsForm({
  value,
  onChange,
}: {
  value: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub="Used to match against job requirements">Skills</SectionTitle>
      <EditableList<SkillGroup>
        items={value}
        onChange={onChange}
        newItem={() => ({ category: '', items: [] })}
        addLabel="Add skill group"
        emptyLabel="No skill groups yet."
        renderItem={(group, update) => (
          <div className="space-y-2">
            <FieldInput
              placeholder="Category (e.g. Languages)"
              value={group.category}
              onChange={(category) => update({ ...group, category })}
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
    </Card>
  );
}
