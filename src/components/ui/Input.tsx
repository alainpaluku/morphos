import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({ label, error, fullWidth, className = '', ...props }: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        className={`px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-fast ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Textarea({ label, error, fullWidth, className = '', ...props }: TextareaProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        className={`px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-fast resize-none ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
      )}
    </div>
  );
}

// Color picker with text input
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium mb-2">{label}</label>}
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border-2 border-[var(--border-color)] cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg text-xs font-mono border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent)]"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}
