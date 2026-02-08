// Security configuration constants

export const SECURITY_CONFIG = {
  // Image upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],

  // Input validation
  MAX_PROMPT_LENGTH: 1000,
  MAX_CODE_LENGTH: 50000,

  // API rate limiting
  MAX_REQUESTS_PER_DAY: 5,
  RATE_LIMIT_WINDOW_MS: 86400000, // 24 hours

  // API key validation
  API_KEY_PREFIX: 'AIza',
  API_KEY_LENGTH: 39,

  // Code sanitization patterns
  DANGEROUS_PATTERNS: [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    // Note: require() is allowed for @jscad/modeling imports
    /import\s+(?!.*@jscad)/gi, // Allow @jscad imports only
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /localStorage/gi,
    /sessionStorage/gi,
    /document\./gi,
    /window\./gi,
  ],
} as const;

export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Clé API invalide. Vérifiez votre configuration.',
  QUOTA_EXCEEDED: 'Quota API dépassé. Limite gratuite atteinte (5 requêtes/jour).',
  INVALID_IMAGE: 'Image invalide. Formats acceptés: PNG, JPEG, GIF, WebP (max 5MB).',
  INVALID_PROMPT: 'Prompt invalide ou vide.',
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  GENERATION_ERROR: 'Une erreur est survenue lors de la génération.',
} as const;
