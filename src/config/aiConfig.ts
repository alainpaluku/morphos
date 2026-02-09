// AI Configuration
// Centralized configuration for AI models

export const AI_CONFIG = {
  // Available Gemini models (FREE TIER - February 2026)
  MODELS: {
    // Gemini 3 Series (Latest)
    GEMINI_3_FLASH: 'gemini-3-flash',           // ✅ FREE - Best for speed and quality balance
    
    // Gemini 2.5 Series
    GEMINI_2_5_PRO: 'gemini-2.5-pro',           // ✅ FREE - Complex reasoning, analysis
    GEMINI_2_5_FLASH: 'gemini-2.5-flash',       // ✅ FREE - Large scale processing
    GEMINI_2_5_FLASH_LITE: 'gemini-2.5-flash-lite', // ✅ FREE - High throughput, cost-effective
    
    // Gemini 2.0 Series
    GEMINI_2_0_FLASH: 'gemini-2.0-flash',       // ✅ FREE - Multimodal, agents
    
    // Gemini 1.5 Series (Stable)
    GEMINI_1_5_FLASH: 'gemini-1.5-flash',       // ✅ FREE - Stable, proven
    GEMINI_1_5_FLASH_8B: 'gemini-1.5-flash-8b', // ✅ FREE - Lightweight
    
    // Note: Gemini 3 Pro is NOT available in free tier
  },

  // Default model to use (recommended for CAD generation)
  DEFAULT_MODEL: 'gemini-2.5-flash', // Best balance for code generation

  // Generation parameters
  GENERATION_CONFIG: {
    temperature: 0.2,      // Low temperature for consistent code generation
    maxOutputTokens: 8192, // Maximum tokens in response
    topP: 0.8,            // Nucleus sampling parameter
    topK: 40              // Top-k sampling parameter
  },

  // Retry configuration
  RETRY_CONFIG: {
    maxAttempts: 2,
    delayMs: 1000
  }
} as const;

/**
 * Get the configured model name from environment or use default
 */
export const getModelName = (): string => {
  const envModel = import.meta.env.VITE_GEMINI_MODEL;
  
  // Validate that the model exists in our config
  if (envModel && Object.values(AI_CONFIG.MODELS).includes(envModel)) {
    return envModel;
  }

  // Fallback to default
  return AI_CONFIG.DEFAULT_MODEL;
};

/**
 * Validate if a model name is supported
 */
export const isValidModel = (modelName: string): boolean => {
  return Object.values(AI_CONFIG.MODELS).includes(modelName);
};

/**
 * Get model recommendations based on use case
 */
export const getModelRecommendation = (useCase: 'speed' | 'quality' | 'cost' | 'balanced'): string => {
  switch (useCase) {
    case 'speed':
      return AI_CONFIG.MODELS.GEMINI_2_5_FLASH_LITE;
    case 'quality':
      return AI_CONFIG.MODELS.GEMINI_2_5_PRO;
    case 'cost':
      return AI_CONFIG.MODELS.GEMINI_2_5_FLASH_LITE;
    case 'balanced':
    default:
      return AI_CONFIG.MODELS.GEMINI_2_5_FLASH;
  }
};

