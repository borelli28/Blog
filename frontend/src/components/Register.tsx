import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, passphrase }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container">
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              id="passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
            <label htmlFor="passphrase">Passphrase</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              id="confirmPassphrase"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              required
            />
            <label htmlFor="confirmPassphrase">Confirm Passphrase</label>
          </div>
          <button type="submit" className="btn light-blue">Register</button>
        </form>
      </div>
    </Layout>
  );
};

export default Register;