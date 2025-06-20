import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Dashboard from './Dashboard';
import PrivateNotes from './PrivateNotes';
import Groups from './Groups';

import './AppLayout.css';

type ActiveView = 'dashboard' | 'notes' | 'groups' | 'profile';

function AppLayout() {
  const navigate = useNavigate();
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
      <nav className="sidenav">
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
              viewBox="0 0 576 512">
                <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"/>
              </svg>
              <span className='linktext'>Groups</span>
              </a>
            </li>

            <li
              className={activeView === 'profile' ? 'active' : ''}
              onClick={() => setActiveView('profile')}
            >
              <a className='navlink'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/>
              </svg>
              <span className='linktext'>Profile</span>
              </a>
            </li>

          </ul>
      </nav>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
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