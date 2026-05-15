import { createSignal, For, Show } from 'solid-js';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

export function ChatInterface(props: ChatInterfaceProps) {
  const [inputText, setInputText] = createSignal('');
  const [previewImage, setPreviewImage] = createSignal<string | null>(null);
  let fileInput: HTMLInputElement | undefined;

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const text = inputText().trim();
    if (text || previewImage()) {
      props.onSendMessage(text, previewImage() || undefined);
      setInputText('');
      setPreviewImage(null);
    }
  };

  const handleImageUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div class="flex flex-col h-full bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div class="p-4 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class={`w-2 h-2 ${props.isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} rounded-full`}></div>
          <span class="text-xs font-bold uppercase tracking-widest text-white">Morphos AI Assistant</span>
        </div>
      </div>

      {/* Messages */}
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <For each={props.messages}>
          {(msg) => (
            <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div class={`max-w-[85%] p-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-700 text-gray-200 rounded-tl-none'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="User sketch" class="w-full h-auto rounded-lg mb-2 border border-blue-400/30" />
                )}
                <p class="whitespace-pre-wrap">{msg.content}</p>
                <div class="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </For>
        <Show when={props.isLoading}>
          <div class="flex justify-start">
            <div class="bg-gray-700 p-3 rounded-xl rounded-tl-none flex gap-1">
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </Show>
      </div>

      {/* Input */}
      <div class="p-4 border-t border-gray-700 bg-gray-900/50">
        <Show when={previewImage()}>
          <div class="relative w-20 h-20 mb-3 group">
            <img src={previewImage()!} class="w-full h-full object-cover rounded-lg border border-blue-500" />
            <button
              onClick={() => setPreviewImage(null)}
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg"
            >
              ✕
            </button>
          </div>
        </Show>

        <form onSubmit={handleSubmit} class="flex gap-2">
          <input
            type="file"
            accept="image/*"
            class="hidden"
            ref={fileInput}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInput?.click()}
            class="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors border border-gray-700"
            title="Upload image"
          >
            📷
          </button>
          <input
            type="text"
            value={inputText()}
            onInput={(e) => setInputText(e.currentTarget.value)}
            placeholder="Describe your design..."
            class="flex-1 bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
            disabled={props.isLoading}
          />
          <button
            type="submit"
            disabled={props.isLoading || (!inputText().trim() && !previewImage())}
            class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
