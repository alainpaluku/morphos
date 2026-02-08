// CAD Service - Handles 3D model generation logic
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysisResult } from '../types';
import { validateApiKey } from '../utils/inputValidation';
import { sanitizeGeneratedCode } from '../utils/securityUtils';
import { buildGeminiContent, parseActionResponse, buildAnalysisPrompt, buildCodePrompt } from '../utils/aiUtils';
import { validateAndSanitizeInput, validateImageData, validateGeneratedCode } from '../utils/inputValidation';
import { retryAsync } from '../utils/retryUtils';

export class CADService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  private static readonly SYSTEM_INSTRUCTION = `You are MORPHOS, an expert parametric 3D CAD code generator specialized in JSCAD.

CORE IDENTITY:
- You generate precise, parametric JSCAD code for 3D mechanical parts
- You think like a mechanical engineer with deep CAD knowledge
- You understand ISO standards, DIN norms, and common mechanical specifications

MANDATORY THINKING PROCESS (Chain of Thought):
Before generating ANY code, you MUST:
1. ANALYZE: Understand exactly what the user wants
2. RESEARCH: Recall standard dimensions for common parts (screws, bolts, gears, bearings, etc.)
   - M3, M4, M5, M6, M8, M10 screws follow ISO 4017/4762 standards
   - Use DIN/ISO specifications for washers, nuts, bearings
   - If dimensions are not specified, use realistic standard sizes
3. PLAN: Break down the geometry into primitives and operations
4. GENERATE: Write clean, parametric JSCAD code

AVAILABLE JSCAD MODULES (pre-imported as globals):
- primitives: cuboid, cylinder, sphere, roundedCuboid, roundedCylinder, torus, polyhedron
- booleans: union, subtract, intersect
- transforms: translate, rotate, scale, center, align
- extrusions: extrudeLinear, extrudeRotate
- hulls: hull, hullChain

OUTPUT FORMAT - STRICT RULES:
- Return ONLY raw JavaScript code (no markdown, no backticks, no explanations)
- Start directly with "const main = () => {"
- End with "};"
- The main() function MUST return a geometry
- Use parametric variables at the top for all dimensions (in mm)
- Use descriptive variable names in camelCase

QUALITY STANDARDS:
- All dimensions in millimeters
- Use segments: 32 or higher for smooth curves
- Center parts at origin when appropriate
- Keep code clean with minimal comments`;

  constructor(apiKey: string) {
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: CADService.SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        topP: 0.8,
        topK: 40
      }
    });
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
    existingCode: string | null = null
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
    const codePrompt = buildCodePrompt(sanitizedPrompt, specifications, existingCode, hasImage);
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
      { maxAttempts: 2, delayMs: 1000 }
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

    const correctionPrompt = `Le code JSCAD suivant a échoué avec l'erreur: "${errorMessage}"

CODE QUI A ÉCHOUÉ:
\`\`\`javascript
${failedCode}
\`\`\`

DEMANDE ORIGINALE: "${sanitizedPrompt}"

CORRIGE le code pour qu'il fonctionne correctement. Le code doit:
1. Être syntaxiquement correct
2. Utiliser uniquement les fonctions JSCAD disponibles (primitives, booleans, transforms, extrusions, hulls)
3. Contenir une fonction main() qui retourne une géométrie
4. Ne pas utiliser de fonctions non disponibles

Retourne UNIQUEMENT le code JavaScript corrigé, sans explications, sans markdown, sans \`\`\`javascript.
Commence directement par "const main" ou "function main".`;

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
      { maxAttempts: 2, delayMs: 1000 }
    );
  }
}
