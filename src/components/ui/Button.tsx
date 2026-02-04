import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'secondary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium flex items-center justify-center gap-2 transition-all';
  
  const variantClasses = {
    primary: 'bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 shadow-md',
    secondary: 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]',
    ghost: 'hover:bg-[var(--bg-tertiary)] transition-fast'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button 
      className={`p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-fast ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ExpandButton({ onClick, isExpanded }: { onClick: () => void; isExpanded?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label={isExpanded ? "Collapse" : "Expand"}
    >
      <svg className={`w-5 h-5 transition-transform ${isExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
