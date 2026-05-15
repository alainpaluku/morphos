import { createSignal, createMemo, onMount, Show } from 'solid-js';
import { BabylonViewport } from './components/BabylonViewport';
import { ChatInterface } from './components/ChatInterface';
import ProjectService from './services/ProjectService';
import { CADService } from './services/CADService';
import ExportService from './services/ExportService';
import { Project, Model, ChatMessage, AppMode } from './types';

function App() {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [currentProject, setCurrentProject] = createSignal<Project | null>(null);
  const [currentModel, setCurrentModel] = createSignal<Model | null>(null);
  const [isCompiling, setIsCompiling] = createSignal(false);
  const [isExporting, setIsExporting] = createSignal(false);
  const [messages, setMessages] = createSignal<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = createSignal(false);
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [isChatOpen, setIsChatOpen] = createSignal(false);

  let cadService: CADService | null = null;

  onMount(() => {
    const loaded = ProjectService.getAllProjects();
    if (loaded.length === 0) {
      const def = ProjectService.createProject('Default Project');
      setProjects([def]);
      setCurrentProject(def);
    } else {
      setProjects(loaded);
      setCurrentProject(loaded[0]);
      if (loaded[0].models.length > 0) setCurrentModel(loaded[0].models[0]);
    }

    // Try to get API key from localStorage or env
    const apiKey = localStorage.getItem('MORPHOS_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        cadService = new CADService(apiKey);
      } catch (e) {
        console.error('Failed to init CAD service', e);
      }
    } else {
      setMessages([{
        id: '1',
        role: 'system',
        content: 'Please provide a Gemini API key in settings to enable AI features.',
        timestamp: new Date().toISOString()
      }]);
    }
  });

  const handleSendMessage = async (text: string, image?: string) => {
    if (!cadService) {
        const apiKey = prompt('Please enter your Gemini API key:');
        if (apiKey) {
            try {
                cadService = new CADService(apiKey);
                localStorage.setItem('MORPHOS_API_KEY', apiKey);
            } catch (e) {
                alert('Invalid API key');
                return;
            }
        } else return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      image,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsChatLoading(true);

    try {
      // 1. Analyze request
      const analysis = await cadService.analyzeRequest(text, image, currentModel()?.code);
      const mode = analysis.suggestedMode || currentModel()?.mode || '3D';

      // 2. Search specs if needed
      const specs = cadService.getSpecifications(analysis.searchQuery);

      // 3. Generate code
      const code = await cadService.generateCode(
        text,
        specs,
        image,
        analysis.actionType === 'CREATE' ? null : currentModel()?.code,
        mode
      );

      // 4. Update model
      const updatedModel: Model = {
        id: currentModel()?.id || Date.now().toString(),
        name: analysis.objectName || 'New Model',
        code,
        prompt: text,
        mode: mode,
        createdAt: currentModel()?.createdAt || new Date().toISOString()
      };

      setCurrentModel(updatedModel);

      // Update project
      if (currentProject()) {
        const updatedProject = { ...currentProject()! };
        const modelIndex = updatedProject.models.findIndex(m => m.id === updatedModel.id);
        if (modelIndex >= 0) {
          updatedProject.models[modelIndex] = updatedModel;
        } else {
          updatedProject.models.push(updatedModel);
        }
        ProjectService.saveProject(updatedProject);
        setCurrentProject(updatedProject);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've ${analysis.actionType === 'CREATE' ? 'created' : 'updated'} the ${mode} model for: ${analysis.objectName}`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error: any) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDataGenerated = (data: { stl?: ArrayBuffer, step?: ArrayBuffer, svg?: string, dxf?: string }) => {
    if (currentModel()) {
        const updated = {
            ...currentModel()!,
            stlData: data.stl || currentModel()?.stlData,
            stepData: data.step || currentModel()?.stepData,
            svgData: data.svg || currentModel()?.svgData,
            dxfData: data.dxf || currentModel()?.dxfData,
        };
        setCurrentModel(updated);
        // Save to project
        if (currentProject()) {
             const proj = { ...currentProject()! };
             const idx = proj.models.findIndex(m => m.id === updated.id);
             if (idx >= 0) {
                 proj.models[idx] = updated;
                 ProjectService.saveProject(proj);
             }
        }
    }
  };

  const handleExport = () => {
      const model = currentModel();
      if (!model) return;

      const formats = ExportService.getAvailableFormats(model.mode);
      const format = formats[0]; // Default to first available

      if (model.mode === '3D') {
          if (model.stlData) {
              ExportService.exportSTL(model.stlData, model.name);
          } else {
              alert('Model still processing, please wait.');
          }
      } else {
          if (model.svgData) {
              ExportService.exportSVG(model.svgData, model.name);
          } else {
              alert('Model still processing, please wait.');
          }
      }
  };

  return (
    <div class="h-screen flex bg-[#111827] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <Show when={isSidebarOpen()}>
        <aside class="w-72 bg-[#1f2937] border-r border-gray-800 flex flex-col z-30 shadow-2xl">
            <div class="p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black tracking-tighter text-blue-500">MORPHOS</h1>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SolidJS + BabylonJS</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} class="text-gray-500 hover:text-white">◀</button>
            </div>

            <div class="p-4">
            <button
                onClick={() => {
                    const name = prompt('Project Name:');
                    if (name) {
                        const p = ProjectService.createProject(name);
                        setProjects(prev => [...prev, p]);
                        setCurrentProject(p);
                        setCurrentModel(null);
                    }
                }}
                class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
                <span>+</span> New Project
            </button>
            </div>

            <nav class="flex-1 overflow-y-auto px-4 space-y-2">
            <h3 class="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">Your Projects</h3>
            <For each={projects()}>
                {(p) => (
                <div
                    onClick={() => {
                        setCurrentProject(p);
                        setCurrentModel(p.models[0] || null);
                    }}
                    class={`group p-3 rounded-xl cursor-pointer transition-all border ${currentProject()?.id === p.id ? 'bg-gray-800 border-gray-700 shadow-sm' : 'border-transparent hover:bg-gray-800/50'}`}
                >
                    <div class="font-semibold text-sm">{p.name}</div>
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
      </Show>

      {/* Main Content */}
      <main class="flex-1 flex flex-col relative bg-[#0b0f1a]">
        <header class="h-16 bg-[#1f2937]/50 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between z-20">
          <div class="flex items-center gap-4">
            <Show when={!isSidebarOpen()}>
                <button onClick={() => setIsSidebarOpen(true)} class="text-gray-400 hover:text-white">☰</button>
            </Show>
            <div class="h-8 w-[1px] bg-gray-700 mx-2"></div>
            <div>
              <h2 class="text-sm font-bold text-gray-200">{currentProject()?.name}</h2>
              <p class="text-[10px] text-gray-500 font-medium">{currentModel()?.name || 'No model active'}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            {isCompiling() && (
              <div class="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <div class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></div>
                <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">Compiling CAD</span>
              </div>
            )}
            <button class="px-5 py-2 bg-[#1f2937] hover:bg-gray-700 border border-gray-700 text-xs font-bold rounded-lg transition-all">Code</button>
            <button
                onClick={handleExport}
                class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
            >
                Export Design
            </button>
          </div>
        </header>

        <div class="flex-1 relative">
          {currentModel() ? (
            <BabylonViewport
              scadCode={currentModel()!.code}
              mode={currentModel()!.mode}
              onDataGenerated={handleDataGenerated}
              onCompiling={setIsCompiling}
            />
          ) : (
            <div class="h-full flex flex-col items-center justify-center text-center p-12">
              <div class="w-24 h-24 bg-gray-800/50 rounded-3xl mb-6 flex items-center justify-center border border-gray-700">
                 <span class="text-4xl">📐</span>
              </div>
              <h3 class="text-xl font-bold mb-2">No Model Active</h3>
              <p class="text-gray-500 max-w-xs text-sm">Select a project from the sidebar or describe a new part to start generating.</p>
              <button
                onClick={() => setIsChatOpen(true)}
                class="mt-8 px-8 py-3 bg-blue-600 rounded-xl font-bold text-sm hover:scale-105 transition-all"
              >
                Open AI Assistant
              </button>
            </div>
          )}
        </div>

        {/* Floating AI Toggle */}
        <Show when={!isChatOpen()}>
            <button
                onClick={() => setIsChatOpen(true)}
                class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all z-40"
            >
                🤖
            </button>
        </Show>

        {/* AI Chat Drawer */}
        <Show when={isChatOpen()}>
            <div class="absolute bottom-6 right-6 w-96 h-[500px] z-50">
                <ChatInterface
                    messages={messages()}
                    isLoading={isChatLoading()}
                    onSendMessage={handleSendMessage}
                />
                <button
                    onClick={() => setIsChatOpen(false)}
                    class="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    _
                </button>
            </div>
        </Show>
      </main>
    </div>
  );
}

export default App;
