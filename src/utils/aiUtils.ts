// AI utilities for common AI-related operations

import { AIAnalysisResult } from '../types';

/**
 * Parse image data and extract base64 and mime type
 */
export const parseImageData = (imageData: string): { base64: string; mimeType: string } | null => {
  if (!imageData) return null;
  
  try {
    const parts = imageData.split(',');
    if (parts.length !== 2) return null;
    
    const base64Data = parts[1];
    const mimeType = parts[0].split(';')[0].split(':')[1];
    
    return { base64: base64Data, mimeType };
  } catch (error) {
    return null;
  }
};

/**
 * Build content array for Gemini API with optional image
 */
export const buildGeminiContent = (textPrompt: string, imageData: string | null = null): any[] => {
  const content: any[] = [{ text: textPrompt }];
  
  if (imageData) {
    const parsed = parseImageData(imageData);
    if (parsed) {
      content.push({
        inlineData: {
          data: parsed.base64,
          mimeType: parsed.mimeType
        }
      });
    }
  }
  
  return content;
};

/**
 * Parse AI response for action analysis
 */
export const parseActionResponse = (response: string, defaultPrompt: string): AIAnalysisResult => {
  const actionMatch = response.match(/ACTION:\s*(CREATE|MODIFY|ADJUST)/i);
  const objectMatch = response.match(/OBJECT:\s*(.+?)(?:\n|$)/i);
  const searchMatch = response.match(/SEARCH:\s*(.+?)(?:\n|$)/i);
  
  return {
    actionType: actionMatch ? actionMatch[1].toUpperCase() as 'CREATE' | 'MODIFY' | 'ADJUST' : 'CREATE',
    objectName: objectMatch ? objectMatch[1].trim() : 'object',
    searchQuery: searchMatch ? searchMatch[1].trim() : defaultPrompt
  };
};

/**
 * Get action metadata (emoji, text, color)
 */
export const getActionMetadata = (actionType: 'CREATE' | 'MODIFY' | 'ADJUST') => {
  const metadata = {
    CREATE: { emoji: '✨', text: 'Création', color: 'primary' },
    MODIFY: { emoji: '🔧', text: 'Modification', color: 'secondary' },
    ADJUST: { emoji: '⚙️', text: 'Ajustement', color: 'tertiary' }
  };
  
  return metadata[actionType] || metadata.CREATE;
};

/**
 * Format error message based on error type
 */
export const formatAIError = (error: unknown): { message: string; isQuotaError: boolean } => {
  if (!(error instanceof Error)) {
    return {
      message: 'Une erreur est survenue lors de la génération.',
      isQuotaError: false
    };
  }
  
  const errorMessage = error.message || '';
  
  // Quota errors
  if (errorMessage.includes('429')) {
    return {
      message: 'Quota API dépassé. Limite gratuite atteinte (20 requêtes/jour). Veuillez réessayer plus tard ou vérifier votre plan API.',
      isQuotaError: true
    };
  }
  
  if (errorMessage.includes('quota')) {
    return {
      message: 'Limite de quota atteinte. Veuillez attendre quelques secondes avant de réessayer.',
      isQuotaError: true
    };
  }
  
  // API key errors
  if (errorMessage.includes('API key') || errorMessage.includes('401')) {
    return {
      message: 'Clé API invalide ou manquante. Vérifiez votre configuration.',
      isQuotaError: false
    };
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      message: 'Erreur de connexion. Vérifiez votre connexion internet.',
      isQuotaError: false
    };
  }
  
  return {
    message: errorMessage || 'Une erreur est survenue lors de la génération.',
    isQuotaError: false
  };
};

/**
 * Build analysis prompt for action detection
 */
