import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { WorkerMessage, Material } from '../types';
import { MaterialService } from '../services/MaterialService';
import { useTheme } from '../contexts/ThemeContext';

interface ThreeViewportProps {
  scadCode: string;
  material?: Material | null;
  onSTLGenerated: (data: ArrayBuffer) => void;
  onGeometryGenerated: (geometry: THREE.BufferGeometry) => void;
  onError: (errors: string[]) => void;
  onCompiling: (isCompiling: boolean) => void;
}

function ThreeViewport({ 
  scadCode,
  material,
  onSTLGenerated, 
  onGeometryGenerated, 
  onError, 
  onCompiling
}: ThreeViewportProps): JSX.Element {
  const { theme } = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with monochrome background based on theme
    const scene = new THREE.Scene();
    // Dark mode: dark gray, Light mode: light gray
    const bgColor = theme === 'dark' ? 0x1a1a1a : 0xf5f5f5;
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);

    // Renderer with shadows
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup - brighter
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Main directional light with shadows - brighter
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(50, 80, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    // Fill light (softer, from opposite side) - brighter
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-30, 40, -30);
    scene.add(fillLight);

    // Rim light (for edge definition) - brighter
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 20, -50);
    scene.add(rimLight);

    // Subtle grid (less visible)
    const gridColor = theme === 'dark' ? 0x333333 : 0xcccccc;
    const gridHelper = new THREE.GridHelper(100, 20, gridColor, gridColor);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Axes helper (smaller, less intrusive)
    const axesHelper = new THREE.AxesHelper(30);
    axesHelper.material.opacity = 0.6;
    axesHelper.material.transparent = true;
    scene.add(axesHelper);

    // Ground plane for better depth perception
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundColor = theme === 'dark' ? 0x2a2a2a : 0xe8e8e8;
    const groundMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.3,
      color: groundColor
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation loop
    const animate = (): void => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = (): void => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Initialize Web Worker with TypeScript + local packages
    workerRef.current = new Worker(
      new URL('../workers/jscad.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>): void => {
      const { type, data, error } = e.data;
      
      onCompiling(false);
      
      if (type === 'success' && data) {
        try {
          // Load STL
          const loader = new STLLoader();
          const geometry = loader.parse(data);
          
          // Pass geometry to parent
          if (onGeometryGenerated) {
            onGeometryGenerated(geometry);
          }
          
          // Center geometry
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          if (geometry.boundingBox) {
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);
          }
          
          // Remove old mesh
          if (meshRef.current) {
            scene.remove(meshRef.current);
            meshRef.current.geometry.dispose();
            if (Array.isArray(meshRef.current.material)) {
              meshRef.current.material.forEach((mat: any) => mat.dispose());
            } else {
              meshRef.current.material.dispose();
            }
          }

          // Create new mesh with enhanced material
          const currentMaterial = material || MaterialService.getDefaultMaterial();
          const materialProps = MaterialService.getThreeMaterialProps(currentMaterial);
          
          const threeMaterial = new THREE.MeshStandardMaterial({
            ...materialProps,
            side: THREE.DoubleSide,
            envMapIntensity: 2.0,
            flatShading: false
          });
          const mesh = new THREE.Mesh(geometry, threeMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          meshRef.current = mesh;

          onSTLGenerated(data);
          onError([]);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('3D Model loading error:', errorMessage);
          onError([`Failed to load 3D model: ${errorMessage}`]);
        }
      } else if (type === 'error' && error) {
        console.error('Worker error:', error);
        onError([`Worker error: ${error}`]);
      }
    };
    
    workerRef.current.onerror = (error: ErrorEvent): void => {
      console.error('Worker error event:', error);
      onCompiling(false);
      onError([`Worker failed: ${error.message}`]);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workerRef.current) workerRef.current.terminate();
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update scene background when theme changes
  useEffect(() => {
    if (sceneRef.current) {
      const bgColor = theme === 'dark' ? 0x1a1a1a : 0xf5f5f5;
      sceneRef.current.background = new THREE.Color(bgColor);
    }
  }, [theme]);

  useEffect(() => {
    if (workerRef.current && scadCode) {
      onCompiling(true);
      workerRef.current.postMessage({ code: scadCode });
    }
  }, [scadCode, onCompiling]);

  // Update material when it changes
  useEffect(() => {
    if (meshRef.current && material) {
      const materialProps = MaterialService.getThreeMaterialProps(material);
      const threeMaterial = new THREE.MeshStandardMaterial({
        ...materialProps,
        side: THREE.DoubleSide,
        envMapIntensity: 2.0,
        flatShading: false
      });
      
      // Dispose old material
      if (meshRef.current.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat: any) => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
      
      // Apply new material
      meshRef.current.material = threeMaterial;
    }
  }, [material]);

  return <div ref={mountRef} className="w-full h-full" />;
}

export default ThreeViewport;
