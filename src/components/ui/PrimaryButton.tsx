// Composant bouton primaire réutilisable pour actions principales

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
}

export function PrimaryButton({ 
  children, 
  icon, 
  loading = false,
  disabled,
  className = '', 
  ...props 
}: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`px-6 py-2 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-medium flex items-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
