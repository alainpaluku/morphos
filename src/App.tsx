import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import WelcomePage from './components/WelcomePage';
import Sidebar from './components/layout/Sidebar';
import ThreeViewport from './components/ThreeViewport';
import ChatInterface from './components/ChatInterface';
import CodeModal from './components/modals/CodeModal';
import ExportModal from './components/modals/ExportModal';
import ParametersPanel from './components/layout/ParametersPanel';
import ProjectService from './services/ProjectService';
import { MaterialService } from './services/MaterialService';
import { CADService } from './services/CADService';
import { Icons } from './constants/icons';
import { generateModelName } from './utils/modelUtils';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { LanguageSelector, ThemeToggle } from './components/ui';
import { Project, Model, Material } from './types';
import { updateModelCode, updateModelMaterial } from './utils/projectUtils';

function App(): JSX.Element {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem('morphos-welcomed');
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMinimized, setChatMinimized] = useState<boolean>(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState<boolean>(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState<boolean>(false);
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Store generation context for auto-correction
  const [generationContext, setGenerationContext] = useState<{
    prompt: string;
    imageData: string | null;
  } | null>(null);

  // Memoize callbacks to prevent infinite recompilation loop
  const handleSTLGenerated = useCallback((data: ArrayBuffer) => {
    setStlData(data);
  }, []);

  const handleGeometryGenerated = useCallback((geom: THREE.BufferGeometry) => {
    setGeometry(geom);
  }, []);

  const handleViewportError = useCallback((errors: string[]) => {
    if (errors.length > 0) {
      console.error('3D Viewport errors:', errors);
      // Could show a toast notification here
    }
  }, []);

  const handleCompiling = useCallback((compiling: boolean) => {
    setIsCompiling(compiling);
  }, []);

  // Auto-correct code on error
  const handleCodeError = useCallback(async (errorMessage: string, failedCode: string) => {
    if (!generationContext || !currentModel || !currentProject) {
      console.log('[App] Cannot correct: missing context');
      return;
    }

    console.log('[App] Code error detected, attempting automatic correction...');
    console.log('[App] Error:', errorMessage);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        console.error('[App] API key not found');
        return;
      }

      const cadService = new CADService(apiKey);

      const correctedCode = await cadService.correctCode(
        generationContext.prompt,
        failedCode,
        errorMessage,
        generationContext.imageData
      );

      console.log('[App] Code corrected successfully, updating model...');

      // Update model with corrected code
      const result = updateModelCode(currentProject, currentModel.id, correctedCode);
      if (result) {
        setCurrentProject(result.project);
        setCurrentModel(result.model);
        console.log('[App] Model updated with corrected code');
      }
    } catch (error) {
      console.error('[App] Code correction failed:', error);
      // Don't throw - just log the error
    }
  }, [generationContext, currentModel, currentProject]);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = ProjectService.getAllProjects();
    if (loadedProjects.length === 0) {
      const defaultProject = ProjectService.createProject('My First Project', 'Default project');
      setProjects([defaultProject]);
      setCurrentProject(defaultProject);
    } else {
      setProjects(loadedProjects);
      setCurrentProject(loadedProjects[0]);
    }
  }, []);

  const handleNewProject = useCallback((): void => {
    const name = prompt('Project name:');
    if (name) {
      const newProject = ProjectService.createProject(name);
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
    }
  }, []);

  const handleProjectSelect = useCallback((project: Project): void => {
    setCurrentProject(project);
    // Load the first model if available
    if (project.models && project.models.length > 0) {
      setCurrentModel(project.models[0]);
    } else {
      setCurrentModel(null);
    }
  }, []);

  const handleModelSelect = useCallback((model: Model): void => {
    setCurrentModel(model);
  }, []);

  const handleCodeGenerated = useCallback((code: string, prompt: string, imageData: string | null = null): void => {
    // Store generation context for potential correction
    setGenerationContext({ prompt, imageData });

    console.log('[App] Code generated, storing context:', { prompt: prompt.substring(0, 50), hasImage: !!imageData });

    // Detect material from prompt
    const detectedMaterial = MaterialService.applyMaterialFromPrompt(prompt);

    const model: Omit<Model, 'id' | 'createdAt'> = {
      name: generateModelName(prompt),
      code,
      prompt,
      stlData: null,
      material: detectedMaterial
    };

    if (currentProject) {
      ProjectService.addModelToProject(currentProject.id, model);
      const updated = ProjectService.getProject(currentProject.id);
      if (updated) {
        setCurrentProject(updated);
        setCurrentModel(updated.models[0]);
        setChatMinimized(true);
      }
    }
  }, [currentProject]);

  const handleMaterialChange = useCallback((material: Material): void => {
    if (currentModel && currentProject) {
      const result = updateModelMaterial(currentProject, currentModel.id, material);
      if (result) {
        setCurrentProject(result.project);
        setCurrentModel(result.model);
      }
    }
  }, [currentModel, currentProject]);

  const handleCodeSave = useCallback((newCode: string): void => {
    if (currentModel && currentProject) {
      const result = updateModelCode(currentProject, currentModel.id, newCode);
      if (result) {
        setCurrentProject(result.project);
        setCurrentModel(result.model);
      }
    }
  }, [currentModel, currentProject]);

  const handleGetStarted = (): void => {
    localStorage.setItem('morphos-welcomed', 'true');
    setShowWelcome(false);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('morphos-welcomed');
    setShowWelcome(true);
  };

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Left Sidebar - Projects */}
      <Sidebar
        currentProject={currentProject}
        currentModel={currentModel}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        onNewProject={handleNewProject}
        onModelSelect={handleModelSelect}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content - 3D Viewport */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-14 bg-[var(--bg-secondary)] backdrop-blur-sm border-b border-[var(--border-color)] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-semibold">{currentProject?.name || t.messages.noProject}</h1>
              <p className="text-xs text-[var(--text-secondary)]">{currentModel?.name || t.messages.noModel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {isCompiling && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Icons.Spinner />
                {t.messages.compiling}
              </div>
            )}

            <button
              onClick={() => setShowCodeModal(true)}
              disabled={!currentModel}
              className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 border border-[var(--border-color)]"
            >
              <Icons.Code />
              {t.actions.code}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              disabled={!currentModel}
              className="px-3 py-1.5 text-sm bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              <Icons.Download />
              {t.actions.export}
            </button>
          </div>
        </header>

        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {currentModel ? (
            <ThreeViewport
              scadCode={currentModel.code}
              material={currentModel.material}
              onSTLGenerated={handleSTLGenerated}
              onGeometryGenerated={handleGeometryGenerated}
              onError={handleViewportError}
              onCompiling={handleCompiling}
              onCodeError={handleCodeError}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icons.Cube className="w-24 h-24 mx-auto mb-4 text-[var(--text-tertiary)]" />
                <h2 className="text-2xl font-bold mb-2">{t.messages.createToday}</h2>
                <p className="text-[var(--text-secondary)] mb-6">{t.messages.describeModel}</p>
                <button
                  onClick={() => {
                    setShowChat(true);
                    setChatMinimized(false);
                  }}
                  className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-lg font-medium transition-all duration-200"
                >
                  {t.messages.startCreating}
                </button>
              </div>
            </div>
          )}

          {/* Floating Chat Button */}
          {!showChat && (
            <button
              onClick={() => {
                setShowChat(true);
                setChatMinimized(false);
              }}
              className="fixed bottom-8 w-16 h-16 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
              style={{
                right: rightSidebarCollapsed ? '2rem' : '22rem',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease'
              }}
              title={t.chat.title}
            >
              <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-75 animate-pulse-ring"></div>
              <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-50 animate-pulse-ring" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10">
                <Icons.Chat className="w-7 h-7" />
              </div>

              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-primary)] z-20">
                <div className="absolute inset-0 bg-[var(--accent)] rounded-full animate-ping"></div>
              </div>

              <div className="absolute bottom-full mb-3 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-2xl border border-[var(--border-color)] group-hover:translate-y-0 translate-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--bg-primary)] rounded-full animate-pulse"></div>
                  <span className="font-semibold">{t.chat.title}</span>
                </div>
                <div className="text-xs opacity-60 mt-0.5">{t.messages.clickToStart}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="border-8 border-transparent border-t-[var(--accent)]"></div>
                </div>
              </div>
            </button>
          )}

          {/* Floating Chat Panel */}
          {showChat && (
            <div
              className="fixed bottom-8 bg-[var(--bg-secondary)] backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col z-50 animate-slideUp overflow-hidden"
              style={{
                right: rightSidebarCollapsed ? '2rem' : '22rem',
                width: chatMinimized ? '320px' : '480px',
                height: chatMinimized ? '64px' : '680px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)] backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg flex items-center justify-center shadow-lg">
                      <Icons.Chat className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-primary)]">
                      <div className="absolute inset-0 bg-[var(--accent)] rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t.chat.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{t.chat.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChatMinimized(!chatMinimized)}
                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    title={chatMinimized ? "Expand" : "Minimize"}
                  >
                    {chatMinimized ? <Icons.ChevronUp className="w-4 h-4" /> : <Icons.ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    title={t.actions.close}
                  >
                    <Icons.Close className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!chatMinimized && (
                <div className="flex-1 min-h-0">
                  <ChatInterface
                    onCodeGenerated={handleCodeGenerated}
                    currentModel={currentModel}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Parameters */}
      <ParametersPanel
        currentModel={currentModel}
        onCodeChange={handleCodeSave}
        onMaterialChange={handleMaterialChange}
        isCollapsed={rightSidebarCollapsed}
        onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
      />

      {/* Floating button to open right sidebar when collapsed */}
      {rightSidebarCollapsed && (
        <button
          onClick={() => setRightSidebarCollapsed(false)}
          className="fixed right-4 top-4 z-40 w-12 h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          title="Open Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Code Modal */}
      {showCodeModal && currentModel && (
        <CodeModal
          code={currentModel.code}
          onClose={() => setShowCodeModal(false)}
          onSave={handleCodeSave}
        />
      )}

      {/* Export Modal */}
      {showExportModal && currentModel && (
        <ExportModal
          currentModel={currentModel}
          stlData={stlData}
          geometry={geometry}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
