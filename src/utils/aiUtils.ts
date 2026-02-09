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

// Re-export from errorHandler for backward compatibility
export { formatAIError } from './errorHandler';

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
1. [ANALYSIS] First, analyze the image in detail:
   - Identify the main shape and its components.
   - Estimate relative dimensions (assume standard sizes if unknown, e.g., M6 screw).
   - Determine necessary primitives (cuboid, cylinder, sphere) and boolean operations.
2. [REFLECTION] Plan the implementation step-by-step.
3. [CODE] Generate the JSCAD code.

FORMAT:
You MUST use the following format:

// --- ANALYSIS ---
// [Write your analysis and thought process here]
// [Explain dimensions and geometric approach]

// --- CODE START ---
const main = () => {
  // Your code here
  // ...
};

CRITICAL:
- The code MUST be after "// --- CODE START ---"
- MUST include main() function that returns geometry
- Use primitives, booleans, transforms from @jscad/modeling
- Return ONLY the formatted text with Analysis and Code.`;
  }

  return `Generate JSCAD code for: "${userPrompt}"

${specifications ? `SPECS: ${specifications}\n` : ''}

AVAILABLE:
- primitives: cuboid, cylinder, sphere, roundedCuboid, roundedCylinder
- booleans: union, subtract, intersect
- transforms: translate, rotate, scale

EXAMPLES:

Cube:
const main = () => {
  const size = 20;
  return primitives.cuboid({ size: [size, size, size] });
};

Cylinder:
const main = () => {
  const radius = 10;
  const height = 30;
  return primitives.cylinder({ radius, height, segments: 32 });
};

Sphere:
const main = () => {
  const radius = 15;
  return primitives.sphere({ radius, segments: 32 });
};

Box with rounded corners:
const main = () => {
  const width = 50;
  const depth = 30;
  const height = 20;
  const roundRadius = 2;
  return primitives.roundedCuboid({ size: [width, depth, height], roundRadius, segments: 16 });
};

Simple screw:
const main = () => {
  const shaftRadius = 3;
  const shaftHeight = 30;
  const headRadius = 5;
  const headHeight = 4;
  
  const shaft = primitives.cylinder({ radius: shaftRadius, height: shaftHeight, segments: 32 });
  const head = primitives.cylinder({ radius: headRadius, height: headHeight, segments: 32 });
  const headTranslated = transforms.translate([0, 0, shaftHeight], head);
  
  return booleans.union(shaft, headTranslated);
};

RULES:
- Return ONLY code (no markdown, no backticks)
- Start with: const main = () => {
- End with: };
- main() MUST return a geometry
- Use millimeters
- Keep it simple

Generate code for: "${userPrompt}"`;
};
