import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const user_email = formData.get('email') as string;
    const user_password = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:8080/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email,
          user_password,
        }),
      });

      if (response.status === 201) {
        localStorage.setItem('isAuthenticated', 'true');
        // Navigate within the React app
        navigate('/app');
      } else {
        // Handle other status codes
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            required 
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            required 
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;