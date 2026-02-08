// Centralized error handling utilities

export interface ErrorResult {
  message: string;
  isQuotaError: boolean;
  isRetryable: boolean;
}

export interface JSCADErrorResult {
  title: string;
  message: string;
  suggestion: string;
  isRetryable: boolean;
}

/**
 * Format JSCAD code execution errors with user-friendly messages
 */
export const formatJSCADError = (error: string): JSCADErrorResult => {
  const errorLower = error.toLowerCase();

  // Syntax errors
  if (errorLower.includes('syntaxerror') || errorLower.includes('unexpected token')) {
    return {
      title: 'Syntax Error',
      message: 'The generated code contains a syntax error and cannot execute.',
      suggestion: 'Try rephrasing your request with simpler terms, or describe a more basic shape.',
      isRetryable: true,
    };
  }

  // Reference errors (undefined variables/functions)
  if (errorLower.includes('referenceerror') || errorLower.includes('is not defined')) {
    return {
      title: 'Function Not Available',
      message: 'The code uses a function or variable that does not exist in JSCAD.',
      suggestion: 'Request a simpler shape using basic primitives (cube, cylinder, sphere).',
      isRetryable: true,
    };
  }

  // Type errors
  if (errorLower.includes('typeerror') || errorLower.includes('cannot read properties')) {
    return {
      title: 'Type Error',
      message: 'The code contains a data manipulation error.',
      suggestion: 'Try describing dimensions more explicitly (e.g., "50mm wide, 30mm tall").',
      isRetryable: true,
    };
  }

  // Geometry errors
  if (errorLower.includes('geometry') || errorLower.includes('polygon') || errorLower.includes('vertices')) {
    return {
      title: 'Geometry Error',
      message: 'The generated shape has invalid or impossible geometry to compute.',
      suggestion: 'Simplify your request or avoid very complex shapes with many details.',
      isRetryable: true,
    };
  }

  // Main function missing
  if (errorLower.includes('main') && (errorLower.includes('not') || errorLower.includes('undefined'))) {
    return {
      title: 'Incomplete Code',
      message: 'The generated code is incomplete or poorly formatted.',
      suggestion: 'Rephrase your request being more specific about the desired shape.',
      isRetryable: true,
    };
  }

  // Worker/execution errors
  if (errorLower.includes('worker') || errorLower.includes('timeout') || errorLower.includes('script')) {
    return {
      title: 'Execution Error',
      message: 'The code took too long to execute or crashed.',
      suggestion: 'The shape might be too complex. Try a simplified version.',
      isRetryable: true,
    };
  }

  // Default error
  return {
    title: 'Generation Error',
    message: 'The 3D model could not be created from the generated code.',
    suggestion: 'Rephrase your request with simpler terms or explicit dimensions.',
    isRetryable: true,
  };
};

/**
 * Format AI-related errors with user-friendly messages
 */
export const formatAIError = (error: unknown): ErrorResult => {
  if (!(error instanceof Error)) {
    return {
      message: 'Une erreur est survenue lors de la génération.',
      isQuotaError: false,
      isRetryable: true,
    };
  }

  const errorMessage = error.message || '';

  // Quota errors (429)
  if (errorMessage.includes('429')) {
    return {
      message: 'Quota API dépassé. Limite gratuite atteinte (20 requêtes/jour). Veuillez réessayer plus tard ou vérifier votre plan API.',
      isQuotaError: true,
      isRetryable: true,
    };
  }

  // Generic quota errors
  if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    return {
      message: 'Limite de quota atteinte. Veuillez attendre quelques secondes avant de réessayer.',
      isQuotaError: true,
      isRetryable: true,
    };
  }

  // API key errors (401, 403)
  if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
    return {
      message: 'Clé API invalide ou manquante. Vérifiez votre configuration.',
      isQuotaError: false,
      isRetryable: false,
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
    return {
      message: 'Erreur de connexion. Vérifiez votre connexion internet.',
      isQuotaError: false,
      isRetryable: true,
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      message: 'La requête a expiré. Veuillez réessayer.',
      isQuotaError: false,
      isRetryable: true,
    };
  }

  // Default error
  return {
    message: errorMessage || 'Une erreur est survenue lors de la génération.',
    isQuotaError: false,
    isRetryable: true,
  };
};

/**
 * Format export-related errors
 */
export const formatExportError = (error: unknown, format: string): string => {
  if (!(error instanceof Error)) {
    return `Échec de l'export ${format.toUpperCase()}`;
  }

  const errorMessage = error.message || '';

  if (errorMessage.includes('not available')) {
    return `Données requises non disponibles pour l'export ${format.toUpperCase()}. Veuillez régénérer le modèle.`;
  }

  if (errorMessage.includes('geometry')) {
    return `Erreur de géométrie. Le modèle ne peut pas être exporté en ${format.toUpperCase()}.`;
  }

  return `Échec de l'export ${format.toUpperCase()}: ${errorMessage}`;
};

/**
 * Format validation errors
 */
export const formatValidationError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Erreur de validation';
  }

  return error.message;
};
