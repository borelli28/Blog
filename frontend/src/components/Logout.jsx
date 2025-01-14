import { useNavigate } from 'react-router-dom';
import React from 'react';
import '../styles/Logout.css';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout. Please try again.');
    }
  };

  return (
    <div className="nav-item">
      <button onClick={handleLogout} className="nav-link btn btn-outline-danger mx-1">
        Logout
      </button>
    </div>
  );
};

export default Logout;