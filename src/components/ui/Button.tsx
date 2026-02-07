import { ReactNode, ButtonHTMLAttributes } from 'react';
import { buttonBaseStyles, buttonPrimaryStyles, buttonSecondaryStyles, buttonGhostStyles, buttonSizeSmall, buttonSizeMedium, buttonSizeLarge, iconButtonStyles } from './styles';

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
  const variantClasses = {
    primary: buttonPrimaryStyles,
    secondary: buttonSecondaryStyles,
    ghost: buttonGhostStyles
  };
  
  const sizeClasses = {
    sm: buttonSizeSmall,
    md: buttonSizeMedium,
    lg: buttonSizeLarge
  };
  
  return (
    <button 
      className={`${buttonBaseStyles} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button 
      className={`${iconButtonStyles} ${className}`}
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
