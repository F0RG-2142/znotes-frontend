import { useEffect, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import type { TextFormatType, ElementFormatType } from 'lexical';
  

interface ToolbarState {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

const INITIAL_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
};

interface ToolbarButton {
  icon: string;
  label: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState<ToolbarState>(INITIAL_TOOLBAR_STATE);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setToolbarState(prev => ({
        ...prev,
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
      }));
    }
  }, []);

  // Register all commands
  useEffect(() => {
    const unregisterCommands = [
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        updateToolbar();
        return false;
      }, 1),
      
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
        setToolbarState(prev => ({ ...prev, canUndo: payload }));
        return false;
      }, 1),
      
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
        setToolbarState(prev => ({ ...prev, canRedo: payload }));
        return false;
      }, 1),
      
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
    ];

    return () => unregisterCommands.forEach(unregister => unregister());
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormatType) => () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatElement = (alignment: ElementFormatType) => () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const historyButtons: ToolbarButton[] = [
    {
      icon: 'undo',
      label: 'Undo',
      action: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      isDisabled: !toolbarState.canUndo,
    },
    {
      icon: 'redo',
      label: 'Redo',
      action: () => editor.dispatchCommand(REDO_COMMAND, undefined),
      isDisabled: !toolbarState.canRedo,
    },
  ];

  const formatButtons: ToolbarButton[] = [
    {
      icon: 'bold',
      label: 'Bold',
      action: formatText('bold'),
      isActive: toolbarState.isBold,
    },
    {
      icon: 'italic',
      label: 'Italic',
      action: formatText('italic'),
      isActive: toolbarState.isItalic,
    },
    {
      icon: 'underline',
      label: 'Underline',
      action: formatText('underline'),
      isActive: toolbarState.isUnderline,
    },
  ];

  const alignmentButtons: ToolbarButton[] = [
    {
      icon: 'align-left',
      label: 'Left Align',
      action: formatElement('left' as ElementFormatType),
    },
    {
      icon: 'align-center',
      label: 'Center Align',
      action: formatElement('center' as ElementFormatType),
    },
    {
      icon: 'align-right',
      label: 'Right Align',
      action: formatElement('right' as ElementFormatType),
    },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting toolbar">
      <ToolbarGroup buttons={historyButtons} />
      <div className="toolbar-divider" />
      <ToolbarGroup buttons={formatButtons} />
      <div className="toolbar-divider" />
      <ToolbarGroup buttons={alignmentButtons} />
    </div>
  );
}

interface ToolbarGroupProps {
  buttons: ToolbarButton[];
}

function ToolbarGroup({ buttons }: ToolbarGroupProps) {
  return (
    <div className="toolbar-group">
      {buttons.map((button, index) => (
        <ToolbarButton key={button.icon} button={button} isFirst={index === 0} />
      ))}
    </div>
  );
}

interface ToolbarButtonProps {
  button: ToolbarButton;
  isFirst: boolean;
}

function ToolbarButton({ button, isFirst }: ToolbarButtonProps) {
  const className = [
    'toolbar-item',
    isFirst && 'spaced',
    button.isActive && 'active',
    button.className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      onClick={button.action}
      className={className}
      disabled={button.isDisabled}
      aria-label={button.label}
      aria-pressed={button.isActive}
      title={button.label}
    >
      <i className={`format ${button.icon}`} aria-hidden="true" />
    </button>
  );
}