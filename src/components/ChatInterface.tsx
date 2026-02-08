import { useState, FormEvent } from 'react';
import { useAIChat, LoadingPhase } from '../hooks/useAIChat';
import { useLanguage } from '../contexts/LanguageContext';
import { Icons } from '../constants/icons';
import QuickPrompts from './QuickPrompts';

interface ChatInterfaceProps {
  onCodeGenerated: (code: string, prompt: string, imageData: string | null) => void;
  currentModel?: { code: string; name: string } | null;
}

function ChatInterface({ onCodeGenerated, currentModel }: ChatInterfaceProps): JSX.Element {
  const [input, setInput] = useState<string>('');
  const { t } = useLanguage();

  const { messages, loading, loadingPhase, handleSubmit, retry } = useAIChat({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    currentModel,
    onCodeGenerated
  });

  const handleQuickPrompt = (prompt: string): void => {
    setInput(prompt);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');

    await handleSubmit(userPrompt, null);
  };

  const handleRetry = (): void => {
    const lastPromptValue = retry();
    if (lastPromptValue) {
      setInput(lastPromptValue);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <QuickPrompts
            hasModel={!!currentModel}
            onSelect={handleQuickPrompt}
          />
        )}

        {messages.map((msg, idx) => (
          <div key={idx}>
            <div
              className={`p-3 rounded-lg text-sm animate-fadeIn ${msg.role === 'user'
                ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                : msg.role === 'error'
                  ? 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] mr-8'
                }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.role === 'error' && (
                  <div className="flex items-start gap-2">
                    <Icons.Alert className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--text-secondary)]" />
                    <div className="text-[var(--text-primary)]">{msg.content}</div>
                  </div>
                )}
                {msg.role !== 'error' && <span className={msg.role === 'user' ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'}>{msg.content}</span>}
              </div>
            </div>
            {msg.role === 'error' && msg.isQuotaError && (
              <div className="mt-2 mr-8 flex gap-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <Icons.Refresh className="w-3 h-3" />
                  Réessayer
                </button>
                <a
                  href="https://ai.google.dev/gemini-api/docs/rate-limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <Icons.Info className="w-3 h-3" />
                  En savoir plus
                </a>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg mr-8 animate-fadeIn border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {loadingPhase === 'analyzing'
                  ? t.chat.analyzingRequest
                  : loadingPhase === 'generating'
                    ? t.chat.generatingCode
                    : t.chat.generating}
              </p>
            </div>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <Icons.Info className="w-3 h-3" />
              {t.chat.pleaseWaitGeneration}
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="p-4 border-t border-[var(--border-color)]">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your 3D model..."
            className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-200 placeholder-[var(--text-tertiary)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          >
            <Icons.Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;
