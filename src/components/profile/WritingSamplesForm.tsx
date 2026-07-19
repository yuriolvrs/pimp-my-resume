import { StringList } from '../StringList';

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
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Writing samples</h2>
      <p className="text-sm text-slate-500">
        Paste a few pieces of your own writing (past cover letters, emails, etc.) — used later to
        match your voice when generating a cover letter.
      </p>
      <StringList
        items={value}
        onChange={onChange}
        onBlurCommit={onCommit}
        placeholder="Paste a writing sample..."
        multiline
        addLabel="Add sample"
        emptyLabel="No writing samples yet."
      />
    </section>
  );
}
