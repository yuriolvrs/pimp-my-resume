// What this file is: the editable form for a job posting's analysis --
// role summary, requirements, keywords, matches (each with profile
// evidence), and gaps. Built entirely from the existing EditableList/
// StringList primitives, the same way the profile section forms are, so a
// bad or incomplete LLM extraction can be corrected by hand.
// In plain terms: the form where you review and fix up the AI's read on a
// job posting -- what it requires, what you already have, and what's
// missing.

import type { JobAnalysis, RequirementMatch } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export function AnalysisEditor({
  value,
  onChange,
}: {
  value: JobAnalysis;
  onChange: (analysis: JobAnalysis) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Role summary</h2>
        <textarea
          className={inputClass}
          rows={2}
          value={value.roleSummary}
          onChange={(e) => onChange({ ...value, roleSummary: e.target.value })}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <StringList
          items={value.requirements}
          onChange={(requirements) => onChange({ ...value, requirements })}
          multiline
          addLabel="Add requirement"
          emptyLabel="No requirements listed."
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Keywords</h2>
        <StringList
          items={value.keywords}
          onChange={(keywords) => onChange({ ...value, keywords })}
          addLabel="Add keyword"
          emptyLabel="No keywords listed."
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Matches</h2>
        <EditableList<RequirementMatch>
          items={value.matches}
          onChange={(matches) => onChange({ ...value, matches })}
          newItem={() => ({ requirement: '', profileEvidence: [] })}
          addLabel="Add match"
          emptyLabel="No matches yet."
          renderItem={(match, update) => (
            <div className="space-y-2">
              <input
                className={inputClass}
                placeholder="Requirement"
                value={match.requirement}
                onChange={(e) => update({ ...match, requirement: e.target.value })}
              />
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Profile evidence
                </span>
                <StringList
                  items={match.profileEvidence}
                  onChange={(profileEvidence) => update({ ...match, profileEvidence })}
                  multiline
                  addLabel="Add evidence"
                  emptyLabel="No evidence yet."
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Gaps</h2>
        <StringList
          items={value.gaps}
          onChange={(gaps) => onChange({ ...value, gaps })}
          multiline
          addLabel="Add gap"
          emptyLabel="No gaps listed."
        />
      </section>
    </div>
  );
}
