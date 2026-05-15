// AI Configuration - Simplified
export const AI_CONFIG = {
  // Single free model - Gemini 2.5 Flash
  MODEL: 'gemini-2.5-flash',

  // Generation parameters
  GENERATION_CONFIG: {
    temperature: 0.7,
    maxOutputTokens: 8192,
    topP: 0.95,
    topK: 64
  },

  // Retry configuration
  RETRY_CONFIG: {
    maxAttempts: 2,
    delayMs: 1000
  }
} as const;
