import { createSignal, createMemo, onMount, Show, For } from 'solid-js';
import { BabylonViewport } from './components/BabylonViewport';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/ui/Sidebar';
import { Header } from './components/ui/Header';
import { Button } from './components/ui/Button';
import ProjectService from './services/ProjectService';
import { CADService } from './services/CADService';
import ExportService from './services/ExportService';
import { Project, Model, ChatMessage, AppMode } from './types';

function App() {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [currentProject, setCurrentProject] = createSignal<Project | null>(null);
  const [currentModel, setCurrentModel] = createSignal<Model | null>(null);
  const [isCompiling, setIsCompiling] = createSignal(false);
  const [messages, setMessages] = createSignal<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = createSignal(false);
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [isChatOpen, setIsChatOpen] = createSignal(false);
  const [showExportMenu, setShowExportMenu] = createSignal(false);
  const [appMode, setAppMode] = createSignal<AppMode>('3D');

  let cadService: CADService | null = null;
  let fileInput: HTMLInputElement | undefined;

  onMount(() => {
    const loaded = ProjectService.getAllProjects();
    if (loaded.length === 0) {
      const def = ProjectService.createProject('Default Project', '', '3D');
      setProjects([def]);
      setCurrentProject(def);
    } else {
      setProjects(loaded);
      setCurrentProject(loaded[0]);
      if (loaded[0].models.length > 0) {
          setCurrentModel(loaded[0].models[0]);
          setAppMode(loaded[0].mode);
      } else {
          setAppMode(loaded[0].mode);
      }
    }

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

  const saveToProject = (updatedModel: Model) => {
    const project = currentProject();
    if (project) {
      const updatedProject = { ...project };
      const modelIndex = updatedProject.models.findIndex(m => m.id === updatedModel.id);
      if (modelIndex >= 0) {
        updatedProject.models[modelIndex] = updatedModel;
      } else {
        updatedProject.models.unshift(updatedModel);
      }
      ProjectService.saveProject(updatedProject);
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    }
  };

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
      const analysis = await cadService.analyzeRequest(text, image, currentModel()?.code);
      const mode = analysis.suggestedMode || appMode();
      const specs = cadService.getSpecifications(analysis.searchQuery);
      const code = await cadService.generateCode(
        text,
        specs,
        image,
        analysis.actionType === 'CREATE' ? null : currentModel()?.code,
        mode
      );

      const updatedModel: Model = {
        id: currentModel()?.id || Date.now().toString(),
        name: analysis.objectName || 'New Model',
        code,
        prompt: text,
        mode: mode,
        createdAt: currentModel()?.createdAt || new Date().toISOString()
      };

      setCurrentModel(updatedModel);
      setAppMode(mode);
      saveToProject(updatedModel);

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
        saveToProject(updated);
    }
  };

  const handleExport = (formatId: string) => {
      const model = currentModel();
      if (!model) return;

      switch (formatId) {
          case 'stl': model.stlData ? ExportService.exportSTL(model.stlData, model.name) : alert('STL not ready'); break;
          case 'step': model.stepData ? ExportService.exportSTEP(model.stepData, model.name) : alert('STEP not ready'); break;
          case 'svg': model.svgData ? ExportService.exportSVG(model.svgData, model.name) : alert('SVG not ready'); break;
          case 'dxf': model.dxfData ? ExportService.exportDXF(model.dxfData, model.name) : alert('DXF not ready'); break;
          case 'obj': model.stlData ? ExportService.exportOBJ(model.stlData, model.name) : alert('Model not ready'); break;
          case 'gcode': ExportService.exportGCODE(model.name); break;
          case 'code': ExportService.exportCode(model.code, model.name, model.mode); break;
      }
      setShowExportMenu(false);
  };

  const handleImport = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
          try {
              const importedData = await ProjectService.importFile(file);
              const newModel: Model = {
                  id: Date.now().toString(),
                  name: importedData.name || 'Imported',
                  code: importedData.code || '',
                  prompt: 'Imported file',
                  mode: importedData.mode as AppMode,
                  stlData: importedData.stlData,
                  svgData: importedData.svgData,
                  dxfData: importedData.dxfData,
                  createdAt: new Date().toISOString()
              };
              setCurrentModel(newModel);
              setAppMode(newModel.mode);
              saveToProject(newModel);
          } catch (err: any) {
              alert(err.message);
          }
      }
  };

  return (
    <div class="h-screen flex bg-[#111827] text-white overflow-hidden font-sans">
      <Sidebar
        projects={projects()}
        currentProject={currentProject()}
        isOpen={isSidebarOpen()}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={() => {
            const name = prompt('Project Name:');
            if (name) {
                const p = ProjectService.createProject(name, '', appMode());
                setProjects(prev => [p, ...prev]);
                setCurrentProject(p);
                setCurrentModel(null);
            }
        }}
        onSelectProject={(p) => {
            setCurrentProject(p);
            setCurrentModel(p.models[0] || null);
            setAppMode(p.mode);
        }}
      />

      <main class="flex-1 flex flex-col relative bg-[#0b0f1a]">
        <Header
          isSidebarOpen={isSidebarOpen()}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          projectName={currentProject()?.name}
          modelName={currentModel()?.name}
          isCompiling={isCompiling()}
          onExport={() => setShowExportMenu(!showExportMenu())}
          onShowCode={() => alert('Code Editor coming soon!')}
        >
            <div class="flex items-center gap-2 ml-6">
                <div class="flex bg-gray-900/50 rounded-xl p-1 border border-gray-700/50">
                    <button
                        onClick={() => setAppMode('2D')}
                        class={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${appMode() === '2D' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >2D</button>
                    <button
                        onClick={() => setAppMode('3D')}
                        class={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${appMode() === '3D' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >3D</button>
                </div>

                <div class="h-6 w-[1px] bg-gray-800 mx-1"></div>

                <input type="file" ref={fileInput} onChange={handleImport} class="hidden" accept=".stl,.svg,.dxf" />
                <Button onClick={() => fileInput?.click()} variant="ghost" size="sm" class="text-[10px] uppercase tracking-widest border border-gray-800">
                   Import CNC/3D
                </Button>
            </div>
        </Header>

        <Show when={showExportMenu()}>
            <div class="absolute top-20 right-6 w-72 bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div class="p-4 bg-gray-800/50 border-b border-gray-700 text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Formats</div>
                <div class="max-h-80 overflow-y-auto">
                    <For each={ExportService.getAvailableFormats(appMode())}>
                        {(format) => (
                            <button
                                onClick={() => handleExport(format.id)}
                                class="w-full flex items-center gap-4 p-4 hover:bg-blue-600/10 hover:text-blue-400 group transition-all text-left"
                            >
                                <span class="text-2xl group-hover:scale-110 transition-transform">{format.icon}</span>
                                <div class="flex-1">
                                    <div class="font-bold text-sm text-gray-200 group-hover:text-blue-400">{format.name}</div>
                                    <div class="text-[10px] text-gray-500 group-hover:text-blue-400/70">{format.description}</div>
                                </div>
                                <span class="text-[10px] font-bold text-gray-600 uppercase">{format.extension}</span>
                            </button>
                        )}
                    </For>
                </div>
            </div>
        </Show>

        <div class="flex-1 relative">
          {currentModel() ? (
            <BabylonViewport
              scadCode={currentModel()!.code}
              mode={appMode()}
              onDataGenerated={handleDataGenerated}
              onCompiling={setIsCompiling}
            />
          ) : (
            <div class="h-full flex flex-col items-center justify-center text-center p-12">
              <div class="w-32 h-32 bg-gray-800/30 rounded-[40px] mb-8 flex items-center justify-center border border-gray-700/50 shadow-inner relative group">
                 <div class="absolute inset-0 bg-blue-600/10 rounded-[40px] blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
                 <span class="text-6xl relative z-10 transition-transform group-hover:scale-110 duration-500">{appMode() === '3D' ? '🧊' : '📐'}</span>
              </div>
              <h3 class="text-2xl font-black mb-3 tracking-tight">No {appMode()} Model Active</h3>
              <p class="text-gray-500 max-w-sm text-sm font-medium leading-relaxed">
                Describe your {appMode() === '3D' ? 'mechanical part' : 'CNC path'} to our AI or import an existing file to get started.
              </p>
              <Button
                onClick={() => setIsChatOpen(true)}
                class="mt-10 px-10 py-4 text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:scale-105"
              >
                Start Generating with AI
              </Button>
            </div>
          )}
        </div>

        <Show when={!isChatOpen()}>
            <button
                onClick={() => setIsChatOpen(true)}
                class="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl hover:scale-110 hover:rotate-3 transition-all z-40 active:scale-95 group"
            >
                <span class="group-hover:animate-bounce">🤖</span>
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0b0f1a] rounded-full"></div>
            </button>
        </Show>

        <Show when={isChatOpen()}>
            <div class="absolute bottom-8 right-8 w-[400px] h-[600px] z-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                <ChatInterface
                    messages={messages()}
                    isLoading={isChatLoading()}
                    onSendMessage={handleSendMessage}
                />
                <button
                    onClick={() => setIsChatOpen(false)}
                    class="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </Show>
      </main>
    </div>
  );
}

export default App;
