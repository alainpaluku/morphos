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
  const modeMatch = response.match(/MODE:\s*(2D|3D)/i);

  return {
    actionType: actionMatch ? actionMatch[1].toUpperCase() as 'CREATE' | 'MODIFY' | 'ADJUST' : 'CREATE',
    objectName: objectMatch ? objectMatch[1].trim() : 'object',
    searchQuery: searchMatch ? searchMatch[1].trim() : defaultPrompt,
    suggestedMode: modeMatch ? modeMatch[1].toUpperCase() as '2D' | '3D' : undefined
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
- CREATE: Creating a new model from scratch (keywords: créer, nouveau, new, create, make)
- MODIFY: Modifying structure of existing model (keywords: modifier, changer, ajouter, add, change, transform)
- ADJUST: Adjusting parameters only (keywords: ajuster, augmenter, réduire, increase, decrease, resize)

Respond in this format:
ACTION: [CREATE/MODIFY/ADJUST]
OBJECT: [object name]
SEARCH: [search query for technical specifications]
MODE: [2D/3D] (Determine if the user wants a 3D part or a 2D drawing/sketch)

Examples:
- "créer une vis M6" → ACTION: CREATE | OBJECT: Screw M6 | SEARCH: M6 screw dimensions ISO DIN
- "modifier le modèle pour ajouter des trous" → ACTION: MODIFY | OBJECT: Current Model | SEARCH: hole pattern
- "augmenter la hauteur de 10mm" → ACTION: ADJUST | OBJECT: Current Model | SEARCH: height parameter
- "ajouter des chanfreins" → ACTION: MODIFY | OBJECT: Current Model | SEARCH: chamfer edges

Analyze: "${userPrompt}"`;
};

/**
 * Build code generation prompt
 */
export const buildCodePrompt = (
  userPrompt: string,
  specifications: string | null,
  existingCode: string | null,
  hasImage: boolean = false,
  mode: '2D' | '3D' = '3D'
): string => {
  const isModification = existingCode !== null;

  if (mode === '2D') {
    return `Generate MAKERJS code for a 2D drawing: "${userPrompt}"
${specifications ? `SPECS: ${specifications}\n` : ''}
${isModification ? `EXISTING CODE: \n${existingCode}\n` : ''}

RULES:
1. Use makerjs library.
2. Return ONLY JavaScript code starting with "const main = () => {"
3. The main function MUST return a makerjs model.
4. Use millimeters.

Example:
const main = () => {
  const circle = new makerjs.models.Ring(10, 15);
  return circle;
};

Return ONLY the code.`;
  }

  if (isModification) {
    return `GENERATE code to modify: "${userPrompt}" in ${mode} mode.

EXISTING CODE:
\`\`\`javascript
${existingCode}
\`\`\`

RULES:
- Apply modifications using ${mode === '3D' ? 'replicad' : 'makerjs'}
- Keep structure
- Return ONLY JavaScript code starting with "const main = () => {"
- The main function MUST return a valid ${mode === '3D' ? 'shape' : 'model'}.

Return ONLY the complete JavaScript code. No markdown, no explanations.`;
  }

  if (hasImage) {
    return `ANALYZE image and GENERATE ${mode} code for: "${userPrompt}"

RULES:
1. [ANALYSIS] First, analyze the image in detail.
2. [REFLECTION] Plan the implementation using ${mode === '3D' ? 'replicad' : 'makerjs'}.
3. [CODE] Generate the JavaScript code.

FORMAT:
You MUST use the following format:

// --- ANALYSIS ---
// [Write your analysis and thought process here]

// --- CODE START ---
const main = () => {
  // Your code here using ${mode === '3D' ? 'replicad' : 'makerjs'}
};

CRITICAL:
- The code MUST be after "// --- CODE START ---"
- Return ONLY the formatted text with Analysis and Code.`;
  }

  if (mode === '3D') {
    return `Generate REPLICAD code for: "${userPrompt}"
${specifications ? `SPECS: ${specifications}\n` : ''}

AVAILABLE in 'replicad':
- makeBox(w, h, d), makeCylinder(r, h), makeSphere(r), makeTorus(r1, r2)
- draw().rect(w, h).extrude(d)
- fuse(s1, s2), cut(s1, s2), common(s1, s2)
- shape.translate([x, y, z]), shape.rotate(angle, [axis]), shape.scale(factor)

EXAMPLE:
const main = () => {
  const { makeBox, fuse } = replicad;
  const box1 = makeBox(20, 20, 20);
  const box2 = makeBox(10, 10, 40).translate([0, 0, -10]);
  return fuse(box1, box2);
};

RULES:
- Return ONLY code
- Start with: const main = () => {
- End with: };
- Use millimeters
- Use the 'replicad' object.

Generate code for: "${userPrompt}"`;
  }

  return `Generate code for: "${userPrompt}"`;
};
