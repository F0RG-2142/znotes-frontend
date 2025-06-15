import { useState, useEffect, useCallback } from 'react';
import './PrivateNotes.css'; // We'll add new styles to this file

// Note interface remains the same
interface Note {
  note_id: string;
  note_name: string;
  created_at: string;
  updated_at: string;
  body: string;
  user_id: string;
}

function PrivateNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New state for the "Add Note" modal
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newNoteBody, setNewNoteBody] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // useCallback memoizes the fetchNotes function so it can be called from anywhere
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('Authentication token not found. Please log in again.');

      const response = await fetch('http://localhost:8080/api/v1/notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch notes: ${response.status}`);

      const data: Note[] | null = await response.json();
      setNotes(data || []);
      setError(null); // Clear previous errors on a successful fetch
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created only once

  // Initial fetch when component mounts
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSaveNote = async () => {
    if (!newNoteBody.trim()) return; // Don't save empty notes

    setIsSaving(true);
    setError(null);

    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('Authentication token not found.');

      const response = await fetch('http://localhost:8080/api/v1/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ body: newNoteBody }),
      });

      if (!response.ok) throw new Error(`Failed to save note: ${response.status}`);

      // Close the modal and reset
      setIsCreating(false);
      setNewNoteBody('');
      // Re-fetch all notes to display the new one
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    console.log(`Clicked note with ID: ${noteId}`);
  };

  if (isLoading) return <div>Loading your notes...</div>;

  return (
    <div>
      {/* Header with the new "Add Note" button */}
      <div className="notes-header">
        <h1>Private Notes</h1>
        <button onClick={() => setIsCreating(true)} className="add-note-button" title="Create a new note">
          +
        </button>
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}

      {/* Grid of existing notes */}
      <div className="notes-grid">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.note_id}
              className="note-preview-block"
              onClick={() => handleNoteClick(note.note_id)}
              tabIndex={0}
            >
              <h3 className="note-title">{note.note_name}</h3>
              <p className="note-date">
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          !isLoading && <p>You don't have any notes yet. Create one!</p>
        )}
      </div>

      {/* "Add Note" Modal */}
      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Create a New Note</h2>
            <textarea
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder="Start writing your note here..."
              className="note-editor"
              disabled={isSaving}
            />
            <div className="modal-actions">
              <button onClick={() => setIsCreating(false)} className="button-secondary" disabled={isSaving}>
                Cancel
              </button>
              <button onClick={handleSaveNote} className="button-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateNotes;