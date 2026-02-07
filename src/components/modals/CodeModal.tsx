import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { ModalHeader } from '../ui/ModalHeader';
import { PrimaryButton } from '../ui/PrimaryButton';
import { modalOverlayStyles, modalContainerStyles, modalFooterStyles } from '../ui/styles';

interface CodeModalProps {
  code: string;
  onClose: () => void;
  onSave: (code: string) => void;
}

function CodeModal({ code, onClose, onSave }: CodeModalProps): JSX.Element {
  const [editedCode, setEditedCode] = useState<string>(code);

  const handleEditorChange = (value: string | undefined): void => {
    if (value !== undefined) {
      setEditedCode(value);
    }
  };

  return (
    <div className={modalOverlayStyles}>
      <div className={`${modalContainerStyles} max-w-6xl h-[85vh]`}>
        {/* Header */}
        <ModalHeader
          title="JSCAD Code Editor"
          subtitle="Edit and apply changes to your 3D model"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
          onClose={onClose}
        />

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={editedCode}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
              fontLigatures: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Footer */}
        <div className={modalFooterStyles}>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Edit the code and click Apply to update the 3D model</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton
              onClick={() => {
                onSave(editedCode);
                onClose();
              }}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Apply Changes
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeModal;
