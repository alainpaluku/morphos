import { Material } from '../types';

// Predefined materials library
export const MATERIALS: Record<string, Material> = {
  // METALS
  aluminum: {
    id: 'aluminum',
    name: 'Aluminium',
    type: 'metal',
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.3,
    opacity: 1,
    properties: {
      density: 2.7,
      price: 2.5,
      recyclable: true,
      printable: false,
      finish: 'brushed'
    }
  },
  steel: {
    id: 'steel',
    name: 'Acier',
    type: 'metal',
    color: '#808080',
    metalness: 0.95,
    roughness: 0.2,
    opacity: 1,
    properties: {
      density: 7.85,
      price: 1.5,
      recyclable: true,
      printable: false,
      finish: 'polished'
    }
  },
  stainlessSteel: {
    id: 'stainlessSteel',
    name: 'Acier Inoxydable',
    type: 'metal',
    color: '#B8B8B8',
    metalness: 0.9,
    roughness: 0.25,
    opacity: 1,
    properties: {
      density: 8.0,
      price: 3.5,
      recyclable: true,
      printable: false,
      finish: 'polished'
    }
  },
  copper: {
    id: 'copper',
    name: 'Cuivre',
    type: 'metal',
    color: '#B87333',
    metalness: 0.95,
    roughness: 0.15,
    opacity: 1,
    properties: {
      density: 8.96,
      price: 8.0,
      recyclable: true,
      printable: false,
      finish: 'polished'
    }
  },
  brass: {
    id: 'brass',
    name: 'Laiton',
    type: 'metal',
    color: '#DAA520',
    metalness: 0.9,
    roughness: 0.2,
    opacity: 1,
    properties: {
      density: 8.5,
      price: 5.0,
      recyclable: true,
      printable: false,
      finish: 'polished'
    }
  },
  titanium: {
    id: 'titanium',
    name: 'Titane',
    type: 'metal',
    color: '#A8A8A8',
    metalness: 0.85,
    roughness: 0.35,
    opacity: 1,
    properties: {
      density: 4.5,
      price: 25.0,
      recyclable: true,
      printable: false,
      finish: 'brushed'
    }
  },

  // PLASTICS
  abs: {
    id: 'abs',
    name: 'ABS',
    type: 'plastic',
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.6,
    opacity: 1,
    properties: {
      density: 1.05,
      price: 2.0,
      recyclable: true,
      printable: true,
      finish: 'matte'
    }
  },
  pla: {
    id: 'pla',
    name: 'PLA',
    type: 'plastic',
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.5,
    opacity: 1,
    properties: {
      density: 1.25,
      price: 1.5,
      recyclable: true,
      printable: true,
      finish: 'glossy'
    }
  },
  petg: {
    id: 'petg',
    name: 'PETG',
    type: 'plastic',
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.4,
    opacity: 1,
    properties: {
      density: 1.27,
      price: 2.5,
      recyclable: true,
      printable: true,
      finish: 'glossy'
    }
  },
  nylon: {
    id: 'nylon',
    name: 'Nylon',
    type: 'plastic',
    color: '#F5F5DC',
    metalness: 0,
    roughness: 0.7,
    opacity: 1,
    properties: {
      density: 1.15,
      price: 4.0,
      recyclable: true,
      printable: true,
      finish: 'matte'
    }
  },
  polycarbonate: {
    id: 'polycarbonate',
    name: 'Polycarbonate',
    type: 'plastic',
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.3,
    opacity: 0.9,
    properties: {
      density: 1.2,
      price: 3.5,
      recyclable: true,
      printable: true,
      finish: 'glossy'
    }
  },

  // WOOD
  wood: {
    id: 'wood',
    name: 'Bois',
    type: 'wood',
    color: '#8B4513',
    metalness: 0,
    roughness: 0.9,
    opacity: 1,
    properties: {
      density: 0.6,
      price: 1.0,
      recyclable: true,
      printable: false,
      finish: 'matte'
    }
  },

  // GLASS
  glass: {
    id: 'glass',
    name: 'Verre',
    type: 'glass',
    color: '#E0F7FA',
    metalness: 0,
    roughness: 0.05,
    opacity: 0.3,
    properties: {
      density: 2.5,
      price: 2.0,
      recyclable: true,
      printable: false,
      finish: 'polished'
    }
  },

  // RUBBER
  rubber: {
    id: 'rubber',
    name: 'Caoutchouc',
    type: 'rubber',
    color: '#2C2C2C',
    metalness: 0,
    roughness: 0.95,
    opacity: 1,
    properties: {
      density: 1.2,
      price: 2.5,
      recyclable: false,
      printable: false,
      finish: 'matte'
    }
  },

  // CERAMIC
  ceramic: {
    id: 'ceramic',
    name: 'Céramique',
    type: 'ceramic',
    color: '#FFFAF0',
    metalness: 0,
    roughness: 0.4,
    opacity: 1,
    properties: {
      density: 2.4,
      price: 3.0,
      recyclable: false,
      printable: false,
      finish: 'glossy'
    }
  },

  // COMPOSITE
  carbonFiber: {
    id: 'carbonFiber',
    name: 'Fibre de Carbone',
    type: 'composite',
    color: '#1A1A1A',
    metalness: 0.3,
    roughness: 0.6,
    opacity: 1,
    properties: {
      density: 1.6,
      price: 15.0,
      recyclable: false,
      printable: true,
      finish: 'matte'
    }
  }
};

