import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md';
}

export function Tabs({ tabs, activeTab, onChange, size = 'md' }: TabsProps) {
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-xs'
  };
  
  return (
    <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 ${sizeClasses[size]} rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === tab.id
              ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
