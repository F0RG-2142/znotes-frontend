import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Clock, User, Trash2 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useNotes } from '../hooks/useNotes';
import { useTeamNotes } from '../hooks/useTeamNotes';
import { Note, TeamNote } from '../types/api';

const NoteEditor: React.FC = () => {
  const { id, groupId } = useParams<{ id: string; groupId?: string }>();
  const navigate = useNavigate();
  const { getNote, updateNote, deleteNote } = useNotes();
  const teamNotesHook = useTeamNotes(groupId || '');
  
  const [note, setNote] = useState<Note | TeamNote | null>(null);
  const [content, setContent] = useState('');
  const [noteName, setNoteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);



  const isTeamNote = !!groupId;
  
  useEffect(() => {
    const loadNote = async () => {
      if (!id || id === 'undefined') {
        setError('Note ID is missing or invalid');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        let noteData: Note | TeamNote;
        
        if (isTeamNote && groupId) {
          noteData = await teamNotesHook.getTeamNote(id);
        } else {
          // Additional safety check
          if (!id || id === 'undefined') {
            throw new Error('Invalid note ID');
          }
          noteData = await getNote(id);
        }
        
        setNote(noteData);
        setContent(noteData.note_body || '');
        setNoteName(noteData.note_name || extractDefaultTitle(noteData.note_body || ''));
        setLastSaved(new Date(noteData.updated_at));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [id, groupId, isTeamNote]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== note?.note_body || noteName !== note?.note_name);
  };

  const handleNameChange = (newName: string) => {
    setNoteName(newName);
    setHasUnsavedChanges(newName !== note?.note_name || content !== note?.note_body);
  };

  const handleSave = async () => {
    if (!note || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      const finalNoteName = noteName || extractDefaultTitle(content);
      if (isTeamNote && groupId) {
        await teamNotesHook.updateTeamNote(id!, content);
      } else {
        await updateNote(id!, content, finalNoteName);
      }
      
      setNote({ ...note, note_body: content, note_name: finalNoteName, updated_at: new Date().toISOString() });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    const confirmMessage = `Are you sure you want to delete this ${isTeamNote ? 'team ' : ''}note? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        if (isTeamNote && groupId) {
          await teamNotesHook.deleteTeamNote(id!);
          navigate(`/groups/${groupId}`);
        } else {
          await deleteNote(id!);
          navigate('/private-notes');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete note');
      }
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 3000); // Auto-save after 3 seconds of no changes
    
    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges]);

  // Prevent leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const extractDefaultTitle = (body: string) => {
    if (!body) return 'Untitled Note';
    const firstLine = body.split('\n')[0];
    const words = firstLine.trim().split(' ').filter(word => word.length > 0);
    const title = words.slice(0, 10).join(' ');
    return title.length > 50 ? title.substring(0, 50) + '...' : title || 'Untitled Note';
  };



  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error && !note) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Link 
            to={isTeamNote ? `/groups/${groupId}` : '/private-notes'} 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to {isTeamNote ? 'Team' : 'Notes'}
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!note) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Note not found</div>
          <Link 
            to={isTeamNote ? `/groups/${groupId}` : '/private-notes'} 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to {isTeamNote ? 'Team' : 'Notes'}
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Link
              to={isTeamNote ? `/groups/${groupId}` : '/private-notes'}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex-1">
              <input
                type="text"
                value={noteName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Note title"
                className="w-full text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400"
              />
              {isTeamNote && (
                <p className="text-sm text-gray-500">Team Note</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">Unsaved changes</span>
                </>
              ) : lastSaved ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>
                    Saved {lastSaved.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </>
              ) : null}
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Note Metadata */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Start writing your ${isTeamNote ? 'team ' : ''}note...`}
            className="w-full h-[600px] p-6 border-none outline-none resize-none focus:ring-0 text-gray-900 leading-relaxed"
            style={{ 
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '16px',
              lineHeight: '1.7'
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-400">
          <p>
            {isTeamNote ? 'Team note' : 'Private note'} • 
            {content.length} characters • 
            {content.split('\n').length} lines
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default NoteEditor;