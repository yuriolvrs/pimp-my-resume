import type { Contact, ContactLink } from '../../types';
import { EditableList } from '../EditableList';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        className={inputClass}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function ContactForm({
  value,
  onChange,
}: {
  value: Contact;
  onChange: (contact: Contact) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Contact</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
        <Field
          label="Email"
          type="email"
          value={value.email}
          onChange={(email) => onChange({ ...value, email })}
        />
        <Field
          label="Phone"
          value={value.phone ?? ''}
          onChange={(phone) => onChange({ ...value, phone })}
        />
        <Field
          label="Location"
          value={value.location ?? ''}
          onChange={(location) => onChange({ ...value, location })}
        />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Links</span>
        <EditableList<ContactLink>
          items={value.links}
          onChange={(links) => onChange({ ...value, links })}
          newItem={() => ({ label: '', url: '' })}
          addLabel="Add link"
          emptyLabel="No links yet."
          renderItem={(link, update) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Label (e.g. GitHub)"
                value={link.label}
                onChange={(e) => update({ ...link, label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="https://..."
                value={link.url}
                onChange={(e) => update({ ...link, url: e.target.value })}
              />
            </div>
          )}
        />
      </div>
    </section>
  );
}
