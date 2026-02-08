import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { WorkerMessage, Material } from '../types';
import { MaterialService } from '../services/MaterialService';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { disposeMesh, disposeMaterial, centerGeometry } from '../utils/threeUtils';
import { formatJSCADError, JSCADErrorResult } from '../utils/errorHandler';

interface ThreeViewportProps {
  scadCode: string;
  material?: Material | null;
  onSTLGenerated: (data: ArrayBuffer) => void;
  onGeometryGenerated: (geometry: THREE.BufferGeometry) => void;
  onError: (errors: string[]) => void;
  onCompiling: (isCompiling: boolean) => void;
  onCodeError?: (errorMessage: string, failedCode: string) => void;
}

// Helper to create material
const createThreeMaterial = (mat: Material): THREE.MeshStandardMaterial => {
  const materialProps = MaterialService.getThreeMaterialProps(mat);
  return new THREE.MeshStandardMaterial({
    ...materialProps,
    side: THREE.DoubleSide,
    envMapIntensity: 2.0,
    flatShading: false
  });
};

function ThreeViewport({
  scadCode,
  material,
  onSTLGenerated,
  onGeometryGenerated,
  onError,
  onCompiling,
  onCodeError
}: ThreeViewportProps): JSX.Element {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<JSCADErrorResult | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Store callbacks in refs to avoid re-triggering useEffect
  const callbacksRef = useRef({
    onSTLGenerated,
    onGeometryGenerated,
    onError,
    onCompiling
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onSTLGenerated,
      onGeometryGenerated,
      onError,
      onCompiling
    };
  }, [onSTLGenerated, onGeometryGenerated, onError, onCompiling]);

  // Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with monochrome background based on theme
    const scene = new THREE.Scene();
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
    cameraRef.current = camera;

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

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-30, 40, -30);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 20, -50);
    scene.add(rimLight);

    // Subtle grid
    const gridColor = theme === 'dark' ? 0x333333 : 0xcccccc;
    const gridHelper = new THREE.GridHelper(100, 20, gridColor, gridColor);
    const gridMaterial = gridHelper.material as THREE.Material;
    if (gridMaterial) {
      gridMaterial.opacity = 0.15;
      gridMaterial.transparent = true;
    }
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(30);
    const axesMaterial = axesHelper.material as THREE.Material;
    if (axesMaterial) {
      axesMaterial.opacity = 0.6;
      axesMaterial.transparent = true;
    }
    scene.add(axesHelper);

    // Ground plane
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
    controlsRef.current = controls;

    // Animation loop
    const animate = (): void => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize with debouncing
    const handleResize = (): void => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // Debounce resize events
    let resizeTimer: number | null = null;
    const debouncedResize = (): void => {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);

      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }

      // Clean up mesh
      if (meshRef.current) {
        disposeMesh(meshRef.current);
        if (sceneRef.current) {
          sceneRef.current.remove(meshRef.current);
        }
        meshRef.current = null;
      }

      // Clean up scene
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      cameraRef.current = null;
    };
  }, []); // Initial setup only

  // Update scene background when theme changes
  useEffect(() => {
    if (sceneRef.current) {
      const bgColor = theme === 'dark' ? 0x1a1a1a : 0xf5f5f5;
      sceneRef.current.background = new THREE.Color(bgColor);
    }
  }, [theme]);

  // Handle SCAD Code execution (Worker interaction) with debouncing
  useEffect(() => {
    if (!scadCode) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce code compilation to avoid excessive worker creation
    debounceTimerRef.current = window.setTimeout(() => {
      const callbacks = callbacksRef.current;
      callbacks.onCompiling(true);
      setIsRendering(true);
      setRenderError(null); // Clear previous errors

      // Terminate existing worker if it exists
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      // Create new worker for each compilation
      const worker = new Worker(
        new URL('../workers/jscad.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent<WorkerMessage>): void => {
        if (worker !== workerRef.current) return;

        const { type, data, error } = e.data;
        console.log('[VIEWPORT] Worker message received:', type);

        const callbacks = callbacksRef.current;
        callbacks.onCompiling(false);
        setIsRendering(false);

        if (type === 'success' && data) {
          console.log('[VIEWPORT] Success! STL data size:', data.byteLength);
          try {
            const loader = new STLLoader();
            console.log('[VIEWPORT] Parsing STL...');
            const geometry = loader.parse(data);
            console.log('[VIEWPORT] STL parsed, vertices:', geometry.attributes.position.count);

            if (callbacks.onGeometryGenerated) {
              callbacks.onGeometryGenerated(geometry);
            }

            // Center geometry
            centerGeometry(geometry);
            console.log('[VIEWPORT] Geometry centered');

            // Update Scene
            if (meshRef.current) {
              console.log('[VIEWPORT] Updating existing mesh');
              // Dispose old resources
              disposeMesh(meshRef.current);

              // Update geometry
              meshRef.current.geometry = geometry;

              // Update material
              const currentMaterial = material || MaterialService.getDefaultMaterial();
              meshRef.current.material = createThreeMaterial(currentMaterial);
            } else if (sceneRef.current) {
              console.log('[VIEWPORT] Creating new mesh');
              const currentMaterial = material || MaterialService.getDefaultMaterial();
              const threeMaterial = createThreeMaterial(currentMaterial);
              const mesh = new THREE.Mesh(geometry, threeMaterial);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              sceneRef.current.add(mesh);
              meshRef.current = mesh;
              console.log('[VIEWPORT] Mesh added to scene');
            }

            callbacks.onSTLGenerated(data);
            callbacks.onError([]);
            console.log('[VIEWPORT] Rendering complete!');
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('[VIEWPORT] 3D Model loading error:', errorMessage, err);
            callbacks.onError([`Failed to load 3D model: ${errorMessage}`]);
          }
        } else if (type === 'error' && error) {
          console.error('[VIEWPORT] Worker error:', error);

          // Format error for user display
          const formattedError = formatJSCADError(error);
          setRenderError(formattedError);

          callbacks.onError([`Worker error: ${error}`]);

          // Trigger code correction if callback is provided
          if (onCodeError) {
            console.log('[VIEWPORT] Triggering code correction...');
            onCodeError(error, scadCode);
          }
        }
      };

      worker.onerror = (error: ErrorEvent): void => {
        if (worker !== workerRef.current) return;
        console.error('[VIEWPORT] Worker error event:', error);
        const callbacks = callbacksRef.current;
        callbacks.onCompiling(false);
        setIsRendering(false);

        // Format error for user display
        const formattedError = formatJSCADError(error.message || 'Unknown worker error');
        setRenderError(formattedError);

        callbacks.onError([`Worker failed: ${error.message}`]);
      };

      console.log('[VIEWPORT] Posting code to worker, length:', scadCode.length);
      worker.postMessage({ code: scadCode });
    }, 100); // 100ms debounce - optimized for faster rendering

    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Terminate worker on cleanup
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [scadCode, material]); // Only depend on scadCode and material, not callbacks

  // Update material when it changes (only if mesh exists and material is different)
  useEffect(() => {
    if (meshRef.current && material) {
      const threeMaterial = createThreeMaterial(material);

      // Dispose old material
      disposeMaterial(meshRef.current.material);

      // Update material
      meshRef.current.material = threeMaterial;
    }
  }, [material]);

  const clearError = useCallback(() => {
    setRenderError(null);
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative">
      {/* Loading overlay */}
      {isRendering && (
        <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-xl border border-[var(--border-color)] text-center max-w-sm">
            {/* Animated spinner */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-[var(--border-color)] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[var(--accent)] rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-[var(--accent)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>

            {/* Messages */}
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {t.messages.rendering3D}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {t.messages.compilingJSCAD}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {t.messages.pleaseWaitRendering}
            </p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {renderError && !isRendering && (
        <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl shadow-xl border border-red-500/30 text-center max-w-md mx-4">
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error title */}
            <h3 className="text-lg font-bold text-red-500 mb-2">
              ⚠️ {renderError.title}
            </h3>

            {/* Error message */}
            <p className="text-sm text-[var(--text-primary)] mb-3">
              {renderError.message}
            </p>

            {/* Suggestion */}
            <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg mb-4">
              <p className="text-xs text-[var(--text-secondary)]">
                💡 <strong>Tip:</strong> {renderError.suggestion}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={clearError}
              className="px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreeViewport;
