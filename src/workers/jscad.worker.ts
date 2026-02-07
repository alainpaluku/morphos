// 3D Worker using @jscad/modeling for geometry generation and STL conversion

interface WorkerMessage {
  code: string;
}

interface WorkerResponse {
  type: 'success' | 'error';
  data?: ArrayBuffer;
  error?: string;
}

import { primitives, booleans, transforms, extrusions, hulls } from '@jscad/modeling';
import { cuboid, cylinder, sphere } from '@jscad/modeling/src/primitives';
import { union, subtract, intersect } from '@jscad/modeling/src/operations/booleans';
import { translate, rotate, scale } from '@jscad/modeling/src/operations/transforms';
import { extrudeLinear } from '@jscad/modeling/src/operations/extrusions';
import { hull } from '@jscad/modeling/src/operations/hulls';
import { toPolygons } from '@jscad/modeling/src/geometries/geom3';
import type { Geom3 } from '@jscad/modeling/src/geometries/types';

// Map to expected structure for the generated code
const jscadPrimitives = {
  cuboid: (params: any) => cuboid({ size: params.size }),
  cube: (params: any) => cuboid({ size: params.size || [params.radius || 10, params.radius || 10, params.radius || 10] }), // Alias for AI compatibility
  cylinder: (params: any) => cylinder({ radius: params.radius, height: params.height, segments: params.segments || 16 }),
  sphere: (params: any) => sphere({ radius: params.radius, segments: params.segments || 12 })
};

const jscadBooleans = {
  union: (...shapes: any[]) => union(...shapes),
  subtract: (a: any, ...b: any[]) => subtract(a, ...b),
  intersect: (...shapes: any[]) => intersect(...shapes)
};

const jscadTransforms = {
  translate: (offset: number[], shape: any) => translate(offset as any, shape),
  rotate: (angles: number[], shape: any) => rotate(angles as any, shape),
  scale: (factors: number[], shape: any) => scale(factors as any, shape)
};

const jscadExtrusions = {
  extrudeLinear: (params: any, shape: any) => extrudeLinear({ height: params.height }, shape)
};

const jscadHulls = {
  hull: (...shapes: any[]) => hull(...shapes)
};

/**
 * Convert JSCAD geometry to STL binary format
 * Creates a binary STL file from JSCAD geometry polygons
 */
