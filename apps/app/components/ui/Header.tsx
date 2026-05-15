import { Show, JSX } from 'solid-js';
import { Button } from './Button';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  modelName?: string;
  isCompiling: boolean;
  onExport: () => void;
  onShowCode: () => void;
  children?: JSX.Element;
}

export function Header(props: HeaderProps) {
  return (
    <header class="h-16 bg-[#1f2937]/50 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between z-20">
      <div class="flex items-center gap-4">
        <Show when={!props.isSidebarOpen}>
          <button onClick={props.onToggleSidebar} class="text-gray-400 hover:text-white">☰</button>
        </Show>
        <div class="h-8 w-[1px] bg-gray-700 mx-2"></div>
        <div>
          <h2 class="text-sm font-bold text-gray-200">{props.projectName || 'No Project'}</h2>
          <p class="text-[10px] text-gray-500 font-medium">{props.modelName || 'No model active'}</p>
        </div>

        {/* Slot for additional header content (Mode Switcher, etc) */}
        {props.children}
      </div>

      <div class="flex items-center gap-3">
        {props.isCompiling && (
          <div class="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <div class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></div>
            <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">Compiling CAD</span>
          </div>
        )}
        <Button onClick={props.onShowCode} variant="outline" size="sm">Code</Button>
        <Button onClick={props.onExport} variant="primary" size="sm">Export Design</Button>
      </div>
    </header>
  );
}
