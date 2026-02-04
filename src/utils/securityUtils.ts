// Security utilities for input validation and sanitization
import { SECURITY_CONFIG } from '../config/security';

/**
 * Validates and sanitizes image data URL
 */
export const validateImageData = (imageData: string): boolean => {
  if (!imageData) return false;
  
  // Check if it's a valid data URL
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  if (!dataUrlPattern.test(imageData)) return false;
  
  // Check size
  const base64Data = imageData.split(',')[1];
  if (!base64Data) return false;
  
  const sizeInBytes = (base64Data.length * 3) / 4;
  
  return sizeInBytes <= SECURITY_CONFIG.MAX_IMAGE_SIZE;
};

/**
 * Sanitizes user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential script tags and dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, SECURITY_CONFIG.MAX_PROMPT_LENGTH);
};

/**
 * Validates API key format
 */
export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;
  
  return apiKey.startsWith(SECURITY_CONFIG.API_KEY_PREFIX) && 
         apiKey.length === SECURITY_CONFIG.API_KEY_LENGTH;
};

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
  
  // Check for dangerous patterns
  const hasDangerousCode = SECURITY_CONFIG.DANGEROUS_PATTERNS.some(
    pattern => pattern.test(sanitized)
  );
  
  if (hasDangerousCode) {
    // Remove dangerous patterns
    SECURITY_CONFIG.DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '/* REMOVED */');
    });
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
