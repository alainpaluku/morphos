import { useState } from 'react';
import ModelsListModal from '../modals/ModelsListModal';
import { Icons } from '../../constants/icons';
import { formatRelativeTime } from '../../utils/formatters';
import { Project, Model } from '../../types';

interface SidebarProps {
  currentProject: Project | null;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
  onModelSelect: (model: Model) => void;
  currentModel: Model | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

function Sidebar({
  currentProject,
  projects,
  onProjectSelect,
  onNewProject,
  onModelSelect,
  currentModel,
  isCollapsed,
  onToggleCollapse,
  onLogout
}: SidebarProps): JSX.Element {
  const [expandedProject, setExpandedProject] = useState<string | null>(currentProject?.id || null);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [showAllModelsModal, setShowAllModelsModal] = useState<boolean>(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);

  const toggleProject = (projectId: string): void => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <>
      <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-[var(--border-color)]/50">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onToggleCollapse}
                className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="Expand sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xl text-[var(--text-primary)]">
                  MORPHOS
                </span>
                <p className="text-xs text-[var(--text-tertiary)]">AI 3D Generator</p>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors flex-shrink-0"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* New Project Button */}
        <div className="p-3">
          <button
            onClick={onNewProject}
            className={`w-full ${isCollapsed ? 'px-3 py-3' : 'px-4 py-3'} bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]`}
            title={isCollapsed ? "New Project" : ""}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!isCollapsed && <span>New Project</span>}
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="mb-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-2 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Projects ({projects.length})
              </h3>
            )}
            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`rounded-xl overflow-hidden transition-all duration-200 ${currentProject?.id === project.id
                      ? 'bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
                      : 'bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)]/50 hover:border-[var(--border-color)]'
                    }`}
                >
                  {/* Project Header */}
                  {isCollapsed ? (
                    <button
                      onClick={() => onProjectSelect(project)}
                      className="w-full p-3 flex items-center justify-center"
                      title={project.name}
                    >
                      <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {currentProject?.id === project.id && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                        )}
                        {project.models?.length > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full text-[10px] flex items-center justify-center font-bold">
                            {project.models.length}
                          </div>
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-3">
                      <button
                        onClick={() => onProjectSelect(project)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="font-medium truncate flex items-center gap-2">
                          {currentProject?.id === project.id && (
                            <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                          )}
                          {project.name}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-2 mt-1">
                          <span>{project.models?.length || 0} models</span>
                          <span>•</span>
                          <span>{formatRelativeTime(project.updatedAt)}</span>
                        </div>
                      </button>

                      {project.models?.length > 0 && (
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''
                              }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Models List */}
                  {!isCollapsed && expandedProject === project.id && project.models?.length > 0 && (
                    <div className="border-t border-[var(--border-color)]/50 bg-[var(--bg-secondary)]/30">
                      <div className="p-2 space-y-1">
                        {project.models.slice(0, 5).map((model, idx) => (
                          <button
                            key={model.id || idx}
                            onClick={() => onModelSelect(model)}
                            onMouseEnter={() => setHoveredModel(model.id)}
                            onMouseLeave={() => setHoveredModel(null)}
                            className={`w-full px-3 py-2 rounded-lg transition-colors group text-left ${currentModel?.id === model.id
                                ? 'bg-[var(--accent)]/30 border border-[var(--border-color)]/50'
                                : 'hover:bg-[var(--bg-tertiary)]/50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 flex-shrink-0 ${currentModel?.id === model.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm truncate flex items-center gap-2 ${currentModel?.id === model.id ? 'font-semibold' : ''
                                  }`}>
                                  {currentModel?.id === model.id && (
                                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse"></div>
                                  )}
                                  {model.name}
                                </div>
                                <div className="text-xs text-[var(--text-tertiary)] truncate">
                                  {formatRelativeTime(model.createdAt)}
                                </div>
                              </div>
                              {hoveredModel === model.id && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onModelSelect(model);
                                    }}
                                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                                    title="View model"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                        {project.models.length > 5 && (
                          <button
                            onClick={() => {
                              setSelectedProjectForModal(project);
                              setShowAllModelsModal(true);
                            }}
                            className="w-full text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-center py-2 hover:bg-[var(--bg-tertiary)]/30 rounded transition-colors"
                          >
                            View all {project.models.length} models →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-3 border-t border-[var(--border-color)]/50 bg-[var(--bg-secondary)]/50">
          {!isCollapsed ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-2 border border-[var(--border-color)]/50">
                  <div className="text-xs text-[var(--text-tertiary)]">Total Models</div>
                  <div className="text-lg font-bold text-[var(--text-secondary)]">
                    {projects.reduce((sum, p) => sum + (p.models?.length || 0), 0)}
                  </div>
                </div>
                <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-2 border border-[var(--border-color)]/50">
                  <div className="text-xs text-[var(--text-tertiary)]">Projects</div>
                  <div className="text-lg font-bold text-[var(--text-secondary)]">{projects.length}</div>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center gap-2 p-2 bg-[var(--bg-tertiary)]/30 rounded-lg border border-[var(--border-color)]/50">
                <div className="w-9 h-9 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <Icons.User />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">User</div>
                  <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></span>
                    Free Plan
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors group"
                  title="Logout"
                >
                  <Icons.Logout className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg flex items-center justify-center shadow-lg" title="User">
                <Icons.User />
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors group"
                title="Logout"
              >
                <Icons.Logout className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Models List Modal */}
      {showAllModelsModal && selectedProjectForModal && (
        <ModelsListModal
          project={selectedProjectForModal}
          currentModel={currentModel}
          onModelSelect={onModelSelect}
          onClose={() => {
            setShowAllModelsModal(false);
            setSelectedProjectForModal(null);
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
