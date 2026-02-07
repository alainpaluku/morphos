// Reusable modal header component

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, icon, onClose }: ModalHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
