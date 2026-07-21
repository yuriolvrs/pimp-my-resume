// What this file is: shared visual building blocks (Card, Button, Badge,
// SectionTitle, labeled text/textarea fields) used across every page, so the
// app has one consistent look instead of each screen styling its own
// buttons and cards.
// In plain terms: the basic look-and-feel pieces (buttons, cards, form
// fields) that the rest of the app is built out of.

import type { ReactNode } from 'react';

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

const fieldInputClass =
  'px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:border-blue-400 transition-all';

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
