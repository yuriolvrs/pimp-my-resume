// What this file is: the editable form for the Skills section — a flat,
// chip-based list of individual skills (no grouping/categories).
// In plain terms: the form where you add and remove your skills as tags.

import { Card, SectionTitle, TagInput } from '../ui/primitives';

export function SkillsForm({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub="Used to match against job requirements">Skills</SectionTitle>
      <TagInput
        value={value}
        onChange={onChange}
        placeholder="React, TypeScript, Python, PostgreSQL…"
        emptyLabel="No skills added yet"
      />
    </Card>
  );
}
