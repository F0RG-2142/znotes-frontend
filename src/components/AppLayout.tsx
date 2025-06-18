import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Dashboard from './Dashboard';
import PrivateNotes from './PrivateNotes';
import Groups from './Groups';

import './AppLayout.css';

type ActiveView = 'dashboard' | 'notes' | 'groups' | 'profile';

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
      <nav className={`sidenav ${isNavOpen ? 'open' : 'closed'}`}>
        {/* This new wrapper is key to fading the content correctly */}
        <div className="sidenav-header">
          <span className="short-text">Z</span>
          <span className="full-text">ZNotes</span>
        </div>
          <ul className="sidenav-nav">
            <li
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveView('dashboard')}
            >
              <a className='navlink'>
              <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 512">
                <path d="M372.2 52c0 20.9-12.4 39-30.2 47.2L448 192l104.4-20.9c-5.3-7.7-8.4-17.1-8.4-27.1c0-26.5 21.5-48 48-48s48 21.5 48 48c0 26-20.6 47.1-46.4 48L481 442.3c-10.3 23-33.2 37.7-58.4 37.7l-205.2 0c-25.2 0-48-14.8-58.4-37.7L46.4 192C20.6 191.1 0 170 0 144c0-26.5 21.5-48 48-48s48 21.5 48 48c0 10.1-3.1 19.4-8.4 27.1L192 192 298.1 99.1c-17.7-8.3-30-26.3-30-47.1c0-28.7 23.3-52 52-52s52 23.3 52 52z"/>
                </svg>
              <span className='linktext'>Dashboard</span>
              </a>
            </li>

            <li
              className={activeView === 'notes' ? 'active' : ''}
              onClick={() => setActiveView('notes')}
            >
              <a className='navlink'>
              <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 512">
                <path d="M372.2 52c0 20.9-12.4 39-30.2 47.2L448 192l104.4-20.9c-5.3-7.7-8.4-17.1-8.4-27.1c0-26.5 21.5-48 48-48s48 21.5 48 48c0 26-20.6 47.1-46.4 48L481 442.3c-10.3 23-33.2 37.7-58.4 37.7l-205.2 0c-25.2 0-48-14.8-58.4-37.7L46.4 192C20.6 191.1 0 170 0 144c0-26.5 21.5-48 48-48s48 21.5 48 48c0 10.1-3.1 19.4-8.4 27.1L192 192 298.1 99.1c-17.7-8.3-30-26.3-30-47.1c0-28.7 23.3-52 52-52s52 23.3 52 52z"/>
                </svg>
              <span className='linktext'>Notes</span>
              </a>
            </li>

            <li
              className={activeView === 'groups' ? 'active' : ''}
              onClick={() => setActiveView('groups')}
            >
              <a className='navlink'>
              <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 512">
                <path d="M372.2 52c0 20.9-12.4 39-30.2 47.2L448 192l104.4-20.9c-5.3-7.7-8.4-17.1-8.4-27.1c0-26.5 21.5-48 48-48s48 21.5 48 48c0 26-20.6 47.1-46.4 48L481 442.3c-10.3 23-33.2 37.7-58.4 37.7l-205.2 0c-25.2 0-48-14.8-58.4-37.7L46.4 192C20.6 191.1 0 170 0 144c0-26.5 21.5-48 48-48s48 21.5 48 48c0 10.1-3.1 19.4-8.4 27.1L192 192 298.1 99.1c-17.7-8.3-30-26.3-30-47.1c0-28.7 23.3-52 52-52s52 23.3 52 52z"/>
                </svg>
              <span className='linktext'>Groups</span>
              </a>
            </li>

            <li
              className={activeView === 'profile' ? 'active' : ''}
              onClick={() => setActiveView('profile')}
            >
              <a className='navlink'>
              <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 512">
                <path d="M372.2 52c0 20.9-12.4 39-30.2 47.2L448 192l104.4-20.9c-5.3-7.7-8.4-17.1-8.4-27.1c0-26.5 21.5-48 48-48s48 21.5 48 48c0 26-20.6 47.1-46.4 48L481 442.3c-10.3 23-33.2 37.7-58.4 37.7l-205.2 0c-25.2 0-48-14.8-58.4-37.7L46.4 192C20.6 191.1 0 170 0 144c0-26.5 21.5-48 48-48s48 21.5 48 48c0 10.1-3.1 19.4-8.4 27.1L192 192 298.1 99.1c-17.7-8.3-30-26.3-30-47.1c0-28.7 23.3-52 52-52s52 23.3 52 52z"/>
                </svg>
              <span className='linktext'>Profile</span>
              </a>
            </li>

          </ul>
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