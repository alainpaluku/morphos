// JSCAD Worker - Generates 3D models from code
// Pure JavaScript worker with better CDN handling

let isLoaded = false;
let jscadLib = null;

// Load JSCAD from CDN
function loadJSCAD() {
  if (isLoaded) return;
  
  try {
    // Load modeling library
    importScripts('https://unpkg.com/@jscad/modeling@2.12.0/dist/jscad-modeling.min.js');
    
    // Load STL serializer
    importScripts('https://unpkg.com/@jscad/stl-serializer@2.3.0/dist/jscad-stl-serializer.min.js');
    
    // Check what's available in global scope
    const availableKeys = Object.keys(self).filter(k => 
      k.toLowerCase().includes('jscad') || 
      k.toLowerCase().includes('modeling') ||
      k.toLowerCase().includes('stl')
    );
    
    // Try to find the libraries
    jscadLib = {
      modeling: self.jscadModeling || self.modeling || self.window?.jscadModeling,
      stlSerializer: self.jscadStlSerializer || self.stlSerializer || self.window?.jscadStlSerializer
    };
    
    // If not found, throw error with available keys
    if (!jscadLib.modeling) {
      throw new Error('JSCAD modeling library not found. Available globals: ' + availableKeys.join(', '));
    }
    
    if (!jscadLib.stlSerializer) {
      throw new Error('JSCAD STL serializer not found. Available globals: ' + availableKeys.join(', '));
    }
    
    isLoaded = true;
    
  } catch (e) {
    throw new Error('Failed to load JSCAD: ' + e.message);
  }
}

// Execute JSCAD code and generate STL
function executeJSCAD(code) {
  // Load libraries if not already loaded
  loadJSCAD();
  
  if (!jscadLib || !jscadLib.modeling || !jscadLib.stlSerializer) {
    throw new Error('JSCAD libraries not initialized');
  }
  
  const { primitives, booleans, transforms, extrusions } = jscadLib.modeling;
  const { serialize } = jscadLib.stlSerializer;
  
  // Create execution context
  const executeCode = new Function(
    'primitives',
    'booleans',
    'transforms',
    'extrusions',
    code + '\n\nif (typeof main !== "function") {\n  throw new Error("Code must define a main() function");\n}\nreturn main();'
  );
  
  // Execute user code
  const geometry = executeCode(primitives, booleans, transforms, extrusions);
  
  if (!geometry) {
    throw new Error('main() returned null or undefined');
  }
  
  // Serialize to STL
  const rawData = serialize({ binary: true }, geometry);
  
  // Convert to ArrayBuffer
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData[i];
  }
  
  return buffer;
}

// Message handler
self.onmessage = function(e) {
  const code = e.data.code;
  
  if (!code || !code.trim()) {
    self.postMessage({ 
      type: 'error', 
      error: 'No code provided' 
    });
    return;
  }
  
  try {
    const stlData = executeJSCAD(code);
    self.postMessage({ 
      type: 'success', 
      data: stlData 
    }, [stlData]);
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message || 'Unknown error' 
    });
  }
};
