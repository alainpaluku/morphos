// CAD Service - Handles 3D model generation logic
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysisResult } from '../types';
import { validateApiKey, sanitizeInput, sanitizeGeneratedCode } from '../utils/securityUtils';
import { buildGeminiContent, parseActionResponse, buildAnalysisPrompt, buildCodePrompt } from '../utils/aiUtils';
import { validatePrompt, validateImage, validateGeneratedCode } from '../utils/validationUtils';
import { retryAsync } from '../utils/retryUtils';

export class CADService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeRequest(
    prompt: string,
    imageData: string | null = null,
    existingCode: string | null = null
  ): Promise<AIAnalysisResult> {
    const sanitizedPrompt = validatePrompt(sanitizeInput(prompt));
    validateImage(imageData);
    
    const analysisPrompt = buildAnalysisPrompt(sanitizedPrompt, !!existingCode);
    const finalPrompt = imageData 
      ? `${analysisPrompt}\n\nIMAGE: Analyze the sketch/image provided to understand the object dimensions and features.`
      : analysisPrompt;
    
    const content = buildGeminiContent(finalPrompt, imageData);
    const result = await this.model.generateContent(content);
    const response = result.response.text();
    
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
    const sanitizedPrompt = validatePrompt(sanitizeInput(prompt));
    validateImage(imageData);
    
    const hasImage = imageData !== null;
    const codePrompt = buildCodePrompt(sanitizedPrompt, specifications, existingCode, hasImage);
    const content = buildGeminiContent(codePrompt, imageData);
    
    return retryAsync(
      async () => {
        const result = await this.model.generateContent(content);
        const code = sanitizeGeneratedCode(result.response.text());
        validateGeneratedCode(code);
        return code;
      },
      { maxAttempts: 2, delayMs: 1000 }
    );
  }
}
