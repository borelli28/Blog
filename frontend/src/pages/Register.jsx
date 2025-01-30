import { sanitizeUsername, validateUsername, validatePassword } from '../services/inputValidation';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import '../styles/Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'GET',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCSRFToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const safeUsername = sanitizeUsername(username);
    const usernameError = validateUsername(safeUsername);
    const passwordError = validatePassword(password);

    if (usernameError) {
      setErrors(prev => ({ ...prev, username: usernameError }));
    }
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match.' }));
    }
    if (usernameError || passwordError || password !== confirmPassword) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: safeUsername, password: password, confirmPassword: confirmPassword }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div id="auth-page-container">
      <Navbar />
      <div id="auth-content">
        <h2 className="mb-4">Register</h2>
        <div className="form-container">
          {errors.general && <div className="alert alert-danger">{errors.general}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;