// What this file is: the editable form for writing samples — free-text
// blocks that later phases will use to mimic your writing style when
// generating cover letters.
// In plain terms: where you paste examples of your own writing (like an
// old cover letter) so future AI-generated text sounds like you.

import { StringList } from '../StringList';
import { Card, SectionTitle } from '../ui/primitives';

export function WritingSamplesForm({
  value,
  onChange,
  onCommit,
}: {
  value: string[];
  onChange: (writingSamples: string[]) => void;
  onCommit: (writingSamples: string[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub="Used later to match your voice when generating a cover letter">
        Writing Samples
      </SectionTitle>
      <StringList
        items={value}
        onChange={onChange}
        onBlurCommit={onCommit}
        placeholder="Paste a writing sample..."
        multiline
        addLabel="Add sample"
        emptyLabel="No writing samples yet."
      />
    </Card>
  );
}
