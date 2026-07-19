import type { ContactLink, ProjectEntry } from '../../types';
import { EditableList } from '../EditableList';
import { StringList } from '../StringList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export function ProjectsForm({
  value,
  onChange,
}: {
  value: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Projects</h2>
      <EditableList<ProjectEntry>
        items={value}
        onChange={onChange}
        newItem={() => ({ name: '', description: '', bullets: [], links: [] })}
        addLabel="Add project"
        emptyLabel="No projects yet."
        renderItem={(entry, update) => (
          <div className="space-y-2">
            <input
              className={inputClass}
              placeholder="Project name"
              value={entry.name}
              onChange={(e) => update({ ...entry, name: e.target.value })}
            />
            <textarea
              className={inputClass}
              rows={2}
              placeholder="Description"
              value={entry.description}
              onChange={(e) => update({ ...entry, description: e.target.value })}
            />
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Bullets</span>
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
              <span className="mb-1 block text-sm font-medium text-slate-700">Links</span>
              <EditableList<ContactLink>
                items={entry.links}
                onChange={(links) => update({ ...entry, links })}
                newItem={() => ({ label: '', url: '' })}
                addLabel="Add link"
                emptyLabel="No links yet."
                renderItem={(link, updateLink) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="Label (e.g. Demo)"
                      value={link.label}
                      onChange={(e) => updateLink({ ...link, label: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateLink({ ...link, url: e.target.value })}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        )}
      />
    </section>
  );
}
