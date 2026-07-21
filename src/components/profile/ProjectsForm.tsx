// What this file is: the editable form for the Projects section — a list
// of projects, each with a name, description, bullets, and links.
// In plain terms: the form where you list personal or work projects you've
// built.

import type { ContactLink, ProjectEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';
import { Card, FieldInput, FieldTextarea, SectionTitle } from '../ui/primitives';

export function ProjectsForm({
  value,
  onChange,
}: {
  value: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle sub={`${value.length} project${value.length !== 1 ? 's' : ''}`}>
        Projects
      </SectionTitle>
      <EditableList<ProjectEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ name: '', description: '', bullets: [], links: [] })}
        addLabel="Add project"
        emptyLabel="No projects yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <FieldInput
              placeholder="Project name"
              value={entry.name}
              onChange={(name) => update({ ...entry, name })}
            />
            <FieldTextarea
              rows={2}
              placeholder="Description"
              value={entry.description}
              onChange={(description) => update({ ...entry, description })}
            />
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Bullets
              </span>
              <StringList
                items={entry.bullets}
                onChange={(bullets) => update({ ...entry, bullets })}
                placeholder="Describe an accomplishment..."
                multiline
                addLabel="Add bullet"
                emptyLabel="No bullets yet."
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Links
              </span>
              <EditableList<ContactLink>
                items={entry.links}
                onChange={(links) => update({ ...entry, links })}
                newItem={() => ({ label: '', url: '' })}
                addLabel="Add link"
                emptyLabel="No links yet."
                renderItem={(link, updateLink) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <FieldInput
                      placeholder="Label (e.g. Demo)"
                      value={link.label}
                      onChange={(label) => updateLink({ ...link, label })}
                    />
                    <FieldInput
                      placeholder="https://..."
                      value={link.url}
                      onChange={(url) => updateLink({ ...link, url })}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        )}
      />
    </Card>
  );
}
