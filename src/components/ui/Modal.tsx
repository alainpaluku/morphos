import { ReactNode } from 'react';
import { Header } from './Layout';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon, 
  children, 
  footer,
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className={`bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-slideUp`}>
        <Header 
          title={title} 
          subtitle={subtitle} 
          icon={icon} 
          onClose={onClose} 
        />
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-tertiary)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
