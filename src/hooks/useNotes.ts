import { useState, useEffect } from 'react';
import { Note } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const userNotes = await apiService.getNotesByAuthor(user.id);
      setNotes(userNotes);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (body: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    await apiService.createNote({ body, user_id: user.id });
    await fetchNotes(); // Refresh notes list
  };

  const updateNote = async (noteId: string, body: string) => {
    await apiService.updateNote(noteId, { note_id: noteId, note_body: body, note_name: body.split('\n')[0] || 'Untitled Note' });
    await fetchNotes(); // Refresh notes list
  };

  const deleteNote = async (noteId: string) => {
    await apiService.deleteNote(noteId);
    await fetchNotes(); // Refresh notes list
  };

  const getNote = async (noteId: string): Promise<Note> => {
    if (!noteId || noteId === 'undefined') {
      throw new Error('Invalid note ID');
    }
    return apiService.getNote(noteId);
  };

  useEffect(() => {
    fetchNotes();
  }, [user?.id]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    refreshNotes: fetchNotes,
  };
};