import { For, Show } from 'solid-js';
import { Project } from '../../types';
import { Button } from './Button';

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onSelectProject: (p: Project) => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside class={`bg-[#1f2937] border-r border-gray-800 flex flex-col z-30 shadow-2xl transition-all duration-300 ${props.isOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
      <div class="p-6 border-b border-gray-800 flex justify-between items-center whitespace-nowrap">
        <div>
          <h1 class="text-2xl font-black tracking-tighter text-blue-500">MORPHOS</h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SolidJS + BabylonJS</p>
        </div>
        <button onClick={props.onClose} class="text-gray-500 hover:text-white">◀</button>
      </div>

      <div class="p-4">
        <Button onClick={props.onNewProject} class="w-full py-3" variant="primary">
          <span>+</span> New Project
        </Button>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 space-y-2">
        <h3 class="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">Your Projects</h3>
        <For each={props.projects}>
          {(p) => (
            <div
              onClick={() => props.onSelectProject(p)}
              class={`group p-3 rounded-xl cursor-pointer transition-all border ${props.currentProject?.id === p.id ? 'bg-gray-800 border-gray-700 shadow-sm' : 'border-transparent hover:bg-gray-800/50'}`}
            >
              <div class="font-semibold text-sm truncate">{p.name}</div>
              <div class="text-[10px] text-gray-500">{p.models.length} models</div>
            </div>
          )}
        </For>
      </nav>

      <div class="p-4 border-t border-gray-800 bg-gray-900/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">U</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold truncate">User</div>
            <div class="text-[10px] text-green-500 font-bold">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
