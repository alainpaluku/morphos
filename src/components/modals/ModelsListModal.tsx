import { Project, Model } from '../../types';

interface ModelsListModalProps {
  project: Project;
  currentModel: Model | null;
  onModelSelect: (model: Model) => void;
  onClose: () => void;
}

function ModelsListModal({ project, currentModel, onModelSelect, onClose }: ModelsListModalProps): JSX.Element {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--bg-tertiary)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{project.models?.length || 0} models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Models Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {project.models && project.models.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.models.map((model, idx) => (
                <button
                  key={model.id || idx}
                  onClick={() => {
                    onModelSelect(model);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left group hover:scale-[1.02] ${
                    currentModel?.id === model.id
                      ? 'bg-[var(--accent)]/20 border-[var(--border-color)] shadow-lg'
                      : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]/50 hover:border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentModel?.id === model.id
                        ? 'bg-[var(--accent)]/20'
                        : 'bg-[var(--bg-tertiary)]'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        currentModel?.id === model.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {currentModel?.id === model.id && (
                          <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                        )}
                        <h3 className={`font-semibold truncate ${
                          currentModel?.id === model.id ? 'text-[var(--text-primary)]' : 'text-white'
                        }`}>
                          {model.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-2">
                        {formatDate(model.createdAt)}
                      </p>
                      {model.prompt && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                          {model.prompt}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No models in this project</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Click on a model to view it</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelsListModal;
