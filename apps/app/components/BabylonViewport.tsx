import { onMount, onCleanup, createEffect, createSignal, Show } from 'solid-js';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, StandardMaterial, Color3, MeshBuilder, PBRMaterial, Mesh, VertexData } from '@babylonjs/core';
import { Model, Material } from '../types';

interface BabylonViewportProps {
  scadCode: string;
  mode?: '2D' | '3D';
  currentModel?: Model | null;
  onDataGenerated: (data: { stl?: ArrayBuffer, step?: ArrayBuffer, svg?: string, dxf?: string }) => void;
  onCompiling: (isCompiling: boolean) => void;
}

export const BabylonViewport = (props: BabylonViewportProps) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let engine: Engine | null = null;
  let scene: Scene | null = null;
  let worker: Worker | null = null;
  let currentMesh: Mesh | null = null;

  const [svgContent, setSvgContent] = createSignal<string | null>(null);

  onMount(() => {
    if (!canvasRef) return;

    engine = new Engine(canvasRef, true);
    scene = new Scene(engine);
    scene.clearColor = new Color3(0.04, 0.06, 0.1).toColor4(); // Match background #0b0f1a

    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 100, Vector3.Zero(), scene);
    camera.attachControl(canvasRef, true);

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    engine.runRenderLoop(() => {
      scene?.render();
    });

    window.addEventListener('resize', () => engine?.resize());
  });

  onCleanup(() => {
    engine?.dispose();
    worker?.terminate();
  });

  createEffect(() => {
    const code = props.scadCode;
    const mode = props.mode || '3D';

    if (!code) return;

    props.onCompiling(true);

    if (worker) worker.terminate();
    worker = new Worker(new URL('../workers/cad.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
      const { type, data, error } = e.data;
      props.onCompiling(false);

      if (type === 'success' && data) {
        if (mode === '3D') {
          setSvgContent(null);
          if (data.meshes && data.meshes.length > 0) {
            if (currentMesh) currentMesh.dispose();

            const meshData = data.meshes[0];
            const mesh = new Mesh("replicad-mesh", scene!);
            const vertexData = new VertexData();

            vertexData.positions = meshData.positions;
            vertexData.indices = meshData.indices;
            vertexData.normals = meshData.normals;
            vertexData.applyToMesh(mesh);

            const material = new PBRMaterial("pbr", scene!);
            material.roughness = 0.4;
            material.metallic = 0.8;
            material.albedoColor = new Color3(0.2, 0.4, 0.8);
            mesh.material = material;

            currentMesh = mesh;

            // Auto-center camera
            const meshMin = mesh.getBoundingInfo().boundingBox.minimumWorld;
            const meshMax = mesh.getBoundingInfo().boundingBox.maximumWorld;
            const center = Vector3.Center(meshMin, meshMax);
            const distance = Vector3.Distance(meshMin, meshMax) * 1.5;

            scene!.activeCamera!.setTarget(center);
            (scene!.activeCamera as ArcRotateCamera).radius = Math.max(distance, 50);
          }
        } else if (mode === '2D') {
          if (currentMesh) currentMesh.dispose();
          currentMesh = null;
          if (data.svg) {
            setSvgContent(data.svg);
          }
        }

        props.onDataGenerated({
            stl: data.stl,
            step: data.step,
            svg: data.svg,
            dxf: data.dxf
        });
      } else if (type === 'error') {
          console.error('Worker error:', error);
      }
    };

    worker.postMessage({ code, mode });
  });

  return (
    <div class="w-full h-full relative">
      <Show when={props.mode === '3D' || !svgContent()}>
        <canvas ref={canvasRef} class="w-full h-full outline-none" />
      </Show>

      <Show when={props.mode === '2D' && svgContent()}>
        <div class="w-full h-full flex items-center justify-center p-8 bg-gray-900/20 overflow-auto">
            <div class="bg-white p-4 rounded shadow-2xl max-w-full max-h-full" innerHTML={svgContent()!}></div>
        </div>
      </Show>

      {/* Mode Indicator Overlay */}
      <div class="absolute top-4 left-4 flex gap-2">
         <span class={`px-2 py-1 rounded text-[10px] font-bold uppercase ${props.mode === '3D' ? 'bg-blue-600' : 'bg-green-600'}`}>
            {props.mode}
         </span>
      </div>
    </div>
  );
};
