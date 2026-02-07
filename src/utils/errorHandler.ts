// Centralized error handling utilities

export interface ErrorResult {
  message: string;
  isQuotaError: boolean;
  isRetryable: boolean;
}

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
