import { useState, useEffect, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { $getRoot } from 'lexical';
import type { LexicalEditor as LexicalEditorType } from 'lexical';

import ToolbarPlugin from './ToolbarPlugin';
import './LexicalEditor.css';

const editorConfig = {
  namespace: 'NoteEditor',
  onError: (error: Error) => console.error('Lexical Editor Error:', error),
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, LinkNode],
};

interface LexicalEditorProps {
  noteName: string;
  initialBody: string;
  onClose: () => void;
  onSave: (updatedBody: string) => void;
  isSaving?: boolean;
}

function LexicalEditor({ noteName, initialBody, onClose, onSave, isSaving = false }: LexicalEditorProps) {
  const [activeEditor, setActiveEditor] = useState<LexicalEditorType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = useCallback(() => {
    if (!activeEditor) return;
    
    activeEditor.update(() => {
      const htmlString = $generateHtmlFromNodes(activeEditor);
      onSave(htmlString);
    });
  }, [activeEditor, onSave]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'Escape':
            e.preventDefault();
            handleClose();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleClose]);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="lexical-editor-modal">
        <header className="editor-header">
          <h2>{noteName}</h2>
          <button 
            onClick={handleClose} 
            className="close-button"
            aria-label="Close editor"
            disabled={isSaving}
          >
            ×
          </button>
        </header>

        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>

        <footer className="editor-footer">
          <div className="editor-status">
            {hasChanges && <span className="unsaved-indicator">Unsaved changes</span>}
            <span className="keyboard-hint">Ctrl+S to save • Esc to close</span>
          </div>
          <div className="modal-actions">
            <button 
              onClick={handleClose} 
              className="button-secondary"
              disabled={isSaving}
            >
              Close
            </button>
            <button 
              onClick={handleSave} 
              className="button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </footer>

        <HistoryPlugin />
        <LoadInitialContentPlugin initialHtml={initialBody} />
        <EditorInstancePlugin setActiveEditor={setActiveEditor} />
        <OnChangePlugin onChange={() => setHasChanges(true)} />
      </div>
    </LexicalComposer>
  );
}

// Optimized plugins
function LoadInitialContentPlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!initialHtml) return;
    
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, initialHtml]);
  
  return null;
}

function EditorInstancePlugin({ setActiveEditor }: { setActiveEditor: (editor: LexicalEditorType) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    setActiveEditor(editor);
  }, [editor, setActiveEditor]);
  
  return null;
}

export default LexicalEditor;