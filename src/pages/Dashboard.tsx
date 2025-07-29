import React, { useState } from 'react';
import { BarChart3, Clock, Users, FileText, Plus, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { useTeams } from '../hooks/useTeams';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { notes, isLoading: notesLoading } = useNotes();
  const { teams, isLoading: teamsLoading } = useTeams();
  
  // Calculate dashboard stats
  const totalNotes = notes?.length || 0;
  const totalTeams = teams?.length || 0;
  const recentNotes = notes
    ? notes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    : [];

  // Mock activity data (you could enhance this with real activity tracking)
  const [activityData] = useState([
    { day: 'Mon', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Tue', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Wed', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Thu', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Fri', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Sat', notes: Math.floor(Math.random() * 10) + 1 },
    { day: 'Sun', notes: Math.floor(Math.random() * 10) + 1 },
  ]);

  const maxActivity = Math.max(...activityData.map(d => d.notes));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractTitle = (body: string) => {
    if (!body) return 'Untitled Note';
    const firstLine = body.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'Untitled Note';
  };

  if (notesLoading || teamsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p className="text-indigo-100">
            Here's what's happening with your notes and teams today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">{totalTeams}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityData.reduce((sum, day) => sum + day.notes, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Premium</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.has_notes_premium ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                user?.has_notes_premium ? 'bg-yellow-50' : 'bg-gray-50'
              }`}>
                <BarChart3 className={`w-6 h-6 ${
                  user?.has_notes_premium ? 'text-yellow-600' : 'text-gray-400'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {activityData.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <div className="w-8 text-sm text-gray-500">{day.day}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${(day.notes / maxActivity) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-900 font-medium">{day.notes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/private-notes"
                className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-indigo-700 font-medium">New Note</span>
              </Link>
              
              <Link
                to="/groups"
                className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-purple-700 font-medium">Manage Teams</span>
              </Link>
              
              <Link
                to="/private-notes"
                className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-green-700 font-medium">Browse Notes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notes</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.note_id} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <Link
                      to={`/note/${note.note_id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors block truncate"
                    >
                      {extractTitle(note.note_body)}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {formatDate(note.updated_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notes yet. Create your first note to get started!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;