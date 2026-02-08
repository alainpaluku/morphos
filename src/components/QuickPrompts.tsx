// Quick prompts component
import { Icons } from '../constants/icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuickPrompt {
  icon: keyof typeof Icons;
  textKey: string;
  promptEn: string;
  promptFr: string;
}

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const CREATION_PROMPTS: QuickPrompt[] = [
  { icon: 'Cube', textKey: 'cube', promptEn: 'create a 30mm cube', promptFr: 'créer un cube de 30mm' },
  { icon: 'Cylinder', textKey: 'cylinder', promptEn: 'create a cylinder diameter 25mm height 40mm', promptFr: 'créer un cylindre diamètre 25mm hauteur 40mm' },
  { icon: 'Package', textKey: 'box', promptEn: 'create a box 50x30x20mm', promptFr: 'créer une boîte 50x30x20mm' },
  { icon: 'ViewGrid', textKey: 'table', promptEn: 'create a table 80x50cm height 75cm', promptFr: 'créer une table 80x50cm hauteur 75cm' },
  { icon: 'Circle', textKey: 'washer', promptEn: 'create an M8 washer', promptFr: 'créer une rondelle M8' },
  { icon: 'Hexagon', textKey: 'nut', promptEn: 'create an M10 nut', promptFr: 'créer un écrou M10' },
];

function QuickPrompts({ onSelect }: QuickPromptsProps): JSX.Element {
  const { t, language } = useLanguage();

  return (
    <div className="text-center py-8">
      <div className="text-[var(--text-secondary)] text-sm mb-4">
        {t.messages.describeYourModel}
      </div>

      {/* Quota Info */}
      <div className="mb-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-secondary)]">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left">
            <div className="font-semibold mb-1">{t.chat.quotaInfo}</div>
            <div className="text-[var(--text-tertiary)]">{t.chat.quotaDesc}</div>
          </div>
        </div>
      </div>

      {/* Quick Prompts Grid */}
      <div className="grid grid-cols-2 gap-2">
        {CREATION_PROMPTS.map((item, idx) => {
          const IconComponent = Icons[item.icon];
          const text = t.prompts.create[item.textKey as keyof typeof t.prompts.create];
          const prompt = language === 'fr' ? item.promptFr : item.promptEn;

          return (
            <button
              key={idx}
              onClick={() => onSelect(prompt)}
              className="px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg text-xs transition-all duration-200 flex items-center gap-2 border border-[var(--border-color)]"
            >
              <IconComponent className="w-5 h-5" />
              <span>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickPrompts;
