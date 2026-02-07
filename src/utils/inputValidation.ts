// Consolidated input validation and sanitization utilities

import { SECURITY_CONFIG } from '../config/security';

/**
 * Validates and sanitizes text input to prevent injection attacks
 * Combines validation and sanitization in one function
 */
export const validateAndSanitizeInput = (
  input: string,
  maxLength: number = SECURITY_CONFIG.MAX_PROMPT_LENGTH
): string => {
  if (!input) {
    throw new Error('Invalid or empty input');
  }

  // Sanitize: Remove potential script tags and dangerous characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);

  if (sanitized.length === 0) {
    throw new Error('Input is empty after sanitization');
  }

  return sanitized;
};

/**
 * Validates image data URL format and size
 */
export const validateImageData = (imageData: string | null): void => {
  if (!imageData) return;

  // Check if it's a valid data URL
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  if (!dataUrlPattern.test(imageData)) {
    throw new Error('Invalid image format. Supported: PNG, JPEG, GIF, WEBP');
  }

  // Check size
  const base64Data = imageData.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid image data');
  }

  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = SECURITY_CONFIG.MAX_IMAGE_SIZE;

  if (sizeInBytes > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`Image too large (max ${maxSizeMB}MB)`);
  }
};

/**
 * Validates generated code structure
 */
export const validateGeneratedCode = (code: string): void => {
  if (!code || code.trim().length === 0) {
    throw new Error('Generated code is empty');
  }

  // Check for main function
  if (!code.includes('const main') && !code.includes('function main')) {
    throw new Error('Code missing main() function');
  }

  // Check for return statement
  if (!code.includes('return')) {
    throw new Error('Code missing return statement');
  }

  // Check for JSCAD functions (more flexible)
  const hasJSCAD =
    code.includes('primitives') ||
    code.includes('cuboid') ||
    code.includes('cylinder') ||
    code.includes('sphere') ||
    code.includes('cube') ||
    code.includes('booleans') ||
    code.includes('transforms') ||
    code.includes('extrusions') ||
    code.includes('union') ||
    code.includes('subtract') ||
    code.includes('translate') ||
    code.includes('rotate') ||
    code.includes('scale');

  if (!hasJSCAD) {
    console.warn('Code may be missing JSCAD functions, but will attempt execution');
  }

  // Check for common syntax errors
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    throw new Error(`Syntax error: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
  }
};

/**
 * Validates API key format
 */
export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;

  return (
    apiKey.startsWith(SECURITY_CONFIG.API_KEY_PREFIX) &&
    apiKey.length === SECURITY_CONFIG.API_KEY_LENGTH
  );
};

/**
 * Validates export data availability for a given format
 */
export const validateExportData = (
  format: string,
  stlData: ArrayBuffer | null,
  geometry: any | null,
  code: string | null
): void => {
  const requirements: Record<string, () => boolean> = {
    stl: () => !!stlData,
    obj: () => !!geometry,
    '3mf': () => !!stlData,
    gcode: () => !!geometry,
    jscad: () => !!code,
  };

  const check = requirements[format];
  if (!check || !check()) {
    throw new Error(`Required data not available for ${format} export`);
  }
};
