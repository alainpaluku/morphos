// Security utilities for input validation and sanitization
import { SECURITY_CONFIG } from '../config/security';

// Re-export from inputValidation for consistency
export { validateAndSanitizeInput as sanitizeInput, validateApiKey, validateImageData } from './inputValidation';

/**
 * Sanitizes generated code to prevent malicious code execution and remove excessive comments
 */
export const sanitizeGeneratedCode = (code: string): string => {
  if (!code) return '';

  // Remove markdown code blocks (multiple formats)
  let sanitized = code
    .replace(/```(?:javascript|js|jscad)?\s*\n?/gi, '')
    .replace(/```\s*$/g, '')
    .trim();

  // Remove excessive multi-line comments
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove single-line comments except parameter comments
  const lines = sanitized.split('\n');
  const cleanedLines = lines.map(line => {
    // Keep comments that are on the same line as const declarations (parameter comments)
    if (line.includes('const') && line.includes('//')) {
      return line;
    }
    // Remove standalone comment lines
    if (line.trim().startsWith('//')) {
      return '';
    }
    // Remove inline comments at end of lines (except after const)
    if (!line.includes('const')) {
      return line.replace(/\/\/.*$/, '').trimEnd();
    }
    return line;
  }).filter(line => line.trim() !== '');

  sanitized = cleanedLines.join('\n');

  // Allow legitimate JSCAD imports by temporarily masking them
  const safeRequirements: { [key: string]: string } = {};
  let maskedCode = sanitized;

  // Mask @jscad/modeling requires
  const jscadRequireRegex = /require\(['"]@jscad\/modeling['"]\)(?:\.\w+)?/g;
  let match;
  let i = 0;
  while ((match = jscadRequireRegex.exec(maskedCode)) !== null) {
    const key = `__SAFE_REQUIRE_${i}__`;
    safeRequirements[key] = match[0];
    maskedCode = maskedCode.replace(match[0], key);
    i++;
  }

  // Check for dangerous patterns in the masked code
  const hasDangerousCode = SECURITY_CONFIG.DANGEROUS_PATTERNS.some(
    pattern => pattern.test(maskedCode)
  );

  if (hasDangerousCode) {
    // Remove dangerous patterns
    SECURITY_CONFIG.DANGEROUS_PATTERNS.forEach(pattern => {
      maskedCode = maskedCode.replace(pattern, '/* REMOVED */');
    });
  }

  // Restore safe requirements
  sanitized = maskedCode;
  for (const [key, value] of Object.entries(safeRequirements)) {
    sanitized = sanitized.split(key).join(value);
  }

  return sanitized.slice(0, SECURITY_CONFIG.MAX_CODE_LENGTH);
};

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private calls: number[] = [];
  private maxCalls: number;
  private timeWindow: number;

  constructor(
    maxCalls: number = SECURITY_CONFIG.MAX_REQUESTS_PER_DAY,
    timeWindowMs: number = SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
  ) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old calls outside time window
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    return this.calls.length < this.maxCalls;
  }

  recordRequest(): void {
    this.calls.push(Date.now());
  }

  getRemainingCalls(): number {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxCalls - this.calls.length);
  }

  getResetTime(): Date {
    if (this.calls.length === 0) return new Date();
    const oldestCall = Math.min(...this.calls);
    return new Date(oldestCall + this.timeWindow);
  }
}
