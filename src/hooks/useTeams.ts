import { useState, useEffect } from 'react';
import { Team, TeamMember } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTeams = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const userTeams = await apiService.getAllTeams();
      setTeams(userTeams);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamName: string, isPrivate: boolean = false) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    await apiService.createTeam({
      team_name: teamName,
      user_id: user.id,
      is_private: isPrivate,
    });
    await fetchTeams(); // Refresh teams list
  };

  const deleteTeam = async (teamId: string) => {
    await apiService.deleteTeam(teamId);
    await fetchTeams(); // Refresh teams list
  };

  const getTeam = async (teamId: string): Promise<Team> => {
    return apiService.getTeam(teamId);
  };

  const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    return apiService.getTeamMembers(teamId);
  };

  const addTeamMember = async (teamId: string, userId: string, role: string = 'member') => {
    await apiService.addTeamMember(teamId, { user_id: userId, role });
  };

  const removeTeamMember = async (teamId: string, memberId: string) => {
    await apiService.removeTeamMember(teamId, memberId);
  };

  useEffect(() => {
    fetchTeams();
  }, [user?.id]);

  return {
    teams,
    isLoading,
    error,
    createTeam,
    deleteTeam,
    getTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    refreshTeams: fetchTeams,
  };
};