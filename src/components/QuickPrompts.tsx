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
  hasModel: boolean;
  onSelect: (prompt: string) => void;
}

const CREATION_PROMPTS: QuickPrompt[] = [
  { icon: 'Bolt', textKey: 'screw', promptEn: 'create M6 screw 30mm long', promptFr: 'créer une vis M6 de 30mm' },
  { icon: 'Circle', textKey: 'washer', promptEn: 'create M8 washer', promptFr: 'créer une rondelle M8' },
  { icon: 'Hexagon', textKey: 'nut', promptEn: 'create M10 nut', promptFr: 'créer un écrou M10' },
  { icon: 'Wrench', textKey: 'gear', promptEn: 'create gear 20 teeth module 2', promptFr: 'créer un engrenage 20 dents module 2' },
  { icon: 'Package', textKey: 'box', promptEn: 'create box 50x30x20mm', promptFr: 'créer une boîte 50x30x20mm' },
  { icon: 'Cylinder', textKey: 'cylinder', promptEn: 'create cylinder diameter 20mm height 50mm', promptFr: 'créer un cylindre diamètre 20mm hauteur 50mm' },
];

const MODIFICATION_PROMPTS: QuickPrompt[] = [
  { icon: 'ArrowsExpand', textKey: 'increaseSize', promptEn: 'increase all dimensions by 20%', promptFr: 'augmenter toutes les dimensions de 20%' },
  { icon: 'ArrowsContract', textKey: 'makeThinner', promptEn: 'reduce thickness by half', promptFr: 'réduire l\'épaisseur de moitié' },
  { icon: 'ViewGrid', textKey: 'addHoles', promptEn: 'add 4 mounting holes at corners', promptFr: 'ajouter 4 trous de fixation aux coins' },
  { icon: 'Sparkles', textKey: 'addChamfer', promptEn: 'add chamfers on edges', promptFr: 'ajouter des chanfreins sur les bords' },
  { icon: 'Palette', textKey: 'aluminum', promptEn: 'make it aluminum', promptFr: 'rendre en aluminium' },
  { icon: 'Palette', textKey: 'redPlastic', promptEn: 'make it red plastic', promptFr: 'rendre en plastique rouge' },
];

function QuickPrompts({ hasModel, onSelect }: QuickPromptsProps): JSX.Element {
  const { t, language } = useLanguage();
  const prompts = hasModel ? MODIFICATION_PROMPTS : CREATION_PROMPTS;

  return (
    <div className="text-center py-8">
      <div className="text-[var(--text-secondary)] text-sm mb-4">
        {hasModel ? t.messages.modifyYourModel : t.messages.describeYourModel}
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
        {prompts.map((item, idx) => {
          const IconComponent = Icons[item.icon];
          const text = hasModel 
            ? t.prompts.modify[item.textKey as keyof typeof t.prompts.modify]
            : t.prompts.create[item.textKey as keyof typeof t.prompts.create];
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