function geometryToSTL(geometry: Geom3): ArrayBuffer {
  const polygons = toPolygons(geometry);

  if (polygons.length === 0) {
    throw new Error('Geometry has no polygons');
  }

  // STL binary header (80 bytes)
  const header = new Uint8Array(80);
  header.fill(0);
  const headerText = 'JSCAD Model';
  for (let i = 0; i < Math.min(headerText.length, 80); i++) {
    header[i] = headerText.charCodeAt(i);
  }

  // Count total triangles
  let triangleCount = 0;
  for (const polygon of polygons) {
    const vertices = polygon.vertices;
    // Each polygon with n vertices creates (n-2) triangles
    if (vertices.length >= 3) {
      triangleCount += vertices.length - 2;
    }
  }

  // STL binary format:
  // - 80 byte header
  // - 4 byte uint32: triangle count
  // - For each triangle: 12 bytes normal (3x float32), 36 bytes vertices (3x 3x float32), 2 bytes attribute
  const bufferSize = 80 + 4 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // Write header
  uint8View.set(header, 0);

  // Write triangle count (little-endian)
  view.setUint32(80, triangleCount, true);

  let offset = 84;

  // Write triangles
  for (const polygon of polygons) {
    const vertices = polygon.vertices;
    if (vertices.length < 3) continue;

    // Calculate normal (using first 3 vertices)
    const v0 = vertices[0];
    const v1 = vertices[1];
    const v2 = vertices[2];

    const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
    const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

    // Cross product
    const normal = [
      edge1[1] * edge2[2] - edge1[2] * edge2[1],
      edge1[2] * edge2[0] - edge1[0] * edge2[2],
      edge1[0] * edge2[1] - edge1[1] * edge2[0]
    ];

    // Normalize
    const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
    if (length > 0) {
      normal[0] /= length;
      normal[1] /= length;
      normal[2] /= length;
    }

    // Create triangles from polygon (fan triangulation)
    for (let i = 1; i < vertices.length - 1; i++) {
      // Write normal (3x float32)
      view.setFloat32(offset, normal[0], true);
      offset += 4;
      view.setFloat32(offset, normal[1], true);
      offset += 4;
      view.setFloat32(offset, normal[2], true);
      offset += 4;

      // Write vertices (3x 3x float32)
      const v0_coords = vertices[0];
      const v1_coords = vertices[i];
      const v2_coords = vertices[i + 1];

      // Vertex 1
      view.setFloat32(offset, v0_coords[0], true);
      offset += 4;
      view.setFloat32(offset, v0_coords[1], true);
      offset += 4;
      view.setFloat32(offset, v0_coords[2], true);
      offset += 4;

      // Vertex 2
      view.setFloat32(offset, v1_coords[0], true);
      offset += 4;
      view.setFloat32(offset, v1_coords[1], true);
      offset += 4;
      view.setFloat32(offset, v1_coords[2], true);
      offset += 4;

      // Vertex 3
      view.setFloat32(offset, v2_coords[0], true);
      offset += 4;
      view.setFloat32(offset, v2_coords[1], true);
      offset += 4;
      view.setFloat32(offset, v2_coords[2], true);
      offset += 4;

      // Attribute byte count (2 bytes, usually 0)
      view.setUint16(offset, 0, true);
      offset += 2;
    }
  }

  return buffer;
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

// Execute code
function executeJSCAD(code: string): ArrayBuffer {
  try {
    // Validate code security before execution
    validateCodeSecurity(code);

    const executeCode = new Function(
      'primitives',
      'booleans',
      'transforms',
      'extrusions',
      'hulls',
      'require',
      `${code}\n\nif (typeof main !== "function") {\n  throw new Error("Code must define a main() function");\n}\nreturn main();`
    );

    // Mock require to support AI-generated code that uses CommonJS imports
    const mockRequire = (moduleName: string) => {
      switch (moduleName) {
        case '@jscad/modeling':
          return {
            primitives: jscadPrimitives,
            booleans: jscadBooleans,
            transforms: jscadTransforms,
            extrusions: jscadExtrusions,
            hulls: jscadHulls
          };
        default:
          return {};
      }
    };

    // Execute with mapped objects
    let geometry = executeCode(jscadPrimitives, jscadBooleans, jscadTransforms, jscadExtrusions, jscadHulls, mockRequire);

    if (!geometry) {
      throw new Error('main() returned null or undefined');
    }

    // Handle array return (e.g. [cube, sphere])
    if (Array.isArray(geometry)) {
      if (geometry.length === 0) throw new Error('main() returned empty array');
      // Filter out non-objects
      geometry = geometry.filter(g => g && typeof g === 'object');
      // Union them to create a single mesh
      if (geometry.length > 1) {
        try {
          geometry = jscadBooleans.union(...geometry);
        } catch (e) {
          geometry = geometry[0];
        }
      } else {
        geometry = geometry[0];
      }
    }

    const stl = geometryToSTL(geometry);
    console.log('[WORKER] STL generated:', stl.byteLength, 'bytes');
    return stl;
  } catch (error) {
    console.error('[WORKER] Execution error:', error);
    if (error instanceof Error) {
      throw new Error(`Execution error: ${error.message}`);
    }
    throw new Error('Unknown execution error');
  }
}

// Message handler
self.onmessage = (e: MessageEvent<WorkerMessage>): void => {
  const { code } = e.data;

  if (!code || !code.trim()) {
    const response: WorkerResponse = {
      type: 'error',
      error: 'No code provided'
    };
    self.postMessage(response);
    return;
  }

  console.log('[WORKER] Processing code...');

  try {
    const stlData = executeJSCAD(code);
    const response: WorkerResponse = {
      type: 'success',
      data: stlData
    };
    self.postMessage(response, { transfer: [stlData] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WORKER] Error:', errorMessage);
    const response: WorkerResponse = {
      type: 'error',
      error: errorMessage
    };
    self.postMessage(response);
  }
};
