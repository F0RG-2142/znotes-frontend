import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import './AppLayout.css';

function AppLayout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Get JWT token from localStorage (adjust the key as needed)
      const token = localStorage.getItem('jwt') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        // If no token, just clear local storage and navigate
        localStorage.removeItem('isAuthenticated');
        navigate('/');
        return;
      }

      const response = await fetch('/api/v1/logout', {
        method: 'POST',
        headers: {
          'Authorization': `ApiKey ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        // Successful logout - clear all auth data and navigate
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        navigate('/');
      } else {
        // Handle other status codes - still log out locally for security
        console.error('Logout request failed, but logging out locally');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        navigate('/');
      }
    } catch (err) {
      // Network error - still log out locally for security
      console.error('Logout network error, but logging out locally:', err);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('jwt');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="app-nav-brand">MyApp Dashboard</div>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </nav>
      <main className="app-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default AppLayout;