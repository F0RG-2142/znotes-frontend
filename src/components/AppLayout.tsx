import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Dashboard from './Dashboard';
import PrivateNotes from './PrivateNotes';
import Groups from './Groups';

import './AppLayout.css';

type ActiveView = 'dashboard' | 'notes' | 'groups';

function AppLayout() {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <PrivateNotes />;
      case 'groups':
        return <Groups />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Retractable Side Navigation */}
      <nav className={`side-nav ${isNavOpen ? 'open' : 'closed'}`}>
        {/* This new wrapper is key to fading the content correctly */}
        <div className="side-nav-content">
          <div className="side-nav-header">ZNotes</div>
          <ul>
            <li
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </li>
            <li
              className={activeView === 'notes' ? 'active' : ''}
              onClick={() => setActiveView('notes')}
            >
              Private Notes
            </li>
            <li
              className={activeView === 'groups' ? 'active' : ''}
              onClick={() => setActiveView('groups')}
            >
              Groups
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setIsNavOpen(!isNavOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>
        <main className="content-area">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;