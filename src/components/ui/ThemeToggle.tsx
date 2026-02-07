import { useTheme } from '../../contexts/ThemeContext';
import { Icons } from '../../constants/icons';

interface ThemeToggleProps {
    size?: 'sm' | 'md';
}

function ThemeToggle({ size = 'md' }: ThemeToggleProps): JSX.Element {
    const { theme, toggleTheme } = useTheme();

    const paddingClass = size === 'sm'
        ? 'p-1.5 md:p-2'
        : 'p-2';

    const iconClass = size === 'sm'
        ? 'w-4 h-4 md:w-5 md:h-5'
        : 'w-5 h-5';

    return (
        <button
            onClick={toggleTheme}
            className={`${paddingClass} hover:bg-[var(--bg-tertiary)] rounded-${size === 'sm' ? 'md md:rounded-lg' : 'lg'} transition-colors ${size === 'sm' ? 'border border-[var(--border-color)]' : ''}`}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
            <div className={theme === 'dark' ? 'theme-icon-sun' : 'theme-icon-moon'}>
                {theme === 'dark' ? <Icons.Sun className={iconClass} /> : <Icons.Moon className={iconClass} />}
            </div>
        </button>
    );
}

export default ThemeToggle;
