import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import PrivateNotes from './pages/PrivateNotes';
import Groups from './pages/Groups';
import GroupPage from './pages/GroupPage';
import NoteEditor from './pages/NoteEditor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/private-notes" element={
            <ProtectedRoute>
              <PrivateNotes />
            </ProtectedRoute>
          } />
          
          <Route path="/groups" element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:id" element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          } />
          
          <Route path="/note/:id" element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:groupId/notes/:id" element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;