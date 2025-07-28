import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Plus, FileText, Settings, UserPlus, Crown, User, Calendar, Trash2, Edit3 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useTeams } from '../hooks/useTeams';
import { useTeamNotes } from '../hooks/useTeamNotes';
import { Team, TeamMember } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTeam, getTeamMembers } = useTeams();
  const { notes, createTeamNote, deleteTeamNote, isLoading: notesLoading, error: notesError } = useTeamNotes(id || '');
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadTeamData = async () => {
      // Check if ID exists
      if (!id) {
        setError('Invalid team ID');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch team data and members in parallel
        const [teamData, membersData] = await Promise.all([
          getTeam(id).catch(err => {
            throw new Error(`Failed to load team: ${err.message || 'Unknown error'}`);
          }),
          getTeamMembers(id).catch(err => {
            throw new Error(`Failed to load team members: ${err.message || 'Unknown error'}`);
          })
        ]);
        
        setTeam(teamData);
        setMembers(membersData);
      } catch (error) {
        console.error('Error loading team data:', error);
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

  // Show loading state
  if (isLoading || notesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  // Show errors
  if (error || notesError) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error || notesError}</div>
          <button 
            onClick={() => navigate('/groups')} 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Teams
          </button>
        </div>
      </AppLayout>
    );
  }

  // Show not found
  if (!team) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Team not found</div>
          <button 
            onClick={() => navigate('/groups')} 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Teams
          </button>
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
            <div>
              <h1 className="text-2xl font-bold mb-2">{team.team_name}</h1>
              <div className="flex items-center gap-4 text-purple-100">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            {isOwner && (
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
            {isOwner && (
              <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {member.user_id === user?.id ? 'You' : `User ${member.user_id.substring(0, 8)}`}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {member.role === 'owner' && (
                      <>
                        <Crown className="w-3 h-3" />
                        <span>Owner</span>
                      </>
                    )}
                    {member.role !== 'owner' && (
                      <span className="capitalize">{member.role}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team Notes</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
          
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Link 
                  key={note.note_id}
                  to={`/groups/${team.team_id}/notes/${note.note_id}`}
                  className="group border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all block"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
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
                  
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
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