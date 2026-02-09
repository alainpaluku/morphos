import { useState, useEffect } from 'react';
import { Icons } from '../../constants/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  extractParameters, 
  updateParameterInCode, 
  getParameterCategory,
  formatParameterValue,
  translateParameterName
} from '../../utils/parameterUtils';
import { Model, Parameter, Preset, IconComponent, Material } from '../../types';
import { MATERIALS, MATERIAL_CATEGORIES } from '../../constants/materials';
import { MaterialService } from '../../services/MaterialService';
import { Button, ExpandButton, IconButton, Slider, Tabs, Card, EmptyState, ColorPicker, Flex } from '../ui';

interface ParametersPanelProps {
  currentModel: Model | null;
  onCodeChange: (newCode: string) => void;
  onMaterialChange: (material: Material) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function ParametersPanel({ 
  currentModel, 
  onCodeChange,
  onMaterialChange,
  isCollapsed, 
  onToggleCollapse
}: ParametersPanelProps): JSX.Element {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'parameters' | 'materials'>('parameters');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [originalValues, setOriginalValues] = useState<Record<string, number>>({});
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'metal' | 'plastic' | 'other'>('metal');
  const [customColor, setCustomColor] = useState('#C0C0C0');

  useEffect(() => {
    if (currentModel?.material?.color) {
      setCustomColor(currentModel.material.color);
    }
  }, [currentModel?.material?.color]);

  useEffect(() => {
    if (!currentModel?.code) {
      setParameters([]);
      setOriginalValues({});
      return;
    }

    const extractedParams = extractParameters(currentModel.code);
    setParameters(extractedParams);
    
    const originals: Record<string, number> = {};
    extractedParams.forEach(p => {
      originals[p.name] = p.value;
    });
    setOriginalValues(originals);
  }, [currentModel]);

  const handleParameterChange = (paramName: string, newValue: number): void => {
    if (!currentModel?.code) return;
    const param = parameters.find(p => p.name === paramName);
    if (!param) return;

    const newCode = updateParameterInCode(currentModel.code, paramName, newValue, param.lineIndex);
    onCodeChange(newCode);
    setParameters(prev => prev.map(p => p.name === paramName ? { ...p, value: newValue } : p));
  };

  const handleReset = (): void => {
    Object.keys(originalValues).forEach(paramName => {
      handleParameterChange(paramName, originalValues[paramName]);
    });
  };

  const handleSavePreset = (): void => {
    const presetName = prompt(t.messages.presetName);
    if (presetName) {
      const preset: Preset = { name: presetName, values: {} };
      parameters.forEach(p => { preset.values[p.name] = p.value; });
      setPresets([...presets, preset]);
    }
  };

  const material = currentModel?.material || MaterialService.getDefaultMaterial();

  const handleMaterialSelect = (materialId: string) => {
    const newMaterial = MaterialService.getMaterial(materialId);
    if (newMaterial) {
      setCustomColor(newMaterial.color);
      onMaterialChange({ ...newMaterial });
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onMaterialChange({ ...material, color });
  };

  const handlePropertyChange = (property: 'metalness' | 'roughness' | 'opacity', value: number) => {
    onMaterialChange({ ...material, [property]: value });
  };

  const renderIcon = (type: string, className: string): JSX.Element => {
    const iconKey = type.charAt(0).toUpperCase() + type.slice(1);
    const IconComponent = (Icons as Record<string, IconComponent>)[iconKey];
    return IconComponent ? <IconComponent className={className} /> : <Icons.Settings className={className} />;
  };

  // No model selected
  if (!currentModel) {
    return (
      <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="flex-1 flex items-center justify-center">
          <ExpandButton onClick={onToggleCollapse} />
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`${isCollapsed ? 'w-0' : 'w-80'} bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}>
      
      {/* HEADER */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-[var(--border-color)]/50 bg-[var(--bg-secondary)]/80 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">SETTINGS</h3>
            <IconButton onClick={onToggleCollapse}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </IconButton>
          </div>
          
          {/* TABS */}
          <Tabs
            tabs={[
              { id: 'parameters', label: 'PARAMETERS', icon: <Icons.Settings className="w-4 h-4" /> },
              { id: 'materials', label: 'MATERIALS', icon: <Icons.Palette className="w-4 h-4" /> }
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'parameters' | 'materials')}
          />
        </div>
      )}

      {/* CONTENT - Only one section visible at a time */}
      {!isCollapsed && (
        activeTab === 'parameters' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4">
              {parameters.length === 0 ? (
                <EmptyState
                  icon={<Icons.Settings className="w-8 h-8 opacity-50" />}
                  title={t.messages.noParametersFound}
                  description={t.messages.parametersAutoDetected}
                />
              ) : (
                <div className="space-y-3">
                  {parameters.map((param, idx) => {
                    const category = getParameterCategory(param.name);
                    return (
                      <Card key={idx} padding="md">
                        <Flex justify="between" className="mb-3">
                          <Flex gap="sm">
                            <span className={category.color}>{renderIcon(category.type, "w-5 h-5")}</span>
                            <span className="text-sm font-medium">{translateParameterName(param.name)}</span>
                          </Flex>
                          <input
                            type="number"
                            value={formatParameterValue(param.value)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) handleParameterChange(param.name, val);
                            }}
                            className="w-24 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-right"
                            step={param.step}
                            min={param.min}
                            max={param.max}
                          />
                        </Flex>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={param.value}
                          onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
                          className="slider w-full"
                        />
                        <Flex justify="between" className="text-xs text-[var(--text-tertiary)] mt-2">
                          <span>{formatParameterValue(param.min)}</span>
                          <span className="font-semibold">{formatParameterValue(param.value)}</span>
                          <span>{formatParameterValue(param.max)}</span>
                        </Flex>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            
            {parameters.length > 0 && (
              <div className="p-4 border-t border-[var(--border-color)]/50 space-y-2 flex-shrink-0">
                <Button onClick={handleSavePreset} variant="secondary" className="w-full">
                  {t.messages.savePreset}
                </Button>
                <Button onClick={handleReset} variant="secondary" className="w-full">
                  {t.messages.resetToOriginal}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
                {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as any)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium ${
                      selectedCategory === key ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Material Grid */}
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_CATEGORIES[selectedCategory].materials.map((matId) => {
                  const mat = MATERIALS[matId];
                  const isSelected = material.id === matId;
                  return (
                    <button
                      key={matId}
                      onClick={() => handleMaterialSelect(matId)}
                      className={`p-3 rounded-lg border-2 ${isSelected ? 'border-[var(--accent)]' : 'border-[var(--border-color)]'}`}
                    >
                      <div className="w-full h-12 rounded-md mb-2" style={{ backgroundColor: mat.color }} />
                      <p className="text-xs font-medium truncate">{mat.name}</p>
                    </button>
                  );
                })}
              </div>

              {/* Color Picker */}
              <ColorPicker
                label={t.materials.color}
                value={customColor}
                onChange={handleColorChange}
              />

              {/* Properties */}
              <div className="space-y-3">
                <Slider
                  label={t.materials.metalness}
                  value={material.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => handlePropertyChange('metalness', v)}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label={t.materials.roughness}
                  value={material.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => handlePropertyChange('roughness', v)}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider
                  label={t.materials.opacity}
                  value={material.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => handlePropertyChange('opacity', v)}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default ParametersPanel;
