// What this file is: shared visual building blocks (Card, Button, Badge,
// SectionTitle, labeled text/textarea fields) used across every page, so the
// app has one consistent look instead of each screen styling its own
// buttons and cards.
// In plain terms: the basic look-and-feel pieces (buttons, cards, form
// fields) that the rest of the app is built out of.

import type { ReactNode } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-slate-800">{children}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// Header for a collapsible, add-one-more list section (Work Experience,
// Projects, Education, Writing Samples): title/sub on the left, an Add
// button and expand/collapse chevron on the right.
export function CollapsibleSectionHeader({
  title,
  sub,
  open,
  onToggle,
  onAdd,
  addLabel = 'Add',
}: {
  title: string;
  sub?: string;
  open: boolean;
  onToggle: () => void;
  onAdd: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Btn size="sm" variant="secondary" onClick={onAdd}>
          <Plus size={13} />
          {addLabel}
        </Btn>
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? 'Collapse' : 'Expand'}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}

// Animates a section's content in/out on open/close, using the CSS
// grid-template-rows 0fr/1fr trick so it works without measuring the
// content's height (which varies with the number of list items).
export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

const buttonVariants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700 focus:ring-slate-900/30 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400/20',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400/20',
  danger: 'text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-400/20',
} as const;

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
} as const;

export function Btn({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const badgeColors = {
  slate: 'bg-slate-100 text-slate-500',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
} as const;

export function Badge({
  children,
  color = 'slate',
}: {
  children: ReactNode;
  color?: keyof typeof badgeColors;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeColors[color]}`}
    >
      {children}
    </span>
  );
}

export const fieldInputClass =
  'px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:border-blue-400 transition-all';

export const fieldLabelClass = 'text-[11px] font-semibold text-slate-400 uppercase tracking-widest';

export function FieldInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  className = '',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={fieldInputClass}
      />
    </div>
  );
}

export function FieldTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  className = '',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`${fieldInputClass} resize-y leading-relaxed`}
      />
    </div>
  );
}

export function FieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className={fieldLabelClass}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldInputClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Descending list of years for start/end date dropdowns (next year down to 60 years back). */
export function yearOptions(): string[] {
  const end = new Date().getFullYear() + 1;
  const start = end - 61;
  const years: string[] = [];
  for (let year = end; year >= start; year--) {
    years.push(String(year));
  }
  return years;
}

/** Renders a month/year pair as e.g. "March 2022", "2022", or "" if both are empty. */
export function formatMonthYear(month?: string, year?: string): string {
  if (!year) return month ?? '';
  return month ? `${month} ${year}` : year;
}
