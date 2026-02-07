// Centralized Tailwind CSS class definitions for consistent styling

// Input styles
export const inputBaseStyles = 'px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-fast';

// Button styles
export const buttonPrimaryStyles = 'bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 shadow-md';
export const buttonSecondaryStyles = 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]';
export const buttonGhostStyles = 'hover:bg-[var(--bg-tertiary)] transition-fast';

// Button sizes
export const buttonSizeSmall = 'px-3 py-1.5 text-xs';
export const buttonSizeMedium = 'px-4 py-2 text-sm';
export const buttonSizeLarge = 'px-6 py-3 text-base';

// Common button base
export const buttonBaseStyles = 'rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

// Modal styles
export const modalOverlayStyles = 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn';
export const modalContainerStyles = 'bg-[var(--bg-tertiary)] rounded-2xl shadow-2xl w-full flex flex-col animate-slideUp';
export const modalFooterStyles = 'px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between flex-shrink-0';

// Panel styles
export const panelStyles = 'bg-[var(--bg-secondary)]/50 rounded-xl p-4 border border-[var(--border-color)]';

// Icon button
export const iconButtonStyles = 'p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-fast';
