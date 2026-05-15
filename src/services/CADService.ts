// CAD Service - Handles 3D model generation logic
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysisResult } from '../types';
import { validateApiKey } from '../utils/inputValidation';
import { sanitizeGeneratedCode } from '../utils/securityUtils';
import { buildGeminiContent, parseActionResponse, buildAnalysisPrompt, buildCodePrompt } from '../utils/aiUtils';
import { validateAndSanitizeInput, validateImageData, validateGeneratedCode } from '../utils/inputValidation';
import { retryAsync } from '../utils/retryUtils';
import { AI_CONFIG } from '../config/aiConfig';

export class CADService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  private static readonly SYSTEM_INSTRUCTION = `You are MORPHOS, an expert CAD code generator.
You can generate 3D models using Replicad (OpenCascade) and 2D drawings using Makerjs.

YOUR MISSION:
Generate clean, working JavaScript code based on the requested mode (2D or 3D).

--- 3D MODE (REPLICAD) ---
Library 'replicad' is available.
Key functions:
- makeBox(width, height, depth), makeCylinder(radius, height), makeSphere(radius)
- draw().rect(w, h).extrude(d)
- fuse(shape1, shape2), cut(shape1, shape2), common(shape1, shape2)
- shape.translate([x, y, z]), shape.rotate(angle, [axis]), shape.scale(factor)

Example 3D:
const main = () => {
  const { makeBox } = replicad;
  return makeBox(20, 20, 20);
};

--- 2D MODE (MAKERJS) ---
Library 'makerjs' is available.
Key functions:
- new makerjs.models.Rectangle(width, height)
- new makerjs.models.Oval(width, height)
- makerjs.model.combineUnion(a, b), makerjs.model.combineSubtraction(a, b)

Example 2D:
const main = () => {
  return new makerjs.models.Rectangle(100, 50);
};

RULES:
1. Return ONLY JavaScript code.
2. Start with: const main = () => {
3. End with: };
4. Use millimeters.
5. Always return the model/shape from main().`;

  constructor(apiKey: string) {
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: AI_CONFIG.MODEL,
        systemInstruction: CADService.SYSTEM_INSTRUCTION,
        generationConfig: AI_CONFIG.GENERATION_CONFIG
      });
      console.log(`[CADService] ✓ Initialized with model: ${AI_CONFIG.MODEL}`);
    } catch (error) {
      console.error('[CADService] Failed to initialize Gemini model:', error);
      throw new Error(`Failed to initialize AI model. Please check your API key.`);
    }
  }

  async analyzeRequest(
    prompt: string,
    imageData: string | null = null,
    existingCode: string | null = null
  ): Promise<AIAnalysisResult> {
    const sanitizedPrompt = validateAndSanitizeInput(prompt);

    // Validate image if provided
    try {
      validateImageData(imageData);
      if (imageData) {
        console.log('[CADService] Image provided, size:', imageData.length, 'chars');
      }
    } catch (error) {
      console.error('[CADService] Image validation failed:', error);
      throw error;
    }

    const analysisPrompt = buildAnalysisPrompt(sanitizedPrompt, !!existingCode);
    const finalPrompt = imageData
      ? `${analysisPrompt}\n\nIMAGE: Analyze the sketch/image provided to understand the object dimensions and features.`
      : analysisPrompt;

    console.log('[CADService] Analyzing request with image:', !!imageData);
    const content = buildGeminiContent(finalPrompt, imageData);
    const result = await this.model.generateContent(content);
    const response = result.response.text();
    console.log('[CADService] Analysis response:', response.substring(0, 200));

    return parseActionResponse(response, sanitizedPrompt);
  }

  getSpecifications(searchQuery: string): string | null {
    const lowerQuery = searchQuery.toLowerCase();

    const specs: Record<string, string> = {
      'm6_screw': `ISO 4017 M6:\n• Diamètre tige: 6mm\n• Diamètre tête: 10mm\n• Hauteur tête: 4mm`,
      'm8_washer': `ISO 7089 M8:\n• Diamètre intérieur: 8.4mm\n• Diamètre extérieur: 16mm\n• Épaisseur: 1.6mm`
    };

    if (lowerQuery.includes('m6') && (lowerQuery.includes('screw') || lowerQuery.includes('vis'))) {
      return specs.m6_screw;
    }

    if (lowerQuery.includes('m8') && (lowerQuery.includes('washer') || lowerQuery.includes('rondelle'))) {
      return specs.m8_washer;
    }

    return null;
  }

  async generateCode(
    prompt: string,
    specifications: string | null,
    imageData: string | null = null,
    existingCode: string | null = null,
    mode: '2D' | '3D' = '3D'
  ): Promise<string> {
    const sanitizedPrompt = validateAndSanitizeInput(prompt);

    // Validate image if provided
    try {
      validateImageData(imageData);
      if (imageData) {
        console.log('[CADService] Generating code with image, size:', imageData.length, 'chars');
      }
    } catch (error) {
      console.error('[CADService] Image validation failed:', error);
      throw error;
    }

    const hasImage = imageData !== null;
    const codePrompt = buildCodePrompt(sanitizedPrompt, specifications, existingCode, hasImage, mode);
    const content = buildGeminiContent(codePrompt, imageData);

    console.log('[CADService] Generating code, hasImage:', hasImage);

    return retryAsync(
      async () => {
        const result = await this.model.generateContent(content);
        const rawText = result.response.text();
        console.log('[CADService] Code generated, length:', rawText.length);

        // Extract code from CoT response if present
        let codeToSanitize = rawText;
        if (rawText.includes('// --- CODE START ---')) {
          const parts = rawText.split('// --- CODE START ---');
          if (parts.length > 1) {
            console.log('[CADService] AI Analysis:', parts[0].substring(0, 200)); // Log analysis for debugging
            codeToSanitize = parts[1];
          }
        }

        const code = sanitizeGeneratedCode(codeToSanitize);
        validateGeneratedCode(code);
        console.log('[CADService] Code validated successfully');
        return code;
      },
      AI_CONFIG.RETRY_CONFIG
    );
  }

  /**
   * Correct code that failed to execute
   */
  async correctCode(
    originalPrompt: string,
    failedCode: string,
    errorMessage: string,
    imageData: string | null = null
  ): Promise<string> {
    const sanitizedPrompt = validateAndSanitizeInput(originalPrompt);
    validateImageData(imageData);

    const correctionPrompt = `CORRECTION DE CODE JSCAD

ERREUR: "${errorMessage}"

CODE QUI A ÉCHOUÉ:
\`\`\`javascript
${failedCode}
\`\`\`

DEMANDE ORIGINALE: "${sanitizedPrompt}"

INSTRUCTIONS:
1. Analyse l'erreur et identifie le problème
2. Corrige le code en utilisant UNIQUEMENT:
   - primitives: cuboid, cylinder, sphere, roundedCuboid, roundedCylinder
   - booleans: union, subtract, intersect
   - transforms: translate, rotate, scale
3. Le code DOIT:
   - Commencer par: const main = () => {
   - Retourner une géométrie valide
   - Être syntaxiquement correct
   - Utiliser des dimensions en millimètres

EXEMPLE DE CODE CORRECT:
const main = () => {
  const size = 20;
  return primitives.cuboid({ size: [size, size, size] });
};

RETOURNE UNIQUEMENT LE CODE CORRIGÉ (pas de markdown, pas d'explications).
Commence directement par "const main":`;

    const content = buildGeminiContent(correctionPrompt, imageData);

    return retryAsync(
      async () => {
        const result = await this.model.generateContent(content);
        const rawText = result.response.text();

        // Extract code
        let codeToSanitize = rawText;
        if (rawText.includes('// --- CODE START ---')) {
          const parts = rawText.split('// --- CODE START ---');
          if (parts.length > 1) {
            codeToSanitize = parts[1];
          }
        }

        const code = sanitizeGeneratedCode(codeToSanitize);
        validateGeneratedCode(code);
        return code;
      },
      AI_CONFIG.RETRY_CONFIG
    );
  }
}
