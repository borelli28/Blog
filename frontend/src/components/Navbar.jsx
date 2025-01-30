import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import '../styles/Navbar.css';
import { checkAuth } from '../services/AuthService';
import useTokenRefresh from './TokenRefresh';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useTokenRefresh();

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };
    verifyAuth();
  }, []);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className={`navbar navbar-expand-lg navbar-light mb-4 ${isNavCollapsed ? 'navbar-collapsed' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand">
          <h5 className="mb-0">Armando Borelli</h5>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed ? true : false}
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link btn btn-outline-secondary mx-1">Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link btn btn-outline-secondary mx-1">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/create" className="nav-link btn btn-outline-secondary mx-1">Create Blog</Link>
                </li>
                <li className="nav-item">
                  <Link to="/logs" className="nav-link btn btn-outline-secondary mx-1">Logs</Link>
                </li>
                <Logout />
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;