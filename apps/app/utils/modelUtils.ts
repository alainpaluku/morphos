// Utility functions for model name generation and management

/**
 * Generate a model name from a prompt
 */
export function generateModelName(prompt: string): string {
  const keywords = [
    'screw', 'bolt', 'washer', 'nut', 'gear', 'box', 
    'vis', 'boulon', 'rondelle', 'écrou', 'engrenage',
    'cylinder', 'cube', 'sphere', 'cone', 'torus'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerPrompt.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1) + '_' + Date.now().toString().slice(-6);
    }
  }
  
  return 'Model_' + Date.now().toString().slice(-6);
}
