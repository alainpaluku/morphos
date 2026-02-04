import { useState, FormEvent, ChangeEvent } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import QuickPrompts from './QuickPrompts';

interface ChatInterfaceProps {
  onCodeGenerated: (code: string, prompt: string) => void;
  currentModel?: { code: string; name: string } | null;
}

function ChatInterface({ onCodeGenerated, currentModel }: ChatInterfaceProps): JSX.Element {
  const [input, setInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const { messages, loading, handleSubmit, retry } = useAIChat({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    currentModel,
    onCodeGenerated
  });

  const handleQuickPrompt = (prompt: string): void => {
    setInput(prompt);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande. Taille maximale: 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInput = async (): Promise<void> => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      
      // Set the transcribed text in input
      setInput(transcript);
      
      // Auto-submit after a short delay to show the text
      setTimeout(async () => {
        if (transcript.trim()) {
          const imageData = selectedImage;
          setInput('');
          setSelectedImage(null);
          await handleSubmit(transcript, imageData);
        }
      }, 500);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        alert('Aucun son détecté. Veuillez réessayer.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone non autorisé. Veuillez autoriser l\'accès au microphone.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    const imageData = selectedImage;

    setInput('');
    setSelectedImage(null);

    await handleSubmit(userPrompt, imageData);
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
              className={`p-3 rounded-lg text-sm animate-fadeIn ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : msg.role === 'error'
                  ? 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] mr-8'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.role === 'error' && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer
                </button>
                <a
                  href="https://ai.google.dev/gemini-api/docs/rate-limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  En savoir plus
                </a>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg mr-8 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">Génération...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="p-4 border-t border-[var(--border-color)]">
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Upload" className="h-20 rounded-lg border border-[var(--border-color)]" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent)] hover:opacity-90 rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="relative flex items-center gap-2">
          {/* Image Upload Button */}
          <label className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors cursor-pointer" title="Upload sketch">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <svg className="w-5 h-5 text-[var(--text-secondary)] hover:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-[var(--accent)] animate-pulse' 
                : 'hover:bg-[var(--bg-tertiary)]'
            }`}
            title="Speak to 3D"
          >
            <svg className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-secondary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "🎤 Écoute en cours..." : "Describe your 3D model..."}
            className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-200 placeholder-[var(--text-tertiary)]"
            disabled={loading || isRecording}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || isRecording}
            className="p-3 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;
