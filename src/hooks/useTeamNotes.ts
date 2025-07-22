import { useState, useEffect } from 'react';
import { TeamNote } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useTeamNotes = (teamId: string) => {
  const [notes, setNotes] = useState<TeamNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTeamNotes = async () => {
    if (!teamId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const teamNotes = await apiService.getTeamNotes(teamId);
      setNotes(teamNotes);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch team notes');
    } finally {
      setIsLoading(false);
    }
  };

  const createTeamNote = async (body: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    await apiService.createTeamNote(teamId, { body, user_id: user.id });
    await fetchTeamNotes(); // Refresh notes list
  };

  const updateTeamNote = async (noteId: string, body: string) => {
    await apiService.updateTeamNote(teamId, noteId, { body });
    await fetchTeamNotes(); // Refresh notes list
  };

  const deleteTeamNote = async (noteId: string) => {
    await apiService.deleteTeamNote(teamId, noteId);
    await fetchTeamNotes(); // Refresh notes list
  };

  const getTeamNote = async (noteId: string): Promise<TeamNote> => {
    return apiService.getTeamNote(teamId, noteId);
  };

  useEffect(() => {
    fetchTeamNotes();
  }, [teamId]);

  return {
    notes,
    isLoading,
    error,
    createTeamNote,
    updateTeamNote,
    deleteTeamNote,
    getTeamNote,
    refreshTeamNotes: fetchTeamNotes,
  };
};