interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  showValue?: boolean;
}

export function Slider({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  formatValue = (v) => v.toString(),
  showValue = true 
}: SliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium">{label}</label>
        {showValue && (
          <span className="text-xs text-[var(--text-tertiary)]">
            {formatValue(value)}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider w-full"
      />
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberInput({ value, onChange, min, max, step, className = '' }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) onChange(val);
      }}
      className={`px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
      step={step}
      min={min}
      max={max}
    />
  );
}
