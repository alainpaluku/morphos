// Simple 3D Worker - Generates basic STL without external dependencies

interface WorkerMessage {
  code: string;
}

interface WorkerResponse {
  type: 'success' | 'error';
  data?: ArrayBuffer;
  error?: string;
}

// Simple 3D primitives library
const primitives = {
  cuboid: ({ size }: { size: number[] }) => {
    const [w, h, d] = size;
    return {
      type: 'cuboid',
      vertices: [
        [-w/2, -h/2, -d/2], [w/2, -h/2, -d/2], [w/2, h/2, -d/2], [-w/2, h/2, -d/2],
        [-w/2, -h/2, d/2], [w/2, -h/2, d/2], [w/2, h/2, d/2], [-w/2, h/2, d/2]
      ],
      faces: [
        [0,1,2], [0,2,3], [4,5,6], [4,6,7],
        [0,1,5], [0,5,4], [2,3,7], [2,7,6],
        [0,3,7], [0,7,4], [1,2,6], [1,6,5]
      ]
    };
  },
  
  cylinder: ({ radius, height, segments = 32 }: { radius: number; height: number; segments?: number }) => {
    const vertices: number[][] = [];
    const faces: number[][] = [];
    
    // Bottom center
    vertices.push([0, 0, 0]);
    // Top center
    vertices.push([0, 0, height]);
    
    // Bottom circle
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ]);
    }
    
    // Top circle
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        height
      ]);
    }
    
    // Bottom faces
    for (let i = 0; i < segments; i++) {
      faces.push([0, 2 + i, 2 + ((i + 1) % segments)]);
    }
    
    // Top faces
    for (let i = 0; i < segments; i++) {
      faces.push([1, 2 + segments + ((i + 1) % segments), 2 + segments + i]);
    }
    
    // Side faces
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push([2 + i, 2 + next, 2 + segments + i]);
      faces.push([2 + next, 2 + segments + next, 2 + segments + i]);
    }
    
    return { type: 'cylinder', vertices, faces };
  },
  
  sphere: ({ radius, segments = 16 }: { radius: number; segments?: number }) => {
    const vertices: number[][] = [];
    const faces: number[][] = [];
    
    // Generate vertices
    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        vertices.push([
          radius * cosPhi * sinTheta,
          radius * sinPhi * sinTheta,
          radius * cosTheta
        ]);
      }
    }
    
    // Generate faces
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = lat * (segments + 1) + lon;
        const second = first + segments + 1;
        
        faces.push([first, second, first + 1]);
        faces.push([second, second + 1, first + 1]);
      }
    }
    
    return { type: 'sphere', vertices, faces };
  }
};

const booleans = {
  union: (...shapes: any[]) => {
    const allVertices: number[][] = [];
    const allFaces: number[][] = [];
    let offset = 0;
    
    for (const shape of shapes) {
      allVertices.push(...shape.vertices);
      allFaces.push(...shape.faces.map((f: number[]) => f.map(i => i + offset)));
      offset += shape.vertices.length;
    }
    
    return { type: 'union', vertices: allVertices, faces: allFaces };
  },
  
  subtract: (a: any, b: any) => {
    return { type: 'subtract', vertices: a.vertices, faces: a.faces };
  }
};

const transforms = {
  translate: (offset: number[], shape: any) => {
    return {
      ...shape,
      vertices: shape.vertices.map((v: number[]) => [
        v[0] + offset[0],
        v[1] + offset[1],
        v[2] + offset[2]
      ])
    };
  },
  
  rotate: (angles: number[], shape: any) => {
    return shape;
  },
  
  scale: (factors: number[], shape: any) => {
    return {
      ...shape,
      vertices: shape.vertices.map((v: number[]) => [
        v[0] * factors[0],
        v[1] * factors[1],
        v[2] * factors[2]
      ])
    };
  }
};

const extrusions = {
  extrudeLinear: ({ height }: { height: number }, shape: any) => {
    return primitives.cuboid({ size: [10, 10, height] });
  }
};

// Convert geometry to STL binary format
function geometryToSTL(geometry: any): ArrayBuffer {
  const { vertices, faces } = geometry;
  const triangleCount = faces.length;
  const bufferSize = 80 + 4 + (triangleCount * 50);
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);
  
  // Header (80 bytes)
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, 0);
  }
  
  // Triangle count
  view.setUint32(80, triangleCount, true);
  
  // Triangles
  let offset = 84;
  for (const face of faces) {
    const v1 = vertices[face[0]];
    const v2 = vertices[face[1]];
    const v3 = vertices[face[2]];
    
    // Calculate normal
    const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    const normal = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ];
    
    // Normalize
    const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
    if (len > 0) {
      normal[0] /= len;
      normal[1] /= len;
      normal[2] /= len;
    }
    
    // Write normal
    view.setFloat32(offset, normal[0], true); offset += 4;
    view.setFloat32(offset, normal[1], true); offset += 4;
    view.setFloat32(offset, normal[2], true); offset += 4;
    
    // Write vertices
    view.setFloat32(offset, v1[0], true); offset += 4;
    view.setFloat32(offset, v1[1], true); offset += 4;
    view.setFloat32(offset, v1[2], true); offset += 4;
    
    view.setFloat32(offset, v2[0], true); offset += 4;
    view.setFloat32(offset, v2[1], true); offset += 4;
    view.setFloat32(offset, v2[2], true); offset += 4;
    
    view.setFloat32(offset, v3[0], true); offset += 4;
    view.setFloat32(offset, v3[1], true); offset += 4;
    view.setFloat32(offset, v3[2], true); offset += 4;
    
    // Attribute byte count
    view.setUint16(offset, 0, true); offset += 2;
  }
  
  return buffer;
}

// Execute code
function executeJSCAD(code: string): ArrayBuffer {
  try {
    const executeCode = new Function(
      'primitives',
      'booleans',
      'transforms',
      'extrusions',
      `${code}\n\nif (typeof main !== "function") {\n  throw new Error("Code must define a main() function");\n}\nreturn main();`
    );
    
    const geometry = executeCode(primitives, booleans, transforms, extrusions);
    
    if (!geometry) {
      throw new Error('main() returned null or undefined');
    }
    
    return geometryToSTL(geometry);
  } catch (error) {
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
  
  try {
    const stlData = executeJSCAD(code);
    const response: WorkerResponse = {
      type: 'success',
      data: stlData
    };
    self.postMessage(response, { transfer: [stlData] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response: WorkerResponse = {
      type: 'error',
      error: errorMessage
    };
    self.postMessage(response);
  }
};
