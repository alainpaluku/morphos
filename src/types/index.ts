// Type definitions for Morphos

export type AppMode = '2D' | '3D';

export interface Project {
  id: string;
  name: string;
  description?: string;
  models: Model[];
  mode: AppMode;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  name: string;
  code: string;
  prompt: string;
  mode: AppMode;
  stlData?: ArrayBuffer | null;
  stepData?: ArrayBuffer | null;
  svgData?: string | null;
  dxfData?: string | null;
  createdAt: string;
  parameters?: Parameter[];
  material?: Material;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  properties: MaterialProperties;
}

export type MaterialType = 'metal' | 'plastic' | 'wood' | 'glass' | 'rubber' | 'ceramic' | 'composite';

export interface MaterialProperties {
  density?: number; // g/cm³
  price?: number; // €/kg
  recyclable?: boolean;
  printable?: boolean;
  finish?: 'matte' | 'glossy' | 'brushed' | 'polished' | 'anodized';
}

export interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  lineIndex: number;
}

export interface ParameterCategory {
  type: string;
  color: string;
  bg: string;
}

export interface Preset {
  name: string;
  values: Record<string, number>;
}

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: string;
}

export interface GCodeSettings {
  layerHeight: number;
  nozzleTemp: number;
  bedTemp: number;
  printSpeed: number;
  travelSpeed: number;
  infillDensity: number;
}

export interface WorkerMessage {
  code: string;
  mode: AppMode;
}

export interface WorkerResponse {
  type: 'success' | 'error';
  data?: {
    stl?: ArrayBuffer;
    step?: ArrayBuffer;
    svg?: string;
    dxf?: string;
    meshes?: any[]; // For Three.js rendering
  };
  error?: string;
}

export interface AIAnalysisResult {
  actionType: 'CREATE' | 'MODIFY' | 'ADJUST';
  objectName: string;
  searchQuery: string;
  suggestedMode?: AppMode;
}

export type IconComponent = React.FC<{ className?: string }>;
