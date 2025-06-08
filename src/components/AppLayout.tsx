import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import './AppLayout.css';

function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="app-nav-brand">MyApp Dashboard</div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <main className="app-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default AppLayout;