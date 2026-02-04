import { ReactNode } from 'react';

// Flex container with common patterns
interface FlexProps {
  children: ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  direction?: 'row' | 'col';
}

export function Flex({ 
  children, 
  className = '', 
  gap = 'md',
  align = 'center',
  justify = 'start',
  direction = 'row'
}: FlexProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };
  
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  return (
    <div className={`flex ${directionClasses[direction]} ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}>
      {children}
    </div>
  );
}

// Modal/Panel header
interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
}

export function Header({ title, subtitle, icon, onClose, actions }: HeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)]">
      <Flex gap="md">
        {icon && (
          <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center shadow-lg">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </Flex>
      <Flex gap="sm">
        {actions}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-fast"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </Flex>
    </div>
  );
}

// Card component
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  return (
    <div className={`rounded-xl bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]/50 ${paddingClasses[padding]} ${hover ? 'hover:border-[var(--border-color)] transition-fast' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Section with title
interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold mb-3 uppercase text-[var(--text-secondary)]">{title}</h3>
      {children}
    </div>
  );
}

// Empty state
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center text-[var(--text-tertiary)] py-8">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-3 bg-[var(--bg-tertiary)]/50 rounded-xl flex items-center justify-center border border-[var(--border-color)]/50">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium mb-1">{title}</p>
      {description && <p className="text-xs text-[var(--text-tertiary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Badge
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    accent: 'bg-[var(--accent)] text-[var(--bg-primary)]'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span className={`rounded-lg font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
