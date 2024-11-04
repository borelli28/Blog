import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className="navbar navbar-expand-lg navbar-light mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <h5 className="mb-0">Title Here</h5>
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
            <li className="nav-item">
              <Link to="/blogs" className="nav-link btn btn-outline-secondary mx-1">Blogs</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link btn btn-outline-secondary mx-1">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/logs_page" className="nav-link btn btn-outline-secondary mx-1">Logs</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;