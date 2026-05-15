// Three.js utility functions for resource management and cleanup

import * as THREE from 'three';

/**
 * Dispose of Three.js geometry and material resources
 * Prevents memory leaks by properly cleaning up resources
 */
export function disposeGeometry(geometry: THREE.BufferGeometry | null): void {
  if (!geometry) return;
  
  geometry.dispose();
  
  // Note: BufferAttribute doesn't have dispose() method in Three.js
  // Attributes are automatically cleaned up when geometry is disposed
}

/**
 * Dispose of Three.js material resources
 * Handles both single materials and arrays
 */
export function disposeMaterial(material: THREE.Material | THREE.Material[] | null): void {
  if (!material) return;
  
  const materials = Array.isArray(material) ? material : [material];
  
  for (const mat of materials) {
    if (!mat) continue;
    
    // Dispose of textures (check if they exist and are Texture instances)
    const matAny = mat as any;
    if (matAny.map && matAny.map instanceof THREE.Texture) matAny.map.dispose();
    if (matAny.normalMap && matAny.normalMap instanceof THREE.Texture) matAny.normalMap.dispose();
    if (matAny.roughnessMap && matAny.roughnessMap instanceof THREE.Texture) matAny.roughnessMap.dispose();
    if (matAny.metalnessMap && matAny.metalnessMap instanceof THREE.Texture) matAny.metalnessMap.dispose();
    if (matAny.aoMap && matAny.aoMap instanceof THREE.Texture) matAny.aoMap.dispose();
    if (matAny.emissiveMap && matAny.emissiveMap instanceof THREE.Texture) matAny.emissiveMap.dispose();
    if (matAny.bumpMap && matAny.bumpMap instanceof THREE.Texture) matAny.bumpMap.dispose();
    if (matAny.displacementMap && matAny.displacementMap instanceof THREE.Texture) matAny.displacementMap.dispose();
    if (matAny.alphaMap && matAny.alphaMap instanceof THREE.Texture) matAny.alphaMap.dispose();
    if (matAny.envMap && matAny.envMap instanceof THREE.Texture) matAny.envMap.dispose();
    
    mat.dispose();
  }
}

/**
 * Dispose of Three.js mesh resources (geometry + material)
 */
export function disposeMesh(mesh: THREE.Mesh | null): void {
  if (!mesh) return;
  
  disposeGeometry(mesh.geometry);
  disposeMaterial(mesh.material);
}

/**
 * Dispose of all objects in a Three.js scene
 */
export function disposeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      disposeMesh(object);
    } else if (object instanceof THREE.Light) {
      // Lights don't need disposal, but we can remove them
      object.dispose?.();
    } else if (object instanceof THREE.Group) {
      // Groups are automatically cleaned when children are disposed
    }
  });
  
  // Clear all children
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

/**
 * Center geometry at origin
 */
export function centerGeometry(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  
  if (geometry.boundingBox) {
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
  }
}
