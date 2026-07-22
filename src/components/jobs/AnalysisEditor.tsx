// What this file is: the editable form for a job posting's extracted
// analysis -- role summary, requirements (grouped Required/Preferred), and
// keywords. Matching (which profile evidence supports each requirement)
// happens on the separate Matching review screen, not here. Built on the
// existing EditableList/StringList primitives, same as the profile forms.
// In plain terms: the form where you review and fix up the AI's read on a
// job posting -- the role, what it requires, and the key terms -- before
// running matching against your profile.

import type { JobAnalysis, Requirement, RequirementSeverity } from '../../types';
import { EditableList } from '../EditableList';
import { Card, FieldSelect, FieldTextarea, SectionTitle, TagInput } from '../ui/primitives';

function nextOrder(requirements: Requirement[]): number {
  return requirements.length === 0 ? 0 : Math.max(...requirements.map((r) => r.order)) + 1;
}

function mergeSeverityGroup(
  all: Requirement[],
  severity: RequirementSeverity,
  updatedGroup: Requirement[],
): Requirement[] {
  const others = all.filter((r) => r.severity !== severity);
  return [...others, ...updatedGroup].sort((a, b) => a.order - b.order);
}

function RequirementGroup({
  title,
  severity,
  requirements,
  onChange,
}: {
  title: string;
  severity: RequirementSeverity;
  requirements: Requirement[];
  onChange: (requirements: Requirement[]) => void;
}) {
  const group = requirements.filter((r) => r.severity === severity);

  return (
    <Card className="p-5">
      <SectionTitle>{title}</SectionTitle>
      <EditableList<Requirement>
        items={group}
        onChange={(updatedGroup) => onChange(mergeSeverityGroup(requirements, severity, updatedGroup))}
        newItem={() => ({ id: crypto.randomUUID(), text: '', severity, order: nextOrder(requirements) })}
        addLabel={`Add ${severity} requirement`}
        emptyLabel={`No ${severity} requirements listed.`}
        renderItem={(requirement, update) => (
          <div className="space-y-2">
            <FieldTextarea
              value={requirement.text}
              onChange={(text) => update({ ...requirement, text })}
              rows={2}
            />
            <FieldSelect
              label="Severity"
              value={requirement.severity}
              onChange={(value) => update({ ...requirement, severity: value as RequirementSeverity })}
              options={['required', 'preferred']}
            />
          </div>
        )}
      />
    </Card>
  );
}

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
          rows={4}
        />
      </Card>

      <RequirementGroup
        title="Required"
        severity="required"
        requirements={value.requirements}
        onChange={(requirements) => onChange({ ...value, requirements })}
      />

      <RequirementGroup
        title="Preferred"
        severity="preferred"
        requirements={value.requirements}
        onChange={(requirements) => onChange({ ...value, requirements })}
      />

      <Card className="p-5">
        <SectionTitle>Keywords</SectionTitle>
        <TagInput
          value={value.keywords}
          onChange={(keywords) => onChange({ ...value, keywords })}
          placeholder="Add keyword…"
          emptyLabel="No keywords listed."
        />
      </Card>
    </div>
  );
}
