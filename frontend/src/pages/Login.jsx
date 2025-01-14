import { sanitizeUsername, validateUsername, validatePassword } from '../services/inputValidation';
import { getCSRFToken } from '../services/csrf';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import React, { useState, useEffect } from 'react';
import '../styles/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
    if (usernameError || passwordError) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: safeUsername, password: password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  };

  return (
    <Layout>
      <main className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="mb-4">Login</h2>
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
              <button type="submit" className="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Login;