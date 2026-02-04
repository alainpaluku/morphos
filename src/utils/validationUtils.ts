// Centralized validation utilities

/**
 * Validate and sanitize prompt input
 */
export function validatePrompt(prompt: string): string {
  const sanitized = prompt.trim();
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid or empty prompt');
  }
  if (sanitized.length > 5000) {
    throw new Error('Prompt too long (max 5000 characters)');
  }
  return sanitized;
}

/**
 * Validate image data
 */
export function validateImage(imageData: string | null): void {
  if (!imageData) return;
  
  // Check if it's a valid data URL
  if (!imageData.startsWith('data:image/')) {
    throw new Error('Invalid image format');
  }
  
  // Check file size (approximate, base64 is ~33% larger)
  const sizeInBytes = (imageData.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSize) {
    throw new Error('Image too large (max 5MB)');
  }
}

/**
 * Validate generated code structure
 */
export function validateGeneratedCode(code: string): void {
  if (!code || code.trim().length === 0) {
    throw new Error('Generated code is empty');
  }
  
  // Check for main function
  if (!code.includes('main')) {
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
    // Don't throw error, just warn - let the worker validate
    console.warn('Code may be missing JSCAD functions, but will attempt execution');
  }
  
  // Check for common syntax errors
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    throw new Error(`Syntax error: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
  }
}

/**
 * Validate export data availability
 */
export function validateExportData(
  format: string,
  stlData: ArrayBuffer | null,
  geometry: any | null,
  code: string | null
): void {
  const requirements: Record<string, () => boolean> = {
    stl: () => !!stlData,
    obj: () => !!geometry,
    '3mf': () => !!stlData,
    gcode: () => !!geometry,
    jscad: () => !!code
  };
  
  const check = requirements[format];
  if (!check || !check()) {
    throw new Error(`Required data not available for ${format} export`);
  }
}
