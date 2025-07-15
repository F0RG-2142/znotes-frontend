import { useState, useEffect, useCallback } from 'react';
import LexicalEditor from './LexicalEditor';
import { useApi } from './hooks/useApi';
import './PrivateNotes.css';

interface Note {
  note_id: string;
  note_name: string;
  created_at: string;
  updated_at: string;
  body: string;
  user_id: string;
}

interface ModalState {
  type: 'create' | 'edit' | null;
  note?: Note;
}

function PrivateNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [newNoteBody, setNewNoteBody] = useState<string>('');
  
  const { loading, error, apiCall } = useApi();

  const fetchNotes = useCallback(async () => {
    const data = await apiCall('/api/v1/notes');
    if (data) setNotes(data);
  }, [apiCall]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!newNoteBody.trim()) return;
    
    const success = await apiCall('/api/v1/notes', {
      method: 'POST',
      body: JSON.stringify({ body: newNoteBody }),
    });
    
    if (success) {
      setModal({ type: null });
      setNewNoteBody('');
      await fetchNotes();
    }
  };

  const handleUpdateNote = async (updatedBody: string) => {
    if (!modal.note) return;
    
    const success = await apiCall(`/api/v1/notes/${modal.note.note_id}`, {
      method: 'PUT',
      body: JSON.stringify({ body: updatedBody }),
    });
    
    if (success) {
      setModal({ type: null });
      await fetchNotes();
    }
  };

  const openCreateModal = () => setModal({ type: 'create' });
  const openEditModal = (noteId: string) => {
    const note = notes.find(n => n.note_id === noteId);
    if (note) setModal({ type: 'edit', note });
  };
  const closeModal = () => setModal({ type: null });

  if (loading && notes.length === 0) {
    return <div className="loading">Loading your notes...</div>;
  }

  return (
    <div className="private-notes">
      <header className="notes-header">
        <h1>Private Notes</h1>
        <button 
          onClick={openCreateModal} 
          className="add-note-button" 
          title="Create a new note"
          aria-label="Create a new note"
        >
          +
        </button>
      </header>

      {error && <div className="error-message">Error: {error}</div>}

      <div className="notes-grid">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div 
              key={note.note_id} 
              className="note-preview-block" 
              onClick={() => openEditModal(note.note_id)}
              onKeyDown={(e) => e.key === 'Enter' && openEditModal(note.note_id)}
              tabIndex={0}
              role="button"
              aria-label={`Open note: ${note.note_name}`}
            >
              <h3 className="note-title">{note.note_name}</h3>
              <p className="note-date">
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="empty-state">You don't have any notes yet. Create one!</p>
        )}
      </div>

      {/* Unified Modal */}
      {modal.type && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'create' ? (
              <LexicalEditor
                noteName={newNoteBody[0]}
                initialBody={newNoteBody}
                onClose={closeModal}
                onSave={handleCreateNote}
                isSaving={loading}
              />
            ) : modal.note ? (
              <LexicalEditor
                noteName={modal.note.note_name}
                initialBody={modal.note.body}
                onClose={closeModal}
                onSave={handleUpdateNote}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateNotes;