// What this file is: the editable form for the Skills section — a list of
// named categories (e.g. "Languages", "Frameworks"), each holding a
// chip-based list of individual skills. Categories are freely renamed/added/
// removed, same add/remove pattern as every other repeating section.
// In plain terms: the form where you group your skills under headings like
// "Languages" or "Tools" and add/remove skills within each.

import { useState } from 'react';
import type { SkillGroup } from '../../types';
import { EditableList } from '../EditableList';
import { Card, Collapsible, CollapsibleSectionHeader, FieldInput, TagInput } from '../ui/primitives';

function newSkillGroup(): SkillGroup {
  return { category: '', items: [] };
}

export function SkillsForm({
  value,
  onChange,
}: {
  value: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-6">
      <CollapsibleSectionHeader
        title="Skills"
        sub={`${value.length} categor${value.length !== 1 ? 'ies' : 'y'}`}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onAdd={() => onChange([...value, newSkillGroup()])}
        addLabel="Add category"
      />
      <Collapsible open={open}>
        <EditableList<SkillGroup>
          items={value}
          onChange={onChange}
          newItem={newSkillGroup}
          emptyLabel="No skill categories yet."
          hideAddButton
          renderItem={(group, update) => (
            <div className="space-y-2">
              <FieldInput
                label="Category"
                placeholder="Languages"
                value={group.category}
                onChange={(category) => update({ ...group, category })}
              />
              <TagInput
                value={group.items}
                onChange={(items) => update({ ...group, items })}
                placeholder="React, TypeScript, Python…"
                emptyLabel="No skills added yet"
              />
            </div>
          )}
        />
      </Collapsible>
    </Card>
  );
}
