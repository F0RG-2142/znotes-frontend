import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

function Register() {
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/app');
    };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  );
}

export default Register;