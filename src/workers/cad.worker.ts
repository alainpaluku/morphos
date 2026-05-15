import * as replicadModule from 'replicad';
import * as makerjs from 'makerjs';

// We need to initialize replicad's WASM
const replicad: any = replicadModule;
const replicadPromise = (replicad.ready || (replicad.default && replicad.default.ready)) || Promise.resolve();

interface WorkerMessage {
  code: string;
  mode: '2D' | '3D';
}

interface WorkerResponse {
  type: 'success' | 'error';
  data?: {
    stl?: ArrayBuffer;
    step?: ArrayBuffer;
    svg?: string;
    dxf?: string;
    meshes?: any[];
  };
  error?: string;
}

/**
 * Validate code before execution for security
 */
function validateCodeSecurity(code: string): void {
  // Check for dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /import\s+/gi,
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /localStorage/gi,
    /sessionStorage/gi,
    /document\./gi,
    /window\./gi,
    /self\./gi,
    /postMessage\s*\(/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error(`Security violation: Dangerous pattern detected in code`);
    }
  }

  // Check code length
  if (code.length > 50000) {
    throw new Error('Code too long (max 50000 characters)');
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { code, mode } = e.data;

  try {
    validateCodeSecurity(code);
    if (mode === '3D') {
      await replicadPromise;
      const result = await execute3D(code);
      self.postMessage({ type: 'success', data: result });
    } else {
      const result = execute2D(code);
      self.postMessage({ type: 'success', data: result });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

async function execute3D(code: string) {
  const func = new Function('replicad', `${code}\nreturn main();`);
  const shape = func(replicad);

  if (!shape) throw new Error('main() did not return a shape');

  // Export STL - Replicad's exportSTL returns a string, we need to convert it to ArrayBuffer if needed
  // or just handle it as a string. But ExportService expects ArrayBuffer for exportSTL.
  const stlString = shape.exportSTL();
  const stl = new TextEncoder().encode(stlString).buffer;

  // Export STEP
  const stepString = shape.exportSTEP();
  const step = new TextEncoder().encode(stepString).buffer;

  // Mesh for Three.js rendering
  // Replicad shapes can be meshed
  const meshes = [];
  if (shape.mesh) {
    const mesh = shape.mesh({ tolerance: 0.1 });
    meshes.push(mesh);
  }

  return {
    stl: stl,
    step: step,
    meshes: meshes
  };
}

function execute2D(code: string) {
  const func = new Function('makerjs', `${code}\nreturn main();`);
  const model = func(makerjs);

  if (!model) throw new Error('main() did not return a model');

  const svg = makerjs.exporter.toSVG(model);
  const dxf = makerjs.exporter.toDXF(model);

  return {
    svg,
    dxf
  };
}
