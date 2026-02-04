import * as THREE from 'three';
import { Material } from '../types';
import { MATERIALS, DEFAULT_MATERIAL, MATERIAL_KEYWORDS, COLOR_KEYWORDS } from '../constants/materials';

export class MaterialService {
  /**
   * Get material by ID
   */
  static getMaterial(id: string): Material | null {
    return MATERIALS[id] || null;
  }

  /**
   * Get all materials
   */
  static getAllMaterials(): Material[] {
    return Object.values(MATERIALS);
  }

  /**
   * Get default material
   */
  static getDefaultMaterial(): Material {
    return { ...DEFAULT_MATERIAL };
  }

  /**
   * Detect material from text prompt
   */
  static detectMaterialFromPrompt(prompt: string): Material | null {
    const lowerPrompt = prompt.toLowerCase();

    // Check for material keywords
    for (const [materialId, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          const material = this.getMaterial(materialId);
          if (material) {
            return { ...material };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detect color from text prompt
   */
  static detectColorFromPrompt(prompt: string): string | null {
    const lowerPrompt = prompt.toLowerCase();

    for (const [keyword, color] of Object.entries(COLOR_KEYWORDS)) {
      if (lowerPrompt.includes(keyword)) {
        return color;
      }
    }

    return null;
  }

  /**
   * Apply material and color from prompt
   */
  static applyMaterialFromPrompt(prompt: string): Material {
    let material = this.detectMaterialFromPrompt(prompt) || this.getDefaultMaterial();
    const color = this.detectColorFromPrompt(prompt);

    if (color) {
      material = { ...material, color };
    }

    return material;
  }

  /**
   * Create custom material
   */
  static createCustomMaterial(
    baseMaterial: Material,
    customizations: Partial<Material>
  ): Material {
    return {
      ...baseMaterial,
      ...customizations,
      id: `custom_${Date.now()}`,
      name: customizations.name || `${baseMaterial.name} (Custom)`
    };
  }

  /**
   * Calculate weight based on volume and material density
   */
  static calculateWeight(volumeCm3: number, material: Material): number {
    if (!material.properties.density) return 0;
    return volumeCm3 * material.properties.density; // grams
  }

  /**
   * Calculate cost based on weight and material price
   */
  static calculateCost(weightGrams: number, material: Material): number {
    if (!material.properties.price) return 0;
    return (weightGrams / 1000) * material.properties.price; // euros
  }

  /**
   * Get material info for display
   */
  static getMaterialInfo(material: Material): string {
    const info: string[] = [];
    
    info.push(`Type: ${material.type}`);
    
    if (material.properties.density) {
      info.push(`Densité: ${material.properties.density} g/cm³`);
    }
    
    if (material.properties.price) {
      info.push(`Prix: ${material.properties.price} €/kg`);
    }
    
    if (material.properties.recyclable !== undefined) {
      info.push(`Recyclable: ${material.properties.recyclable ? 'Oui' : 'Non'}`);
    }
    
    if (material.properties.printable !== undefined) {
      info.push(`Imprimable 3D: ${material.properties.printable ? 'Oui' : 'Non'}`);
    }
    
    if (material.properties.finish) {
      info.push(`Finition: ${material.properties.finish}`);
    }

    return info.join(' • ');
  }

  /**
   * Get Three.js material properties with enhanced PBR
   */
  static getThreeMaterialProps(material: Material) {
    // Brighten colors slightly for better visibility
    const color = new THREE.Color(material.color);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    // Increase lightness by 15% for better visibility
    hsl.l = Math.min(hsl.l * 1.15, 0.95);
    color.setHSL(hsl.h, hsl.s, hsl.l);

    const baseProps = {
      color,
      metalness: material.metalness,
      roughness: material.roughness,
      opacity: material.opacity,
      transparent: material.opacity < 1
    };

    // Enhanced properties based on material type
    switch (material.type) {
      case 'metal':
        return {
          ...baseProps,
          metalness: Math.max(material.metalness, 0.85),
          roughness: Math.min(material.roughness, 0.35),
          clearcoat: 0.4,
          clearcoatRoughness: 0.15
        };
      
      case 'plastic':
        return {
          ...baseProps,
          metalness: 0,
          roughness: material.roughness * 0.9,
          clearcoat: material.properties.finish === 'glossy' ? 0.6 : 0.1,
          clearcoatRoughness: 0.1
        };
      
      case 'glass':
        return {
          ...baseProps,
          metalness: 0,
          roughness: 0.05,
          transmission: 0.9,
          thickness: 0.5,
          ior: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0
        };
      
      case 'wood':
        return {
          ...baseProps,
          metalness: 0,
          roughness: 0.8,
          clearcoat: 0.15,
          clearcoatRoughness: 0.4
        };
      
      default:
        return baseProps;
    }
  }
}
