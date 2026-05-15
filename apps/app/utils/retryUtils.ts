// Retry logic utilities

/**
 * Retry an async operation with exponential backoff
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxAttempts = 2, delayMs = 1000, onRetry } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxAttempts - 1) {
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        await delay(delayMs * (attempt + 1)); // Exponential backoff
      }
    }
  }
  
  throw new Error(
    `Operation failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
