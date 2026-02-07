/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for Three.js examples
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    enableDamping: boolean;
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/STLLoader' {
  import { BufferGeometry, Loader } from 'three';
  export class STLLoader extends Loader {
    parse(data: ArrayBuffer): BufferGeometry;
  }
}
