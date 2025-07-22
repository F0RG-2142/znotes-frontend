import React, { useState } from 'react';
import { Users, Plus, Search, Settings, Trash2, Crown, User, Lock, Globe } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useTeams } from '../hooks/useTeams';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Groups: React.FC = () => {
  const { teams, isLoading, error, createTeam, deleteTeam } = useTeams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPrivate, setNewTeamPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreating(true);
    try {
      await createTeam(newTeamName, newTeamPrivate);
      setNewTeamName('');
      setNewTeamPrivate(false);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      try {
        await deleteTeam(teamId);
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error loading teams: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-500 mt-1">{teams.length} teams total</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Team
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Link
                key={team.team_id}
                to={`/groups/${team.team_id}`}
                className="group block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    {team.is_private ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    )}
                    {team.created_by === user?.id && (
                      <button
                        onClick={(e) => handleDeleteTeam(team.team_id, team.team_name, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {team.team_name}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {team.created_by === user?.id ? (
                      <>
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span>Owner</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>Member</span>
                      </>
                    )}
                  </div>
                  <span>Created {formatDate(team.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Create your first team to collaborate with others'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First Team
              </button>
            )}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newTeamPrivate}
                      onChange={(e) => setNewTeamPrivate(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Make this team private</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Private teams are only visible to invited members
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || isCreating}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTeamName('');
                    setNewTeamPrivate(false);
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

export default Groups;