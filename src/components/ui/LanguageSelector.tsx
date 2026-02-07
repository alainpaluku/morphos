import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
    size?: 'sm' | 'md';
}

function LanguageSelector({ size = 'md' }: LanguageSelectorProps): JSX.Element {
    const { language, setLanguage } = useLanguage();

    const paddingClass = size === 'sm'
        ? 'px-2 md:px-3 py-1 md:py-1.5'
        : 'px-3 py-1.5';

    return (
        <div className={`flex gap-${size === 'sm' ? '0.5 md:gap-1' : '1'} bg-[var(--bg-tertiary)] rounded-${size === 'sm' ? 'md md:rounded-lg' : 'lg'} p-${size === 'sm' ? '0.5 md:p-1' : '1'} border border-[var(--border-color)]`}>
            <button
                onClick={() => setLanguage('en')}
                className={`${paddingClass} rounded-md text-xs font-medium transition-all ${language === 'en'
                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                title="English"
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('fr')}
                className={`${paddingClass} rounded-md text-xs font-medium transition-all ${language === 'fr'
                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                title="Français"
            >
                FR
            </button>
        </div>
    );
}

export default LanguageSelector;
