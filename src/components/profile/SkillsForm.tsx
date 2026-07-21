// What this file is: the editable form for the Skills section — a flat,
// chip-based list of individual skills (no grouping/categories).
// In plain terms: the form where you add and remove your skills as tags.

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Btn, Card, SectionTitle } from '../ui/primitives';

export function SkillsForm({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const skill = draft.trim();
    if (skill && !value.includes(skill)) {
      onChange([...value, skill]);
    }
    setDraft('');
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <Card className="p-6">
      <SectionTitle sub="Used to match against job requirements">Skills</SectionTitle>
      <div className="flex flex-wrap gap-2 min-h-9 mb-4">
        {value.length === 0 && <p className="text-xs text-slate-300 self-center">No skills added yet</p>}
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => remove(skill)}
              className="text-slate-400 hover:text-slate-700 transition-colors ml-0.5"
              aria-label={`Remove ${skill}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="React, TypeScript, Python, PostgreSQL…"
          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:border-blue-400 transition-all"
        />
        <Btn size="sm" variant="secondary" onClick={add}>
          <Plus size={13} />
          Add
        </Btn>
      </div>
    </Card>
  );
}
