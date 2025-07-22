import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Plus, FileText, Settings, UserPlus, Crown, User, Calendar, Trash2, Edit3 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useTeams } from '../hooks/useTeams';
import { useTeamNotes } from '../hooks/useTeamNotes';
import { Team, TeamMember } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getTeam, getTeamMembers } = useTeams();
  const { notes, createTeamNote, deleteTeamNote, isLoading: notesLoading } = useTeamNotes(id || '');
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [teamData, membersData] = await Promise.all([
          getTeam(id),
          getTeamMembers(id)
        ]);
        setTeam(teamData);
        setMembers(membersData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [id, getTeam, getTeamMembers]);

  const extractTitle = (body: string) => {
    const firstLine = body.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'Untitled Note';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const handleCreateNote = async () => {
    if (!newNoteBody.trim()) return;
    
    setIsCreating(true);
    try {
      await createTeamNote(newNoteBody);
      setNewNoteBody('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteTeamNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const isOwner = team?.created_by === user?.id;
  const userRole = members.find(m => m.user_id === user?.id)?.role || 'member';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Link to="/groups" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Teams
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!team) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Team not found</div>
          <Link to="/groups" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Teams
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Team Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{team.team_name}</h1>
                <div className="flex items-center gap-4 mt-2 text-purple-100">
                  <div className="flex items-center gap-1">
                    {isOwner ? (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>Owner</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span className="capitalize">{userRole}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(team.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{members.length} members</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
              {isOwner && (
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all">
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Team Notes</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Privacy</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {team.is_private ? 'Private' : 'Public'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                {team.is_private ? (
                  <UserPlus className="w-6 h-6 text-green-600" />
                ) : (
                  <Users className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Notes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Team Notes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>

          {notesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Link
                  key={note.note_id}
                  to={`/groups/${id}/notes/${note.note_id}`}
                  className="group block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Navigate to edit
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note.note_id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                    {extractTitle(note.body)}
                  </h3>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {note.body.split('\n').slice(1).join(' ').substring(0, 80)}...
                  </p>
                  
                  <div className="text-xs text-gray-400">
                    {formatDate(note.updated_at)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No notes in this team yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create First Note
              </button>
            </div>
          )}
        </div>

        {/* Create Note Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Team Note</h2>
              <textarea
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                placeholder="Start writing your team note..."
                className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateNote}
                  disabled={!newNoteBody.trim() || isCreating}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Note'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewNoteBody('');
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GroupPage;