export const buildAnalysisPrompt = (userPrompt: string, hasExistingCode: boolean): string => {
  return `Analyze this CAD request and determine the action type and specifications.

USER REQUEST: "${userPrompt}"
${hasExistingCode ? 'CONTEXT: User has an existing 3D model loaded' : 'CONTEXT: No model currently loaded'}

Determine if this is:
- CREATE: Creating a new 3D model from scratch (keywords: créer, nouveau, new, create, make)
- MODIFY: Modifying structure of existing model (keywords: modifier, changer, ajouter, add, change, transform)
- ADJUST: Adjusting parameters only (keywords: ajuster, augmenter, réduire, increase, decrease, resize)

Respond in this format:
ACTION: [CREATE/MODIFY/ADJUST]
OBJECT: [object name]
SEARCH: [search query for technical specifications]

Examples:
- "créer une vis M6" → ACTION: CREATE | OBJECT: Screw M6 | SEARCH: M6 screw dimensions ISO DIN
- "modifier le modèle pour ajouter des trous" → ACTION: MODIFY | OBJECT: Current Model | SEARCH: hole pattern
- "augmenter la hauteur de 10mm" → ACTION: ADJUST | OBJECT: Current Model | SEARCH: height parameter
- "ajouter des chanfreins" → ACTION: MODIFY | OBJECT: Current Model | SEARCH: chamfer edges

Analyze: "${userPrompt}"`;
};

/**
 * Build code generation prompt - MINIMAL COMMENTS VERSION
 */
export const buildCodePrompt = (
  userPrompt: string,
  specifications: string | null,
  existingCode: string | null,
  hasImage: boolean = false
): string => {
  const isModification = existingCode !== null;
  
  if (isModification) {
    return `GENERATE JSCAD code to modify: "${userPrompt}"

EXISTING CODE:
\`\`\`javascript
${existingCode}
\`\`\`

RULES:
- Apply modifications
- Keep structure
- NO comments except for parameters
- Return ONLY JavaScript code

Return ONLY the complete JavaScript code. No markdown, no explanations.`;
  }
  
  if (hasImage) {
    return `ANALYZE image and GENERATE JSCAD code for: "${userPrompt}"

RULES:
1. Identify main shape
2. Use basic primitives (cuboid, cylinder, sphere)
3. Estimate dimensions (mm)
4. MINIMAL comments (only for parameters)
5. MUST include main() function that returns geometry

SYNTAX:
const main = () => {
  const width = 50;
  const height = 30;
  const shape = primitives.cuboid({ size: [width, height, 20] });
  return shape;
};

Return ONLY JavaScript code. No markdown, no \`\`\`javascript tags, MINIMAL comments.`;
  }
  
  return `GENERATE JSCAD code for: "${userPrompt}"

${specifications ? `SPECS: ${specifications}\n` : ''}

CRITICAL FORMAT RULES:
- Return ONLY raw JavaScript code
- NO markdown formatting
- NO \`\`\`javascript or \`\`\` tags
- NO explanations before or after code
- Start directly with "const main" or "function main"

EXAMPLES:

VIS M6:
const main = () => {
  const shaftDiameter = 6;
  const shaftLength = 30;
  const headDiameter = 10;
  const headHeight = 4;
  
  const shaft = primitives.cylinder({
    radius: shaftDiameter / 2,
    height: shaftLength,
    segments: 32
  });
  
  const head = primitives.cylinder({
    radius: headDiameter / 2,
    height: headHeight,
    segments: 6
  });
  
  return booleans.union(
    shaft,
    transforms.translate([0, 0, shaftLength], head)
  );
};

CUBE:
const main = () => {
  const size = 20;
  return primitives.cuboid({ size: [size, size, size] });
};

BOÎTE:
const main = () => {
  const width = 50;
  const depth = 30;
  const height = 20;
  const wallThickness = 2;
  
  const outer = primitives.cuboid({ size: [width, depth, height] });
  const inner = primitives.cuboid({ 
    size: [width - wallThickness * 2, depth - wallThickness * 2, height] 
  });
  
  return booleans.subtract(
    outer,
    transforms.translate([0, 0, wallThickness], inner)
  );
};

RULES:
1. SIMPLE code - no complex details
2. Clear parameter names
3. MINIMAL comments (only for parameters if needed)
4. Basic shapes (cuboid, cylinder, sphere)
5. Basic operations (union, subtract)
6. MUST have main() function returning geometry
7. Parametric dimensions

CRITICAL:
✓ Must contain "const main = () => {" or "function main()"
✓ Must use primitives, booleans, transforms, or extrusions
✓ Must return geometry
✓ MINIMAL or NO comments
✓ SIMPLE and CLEAN
✓ NO MARKDOWN FORMATTING

Return ONLY JavaScript code starting with "const main" or "function main". Nothing else.`;
};
