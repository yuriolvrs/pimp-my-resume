// What this file is: the editable form for writing samples — free-text
// blocks that later phases will use to mimic your writing style when
// generating cover letters.
// In plain terms: where you paste examples of your own writing (like an
// old cover letter) so future AI-generated text sounds like you.

import { useState } from 'react';
import { StringList } from '../StringList';
import { Card, Collapsible, CollapsibleSectionHeader } from '../ui/primitives';

export function WritingSamplesForm({
  value,
  onChange,
  onCommit,
}: {
  value: string[];
  onChange: (writingSamples: string[]) => void;
  onCommit: (writingSamples: string[]) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-6">
      <CollapsibleSectionHeader
        title="Writing Samples"
        sub="Used later to match your voice when generating a cover letter"
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onAdd={() => onChange([...value, ''])}
        addLabel="Add"
      />
      <Collapsible open={open}>
        <StringList
          items={value}
          onChange={onChange}
          onBlurCommit={onCommit}
          placeholder="Paste a writing sample..."
          multiline
          emptyLabel="No writing samples yet."
          hideAddButton
        />
      </Collapsible>
    </Card>
  );
}
