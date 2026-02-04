// Debug configuration
export const DEBUG = {
  // Enable console logs in development only
  ENABLED: import.meta.env.DEV,
  
  // Log levels
  WORKER: import.meta.env.DEV,
  SERVICE_WORKER: import.meta.env.DEV,
  AI: import.meta.env.DEV,
  THREE: import.meta.env.DEV,
};

// Conditional logger
export const logger = {
  log: (...args: any[]) => {
    if (DEBUG.ENABLED) console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args); // Always log errors
  },
  warn: (...args: any[]) => {
    if (DEBUG.ENABLED) console.warn(...args);
  },
  worker: (...args: any[]) => {
    if (DEBUG.WORKER) console.log('[Worker]', ...args);
  },
  sw: (...args: any[]) => {
    if (DEBUG.SERVICE_WORKER) console.log('[SW]', ...args);
  },
  ai: (...args: any[]) => {
    if (DEBUG.AI) console.log('[AI]', ...args);
  },
  three: (...args: any[]) => {
    if (DEBUG.THREE) console.log('[3D]', ...args);
  },
};