// Default material
export const DEFAULT_MATERIAL: Material = MATERIALS.aluminum;

// Material categories for UI
export const MATERIAL_CATEGORIES = {
  metal: {
    label: 'Métaux',
    materials: ['aluminum', 'steel', 'stainlessSteel', 'copper', 'brass', 'titanium']
  },
  plastic: {
    label: 'Plastiques',
    materials: ['abs', 'pla', 'petg', 'nylon', 'polycarbonate']
  },
  other: {
    label: 'Autres',
    materials: ['wood', 'glass', 'rubber', 'ceramic', 'carbonFiber']
  }
};

// Material keywords for AI detection
export const MATERIAL_KEYWORDS: Record<string, string[]> = {
  aluminum: ['aluminium', 'alu', 'aluminum'],
  steel: ['acier', 'steel'],
  stainlessSteel: ['inox', 'inoxydable', 'stainless'],
  copper: ['cuivre', 'copper'],
  brass: ['laiton', 'brass'],
  titanium: ['titane', 'titanium'],
  abs: ['abs'],
  pla: ['pla'],
  petg: ['petg'],
  nylon: ['nylon'],
  polycarbonate: ['polycarbonate', 'pc'],
  wood: ['bois', 'wood'],
  glass: ['verre', 'glass'],
  rubber: ['caoutchouc', 'rubber'],
  ceramic: ['céramique', 'ceramic'],
  carbonFiber: ['carbone', 'carbon fiber', 'fibre de carbone']
};

// Color keywords for AI detection
export const COLOR_KEYWORDS: Record<string, string> = {
  'noir': '#000000',
  'black': '#000000',
  'blanc': '#FFFFFF',
  'white': '#FFFFFF',
  'rouge': '#FF0000',
  'red': '#FF0000',
  'bleu': '#0000FF',
  'blue': '#0000FF',
  'vert': '#00FF00',
  'green': '#00FF00',
  'jaune': '#FFFF00',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'violet': '#800080',
  'purple': '#800080',
  'rose': '#FFC0CB',
  'pink': '#FFC0CB',
  'gris': '#808080',
  'gray': '#808080',
  'grey': '#808080',
  'argent': '#C0C0C0',
  'silver': '#C0C0C0',
  'or': '#FFD700',
  'gold': '#FFD700',
  'bronze': '#CD7F32',
  'marron': '#8B4513',
  'brown': '#8B4513'
};
