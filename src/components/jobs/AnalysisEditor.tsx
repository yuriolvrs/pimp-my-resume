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
import { Card, FieldInput, FieldTextarea, SectionTitle } from '../ui/primitives';

export function AnalysisEditor({
  value,
  onChange,
}: {
  value: JobAnalysis;
  onChange: (analysis: JobAnalysis) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionTitle>Role Summary</SectionTitle>
        <FieldTextarea
          value={value.roleSummary}
          onChange={(roleSummary) => onChange({ ...value, roleSummary })}
          rows={2}
        />
      </Card>

      <Card className="p-5">
        <SectionTitle>Requirements</SectionTitle>
        <StringList
          items={value.requirements}
          onChange={(requirements) => onChange({ ...value, requirements })}
          multiline
          addLabel="Add requirement"
          emptyLabel="No requirements listed."
        />
      </Card>

      <Card className="p-5">
        <SectionTitle>Keywords</SectionTitle>
        <StringList
          items={value.keywords}
          onChange={(keywords) => onChange({ ...value, keywords })}
          addLabel="Add keyword"
          emptyLabel="No keywords listed."
        />
      </Card>

      <Card className="p-5">
        <SectionTitle sub="Your profile evidence for each requirement">Matches</SectionTitle>
        <EditableList<RequirementMatch>
          items={value.matches}
          onChange={(matches) => onChange({ ...value, matches })}
          newItem={() => ({ requirement: '', profileEvidence: [] })}
          addLabel="Add match"
          emptyLabel="No matches yet."
          renderItem={(match, update) => (
            <div className="space-y-2">
              <FieldInput
                placeholder="Requirement"
                value={match.requirement}
                onChange={(requirement) => update({ ...match, requirement })}
              />
              <div>
                <span className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
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
      </Card>

      <Card className="p-5">
        <SectionTitle sub="Requirements the posting needs that aren't evidenced in your profile">
          Gaps
        </SectionTitle>
        <StringList
          items={value.gaps}
          onChange={(gaps) => onChange({ ...value, gaps })}
          multiline
          addLabel="Add gap"
          emptyLabel="No gaps listed."
        />
      </Card>
    </div>
  );
}
