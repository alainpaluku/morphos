// Utility functions for parameter extraction and management
import { Parameter, ParameterCategory } from '../types';
import { formatParameterValue as formatValue } from './formatters';

// Re-export formatter for backward compatibility
export { formatParameterValue } from './formatters';

/**
 * Extract parameters from JSCAD code
 */
export function extractParameters(code: string): Parameter[] {
  const params: Parameter[] = [];
  const lines = code.split('\n');
  
  const patterns = [
    /const\s+(\w+)\s*=\s*(\d+\.?\d*)/g,
    /let\s+(\w+)\s*=\s*(\d+\.?\d*)/g,
    /var\s+(\w+)\s*=\s*(\d+\.?\d*)/g,
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      const matches = [...line.matchAll(pattern)];
      matches.forEach(match => {
        const name = match[1];
        const value = parseFloat(match[2]);
        
        if (!['i', 'j', 'k', 'x', 'y', 'z', 'index'].includes(name)) {
          const { min, max, step } = calculateParameterRange(value);
          
          params.push({
            name,
            value,
            min,
            max,
            step,
            lineIndex: index
          });
        }
      });
    });
  });

  return params;
}

/**
 * Calculate reasonable min/max/step based on parameter value
 */
export function calculateParameterRange(value: number): { min: number; max: number; step: number } {
  let min: number, max: number, step: number;
  
  if (value < 1) {
    min = Math.max(0.01, value * 0.1);
    max = value * 5;
    step = 0.01;
  } else if (value < 10) {
    min = Math.max(0.1, value * 0.2);
    max = value * 3;
    step = 0.1;
  } else if (value < 100) {
    min = Math.max(1, value * 0.5);
    max = value * 2;
    step = 1;
  } else {
    min = Math.max(10, value * 0.7);
    max = value * 1.5;
    step = 5;
  }
  
  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    step
  };
}

/**
 * Update parameter value in code
 */
export function updateParameterInCode(
  code: string, 
  paramName: string, 
  newValue: number, 
  lineIndex: number
): string {
  const lines = code.split('\n');
  
  const patterns = [
    new RegExp(`(const\\s+${paramName}\\s*=\\s*)\\d+\\.?\\d*`, 'g'),
    new RegExp(`(let\\s+${paramName}\\s*=\\s*)\\d+\\.?\\d*`, 'g'),
    new RegExp(`(var\\s+${paramName}\\s*=\\s*)\\d+\\.?\\d*`, 'g'),
  ];

  patterns.forEach(pattern => {
    lines[lineIndex] = lines[lineIndex].replace(pattern, `$1${newValue}`);
  });

  return lines.join('\n');
}

/**
 * Get parameter category based on name
 */
export function getParameterCategory(name: string): ParameterCategory {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('diameter') || lowerName.includes('radius') || lowerName.includes('diam')) {
    return { 
      type: 'diameter',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--bg-tertiary)]/50' 
    };
  }
  
  if (lowerName.includes('width') || lowerName.includes('thickness') || lowerName.includes('thick')) {
    return { 
      type: 'width',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--bg-tertiary)]/50' 
    };
  }
  
  if (lowerName.includes('height') || lowerName.includes('length') || lowerName.includes('depth')) {
    return { 
      type: 'height',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--bg-tertiary)]/50' 
    };
  }
  
  if (lowerName.includes('pitch') || lowerName.includes('spacing') || lowerName.includes('gap')) {
    return { 
      type: 'sliders',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--bg-tertiary)]/30' 
    };
  }
  
  if (lowerName.includes('angle') || lowerName.includes('rotation') || lowerName.includes('rotate')) {
    return { 
      type: 'rotate',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--accent)]/10' 
    };
  }
  
  if (lowerName.includes('count') || lowerName.includes('number') || lowerName.includes('num') || lowerName.includes('teeth')) {
    return { 
      type: 'hash',
      color: 'text-[var(--text-secondary)]', 
      bg: 'bg-[var(--accent)]/10' 
    };
  }
  
  return { 
    type: 'settings',
    color: 'text-[var(--text-secondary)]', 
    bg: 'bg-[var(--bg-tertiary)]/30' 
  };
}

/**
 * Translate parameter name to French
 */
export function translateParameterName(name: string): string {
  // Dictionary of common parameter names (English -> French)
  const translations: Record<string, string> = {
    // Dimensions
    'width': 'Largeur',
    'height': 'Hauteur',
    'depth': 'Profondeur',
    'length': 'Longueur',
    'thickness': 'Épaisseur',
    'diameter': 'Diamètre',
    'radius': 'Rayon',
    
    // Thread/Screw
    'threadDiameter': 'Diamètre Filetage',
    'threadPitch': 'Pas Filetage',
    'threadDepth': 'Profondeur Filetage',
    'shaftDiameter': 'Diamètre Tige',
    'shaftLength': 'Longueur Tige',
    'headDiameter': 'Diamètre Tête',
    'headHeight': 'Hauteur Tête',
    
    // Nut
    'acrossFlats': 'Entre Plats',
    'nutHeight': 'Hauteur Écrou',
    
    // Washer
    'innerDiameter': 'Diamètre Intérieur',
    'outerDiameter': 'Diamètre Extérieur',
    
    // Gear
    'module': 'Module',
    'teeth': 'Nombre Dents',
    'teethCount': 'Nombre Dents',
    'pressureAngle': 'Angle Pression',
    'faceWidth': 'Largeur Face',
    'boreDiameter': 'Diamètre Alésage',
    'pitchDiameter': 'Diamètre Primitif',
    'rootDiameter': 'Diamètre Pied',
    
    // Box/Enclosure
    'wallThickness': 'Épaisseur Paroi',
    'cornerRadius': 'Rayon Coin',
    
    // General
    'chamferHeight': 'Hauteur Chanfrein',
    'chamferAngle': 'Angle Chanfrein',
    'filletRadius': 'Rayon Congé',
    'holeCount': 'Nombre Trous',
    'holeDiameter': 'Diamètre Trou',
    'spacing': 'Espacement',
    'gap': 'Écart',
    'offset': 'Décalage',
    'angle': 'Angle',
    'rotation': 'Rotation',
    'segments': 'Segments',
    'turns': 'Tours',
    'count': 'Nombre',
    'number': 'Nombre',
    'size': 'Taille'
  };
  
  // Try exact match first
  if (translations[name]) {
    return translations[name];
  }
  
  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial matches for compound names (e.g., "shaftDiameter" -> "Diamètre Tige")
  for (const [key, value] of Object.entries(translations)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Convert camelCase to readable format if no translation found
  // e.g., "myParameter" -> "My Parameter"
  const readable = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  return readable;
}
