// What this file is: the field-editable form for a generated resume --
// same section shape as the Profile page (contact/summary/skills/
// experience/projects/education), reusing the Profile page's own form
// components since a ResumeContent snapshot has identical field shapes.
// Every bullet shown is copied verbatim from the profile (selection, not
// generation -- see selectResumeContent.ts), so there's nothing to warn
// about fabrication-wise; a small "Matched to this job" badge just shows
// which bullets were prioritized because they're linked to a requirement.
// In plain terms: the screen where you review and fine-tune a tailored
// resume before exporting it.

import { useMemo } from 'react';
import { Check } from 'lucide-react';
import type { ResumeContent, SourceMapEntry } from '../../types';
import { ContactForm } from '../profile/ContactForm';
import { SkillsForm } from '../profile/SkillsForm';
import { ExperienceForm } from '../profile/ExperienceForm';
import { ProjectsForm } from '../profile/ProjectsForm';
import { EducationForm } from '../profile/EducationForm';
import { Badge, Card, FieldTextarea, SectionTitle } from '../ui/primitives';

export function ResumeEditor({
  value,
  sourceMap,
  onChange,
}: {
  value: ResumeContent;
  sourceMap: SourceMapEntry[];
  onChange: (content: ResumeContent) => void;
}) {
  const atomIdsByText = useMemo(() => new Map(sourceMap.map((e) => [e.generatedText, e.atomIds])), [sourceMap]);

  function bulletBadge(bulletText: string) {
    const atomIds = atomIdsByText.get(bulletText);
    if (!atomIds || atomIds.length === 0) return null;
    return (
      <Badge color="blue">
        <Check size={11} />
        Matched to this job
      </Badge>
    );
  }

  return (
    <div className="space-y-5">
      <ContactForm value={value.contact} onChange={(contact) => onChange({ ...value, contact })} />

      <Card className="p-6">
        <SectionTitle sub="Shown near the top of your resume">Summary</SectionTitle>
        <FieldTextarea
          value={value.summary}
          onChange={(summary) => onChange({ ...value, summary })}
          rows={3}
          placeholder="A brief professional summary..."
        />
      </Card>

      <SkillsForm value={value.skills} onChange={(skills) => onChange({ ...value, skills })} />

      <ExperienceForm
        value={value.experience}
        onChange={(experience) => onChange({ ...value, experience })}
        bulletBadge={bulletBadge}
      />

      <ProjectsForm
        value={value.projects}
        onChange={(projects) => onChange({ ...value, projects })}
        bulletBadge={bulletBadge}
      />

      <EducationForm value={value.education} onChange={(education) => onChange({ ...value, education })} />
    </div>
  );
}
